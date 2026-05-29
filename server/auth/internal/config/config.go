package config

import (
	"flag"
	"os"
)

type Config struct {
	GRPCPort    string
	PostgresDSN string

	JWTPrivateKeyPath string
	JWTPublicKeyPath  string
	JWTIssuer         string
}

func ReadConfig() Config {
	grpcPort := flag.String("g", ":3200", "gRPC server port")
	postgresDSN := flag.String("d", "", "Postgres DSN")

	jwtPrivateKeyPath := flag.String(
		"jwt-private-key",
		getEnv("JWT_PRIVATE_KEY_PATH", ""),
		"Path to Ed25519 JWT private key PEM file",
	)

	jwtPublicKeyPath := flag.String(
		"jwt-public-key",
		getEnv("JWT_PUBLIC_KEY_PATH", ""),
		"Path to Ed25519 JWT public key PEM file",
	)

	jwtIssuer := flag.String(
		"jwt-issuer",
		getEnv("JWT_ISSUER", "breitl-auth"),
		"JWT issuer name",
	)

	flag.Parse()

	return Config{
		GRPCPort:          *grpcPort,
		PostgresDSN:       *postgresDSN,
		JWTPrivateKeyPath: *jwtPrivateKeyPath,
		JWTPublicKeyPath:  *jwtPublicKeyPath,
		JWTIssuer:         *jwtIssuer,
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
