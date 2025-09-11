package controllers

import (
	"backend/internal/model"
	mongodb "backend/internal/mogodb"
	"context"
	"log/slog"
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

func GetProducts(c *gin.Context) {
	role, _ := c.Get("role")
	if role != "admin" && role != "user" {
		c.JSON(http.StatusForbidden, gin.H{"error": "No persmission to see food products"})
		return
	}
	collection := mongodb.GetCollection("smartcanteen", "products")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{"quantity": bson.M{"$gt": 0}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	defer cursor.Close(ctx)

	var products []model.Product
	if err := cursor.All(ctx, &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

func EditProduct(c *gin.Context) {
	id := c.Param("id")

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		slog.Error("invalid product id")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var input model.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		slog.Error("invalid input")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	collection := mongodb.GetCollection("smartcanteen", "products")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"name":        input.Name,
			"description": input.Description,
			"price":       input.Price,
			"quantity":    input.Quantity,
			"updatedAt":   time.Now(),
		},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		slog.Error("failed to update product")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully"})
}

// ✅ Delete Product
func DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	collection := mongodb.GetCollection("smartcanteen", "products")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}
