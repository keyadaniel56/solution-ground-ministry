package main

import (
	"log"
	"sgm/api/handlers"
	"sgm/api/middleware"
	"sgm/api/models"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	models.InitDB("church.db")

	// Create Gin router
	r := gin.Default()

	// Serve static files from frontend directory
	r.Static("/static", "../frontend")
	r.StaticFile("/", "../frontend/index.html")

	// API routes
	api := r.Group("/api")
	{
		// Public routes
		api.POST("/register", handlers.Register)
		api.POST("/login", handlers.Login)

		// M-Pesa callback (public - Safaricom calls this)
		api.POST("/mpesa/callback", handlers.MpesaCallbackHandler)

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// User routes
			protected.GET("/profile", handlers.GetProfile)
			protected.GET("/users", handlers.GetUsers)

			// Dashboard stats
			protected.GET("/dashboard/stats", handlers.GetDashboardStats)

			// Contribution routes
			protected.POST("/contributions", middleware.RoleMiddleware("pastor", "youth_leader", "admin"), handlers.CreateContribution)
			protected.GET("/contributions", handlers.GetContributions)
			protected.GET("/contributions/:id", handlers.GetContribution)
			protected.POST("/contributions/:id/pay", handlers.ContributeToFund)
			protected.GET("/contributions/:id/payments", handlers.GetContributionPayments)
			protected.PUT("/contributions/:id/status", middleware.RoleMiddleware("pastor", "youth_leader", "admin"), handlers.UpdateContributionStatus)

			// Tithe routes
			protected.POST("/tithes/pay", handlers.PayTithe)
			protected.GET("/tithes", handlers.GetTithes)

			// Offering routes
			protected.POST("/offerings/pay", handlers.PayOffering)
			protected.GET("/offerings", handlers.GetOfferings)

			// M-Pesa routes
			protected.POST("/mpesa/stkpush", handlers.InitiateSTKPush)
			protected.GET("/mpesa/transactions", handlers.GetTransactions)
		}
	}

	// Start server
	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}