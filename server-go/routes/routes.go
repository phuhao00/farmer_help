package routes

import (
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Auth routes
		SetupAuthRoutes(api)
		
		// Product routes
		SetupProductRoutes(api)
		
		// Order routes
		SetupOrderRoutes(api)
		
		// Cart routes
		SetupCartRoutes(api)
		
		// Farmer routes
		SetupFarmerRoutes(api)
		
		// Payment routes
		SetupPaymentRoutes(api)
		
		// Notification routes
		SetupNotificationRoutes(api)
	}
}