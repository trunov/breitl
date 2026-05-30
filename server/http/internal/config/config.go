package config

import (
	"flag"
	"os"
)

type Config struct {
	ServerAddress     string
	GRPCServerAddress string
	PostgresDSN       string

	AutocertCacheDir string
	AutocertHosts    []string
}

func ReadConfig() Config {
	serverAddress := flag.String(
		"addr",
		getEnv("SERVER_ADDRESS", "localhost:3000"),
		"HTTP server address",
	)

	grpcServerAddress := flag.String(
		"grpc-addr",
		getEnv("GRPC_SERVER_ADDRESS", "localhost:3200"),
		"gRPC auth server address",
	)

	postgresDSN := flag.String(
		"postgres-dsn",
		getEnv("POSTGRES_DSN", ""),
		"Postgres DSN",
	)

	flag.Parse()

	return Config{
		ServerAddress:     *serverAddress,
		GRPCServerAddress: *grpcServerAddress,
		PostgresDSN:       *postgresDSN,
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
