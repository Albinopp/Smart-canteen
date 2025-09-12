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

func AddtoCart(c *gin.Context) {
    product_id := c.Param("id")
    user_id := c.Param("user_id")

    var input model.AddtoCart
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    role, _ := c.Get("role")
    if role != "user" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Only user can add products to cart"})
        return
    }

    // Convert IDs
    oid, err := primitive.ObjectIDFromHex(user_id)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }
    pid, err := primitive.ObjectIDFromHex(product_id)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    productColl := mongodb.GetCollection("smartcanteen", "products")
    var product bson.M
    if err := productColl.FindOne(ctx, bson.M{"_id": pid}).Decode(&product); err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    availableQty, ok := product["quantity"].(int32) 
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid product quantity"})
        return
    }

    if input.Quantity > int(availableQty) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity exceeds available stock"})
        return
    }

    cartColl := mongodb.GetCollection("smartcanteen", "addtocart")
    var existingCart bson.M
    err = cartColl.FindOne(ctx, bson.M{
        "user_id":    oid,
        "product_id": pid,
    }).Decode(&existingCart)

    if err == nil {
        newQty := existingCart["quantity"].(int32) + int32(input.Quantity)
        if int(newQty) > int(availableQty) {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Total quantity exceeds available stock"})
            return
        }

        _, err = cartColl.UpdateOne(
            ctx,
            bson.M{"_id": existingCart["_id"]},
            bson.M{"$set": bson.M{"quantity": newQty}},
        )
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "message": "Cart updated successfully",
        })
        return
    }

    cart := bson.M{
        "product_id": pid,
        "user_id":    oid,
        "quantity":   input.Quantity,
    }
    result, err := cartColl.InsertOne(ctx, cart)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add product to cart"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Product added successfully",
        "id":      result.InsertedID.(primitive.ObjectID).Hex(),
    })
}


func GetCart(c *gin.Context) {
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

	oid, err := primitive.ObjectIDFromHex(uidStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}


	cartColl := mongodb.GetCollection("smartcanteen", "addtocart")
	productColl := mongodb.GetCollection("smartcanteen", "products")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := cartColl.Find(ctx, bson.M{"user_id": oid})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}
	defer cursor.Close(ctx)

	var cartItems []bson.M
	if err = cursor.All(ctx, &cartItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse cart"})
		return
	}

	var response []gin.H
	var grandTotal float64 = 0

	for _, item := range cartItems {
		pid := item["product_id"].(primitive.ObjectID)

		var product bson.M
		err := productColl.FindOne(ctx, bson.M{"_id": pid}).Decode(&product)
		if err != nil {
			continue 
		}

		quantity := int(item["quantity"].(int32)) 
		price := product["price"].(float64)       
		total := float64(quantity) * price

		grandTotal += total

		response = append(response, gin.H{
			"name":        product["name"],
			"description": product["description"],
            "productId":pid,
			"price":       price,
			"quantity":    quantity,
            "totalQuantity":product["quantity"],
			"total":       total,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"items":      response,
		"grandTotal": grandTotal,
	})
}

func UpdateCart(c *gin.Context) {
    user_id := c.Param("user_id")
    product_id := c.Param("id")

    var input struct {
        Quantity int `json:"quantity" binding:"required"`
    }
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    if input.Quantity < 1 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity must be at least 1"})
        return
    }

    role, _ := c.Get("role")
    if role != "user" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Only user can update cart"})
        return
    }

    oid, err := primitive.ObjectIDFromHex(user_id)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }
    pid, err := primitive.ObjectIDFromHex(product_id)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    productColl := mongodb.GetCollection("smartcanteen", "products")
    var product bson.M
    if err := productColl.FindOne(ctx, bson.M{"_id": pid}).Decode(&product); err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    availableQty, ok := product["quantity"].(int32)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid product quantity"})
        return
    }

    if input.Quantity > int(availableQty) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity exceeds available stock"})
        return
    }

    cartColl := mongodb.GetCollection("smartcanteen", "addtocart")
    result, err := cartColl.UpdateOne(
        ctx,
        bson.M{"user_id": oid, "product_id": pid},
        bson.M{"$set": bson.M{"quantity": input.Quantity}},
    )

    if err != nil || result.MatchedCount == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Cart updated successfully",
    })
}

func RemoveCart(c *gin.Context) {
    user_id := c.Param("user_id")
    product_id := c.Param("id")

    role, _ := c.Get("role")
    if role != "user" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Only user can remove cart items"})
        return
    }

    oid, err := primitive.ObjectIDFromHex(user_id)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }
    pid, err := primitive.ObjectIDFromHex(product_id)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    cartColl := mongodb.GetCollection("smartcanteen", "addtocart")
    result, err := cartColl.DeleteOne(ctx, bson.M{"user_id": oid, "product_id": pid})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from cart"})
        return
    }
    if result.DeletedCount == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Product removed from cart"})
}
