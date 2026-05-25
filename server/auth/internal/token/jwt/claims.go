package jwt

import (
	golangjwt "github.com/golang-jwt/jwt/v5"
)

type AccessClaims struct {
	UserID      string   `json:"sub"`
	AccountID   string   `json:"account_id"`
	Email       string   `json:"email"`
	FullName    string   `json:"name,omitempty"`
	Role        string   `json:"role"`
	Permissions []string `json:"permissions,omitempty"`

	golangjwt.RegisteredClaims
}
