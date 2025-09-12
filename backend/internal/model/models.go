package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID       primitive.ObjectID `json:"id" bson:"_id"`
	Username string `json:"username" bson:"username"`
	Email    string `json:"email" bson:"email"`
	Password string `json:"password" bson:"password"`
	Role     string `json:"role" bson:"role"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type Product struct {
	ID          string  `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string  `bson:"name" json:"name" binding:"required"`
	Description string  `bson:"description" json:"description"`
	Price       float64 `bson:"price" json:"price" binding:"required"`
	Quantity    int     `bson:"quantity" json:"quantity" binding:"required"`
	CreatedBy   string  `bson:"createdBy" json:"createdBy"`
}

type AddtoCart struct {
	Quantity    int     `json:"quantity"`
}

type OrderItem struct {
	ProductID   string  `bson:"productId" json:"productId" binding:"required"`
	Name        string  `bson:"name" json:"name"`                   
	Price       float64 `bson:"price" json:"price" binding:"required"`
	Quantity    int     `bson:"quantity" json:"quantity" binding:"required"`
	Total       float64 `bson:"total" json:"total"`                
}


type Order struct {
	ID           string       `bson:"_id,omitempty" json:"id,omitempty"`
	CustomerID   string       `bson:"customerId" json:"customerId" binding:"required"`
	CustomerName string       `bson:"customerName" json:"customerName"`
	CustomerEmail string      `bson:"customerEmail" json:"customerEmail"`
	Items        []OrderItem  `bson:"items" json:"items" binding:"required"`
	Total        float64      `bson:"total" json:"total"`                
	Status       string       `bson:"status" json:"status"`              
	PaymentMethod string      `bson:"paymentMethod" json:"paymentMethod"`
	IsPaid       bool         `bson:"isPaid" json:"isPaid"`
	CreatedAt    int64        `bson:"createdAt" json:"createdAt"`   
	Delivered bool `bson:"delivered" json:"delivered"`    
}
