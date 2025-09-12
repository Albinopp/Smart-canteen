package controllers

import (
	"backend/internal/model"
	mongodb "backend/internal/mogodb"
	"context"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/razorpay/razorpay-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateOrder(c *gin.Context) {
	err := godotenv.Load()
	if err != nil {
		slog.Error("No .env file found, falling back to system environment")
	}

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

	uid, err := primitive.ObjectIDFromHex(uidStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	cartColl := mongodb.GetCollection("smartcanteen", "addtocart")
	orderColl := mongodb.GetCollection("smartcanteen", "orders")
	productColl := mongodb.GetCollection("smartcanteen", "products")
	userColl := mongodb.GetCollection("smartcanteen", "users")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user model.User
	if err := userColl.FindOne(ctx, bson.M{"_id": uid}).Decode(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
		return
	}

	cursor, err := cartColl.Find(ctx, bson.M{"user_id": uid})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}
	defer cursor.Close(ctx)

	var cartItems []bson.M
	if err := cursor.All(ctx, &cartItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse cart"})
		return
	}

	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	var orderItems []model.OrderItem
	var subTotal float64 = 0

	for _, item := range cartItems {
		productIDHex, _ := item["product_id"].(primitive.ObjectID)
		quantity := int(item["quantity"].(int32))

		var product model.Product
		err := productColl.FindOne(ctx, bson.M{"_id": productIDHex}).Decode(&product)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
			return
		}

		total := product.Price * float64(quantity)

		orderItem := model.OrderItem{
			ProductID: product.ID,
			Name:      product.Name,
			Price:     product.Price,
			Quantity:  quantity,
			Total:     total,
		}

		orderItems = append(orderItems, orderItem)
		subTotal += total
	}

	order := model.Order{
		CustomerID:    uidStr,
		CustomerName:  user.Username,
		CustomerEmail: user.Email,
		Items:         orderItems,
		Total:         subTotal,
		Status:        "Pending",
		PaymentMethod: "razorpay",
		IsPaid:        false,
		CreatedAt:     time.Now().Unix(),
	}

	res, err := orderColl.InsertOne(ctx, order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	insertedID := res.InsertedID.(primitive.ObjectID).Hex()

	client := razorpay.NewClient(os.Getenv("RAZORPAY_KEY_ID"), os.Getenv("RAZORPAY_KEY_SECRET"))

	data := map[string]interface{}{
		"amount":          int(subTotal * 100),
		"currency":        "INR",
		"receipt":         insertedID,
		"payment_capture": 1,
	}

	razorOrder, err := client.Order.Create(data, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Razorpay order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":         "Order created successfully",
		"orderID":         insertedID,
		"razorpayOrderID": razorOrder["id"],
		"amount":          razorOrder["amount"],
		"currency":        razorOrder["currency"],
		"key":             os.Getenv("RAZORPAY_KEY_ID"),
		"user": gin.H{
			"name":  user.Username,
			"email": user.Email,
		},
	})
}


func GetOrder(c *gin.Context) {
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

	orderColl := mongodb.GetCollection("smartcanteen", "orders")
	productColl := mongodb.GetCollection("smartcanteen", "products")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := orderColl.Find(ctx, bson.M{"customerId": uidStr})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	defer cursor.Close(ctx)

	var orders []model.Order
	if err := cursor.All(ctx, &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse orders"})
		return
	}

	for i, order := range orders {
		for j, item := range order.Items {
			var product model.Product
			err := productColl.FindOne(ctx, bson.M{"_id": item.ProductID}).Decode(&product)
			if err == nil {
				orders[i].Items[j].Name = product.Name
				orders[i].Items[j].Price = product.Price
				orders[i].Items[j].Total = product.Price * float64(item.Quantity)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
	})
}

func GetAllOrders(c *gin.Context) {
	role, _ := c.Get("role")
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	orderColl := mongodb.GetCollection("smartcanteen", "orders")
	productColl := mongodb.GetCollection("smartcanteen", "products")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := orderColl.Find(ctx, bson.M{}) 
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	defer cursor.Close(ctx)

	var orders []model.Order
	if err := cursor.All(ctx, &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse orders"})
		return
	}

	for i, order := range orders {
		for j, item := range order.Items {
			var product model.Product
			err := productColl.FindOne(ctx, bson.M{"_id": item.ProductID}).Decode(&product)
			if err == nil {
				orders[i].Items[j].Name = product.Name
				orders[i].Items[j].Price = product.Price
				orders[i].Items[j].Total = product.Price * float64(item.Quantity)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders, 
	})
}


func MarkOrderDelivered(c *gin.Context) {
	role, _ := c.Get("role")
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	orderID := c.Param("id")
	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
		return
	}

	orderColl := mongodb.GetCollection("smartcanteen", "orders")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"delivered": true,
			"status":    "Delivered",
		},
	}

	objID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	res, err := orderColl.UpdateByID(ctx, objID, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
		return
	}
	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order marked as delivered"})
}
