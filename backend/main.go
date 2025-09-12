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
	database.Connect()

	r := gin.Default()

	// Enable CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Routes
	r.POST("/signup", controllers.Signup)

	r.POST("/login", controllers.Login)

	r.POST("/products", middlewares.AuthMiddleware(), controllers.AddProduct)
	r.GET("/products", middlewares.AuthMiddleware(), controllers.GetProducts)
	r.PUT("/products/:id", middlewares.AuthMiddleware(), controllers.EditProduct)
	r.DELETE("/products/:id", middlewares.AuthMiddleware(), controllers.DeleteProduct)

	r.POST("/addtocart/:id/:user_id", middlewares.AuthMiddleware(), controllers.AddtoCart)
	r.GET("/user/cart", middlewares.AuthMiddleware(), controllers.GetCart)

	r.POST("/user/order", middlewares.AuthMiddleware(), controllers.CreateOrder)
	r.POST("/user/payment/verify", middlewares.AuthMiddleware(), controllers.VerifyPayment)
	r.GET("/user/order/history", middlewares.AuthMiddleware(), controllers.GetOrder)

	r.GET("/admin/orders", middlewares.AuthMiddleware(), controllers.GetAllOrders)
	r.PATCH("/admin/order/:id/deliver", middlewares.AuthMiddleware(), controllers.MarkOrderDelivered)

	r.Run(":8080")
}
