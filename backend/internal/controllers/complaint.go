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

func RaiseComplaint(c *gin.Context){
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	uidStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
		return
	}
	userName, _ := c.Get("username")

	var input model.ComplaintInput

	if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

	complaintColl := mongodb.GetCollection("smartcanteen", "complaint")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	complaint:=bson.M{
		"userId":uidStr,
		"userName":userName,
		"orderId":input.OrderID,
		"productId":input.ProductID,
		"subject":input.Subject,
		"description":input.Description,
		"status":"Pending",
		"adminNotes":input.AdminNotes,
		"createdAt": time.Now(),
	}

	_, err := complaintColl.InsertOne(ctx, complaint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "complaint reported successfully",
		"complaint":complaint,
	})
}

func GetComplaints(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
        return
    }

    uidStr, ok := userID.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    collection := mongodb.GetCollection("smartcanteen", "complaint")

    var complaints []model.Complaint

    cursor, err := collection.Find(ctx, bson.M{"userId": uidStr})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch complaints"})
        return
    }
    defer cursor.Close(ctx)

    if err := cursor.All(ctx, &complaints); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode complaints"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message":     "complaints fetched successfully",
        "complaints":  complaints,
    })
}

func GetAllComplaints(c *gin.Context) {
    role, _ := c.Get("role")
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins have access to this"})
		return
	}

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    collection := mongodb.GetCollection("smartcanteen", "complaint")

    var complaints []model.Complaint

    cursor, err := collection.Find(ctx, bson.M{})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch complaints"})
        return
    }
    defer cursor.Close(ctx)

    if err := cursor.All(ctx, &complaints); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode complaints"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message":     "complaints fetched successfully",
        "complaints":  complaints,
    })
}

func EditComplaint(c *gin.Context) {
    id := c.Param("id")

    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        slog.Error("invalid complaint id")
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid complaint ID"})
        return
    }

    var input model.EditComplaint

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    collection := mongodb.GetCollection("smartcanteen", "complaint")

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    updateFields := bson.M{}

    if input.Subject != "" {
        updateFields["subject"] = input.Subject
    }
    if input.Description != "" {
        updateFields["description"] = input.Description
    }
    if input.AdminNotes != "" {
        updateFields["adminNotes"] = input.AdminNotes
		updateFields["status"] = "acknowledged"
    }

    if len(updateFields) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "No valid fields to update"})
        return
    }

    update := bson.M{"$set": updateFields}

    _, err = collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
    if err != nil {
        slog.Error("failed to update complaint")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update complaint"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Complaint updated successfully"})
}

