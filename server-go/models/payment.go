package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Payment struct {
	ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	OrderID           primitive.ObjectID `json:"order_id" bson:"order_id"`
	UserID            primitive.ObjectID `json:"user_id" bson:"user_id"`
	Amount            int64              `json:"amount" bson:"amount"`
	Currency          string             `json:"currency" bson:"currency"`
	PaymentIntentID   string             `json:"payment_intent_id" bson:"payment_intent_id"`
	Status            string             `json:"status" bson:"status"` // pending, processing, completed, failed
	PaymentMethod     string             `json:"payment_method" bson:"payment_method"`
	StripeChargeID    string             `json:"stripe_charge_id" bson:"stripe_charge_id,omitempty"`
	CreatedAt         time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at" bson:"updated_at"`
}

type PaymentHistory struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	PaymentID primitive.ObjectID `json:"payment_id" bson:"payment_id"`
	Status    string             `json:"status" bson:"status"`
	Message   string             `json:"message" bson:"message"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}