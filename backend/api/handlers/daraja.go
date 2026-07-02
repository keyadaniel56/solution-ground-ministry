package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sgm/api/models"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// Daraja configuration - use environment variables in production
const (
	ConsumerKey    = "YOUR_CONSUMER_KEY"    // Replace with your Safaricom Consumer Key
	ConsumerSecret = "YOUR_CONSUMER_SECRET" // Replace with your Safaricom Consumer Secret
	PassKey        = "YOUR_PASSKEY"         // Replace with your Safaricom PassKey
	ShortCode      = "174379"               // Replace with your shortcode (174379 is test)
	CallbackURL    = "https://your-domain.com/api/mpesa/callback"
	BusinessShortCode = "174379"
)

// MpesaAuthResponse from Safaricom
type MpesaAuthResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   string `json:"expires_in"`
}

// STKPushRequest to Safaricom
type STKPushRequest struct {
	BusinessShortCode string `json:"BusinessShortCode"`
	Password          string `json:"Password"`
	Timestamp         string `json:"Timestamp"`
	TransactionType   string `json:"TransactionType"`
	Amount            string `json:"Amount"`
	PartyA            string `json:"PartyA"`
	PartyB            string `json:"PartyB"`
	PhoneNumber       string `json:"PhoneNumber"`
	CallBackURL       string `json:"CallBackURL"`
	AccountReference  string `json:"AccountReference"`
	TransactionDesc   string `json:"TransactionDesc"`
}

// STKPushResponse from Safaricom
type STKPushResponse struct {
	MerchantRequestID   string `json:"MerchantRequestID"`
	CheckoutRequestID   string `json:"CheckoutRequestID"`
	ResponseCode        string `json:"ResponseCode"`
	ResponseDescription string `json:"ResponseDescription"`
	CustomerMessage     string `json:"CustomerMessage"`
}

// MpesaCallback from Safaricom
type MpesaCallback struct {
	Body struct {
		StkCallback struct {
			MerchantRequestID string `json:"MerchantRequestID"`
			CheckoutRequestID string `json:"CheckoutRequestID"`
			ResultCode        int    `json:"ResultCode"`
			ResultDesc        string `json:"ResultDesc"`
			CallbackMetadata  struct {
				Item []struct {
					Name  string      `json:"Name"`
					Value interface{} `json:"Value"`
				} `json:"Item"`
			} `json:"CallbackMetadata"`
		} `json:"stkCallback"`
	} `json:"Body"`
}

func generateTimestamp() string {
	now := time.Now()
	return now.Format("20060102150405")
}

func generatePassword() string {
	timestamp := generateTimestamp()
	data := BusinessShortCode + PassKey + timestamp
	return base64.StdEncoding.EncodeToString([]byte(data))
}

func getAccessToken() (string, error) {
	url := "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.SetBasicAuth(ConsumerKey, ConsumerSecret)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var authResp MpesaAuthResponse
	if err := json.Unmarshal(body, &authResp); err != nil {
		return "", err
	}

	return authResp.AccessToken, nil
}

func generateReference() string {
	b := make([]byte, 8)
	rand.Read(b)
	return fmt.Sprintf("INV%x", b)
}

