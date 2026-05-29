package jwt

import (
	"crypto/ed25519"
	"errors"
	"time"

	golangjwt "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/trunov/breitl/backend/server/auth/internal/domain/models"
)

type jwtService struct {
	privateKey ed25519.PrivateKey
	publicKey  ed25519.PublicKey
	issuer     string
}

type JWTService interface {
	NewAccessToken(user models.User, duration time.Duration, audience []string) (string, time.Time, error)
	ValidateAccessToken(tokenString string, audience string) (*AccessClaims, error)
}

func NewJWTService(privateKey ed25519.PrivateKey, publicKey ed25519.PublicKey, issuer string) JWTService {
	return &jwtService{
		privateKey: privateKey,
		publicKey:  publicKey,
		issuer:     issuer,
	}
}

func (s *jwtService) NewAccessToken(
	user models.User,
	duration time.Duration,
	audience []string,
) (string, time.Time, error) {
	now := time.Now().UTC()
	expiresAt := now.Add(duration)

	claims := AccessClaims{
		UserID:      user.ID,
		AccountID:   user.AccountID,
		Email:       user.Email,
		FullName:    user.FullName,
		Role:        string(user.Role),
		Permissions: permissionsForRole(user.Role),

		RegisteredClaims: golangjwt.RegisteredClaims{
			Issuer:    s.issuer,
			Audience:  audience,
			ExpiresAt: golangjwt.NewNumericDate(expiresAt),
			NotBefore: golangjwt.NewNumericDate(now),
			IssuedAt:  golangjwt.NewNumericDate(now),
			ID:        uuid.NewString(),
		},
	}

	token := golangjwt.NewWithClaims(golangjwt.SigningMethodEdDSA, claims)

	tokenString, err := token.SignedString(s.privateKey)
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}

func (s *jwtService) ValidateAccessToken(tokenString string, audience string) (*AccessClaims, error) {
	token, err := golangjwt.ParseWithClaims(
		tokenString,
		&AccessClaims{},
		func(token *golangjwt.Token) (interface{}, error) {
			if token.Method != golangjwt.SigningMethodEdDSA {
				return nil, errors.New("unexpected signing method")
			}

			return s.publicKey, nil
		},
		golangjwt.WithExpirationRequired(),
		golangjwt.WithIssuer(s.issuer),
		golangjwt.WithAudience(audience),
		golangjwt.WithIssuedAt(),
	)

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*AccessClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	if claims.UserID == "" {
		return nil, errors.New("missing user_id")
	}

	if claims.AccountID == "" {
		return nil, errors.New("missing account_id")
	}

	if claims.Role == "" {
		return nil, errors.New("missing role")
	}

	return claims, nil
}

func permissionsForRole(role models.UserRole) []string {
	switch role {
	case models.RoleOwner:
		return []string{
			"users:manage",
			"clients:read",
			"clients:write",
			"clients:delete",
			"products:read",
			"products:write",
			"products:delete",
			"categories:manage",
		}
	case models.RoleManager:
		return []string{
			"clients:read",
			"clients:write",
			"products:read",
			"products:write",
			"categories:manage",
		}
	case models.RoleWarehouse:
		return []string{
			"clients:read",
			"products:read",
		}
	case models.RoleViewer:
		return []string{
			"clients:read",
			"products:read",
		}
	default:
		return nil
	}
}
