package model

type User struct {
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
