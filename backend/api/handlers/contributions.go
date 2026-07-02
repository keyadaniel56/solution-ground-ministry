package handlers

import (
	"net/http"
	"sgm/api/models"

	"github.com/gin-gonic/gin"
)

func CreateContribution(c *gin.Context) {
	userID := c.GetUint("user_id")
	role, _ := c.Get("role")

	var req struct {
		Title        string  `json:"title" binding:"required"`
		Description  string  `json:"description"`
		TargetAmount float64 `json:"target_amount" binding:"required"`
		Deadline     string  `json:"deadline"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title and target amount are required"})
		return
	}

	contribution := models.Contribution{
		UserID:       userID,
		Title:        req.Title,
		Description:  req.Description,
		TargetAmount: req.TargetAmount,
		RaisedAmount: 0,
		CreatedBy:    role.(string),
		Status:       "active",
		Deadline:     req.Deadline,
	}

	result := models.DB.Create(&contribution)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create contribution"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Contribution created successfully",
		"id":      contribution.ID,
	})
}

func GetContributions(c *gin.Context) {
	role, _ := c.Get("role")
	var contributions []models.Contribution

	query := models.DB.Preload("Payments.User")

	if role == "youth_leader" {
		query = query.Where("created_by = ?", "youth_leader")
	} else if role == "member" {
		query = query.Where("status = ?", "active")
	}

	query.Order("created_at DESC").Find(&contributions)
	c.JSON(http.StatusOK, contributions)
}

func GetContribution(c *gin.Context) {
	id := c.Param("id")

	var contribution models.Contribution
	result := models.DB.Preload("Payments.User").First(&contribution, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contribution not found"})
		return
	}

	c.JSON(http.StatusOK, contribution)
}

func ContributeToFund(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var req struct {
		Amount    float64 `json:"amount" binding:"required"`
		MpesaCode string  `json:"mpesa_code"`
		Phone     string  `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount is required"})
		return
	}

	if req.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount must be greater than 0"})
		return
	}

	var contribution models.Contribution
	result := models.DB.First(&contribution, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contribution not found"})
		return
	}

	if contribution.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Contribution is not active"})
		return
	}

	// Create payment record
	payment := models.ContributionPayment{
		ContributionID: contribution.ID,
		UserID:         userID,
		Amount:         req.Amount,
		MpesaCode:      req.MpesaCode,
		Phone:          req.Phone,
		Status:         "completed",
	}

	tx := models.DB.Begin()

	if err := tx.Create(&payment).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record payment"})
		return
	}

	// Update raised amount
	newRaised := contribution.RaisedAmount + req.Amount
	newStatus := "active"
	if newRaised >= contribution.TargetAmount {
		newStatus = "completed"
	}

	if err := tx.Model(&contribution).Updates(map[string]interface{}{
		"raised_amount": newRaised,
		"status":        newStatus,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update contribution"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message": "Contribution successful",
		"amount":  req.Amount,
		"total":   newRaised,
	})
}

func GetContributionPayments(c *gin.Context) {
	id := c.Param("id")

	var payments []models.ContributionPayment
	models.DB.Where("contribution_id = ?", id).
		Preload("User").
		Order("created_at DESC").
		Find(&payments)

	c.JSON(http.StatusOK, payments)
}

func UpdateContributionStatus(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status is required"})
		return
	}

	result := models.DB.Model(&models.Contribution{}).Where("id = ?", id).Update("status", req.Status)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated"})
}

// Dashboard stats
func GetDashboardStats(c *gin.Context) {
	role, _ := c.Get("role")
	userID := c.GetUint("user_id")

	stats := gin.H{}

	// Total contributions count
	var totalContributions int64
	query := models.DB.Model(&models.Contribution{})
	if role == "youth_leader" {
		query = query.Where("created_by = ?", "youth_leader")
	}
	query.Count(&totalContributions)
	stats["total_contributions"] = totalContributions

	// Active contributions count
	var activeContributions int64
	models.DB.Model(&models.Contribution{}).Where("status = ?", "active").Count(&activeContributions)
	stats["active_contributions"] = activeContributions

	// Total tithes
	var totalTithes float64
	models.DB.Model(&models.Tithe{}).Select("COALESCE(SUM(amount), 0)").Scan(&totalTithes)
	stats["total_tithes"] = totalTithes

	// Total offerings
	var totalOfferings float64
	models.DB.Model(&models.Offering{}).Select("COALESCE(SUM(amount), 0)").Scan(&totalOfferings)
	stats["total_offerings"] = totalOfferings

	// Total members
	var totalMembers int64
	models.DB.Model(&models.User{}).Count(&totalMembers)
	stats["total_members"] = totalMembers

	// My contributions (if member)
	if role == "member" {
		var myContributions float64
		models.DB.Model(&models.ContributionPayment{}).Where("user_id = ?", userID).Select("COALESCE(SUM(amount), 0)").Scan(&myContributions)
		stats["my_total_contributions"] = myContributions
	}

	c.JSON(http.StatusOK, stats)
}