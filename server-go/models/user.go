package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name" binding:"required"`
	Email     string             `json:"email" bson:"email" binding:"required,email"`
	Password  string             `json:"password,omitempty" bson:"password" binding:"required"`
	Role      string             `json:"role" bson:"role" binding:"required"` // "farmer" or "customer"
	Phone     string             `json:"phone,omitempty" bson:"phone"`
	Location  string             `json:"location,omitempty" bson:"location"`
	Avatar    string             `json:"avatar,omitempty" bson:"avatar"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required"`
	Phone    string `json:"phone,omitempty"`
	Location string `json:"location,omitempty"`
}