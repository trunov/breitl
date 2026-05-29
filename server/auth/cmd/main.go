package main

import (
	"context"
	"log"
	"net"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/trunov/breitl/backend/server/auth/internal/config"
	"github.com/trunov/breitl/backend/server/auth/internal/lib/jwt"
	"github.com/trunov/breitl/backend/server/auth/internal/storage/postgres"
	pb "github.com/trunov/breitl/backend/server/auth/proto"
	"google.golang.org/grpc"
)

func main() {
	cfg := config.ReadConfig()

	if cfg.PostgresDSN == "" {
		log.Fatal("PostgresDSN should be provided")
	}

	if cfg.JWTPrivateKeyPath == "" {
		log.Fatal("JWTPrivateKeyPath should be provided")
	}

	if cfg.JWTPublicKeyPath == "" {
		log.Fatal("JWTPublicKeyPath should be provided")
	}

	if cfg.JWTIssuer == "" {
		log.Fatal("JWTIssuer should be provided")
	}

	ctx := context.Background()

	listen, err := net.Listen("tcp", cfg.GRPCPort)
	if err != nil {
		log.Fatal(err)
	}

	grpcServer := grpc.NewServer()

	dbpool, err := pgxpool.Connect(ctx, cfg.PostgresDSN)
	if err != nil {
		log.Fatal(err)
	}

	privateKey, err := jwt.LoadEd25519PrivateKey(cfg.JWTPrivateKeyPath)
	if err != nil {
		log.Fatalf("failed to load JWT private key: %v", err)
	}

	publicKey, err := jwt.LoadEd25519PublicKey(cfg.JWTPublicKeyPath)
	if err != nil {
		log.Fatalf("failed to load JWT public key: %v", err)
	}

	storage := postgres.NewDBStorage(dbpool)
	jwtService := jwt.NewJWTService(
		privateKey,
		publicKey,
		cfg.JWTIssuer,
	)

	authServer := NewAuthServer(storage, jwtService)

	pb.RegisterAuthServer(grpcServer, authServer)

	log.Printf("Running GRPC on port %s", cfg.GRPCPort)
	if err := grpcServer.Serve(listen); err != nil {
		log.Fatal(err)
	}
}
