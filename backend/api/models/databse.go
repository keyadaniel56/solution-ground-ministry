package models


type User struct{
	FirstName string `json:"firstname"`
	LastName string `json:"lastname"`
	Role string `json:"role"`
	Gender string `json:"gender"`
	Category string `json:"category"`
}