package config

import "os"

type Config struct {
	PostgresDSN string
}

func ReadConfig() Config {
	return Config{
		PostgresDSN: os.Getenv("POSTGRES_DSN"),
	}
}