// InitiateSTKPush initiates an M-Pesa STK Push
func InitiateSTKPush(c *gin.Context) {
	var req struct {
		Phone       string  `json:"phone" binding:"required"`
		Amount      float64 `json:"amount" binding:"required"`
		PaymentType string  `json:"payment_type"` // "tithe", "offering", "contribution"
		RefID       uint    `json:"ref_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Phone and amount are required"})
		return
	}

	// Clean phone number - ensure it starts with 254
	phone := req.Phone
	if strings.HasPrefix(phone, "0") {
		phone = "254" + phone[1:]
	} else if strings.HasPrefix(phone, "+") {
		phone = phone[1:]
	}

	accessToken, err := getAccessToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get M-Pesa access token: " + err.Error()})
		return
	}

	timestamp := generateTimestamp()
	password := generatePassword()
	reference := generateReference()

	stkPush := STKPushRequest{
		BusinessShortCode: BusinessShortCode,
		Password:          password,
		Timestamp:         timestamp,
		TransactionType:   "CustomerPayBillOnline",
		Amount:            fmt.Sprintf("%.0f", req.Amount),
		PartyA:            phone,
		PartyB:            BusinessShortCode,
		PhoneNumber:       phone,
		CallBackURL:       CallbackURL,
		AccountReference:  reference,
		TransactionDesc:   req.PaymentType,
	}

	jsonData, _ := json.Marshal(stkPush)
	apiURL := "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

	httpReq, _ := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	httpReq.Header.Set("Authorization", "Bearer "+accessToken)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initiate STK push: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var stkResp STKPushResponse
	json.Unmarshal(body, &stkResp)

	// Save transaction record
	transaction := models.MpesaTransaction{
		CheckoutID:   stkResp.CheckoutRequestID,
		MerchantID:   stkResp.MerchantRequestID,
		Phone:        phone,
		Amount:       req.Amount,
		Status:       "pending",
		PaymentType:  req.PaymentType,
		PaymentRefID: req.RefID,
	}
	models.DB.Create(&transaction)

	c.JSON(http.StatusOK, gin.H{
		"message":        "STK Push initiated. Check your phone to complete payment.",
		"checkout_id":    stkResp.CheckoutRequestID,
		"merchant_id":    stkResp.MerchantRequestID,
		"response_code":  stkResp.ResponseCode,
		"response_desc":  stkResp.ResponseDescription,
		"transaction_id": transaction.ID,
	})
}

// MpesaCallbackHandler handles M-Pesa payment callbacks
func MpesaCallbackHandler(c *gin.Context) {
	var callback MpesaCallback
	if err := c.ShouldBindJSON(&callback); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid callback data"})
		return
	}

	checkoutID := callback.Body.StkCallback.CheckoutRequestID
	resultCode := callback.Body.StkCallback.ResultCode
	resultDesc := callback.Body.StkCallback.ResultDesc

	// Extract M-Pesa code from metadata
	var mpesaCode string
	for _, item := range callback.Body.StkCallback.CallbackMetadata.Item {
		if item.Name == "MpesaReceiptNumber" {
			if v, ok := item.Value.(string); ok {
				mpesaCode = v
			}
		}
	}

	// Update transaction in database
	status := "completed"
	if resultCode != 0 {
		status = "failed"
	}

	models.DB.Model(&models.MpesaTransaction{}).
		Where("checkout_request_id = ?", checkoutID).
		Updates(map[string]interface{}{
			"mpesa_code": mpesaCode,
			"result_desc": resultDesc,
			"status":     status,
		})

	// If payment was successful, check if it was for a specific payment type
	if resultCode == 0 {
		var transaction models.MpesaTransaction
		models.DB.Where("checkout_request_id = ?", checkoutID).First(&transaction)

		// Get the user who initiated the payment
		var user models.User
		models.DB.Where("phone = ?", transaction.Phone).First(&user)

		if transaction.PaymentType == "tithe" {
			tithe := models.Tithe{
				UserID:    user.ID,
				Amount:    transaction.Amount,
				MpesaCode: mpesaCode,
				Phone:     transaction.Phone,
				Month:     time.Now().Format("January"),
				Year:      time.Now().Year(),
				Status:    "completed",
			}
			models.DB.Create(&tithe)
		} else if transaction.PaymentType == "offering" {
			offering := models.Offering{
				UserID:      user.ID,
				Amount:      transaction.Amount,
				MpesaCode:   mpesaCode,
				Phone:       transaction.Phone,
				ServiceType: "online",
				Status:      "completed",
			}
			models.DB.Create(&offering)
		} else if transaction.PaymentType == "contribution" && transaction.PaymentRefID > 0 {
			payment := models.ContributionPayment{
				ContributionID: transaction.PaymentRefID,
				UserID:         user.ID,
				Amount:         transaction.Amount,
				MpesaCode:      mpesaCode,
				Phone:          transaction.Phone,
				Status:         "completed",
			}
			models.DB.Create(&payment)

			// Update contribution raised amount
			var contribution models.Contribution
			models.DB.First(&contribution, transaction.PaymentRefID)
			newRaised := contribution.RaisedAmount + transaction.Amount
			newStatus := "active"
			if newRaised >= contribution.TargetAmount {
				newStatus = "completed"
			}
			models.DB.Model(&contribution).Updates(map[string]interface{}{
				"raised_amount": newRaised,
				"status":        newStatus,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Callback received"})
}