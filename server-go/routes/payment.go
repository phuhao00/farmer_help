package routes

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/paymentintent"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"farm-to-table/models"
	"farm-to-table/config"
)

type PaymentRequest struct {
	Amount   int64  `json:"amount"`
	Currency string `json:"currency"`
	OrderID  string `json:"order_id"`
}

type PaymentResponse struct {
	ClientSecret string `json:"client_secret"`
	PaymentID    string `json:"payment_id"`
}

func SetupPaymentRoutes(api *gin.RouterGroup) {
	payment := api.Group("/payment")
	{
		payment.POST("/create-intent", createPaymentIntent)
		payment.POST("/confirm", confirmPayment)
		payment.GET("/status/:payment_id", getPaymentStatus)
	}
}

func createPaymentIntent(c *gin.Context) {
	// Initialize Stripe
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	if stripe.Key == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Stripe configuration missing"})
		return
	}

	var req PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate order exists
	orderID, err := primitive.ObjectIDFromHex(req.OrderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var order models.Order
	collection := config.GetCollection("orders")
	err = collection.FindOne(c, gin.H{"_id": orderID}).Decode(&order)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// Create payment intent
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(req.Amount),
		Currency: stripe.String(req.Currency),
		Metadata: map[string]string{
			"order_id": req.OrderID,
		},
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		log.Printf("Payment intent creation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment intent"})
		return
	}

	// Update order with payment intent ID
	update := gin.H{
		"$set": gin.H{
			"payment_intent_id": pi.ID,
			"payment_status":    "pending",
		},
	}
	_, err = collection.UpdateOne(c, gin.H{"_id": orderID}, update)
	if err != nil {
		log.Printf("Failed to update order with payment intent: %v", err)
	}

	response := PaymentResponse{
		ClientSecret: pi.ClientSecret,
		PaymentID:    pi.ID,
	}

	c.JSON(http.StatusOK, response)
}

func confirmPayment(c *gin.Context) {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	
	var req struct {
		PaymentIntentID string `json:"payment_intent_id"`
		OrderID         string `json:"order_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Retrieve payment intent from Stripe
	pi, err := paymentintent.Get(req.PaymentIntentID, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve payment"})
		return
	}

	// Update order status based on payment status
	orderID, _ := primitive.ObjectIDFromHex(req.OrderID)
	collection := config.GetCollection("orders")
	
	var paymentStatus, orderStatus string
	switch pi.Status {
	case stripe.PaymentIntentStatusSucceeded:
		paymentStatus = "completed"
		orderStatus = "confirmed"
	case stripe.PaymentIntentStatusProcessing:
		paymentStatus = "processing"
		orderStatus = "pending"
	case stripe.PaymentIntentStatusRequiresPaymentMethod:
		paymentStatus = "failed"
		orderStatus = "payment_failed"
	default:
		paymentStatus = "pending"
		orderStatus = "pending"
	}

	update := gin.H{
		"$set": gin.H{
			"payment_status": paymentStatus,
			"status":         orderStatus,
			"updated_at":     primitive.NewDateTimeFromTime(primitive.DateTime(0).Time()),
		},
	}

	_, err = collection.UpdateOne(c, gin.H{"_id": orderID}, update)
	if err != nil {
		log.Printf("Failed to update order status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":         pi.Status,
		"payment_status": paymentStatus,
		"order_status":   orderStatus,
	})
}

func getPaymentStatus(c *gin.Context) {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	
	paymentID := c.Param("payment_id")
	
	pi, err := paymentintent.Get(paymentID, nil)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":     pi.ID,
		"status": pi.Status,
		"amount": pi.Amount,
	})
}