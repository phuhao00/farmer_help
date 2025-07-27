package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Product struct {
	ID          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name" binding:"required"`
	Description string             `json:"description" bson:"description" binding:"required"`
	Price       float64            `json:"price" bson:"price" binding:"required"`
	Category    string             `json:"category" bson:"category" binding:"required"`
	Stock       int                `json:"stock" bson:"stock" binding:"required"`
	Unit        string             `json:"unit" bson:"unit" binding:"required"`
	Images      []string           `json:"images,omitempty" bson:"images"`
	IsOrganic   bool               `json:"isOrganic" bson:"isOrganic"`
	HarvestDate *time.Time         `json:"harvestDate,omitempty" bson:"harvestDate"`
	ExpiryDate  *time.Time         `json:"expiryDate,omitempty" bson:"expiryDate"`
	FarmerID    primitive.ObjectID `json:"farmerId" bson:"farmerId"`
	Farmer      *User              `json:"farmer,omitempty" bson:"farmer,omitempty"`
	Rating      float64            `json:"rating,omitempty" bson:"rating"`
	Orders      int                `json:"orders,omitempty" bson:"orders"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type CreateProductRequest struct {
	Name        string     `json:"name" binding:"required"`
	Description string     `json:"description" binding:"required"`
	Price       float64    `json:"price" binding:"required"`
	Category    string     `json:"category" binding:"required"`
	Stock       int        `json:"stock" binding:"required"`
	Unit        string     `json:"unit" binding:"required"`
	Images      []string   `json:"images,omitempty"`
	IsOrganic   bool       `json:"isOrganic"`
	HarvestDate *time.Time `json:"harvestDate,omitempty"`
	ExpiryDate  *time.Time `json:"expiryDate,omitempty"`
}