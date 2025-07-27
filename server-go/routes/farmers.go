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

func FarmerRoutes(router *gin.RouterGroup) {
	farmers := router.Group("/farmers")
	{
		farmers.GET("", getFarmers)
		farmers.GET("/:id", getFarmer)
		farmers.GET("/:id/products", getFarmerProductsPublic)
	}
}

func getFarmers(c *gin.Context) {
	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"role": "farmer"}
	opts := options.Find().SetProjection(bson.M{"password": 0}) // Exclude password

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch farmers"})
		return
	}
	defer cursor.Close(ctx)

	var farmers []models.User
	if err = cursor.All(ctx, &farmers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode farmers"})
		return
	}

	c.JSON(http.StatusOK, farmers)
}

func getFarmer(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid farmer ID"})
		return
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": objectID, "role": "farmer"}
	projection := bson.M{"password": 0} // Exclude password

	var farmer models.User
	err = collection.FindOne(ctx, filter, options.FindOne().SetProjection(projection)).Decode(&farmer)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Farmer not found"})
		return
	}

	c.JSON(http.StatusOK, farmer)
}

func getFarmerProductsPublic(c *gin.Context) {
	farmerID := c.Param("id")
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