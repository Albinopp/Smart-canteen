package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID       primitive.ObjectID `json:"id" bson:"_id"`
	Username string             `json:"username" bson:"username"`
	Email    string             `json:"email" bson:"email"`
	Password string             `json:"password" bson:"password"`
	Role     string             `json:"role" bson:"role"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type Product struct {
	ID          string     `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string     `bson:"name" json:"name" binding:"required"`
	Description string     `bson:"description" json:"description"`
	Price       float64    `bson:"price" json:"price" binding:"required"`
	Quantity    int        `bson:"quantity" json:"quantity" binding:"required"`
	CreatedBy   string     `bson:"createdBy" json:"createdBy"`
	Feedback    []Feedback `bson:"feedback" json:"feedback"`
}

type AddtoCart struct {
	Quantity int `json:"quantity"`
}

type OrderItem struct {
	ProductID string     `bson:"productId" json:"productId" binding:"required"`
	Name      string     `bson:"name" json:"name"`
	Price     float64    `bson:"price" json:"price" binding:"required"`
	Quantity  int        `bson:"quantity" json:"quantity" binding:"required"`
	Total     float64    `bson:"total" json:"total"`
	Feedback  []Feedback `bson:"feedback" json:"feedback"`
}

type Order struct {
	ID            string      `bson:"_id,omitempty" json:"id,omitempty"`
	CustomerID    string      `bson:"customerId" json:"customerId" binding:"required"`
	CustomerName  string      `bson:"customerName" json:"customerName"`
	CustomerEmail string      `bson:"customerEmail" json:"customerEmail"`
	Items         []OrderItem `bson:"items" json:"items" binding:"required"`
	Total         float64     `bson:"total" json:"total"`
	Status        string      `bson:"status" json:"status"`
	PaymentMethod string      `bson:"paymentMethod" json:"paymentMethod"`
	IsPaid        bool        `bson:"isPaid" json:"isPaid"`
	CreatedAt     int64       `bson:"createdAt" json:"createdAt"`
	Delivered     bool        `bson:"delivered" json:"delivered"`
}

type Feedback struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	ProductID primitive.ObjectID `bson:"productId" json:"productId" binding:"required"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId" binding:"required"`
	UserName  string             `bson:"userName" json:"userName"`
	Rating    int                `bson:"rating" json:"rating" binding:"required"`
	Comment   string             `bson:"comment" json:"comment" binding:"required"`
	CreatedAt int64              `bson:"createdAt" json:"createdAt"`
}

type Complaint struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id,omitempty"`
	UserID      string              `bson:"userId" json:"userId"`
	UserName    string              `bson:"userName" json:"userName"`
	OrderID     *primitive.ObjectID `bson:"orderId,omitempty" json:"orderId,omitempty"`
	ProductID   *primitive.ObjectID `bson:"productId,omitempty" json:"productId,omitempty"`
	Subject     string              `bson:"subject" json:"subject" binding:"required"`
	Description string              `bson:"description" json:"description" binding:"required"`
	Status      string              `bson:"status" json:"status"`
	AdminNotes  string              `bson:"adminNotes,omitempty" json:"adminNotes,omitempty"`
	CreatedAt   time.Time           `bson:"createdAt" json:"createdAt"`
}

type ComplaintInput struct {
	OrderID     *primitive.ObjectID `bson:"orderId,omitempty" json:"orderId,omitempty"`
	ProductID   *primitive.ObjectID `bson:"productId,omitempty" json:"productId,omitempty"`
	Subject     string              `bson:"subject" json:"subject" binding:"required"`
	Description string              `bson:"description" json:"description" binding:"required"`
	Status      string              `bson:"status" json:"status"`
	AdminNotes  string              `bson:"adminNotes,omitempty" json:"adminNotes,omitempty"`
}

type EditComplaint struct {
	Subject     string              `bson:"subject" json:"subject"`
	Description string              `bson:"description" json:"description"`
	Status      string              `bson:"status" json:"status"`
	AdminNotes  string              `bson:"adminNotes,omitempty" json:"adminNotes,omitempty"`
}
