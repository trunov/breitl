package config

import "os"

type Config struct {
	GRPCPort    string
	PostgresDSN string

	JWTPrivateKeyPath string
	JWTPublicKeyPath  string
	JWTIssuer         string
}

func ReadConfig() Config {
	return Config{
		GRPCPort:          getEnv("GRPC_PORT", ":3020"),
		PostgresDSN:       getEnv("POSTGRES_DSN", ""),
		JWTPrivateKeyPath: getEnv("JWT_PRIVATE_KEY_PATH", "/secrets/jwt/private.pem"),
		JWTPublicKeyPath:  getEnv("JWT_PUBLIC_KEY_PATH", "/secrets/jwt/public.pem"),
		JWTIssuer:         getEnv("JWT_ISSUER", "breitl-auth"),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
