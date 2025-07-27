package routes

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"farmer-marketplace/config"
	"farmer-marketplace/models"
)

type CartItem struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	ProductID primitive.ObjectID `json:"productId" bson:"productId"`
	Product   *models.Product    `json:"product,omitempty" bson:"product,omitempty"`
	Quantity  int                `json:"quantity" bson:"quantity"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type AddToCartRequest struct {
	ProductID string `json:"productId" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

type UpdateCartRequest struct {
	Quantity int `json:"quantity" binding:"required,min=0"`
}

func CartRoutes(router *gin.RouterGroup) {
	cart := router.Group("/cart")
	{
		cart.POST("/add", authMiddleware(), addToCart)
		cart.GET("", authMiddleware(), getCart)
		cart.PUT("/:id", authMiddleware(), updateCartItem)
		cart.DELETE("/:id", authMiddleware(), removeFromCart)
		cart.DELETE("/clear", authMiddleware(), clearCart)
	}
}

func addToCart(c *gin.Context) {
	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "customer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only customers can add items to cart"})
		return
	}

	customerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	productID, err := primitive.ObjectIDFromHex(req.ProductID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	collection := config.GetCollection("cart")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if item already exists in cart
	filter := bson.M{"userId": customerID, "productId": productID}
	var existingItem CartItem
	err = collection.FindOne(ctx, filter).Decode(&existingItem)

	if err == nil {
		// Update existing item quantity
		update := bson.M{
			"$inc": bson.M{"quantity": req.Quantity},
			"$set": bson.M{"updatedAt": time.Now()},
		}
		_, err = collection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart item"})
			return
		}
	} else {
		// Add new item to cart
		cartItem := CartItem{
			ID:        primitive.NewObjectID(),
			UserID:    customerID,
			ProductID: productID,
			Quantity:  req.Quantity,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		_, err = collection.InsertOne(ctx, cartItem)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item to cart"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added to cart successfully"})
}

func getCart(c *gin.Context) {
	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "customer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only customers can access cart"})
		return
	}

	customerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	collection := config.GetCollection("cart")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Aggregation pipeline to populate product info
	pipeline := []bson.M{
		{"$match": bson.M{"userId": customerID}},
		{
			"$lookup": bson.M{
				"from":         "products",
				"localField":   "productId",
				"foreignField": "_id",
				"as":           "product",
			},
		},
		{
			"$unwind": bson.M{
				"path":                       "$product",
				"preserveNullAndEmptyArrays": true,
			},
		},
		{
			"$sort": bson.M{"createdAt": -1},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart items"})
		return
	}
	defer cursor.Close(ctx)

	var cartItems []CartItem
	if err = cursor.All(ctx, &cartItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode cart items"})
		return
	}

	c.JSON(http.StatusOK, cartItems)
}

func updateCartItem(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cart item ID"})
		return
	}

	var req UpdateCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "customer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only customers can update cart items"})
		return
	}

	customerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	collection := config.GetCollection("cart")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": objectID, "userId": customerID}

	if req.Quantity == 0 {
		// Remove item if quantity is 0
		_, err = collection.DeleteOne(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove cart item"})
			return
		}
	} else {
		// Update quantity
		update := bson.M{
			"$set": bson.M{
				"quantity":  req.Quantity,
				"updatedAt": time.Now(),
			},
		}
		result, err := collection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart item"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart item updated successfully"})
}

func removeFromCart(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cart item ID"})
		return
	}

	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "customer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only customers can remove cart items"})
		return
	}

	customerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	collection := config.GetCollection("cart")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": objectID, "userId": customerID}
	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove cart item"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart successfully"})
}

func clearCart(c *gin.Context) {
	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "customer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only customers can clear cart"})
		return
	}

	customerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	collection := config.GetCollection("cart")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"userId": customerID}
	_, err = collection.DeleteMany(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}