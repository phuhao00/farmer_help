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
)

type Notification struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	Type      string             `json:"type" bson:"type"` // order_status, message, system
	Title     string             `json:"title" bson:"title"`
	Message   string             `json:"message" bson:"message"`
	Data      map[string]interface{} `json:"data,omitempty" bson:"data,omitempty"`
	Read      bool               `json:"read" bson:"read"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
}

type OrderStatusNotificationRequest struct {
	OrderID string `json:"orderId" binding:"required"`
	Status  string `json:"status" binding:"required"`
}

func NotificationRoutes(router *gin.RouterGroup) {
	notifications := router.Group("/notifications")
	{
		notifications.GET("", authMiddleware(), getNotifications)
		notifications.PUT("/:id/read", authMiddleware(), markAsRead)
		notifications.POST("/order-status", authMiddleware(), sendOrderStatusNotification)
		notifications.DELETE("/:id", authMiddleware(), deleteNotification)
	}
}

func getNotifications(c *gin.Context) {
	userID := c.GetString("userID")
	
	customerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetCollection("notifications")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"userId": customerID}
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}
	defer cursor.Close(ctx)

	var notifications []Notification
	if err = cursor.All(ctx, &notifications); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode notifications"})
		return
	}

	c.JSON(http.StatusOK, notifications)
}

func markAsRead(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	userID := c.GetString("userID")
	customerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetCollection("notifications")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": objectID, "userId": customerID}
	update := bson.M{"$set": bson.M{"read": true}}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark notification as read"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

func sendOrderStatusNotification(c *gin.Context) {
	var req OrderStatusNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := c.GetString("role")
	if role != "farmer" && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only farmers can send order status notifications"})
		return
	}

	// Get order details
	orderID, err := primitive.ObjectIDFromHex(req.OrderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	orderCollection := config.GetCollection("orders")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var order struct {
		CustomerID primitive.ObjectID `bson:"customerId"`
	}
	err = orderCollection.FindOne(ctx, bson.M{"_id": orderID}).Decode(&order)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// Create notification
	notification := Notification{
		ID:      primitive.NewObjectID(),
		UserID:  order.CustomerID,
		Type:    "order_status",
		Title:   "Order Status Update",
		Message: getStatusMessage(req.Status),
		Data: map[string]interface{}{
			"orderId": req.OrderID,
			"status":  req.Status,
		},
		Read:      false,
		CreatedAt: time.Now(),
	}

	collection := config.GetCollection("notifications")
	_, err = collection.InsertOne(ctx, notification)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification sent successfully"})
}

func deleteNotification(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	userID := c.GetString("userID")
	customerID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetCollection("notifications")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": objectID, "userId": customerID}
	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted successfully"})
}

func getStatusMessage(status string) string {
	switch status {
	case "confirmed":
		return "Your order has been confirmed by the farmer"
	case "preparing":
		return "Your order is being prepared"
	case "ready":
		return "Your order is ready for pickup"
	case "out_for_delivery":
		return "Your order is out for delivery"
	case "delivered":
		return "Your order has been delivered"
	case "cancelled":
		return "Your order has been cancelled"
	default:
		return "Your order status has been updated"
	}
}