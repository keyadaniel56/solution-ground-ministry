package models

import (
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// User model
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	FirstName string    `json:"firstname" gorm:"not null"`
	LastName  string    `json:"lastname" gorm:"not null"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"`
	Phone     string    `json:"phone"`
	Role      string    `json:"role" gorm:"default:member"` // "admin", "pastor", "youth_leader", "member"
	Gender    string    `json:"gender"`
	Category  string    `json:"category"` // "youth", "adult", "children"
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Contribution model
type Contribution struct {
	ID           uint                   `json:"id" gorm:"primaryKey"`
	UserID       uint                   `json:"user_id" gorm:"not null"`
	Title        string                 `json:"title" gorm:"not null"`
	Description  string                 `json:"description"`
	TargetAmount float64                `json:"target_amount" gorm:"not null"`
	RaisedAmount float64                `json:"raised_amount" gorm:"default:0"`
	CreatedBy    string                 `json:"created_by"` // role who created it
	Status       string                 `json:"status" gorm:"default:active"` // "active", "completed", "cancelled"
	Deadline     string                 `json:"deadline"`
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
	Payments     []ContributionPayment  `json:"payments,omitempty" gorm:"foreignKey:ContributionID"`
}

// ContributionPayment model
type ContributionPayment struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	ContributionID uint      `json:"contribution_id" gorm:"not null"`
	UserID         uint      `json:"user_id" gorm:"not null"`
	Amount         float64   `json:"amount" gorm:"not null"`
	MpesaCode      string    `json:"mpesa_code"`
	Phone          string    `json:"phone"`
	Status         string    `json:"status" gorm:"default:pending"`
	CreatedAt      time.Time `json:"created_at"`
	User           User      `json:"user" gorm:"foreignKey:UserID"`
}

// Tithe model
type Tithe struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UserID     uint      `json:"user_id" gorm:"not null"`
	Amount     float64   `json:"amount" gorm:"not null"`
	MpesaCode  string    `json:"mpesa_code"`
	Phone      string    `json:"phone"`
	Month      string    `json:"month"`
	Year       int       `json:"year"`
	Status     string    `json:"status" gorm:"default:pending"`
	CreatedAt  time.Time `json:"created_at"`
	User       User      `json:"user" gorm:"foreignKey:UserID"`
}

// Offering model
type Offering struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"not null"`
	Amount      float64   `json:"amount" gorm:"not null"`
	MpesaCode   string    `json:"mpesa_code"`
	Phone       string    `json:"phone"`
	ServiceType string    `json:"service_type"` // "sunday", "wednesday", "special"
	Status      string    `json:"status" gorm:"default:pending"`
	CreatedAt   time.Time `json:"created_at"`
	User        User      `json:"user" gorm:"foreignKey:UserID"`
}

// MpesaTransaction model for Daraja API
type MpesaTransaction struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	CheckoutID      string    `json:"checkout_request_id"`
	MerchantID      string    `json:"merchant_request_id"`
	Phone           string    `json:"phone"`
	Amount          float64   `json:"amount"`
	MpesaCode       string    `json:"mpesa_code"`
	ResultDesc      string    `json:"result_desc"`
	Status          string    `json:"status" gorm:"default:pending"`
	PaymentType     string    `json:"payment_type"` // "tithe", "offering", "contribution"
	PaymentRefID    uint      `json:"payment_ref_id"`
	CreatedAt       time.Time `json:"created_at"`
}

// Login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Register request
type RegisterRequest struct {
	FirstName string `json:"firstname" binding:"required"`
	LastName  string `json:"lastname" binding:"required"`
	Email     string `json:"email" binding:"required"`
	Password  string `json:"password" binding:"required"`
	Phone     string `json:"phone"`
	Role      string `json:"role"`
	Gender    string `json:"gender"`
	Category  string `json:"category"`
}

// MpesaSTKPushRequest for initiating M-Pesa payment
type MpesaSTKPushRequest struct {
	Phone   string  `json:"phone" binding:"required"`
	Amount  float64 `json:"amount" binding:"required"`
	Account string  `json:"account"` // reference
}

// InitDB initializes the database
func InitDB(dbPath string) {
	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate models
	err = DB.AutoMigrate(
		&User{},
		&Contribution{},
		&ContributionPayment{},
		&Tithe{},
		&Offering{},
		&MpesaTransaction{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migrated successfully")
	seedDefaultUsers()
}

func seedDefaultUsers() {
	var count int64
	DB.Model(&User{}).Count(&count)
	if count > 0 {
		return
	}

	defaultUsers := []User{
		{FirstName: "Admin", LastName: "User", Email: "admin@church.com", Password: "admin123", Phone: "0712345678", Role: "admin", Gender: "male", Category: "adult"},
		{FirstName: "Pastor", LastName: "Main", Email: "pastor@church.com", Password: "pastor123", Phone: "0723456789", Role: "pastor", Gender: "male", Category: "adult"},
		{FirstName: "Youth", LastName: "Leader", Email: "youth@church.com", Password: "youth123", Phone: "0734567890", Role: "youth_leader", Gender: "female", Category: "youth"},
		{FirstName: "John", LastName: "Member", Email: "john@church.com", Password: "member123", Phone: "0745678901", Role: "member", Gender: "male", Category: "youth"},
	}

	for i := range defaultUsers {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(defaultUsers[i].Password), bcrypt.DefaultCost)
		if err != nil {
			log.Println("Error hashing password:", err)
			continue
		}
		defaultUsers[i].Password = string(hashedPassword)
		DB.Create(&defaultUsers[i])
	}
	log.Println("Default users seeded successfully")
}