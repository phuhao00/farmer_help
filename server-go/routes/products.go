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

func ProductRoutes(router *gin.RouterGroup) {
	products := router.Group("/products")
	{
		products.GET("", getProducts)
		products.GET("/:id", getProduct)
		products.POST("", authMiddleware(), createProduct)
		products.PUT("/:id", authMiddleware(), updateProduct)
		products.DELETE("/:id", authMiddleware(), deleteProduct)
		products.GET("/farmer/:farmerId", getFarmerProducts)
		products.GET("/farmer", authMiddleware(), getMyProducts)
	}
}

func getProducts(c *gin.Context) {
	collection := config.GetCollection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Build aggregation pipeline to populate farmer info
	pipeline := []bson.M{
		{
			"$lookup": bson.M{
				"from":         "users",
				"localField":   "farmerId",
				"foreignField": "_id",
				"as":           "farmer",
			},
		},
		{
			"$unwind": bson.M{
				"path":                       "$farmer",
				"preserveNullAndEmptyArrays": true,
			},
		},
		{
			"$project": bson.M{
				"farmer.password": 0,
			},
		},
		{
			"$sort": bson.M{"createdAt": -1},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err = cursor.All(ctx, &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

func getProduct(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	collection := config.GetCollection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Aggregation pipeline to populate farmer info
	pipeline := []bson.M{
		{"$match": bson.M{"_id": objectID}},
		{
			"$lookup": bson.M{
				"from":         "users",
				"localField":   "farmerId",
				"foreignField": "_id",
				"as":           "farmer",
			},
		},
		{
			"$unwind": bson.M{
				"path":                       "$farmer",
				"preserveNullAndEmptyArrays": true,
			},
		},
		{
			"$project": bson.M{
				"farmer.password": 0,
			},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err = cursor.All(ctx, &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode product"})
		return
	}

	if len(products) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, products[0])
}

func createProduct(c *gin.Context) {
	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "farmer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only farmers can create products"})
		return
	}

	farmerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid farmer ID"})
		return
	}

	product := models.Product{
		ID:          primitive.NewObjectID(),
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Category:    req.Category,
		Stock:       req.Stock,
		Unit:        req.Unit,
		Images:      req.Images,
		IsOrganic:   req.IsOrganic,
		HarvestDate: req.HarvestDate,
		ExpiryDate:  req.ExpiryDate,
		FarmerID:    farmerID,
		Rating:      4.5, // Default rating
		Orders:      0,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	collection := config.GetCollection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Product created successfully",
		"product": product,
	})
}

func updateProduct(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "farmer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only farmers can update products"})
		return
	}

	farmerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid farmer ID"})
		return
	}

	collection := config.GetCollection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if product belongs to the farmer
	filter := bson.M{"_id": objectID, "farmerId": farmerID}
	update := bson.M{
		"$set": bson.M{
			"name":        req.Name,
			"description": req.Description,
			"price":       req.Price,
			"category":    req.Category,
			"stock":       req.Stock,
			"unit":        req.Unit,
			"images":      req.Images,
			"isOrganic":   req.IsOrganic,
			"harvestDate": req.HarvestDate,
			"expiryDate":  req.ExpiryDate,
			"updatedAt":   time.Now(),
		},
	}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found or not owned by farmer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully"})
}

func deleteProduct(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	userID := c.GetString("userID")
	role := c.GetString("role")

	if role != "farmer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only farmers can delete products"})
		return
	}

	farmerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid farmer ID"})
		return
	}

	collection := config.GetCollection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if product belongs to the farmer
	filter := bson.M{"_id": objectID, "farmerId": farmerID}
	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found or not owned by farmer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

func getFarmerProducts(c *gin.Context) {
	farmerID := c.Param("farmerId")
	objectID, err := primitive.ObjectIDFromHex(farmerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid farmer ID"})
		return
	}

	collection := config.GetCollection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"farmerId": objectID}
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err = cursor.All(ctx, &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

func getMyProducts(c *gin.Context) {
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

	collection := config.GetCollection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"farmerId": farmerID}
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err = cursor.All(ctx, &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode products"})
		return
	}

	c.JSON(http.StatusOK, products)
}