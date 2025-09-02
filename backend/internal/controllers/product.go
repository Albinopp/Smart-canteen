package controllers

import (
	"backend/internal/model"
	mongodb "backend/internal/mogodb"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AddProduct(c *gin.Context) {
	var input model.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Attach creator info (from JWT context)
	createdBy, _ := c.Get("username")
	input.CreatedBy, _ = createdBy.(string)
	role, _ := c.Get("role")
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can add products"})
		return
	}

	// Insert into MongoDB
	collection := mongodb.GetCollection("smartcanteen", "products")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	product := bson.M{
		"name":        input.Name,
		"description": input.Description,
		"price":       input.Price,
		"quantity":    input.Quantity,
		"createdBy":   input.CreatedBy,
		"createdAt":   time.Now(),
	}

	result, err := collection.InsertOne(ctx, product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Product added successfully",
		"id":      result.InsertedID.(primitive.ObjectID).Hex(),
	})
}
