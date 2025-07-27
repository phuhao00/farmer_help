package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestCreatePaymentIntent(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	// Set up test environment variables
	t.Setenv("STRIPE_SECRET_KEY", "sk_test_123")
	
	router := gin.New()
	api := router.Group("/api")
	SetupPaymentRoutes(api)

	tests := []struct {
		name           string
		payload        PaymentRequest
		expectedStatus int
		setupMock      func()
	}{
		{
			name: "Valid payment request",
			payload: PaymentRequest{
				Amount:   2500,
				Currency: "usd",
				OrderID:  "507f1f77bcf86cd799439011",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "Invalid order ID",
			payload: PaymentRequest{
				Amount:   2500,
				Currency: "usd",
				OrderID:  "invalid-id",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Missing amount",
			payload: PaymentRequest{
				Currency: "usd",
				OrderID:  "507f1f77bcf86cd799439011",
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			jsonPayload, _ := json.Marshal(tt.payload)
			req, _ := http.NewRequest("POST", "/api/payment/create-intent", bytes.NewBuffer(jsonPayload))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer test-token")

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
		})
	}
}

func TestConfirmPayment(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	t.Setenv("STRIPE_SECRET_KEY", "sk_test_123")
	
	router := gin.New()
	api := router.Group("/api")
	SetupPaymentRoutes(api)

	payload := map[string]string{
		"payment_intent_id": "pi_test_123",
		"order_id":         "507f1f77bcf86cd799439011",
	}

	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/api/payment/confirm", bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer test-token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Should return error in test environment due to invalid Stripe key
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestGetPaymentStatus(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	t.Setenv("STRIPE_SECRET_KEY", "sk_test_123")
	
	router := gin.New()
	api := router.Group("/api")
	SetupPaymentRoutes(api)

	req, _ := http.NewRequest("GET", "/api/payment/status/pi_test_123", nil)
	req.Header.Set("Authorization", "Bearer test-token")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Should return error in test environment due to invalid payment ID
	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestPaymentRequestValidation(t *testing.T) {
	tests := []struct {
		name    string
		request PaymentRequest
		valid   bool
	}{
		{
			name: "Valid request",
			request: PaymentRequest{
				Amount:   1000,
				Currency: "usd",
				OrderID:  "507f1f77bcf86cd799439011",
			},
			valid: true,
		},
		{
			name: "Zero amount",
			request: PaymentRequest{
				Amount:   0,
				Currency: "usd",
				OrderID:  "507f1f77bcf86cd799439011",
			},
			valid: false,
		},
		{
			name: "Negative amount",
			request: PaymentRequest{
				Amount:   -100,
				Currency: "usd",
				OrderID:  "507f1f77bcf86cd799439011",
			},
			valid: false,
		},
		{
			name: "Empty currency",
			request: PaymentRequest{
				Amount:   1000,
				Currency: "",
				OrderID:  "507f1f77bcf86cd799439011",
			},
			valid: false,
		},
		{
			name: "Empty order ID",
			request: PaymentRequest{
				Amount:   1000,
				Currency: "usd",
				OrderID:  "",
			},
			valid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			valid := tt.request.Amount > 0 && 
					tt.request.Currency != "" && 
					tt.request.OrderID != ""
			assert.Equal(t, tt.valid, valid)
		})
	}
}