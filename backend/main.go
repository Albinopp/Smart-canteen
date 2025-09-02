package main

import (
	"backend/internal/controllers"
	"backend/internal/middleware"
	database "backend/internal/mogodb"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

func main() {
	// Connect to MongoDB
	database.Connect()

	// Setup Gin router
	r := gin.Default()

	// Enable CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // React frontend
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Routes
	r.POST("/signup", controllers.Signup)

	r.POST("/login", controllers.Login)

	r.POST("/products", middlewares.AuthMiddleware(), controllers.AddProduct)

	r.Run(":8080")
}
