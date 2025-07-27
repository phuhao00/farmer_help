package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderItem struct {
	ProductID primitive.ObjectID `json:"productId" bson:"productId"`
	Product   *Product           `json:"product,omitempty" bson:"product,omitempty"`
	Quantity  int                `json:"quantity" bson:"quantity"`
	Price     float64            `json:"price" bson:"price"`
}

type DeliveryAddress struct {
	Street  string `json:"street" bson:"street"`
	City    string `json:"city" bson:"city"`
	State   string `json:"state" bson:"state"`
	ZipCode string `json:"zipCode" bson:"zipCode"`
	Country string `json:"country" bson:"country"`
}

type Order struct {
	ID              primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	CustomerID      primitive.ObjectID `json:"customerId" bson:"customerId"`
	Customer        *User              `json:"customer,omitempty" bson:"customer,omitempty"`
	Items           []OrderItem        `json:"items" bson:"items"`
	TotalAmount     float64            `json:"totalAmount" bson:"totalAmount"`
	Status          string             `json:"status" bson:"status"` // pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled
	DeliveryAddress DeliveryAddress    `json:"deliveryAddress" bson:"deliveryAddress"`
	PaymentMethod   string             `json:"paymentMethod,omitempty" bson:"paymentMethod"`
	PaymentStatus   string             `json:"paymentStatus,omitempty" bson:"paymentStatus"`
	PaymentIntentID string             `json:"paymentIntentId,omitempty" bson:"paymentIntentId"`
	TrackingNumber  string             `json:"trackingNumber,omitempty" bson:"trackingNumber"`
	EstimatedDelivery time.Time        `json:"estimatedDelivery,omitempty" bson:"estimatedDelivery"`
	Notes           string             `json:"notes,omitempty" bson:"notes"`
	CreatedAt       time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt       time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type CreateOrderRequest struct {
	Items           []OrderItem     `json:"items" binding:"required"`
	DeliveryAddress DeliveryAddress `json:"deliveryAddress" binding:"required"`
	PaymentMethod   string          `json:"paymentMethod,omitempty"`
	Notes           string          `json:"notes,omitempty"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}