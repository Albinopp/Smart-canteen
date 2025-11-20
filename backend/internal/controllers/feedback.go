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
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SubmitFeedback(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    uid, ok := userID.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
        return
    }

    oid, err := primitive.ObjectIDFromHex(uid)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    var input struct {
        ProductID string `json:"productId" binding:"required"`
        Rating    int    `json:"rating" binding:"required,min=1,max=5"`
        Comment   string `json:"comment" binding:"required,max=500"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    pid, err := primitive.ObjectIDFromHex(input.ProductID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    feedback := model.Feedback{
        ProductID: pid,
        UserID:    oid,
        Rating:    input.Rating,
        Comment:   input.Comment,
        CreatedAt: time.Now().Unix(),
    }

    coll := mongodb.GetCollection("smartcanteen", "feedbacks")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    result, err := coll.InsertOne(ctx, feedback)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit feedback"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Feedback submitted successfully",
        "id":      result.InsertedID.(primitive.ObjectID).Hex(),
    })
}

func SubmitOrEditFeedback(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    uid, err := primitive.ObjectIDFromHex(userID.(string))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    var input struct {
        ProductID string `json:"productId" binding:"required"`
        Rating    int    `json:"rating" binding:"required"`
        Comment   string `json:"comment"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    pid, err := primitive.ObjectIDFromHex(input.ProductID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    feedbackColl := mongodb.GetCollection("smartcanteen", "feedback")

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    _, err = feedbackColl.UpdateOne(
        ctx,
        bson.M{"user_id": uid, "product_id": pid},
        bson.M{
            "$set": bson.M{
                "rating":    input.Rating,
                "comment":   input.Comment,
                "updatedAt": time.Now(),
            },
            "$setOnInsert": bson.M{
                "createdAt": time.Now(),
            },
        },
        options.Update().SetUpsert(true),
    )

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit feedback"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Feedback submitted/updated successfully"})
}


func GetFeedbackByProductID(ctx context.Context, productID primitive.ObjectID) ([]model.Feedback, error) {
	collection := mongodb.GetCollection("smartcanteen", "feedbacks")

	var feedback []model.Feedback

	cursor, err := collection.Find(ctx, bson.M{"productId": productID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &feedback); err != nil {
		return nil, err
	}

    slog.Info("feedback",feedback)
	return feedback, nil
}
