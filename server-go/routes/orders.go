package routes

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"farmer-marketplace/config"
	"farmer-marketplace/models"
)

func OrderRoutes(router *gin.RouterGroup) {
	orders := router.Group("/orders")
	{
		orders.POST("", authMiddleware(), createOrder)
		orders.GET("", authMiddleware(), getOrders)
		orders.GET("/:id", authMiddleware(), getOrder)
		orders.PUT("/:id/status", authMiddleware(), updateOrderStatus)
		orders.GET("/farmer", authMiddleware(), getFarmerOrders)
		orders.GET("/customer", authMiddleware(), getCustomerOrders)
	}
}

func createOrder(c *gin.Context) {
	var req models.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "customer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only customers can create orders"})
		return
	}

	customerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	// Calculate total amount
	var totalAmount float64
	for _, item := range req.Items {
		totalAmount += item.Price * float64(item.Quantity)
	}

	order := models.Order{
		ID:              primitive.NewObjectID(),
		CustomerID:      customerID,
		Items:           req.Items,
		TotalAmount:     totalAmount,
		Status:          "pending",
		DeliveryAddress: req.DeliveryAddress,
		PaymentMethod:   req.PaymentMethod,
		PaymentStatus:   "pending",
		Notes:           req.Notes,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	collection := config.GetCollection("orders")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// Update product stock and order count
	go updateProductStats(req.Items)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Order created successfully",
		"order":   order,
	})
}

func getOrders(c *gin.Context) {
	userID := c.GetString("userID")
	role := c.GetString("role")

	collection := config.GetCollection("orders")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var filter bson.M
	if role == "customer" {
		customerID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
			return
		}
		filter = bson.M{"customerId": customerID}
	} else if role == "farmer" {
		// For farmers, we need to find orders containing their products
		farmerID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid farmer ID"})
			return
		}
		
		// First get farmer's products
		productCollection := config.GetCollection("products")
		productCursor, err := productCollection.Find(ctx, bson.M{"farmerId": farmerID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch farmer products"})
			return
		}
		
		var products []models.Product
		if err = productCursor.All(ctx, &products); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode products"})
			return
		}
		
		var productIDs []primitive.ObjectID
		for _, product := range products {
			productIDs = append(productIDs, product.ID)
		}
		
		filter = bson.M{"items.productId": bson.M{"$in": productIDs}}
	} else {
		filter = bson.M{} // Admin can see all orders
	}

	// Aggregation pipeline to populate customer and product info
	pipeline := []bson.M{
		{"$match": filter},
		{
			"$lookup": bson.M{
				"from":         "users",
				"localField":   "customerId",
				"foreignField": "_id",
				"as":           "customer",
			},
		},
		{
			"$unwind": bson.M{
				"path":                       "$customer",
				"preserveNullAndEmptyArrays": true,
			},
		},
		{
			"$project": bson.M{
				"customer.password": 0,
			},
		},
		{
			"$sort": bson.M{"createdAt": -1},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err = cursor.All(ctx, &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func getOrder(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	collection := config.GetCollection("orders")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Aggregation pipeline to populate customer and product info
	pipeline := []bson.M{
		{"$match": bson.M{"_id": objectID}},
		{
			"$lookup": bson.M{
				"from":         "users",
				"localField":   "customerId",
				"foreignField": "_id",
				"as":           "customer",
			},
		},
		{
			"$unwind": bson.M{
				"path":                       "$customer",
				"preserveNullAndEmptyArrays": true,
			},
		},
		{
			"$project": bson.M{
				"customer.password": 0,
			},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order"})
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err = cursor.All(ctx, &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode order"})
		return
	}

	if len(orders) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, orders[0])
}

func updateOrderStatus(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var req models.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := c.GetString("role")
	if role != "farmer" && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only farmers can update order status"})
		return
	}

	collection := config.GetCollection("orders")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": objectID}
	update := bson.M{
		"$set": bson.M{
			"status":    req.Status,
			"updatedAt": time.Now(),
		},
	}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully"})
}

func getFarmerOrders(c *gin.Context) {
	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "farmer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only farmers can access this endpoint"})
		return
	}

	farmerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid farmer ID"})
		return
	}

	collection := config.GetCollection("orders")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// First get farmer's products
	productCollection := config.GetCollection("products")
	productCursor, err := productCollection.Find(ctx, bson.M{"farmerId": farmerID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch farmer products"})
		return
	}

	var products []models.Product
	if err = productCursor.All(ctx, &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode products"})
		return
	}

	var productIDs []primitive.ObjectID
	for _, product := range products {
		productIDs = append(productIDs, product.ID)
	}

	// Aggregation pipeline to get orders with farmer's products
	pipeline := []bson.M{
		{"$match": bson.M{"items.productId": bson.M{"$in": productIDs}}},
		{
			"$lookup": bson.M{
				"from":         "users",
				"localField":   "customerId",
				"foreignField": "_id",
				"as":           "customer",
			},
		},
		{
			"$unwind": bson.M{
				"path":                       "$customer",
				"preserveNullAndEmptyArrays": true,
			},
		},
		{
			"$project": bson.M{
				"customer.password": 0,
			},
		},
		{
			"$sort": bson.M{"createdAt": -1},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err = cursor.All(ctx, &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func getCustomerOrders(c *gin.Context) {
	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "customer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only customers can access this endpoint"})
		return
	}

	customerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	collection := config.GetCollection("orders")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"customerId": customerID}
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err = cursor.All(ctx, &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func updateProductStats(items []models.OrderItem) {
	collection := config.GetCollection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	for _, item := range items {
		// Update stock and order count
		filter := bson.M{"_id": item.ProductID}
		update := bson.M{
			"$inc": bson.M{
				"stock":  -item.Quantity,
				"orders": 1,
			},
		}
		collection.UpdateOne(ctx, filter, update)
	}
}