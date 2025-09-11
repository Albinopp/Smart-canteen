package controllers

import (
	"backend/internal/model"
	mongodb "backend/internal/mogodb"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func VerifyPayment(c *gin.Context) {
	var body struct {
		RazorpayPaymentID string `json:"razorpay_payment_id"`
		RazorpayOrderID   string `json:"razorpay_order_id"`
		RazorpaySignature string `json:"razorpay_signature"`
		OrderID           string `json:"orderID"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	keySecret := os.Getenv("RAZORPAY_KEY_SECRET")
	data := body.RazorpayOrderID + "|" + body.RazorpayPaymentID

	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	generatedSignature := hex.EncodeToString(h.Sum(nil))

	if generatedSignature != body.RazorpaySignature {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment signature"})
		return
	}

	oid, err := primitive.ObjectIDFromHex(body.OrderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Mongo order ID"})
		return
	}

	orderColl := mongodb.GetCollection("smartcanteen", "orders")
	cartColl := mongodb.GetCollection("smartcanteen", "addtocart")
	productColl := mongodb.GetCollection("smartcanteen", "products")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var order model.Order
	if err := orderColl.FindOne(ctx, bson.M{"_id": oid}).Decode(&order); err != nil {
		slog.Error("order not found")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Order not found"})
		return
	}

	for _, item := range order.Items {
		pid, err := primitive.ObjectIDFromHex(item.ProductID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		res, err := productColl.UpdateOne(
			ctx,
			bson.M{"_id": pid},
			bson.M{"$inc": bson.M{"quantity": -item.Quantity}},
		)
		if err != nil || res.MatchedCount == 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product stock"})
			return
		}
	}


	_, err = orderColl.UpdateOne(
		ctx,
		bson.M{"_id": oid},
		bson.M{
			"$set": bson.M{
				"status":              "Paid",
				"isPaid":              true,
				"razorpay_payment_id": body.RazorpayPaymentID,
				"razorpay_order_id":   body.RazorpayOrderID,
				"updatedAt":           time.Now().Unix(),
			},
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	uid, err := primitive.ObjectIDFromHex(order.CustomerID)
	if err == nil {
		_, err = cartColl.DeleteMany(ctx, bson.M{"user_id": uid})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment verified, order completed"})
}
