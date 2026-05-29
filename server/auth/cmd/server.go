package main

import (
	"context"
	"errors"
	"log"
	"strings"
	"time"

	"github.com/trunov/breitl/backend/server/auth/internal/domain/models"
	"github.com/trunov/breitl/backend/server/auth/internal/lib/jwt"
	"github.com/trunov/breitl/backend/server/auth/internal/storage/postgres"
	pb "github.com/trunov/breitl/backend/server/auth/proto"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const (
	accessTokenTTL  = time.Hour * 2
	defaultAudience = "erp-api"
)

type Storager interface {
	RegisterAccountWithOwner(
		ctx context.Context,
		companyName string,
		ownerFullName string,
		email string,
		passwordHash string,
	) (account models.Account, user models.User, err error)

	FindUserByAccountAndEmail(
		ctx context.Context,
		accountID string,
		email string,
	) (user models.User, err error)
}

type AuthServer struct {
	pb.UnimplementedAuthServer
	storage    Storager
	jwtService jwt.JWTService
}

func NewAuthServer(storage Storager, jwtService jwt.JWTService) *AuthServer {
	return &AuthServer{
		storage:    storage,
		jwtService: jwtService,
	}
}

func (s *AuthServer) Register(ctx context.Context, in *pb.RegisterRequest) (*pb.RegisterResponse, error) {
	companyName := strings.TrimSpace(in.CompanyName)
	fullName := strings.TrimSpace(in.FullName)
	email := strings.ToLower(strings.TrimSpace(in.Email))

	if companyName == "" {
		return nil, status.Error(codes.InvalidArgument, "company name is required")
	}

	if fullName == "" {
		return nil, status.Error(codes.InvalidArgument, "full name is required")
	}

	if email == "" {
		return nil, status.Error(codes.InvalidArgument, "email is required")
	}

	if len(in.Password) < 8 {
		return nil, status.Error(codes.InvalidArgument, "password must be at least 8 characters")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("failed to hash password: %v", err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	account, user, err := s.storage.RegisterAccountWithOwner(
		ctx,
		companyName,
		fullName,
		email,
		string(hashedPassword),
	)
	if err != nil {
		if errors.Is(err, postgres.ErrDuplicateUserEmail) {
			return nil, status.Errorf(codes.AlreadyExists, "user with email %s already exists in this account", email)
		}

		log.Printf("error registering account owner: %v", err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	token, expiresAt, err := s.jwtService.NewAccessToken(
		user,
		accessTokenTTL,
		[]string{defaultAudience},
	)
	if err != nil {
		log.Printf("failed to create access token: %v", err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	return &pb.RegisterResponse{
		AccountId: account.ID,
		UserId:    user.ID,
		Token:     token,
		ExpiresAt: expiresAt.Format(time.RFC3339),
	}, nil
}

func (s *AuthServer) Login(ctx context.Context, in *pb.LoginRequest) (*pb.LoginResponse, error) {
	accountID := strings.ToUpper(strings.TrimSpace(in.AccountId))
	email := strings.ToLower(strings.TrimSpace(in.Email))

	if accountID == "" {
		return nil, status.Error(codes.InvalidArgument, "account id is required")
	}

	if email == "" {
		return nil, status.Error(codes.InvalidArgument, "email is required")
	}

	if in.Password == "" {
		return nil, status.Error(codes.InvalidArgument, "password is required")
	}

	user, err := s.storage.FindUserByAccountAndEmail(ctx, accountID, email)
	if err != nil {
		if errors.Is(err, postgres.ErrUserNotFound) {
			return nil, status.Error(codes.PermissionDenied, "account id, email or password is incorrect")
		}

		log.Printf("internal error occurred while finding user: %v", err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	if !user.IsActive {
		return nil, status.Error(codes.PermissionDenied, "account id, email or password is incorrect")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(in.Password)); err != nil {
		return nil, status.Error(codes.PermissionDenied, "account id, email or password is incorrect")
	}

	token, expiresAt, err := s.jwtService.NewAccessToken(
		user,
		accessTokenTTL,
		[]string{defaultAudience},
	)
	if err != nil {
		log.Printf("failed to create access token: %v", err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	return &pb.LoginResponse{
		Token:     token,
		ExpiresAt: expiresAt.Format(time.RFC3339),
	}, nil
}

func (s *AuthServer) Authenticate(ctx context.Context, in *pb.AuthenticateRequest) (*pb.AuthenticateResponse, error) {
	token := strings.TrimSpace(in.Token)
	if token == "" {
		return nil, status.Error(codes.InvalidArgument, "token is required")
	}

	audience := strings.TrimSpace(in.Audience)
	if audience == "" {
		audience = defaultAudience
	}

	claims, err := s.jwtService.ValidateAccessToken(token, audience)
	if err != nil {
		return nil, status.Error(codes.PermissionDenied, "token is expired or invalid")
	}

	return &pb.AuthenticateResponse{
		UserId:      claims.Subject,
		AccountId:   claims.AccountID,
		Email:       claims.Email,
		FullName:    claims.FullName,
		Role:        claims.Role,
		Permissions: claims.Permissions,
	}, nil
}
