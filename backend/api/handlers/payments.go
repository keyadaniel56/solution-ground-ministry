package handlers

import (
	"net/http"
	"sgm/api/models"
	"time"

	"github.com/gin-gonic/gin"
)

// PayTithe records a tithe payment
func PayTithe(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Amount    float64 `json:"amount" binding:"required"`
		MpesaCode string  `json:"mpesa_code"`
		Phone     string  `json:"phone"`
		Month     string  `json:"month"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount is required"})
		return
	}

	now := time.Now()
	tithe := models.Tithe{
		UserID:    userID,
		Amount:    req.Amount,
		MpesaCode: req.MpesaCode,
		Phone:     req.Phone,
		Month:     req.Month,
		Year:      now.Year(),
		Status:    "completed",
	}

	if err := models.DB.Create(&tithe).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record tithe"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tithe recorded successfully",
		"id":      tithe.ID,
	})
}

// GetTithes returns all tithe records based on role
func GetTithes(c *gin.Context) {
	role, _ := c.Get("role")
	userID := c.GetUint("user_id")

	var tithes []models.Tithe
	query := models.DB.Preload("User").Order("created_at DESC")

	if role == "member" {
		query = query.Where("user_id = ?", userID)
	}

	query.Find(&tithes)
	c.JSON(http.StatusOK, tithes)
}

// PayOffering records an offering payment
func PayOffering(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Amount      float64 `json:"amount" binding:"required"`
		MpesaCode   string  `json:"mpesa_code"`
		Phone       string  `json:"phone"`
		ServiceType string  `json:"service_type"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount is required"})
		return
	}

	offering := models.Offering{
		UserID:      userID,
		Amount:      req.Amount,
		MpesaCode:   req.MpesaCode,
		Phone:       req.Phone,
		ServiceType: req.ServiceType,
		Status:      "completed",
	}

	if err := models.DB.Create(&offering).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record offering"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Offering recorded successfully",
		"id":      offering.ID,
	})
}

// GetOfferings returns all offering records based on role
func GetOfferings(c *gin.Context) {
	role, _ := c.Get("role")
	userID := c.GetUint("user_id")

	var offerings []models.Offering
	query := models.DB.Preload("User").Order("created_at DESC")

	if role == "member" {
		query = query.Where("user_id = ?", userID)
	}

	query.Find(&offerings)
	c.JSON(http.StatusOK, offerings)
}

// GetTransactions returns all M-Pesa transactions
func GetTransactions(c *gin.Context) {
	var transactions []models.MpesaTransaction
	models.DB.Order("created_at DESC").Find(&transactions)
	c.JSON(http.StatusOK, transactions)
}