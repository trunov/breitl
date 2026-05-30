package main

import (
	"context"
	"net/http"
	"os"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/trunov/breitl/server/http/internal/config"
	"github.com/trunov/breitl/server/http/internal/grpcclient"
	"github.com/trunov/breitl/server/http/internal/handler"
	"github.com/trunov/breitl/server/http/internal/storage/postgres"
	"golang.org/x/crypto/acme/autocert"

	log "github.com/sirupsen/logrus"
)

var (
	Version string
)

// const (
// 	serverAddress     = "localhost:3000"
// 	grpcServerAddress = "localhost:3200"
// 	postgresDSN       = "postgres://trunov:98512@localhost:5432/breitl?sslmode=disable"
// )

func init() {
	log.SetFormatter(&log.JSONFormatter{})

	log.SetOutput(os.Stdout)

	log.SetLevel(log.InfoLevel)
}

func StartServer() error {
	ctx := context.Background()

	cfg := config.ReadConfig()

	authClient, err := grpcclient.NewAuthClient(cfg.GRPCServerAddress)
	if err != nil {
		log.Fatal(err)
	}

	dbpool, err := pgxpool.Connect(ctx, cfg.PostgresDSN)
	if err != nil {
		log.Fatal(err)
	}

	storage := postgres.NewDBStorage(dbpool)

	var server *http.Server

	h := handler.NewHandler(authClient, storage, Version)
	r := handler.NewRouter(h)

	manager := &autocert.Manager{
		Cache:      autocert.DirCache("cache-dir"),
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist("breitl.com", "www.breitl.com"),
	}

	server = &http.Server{
		Addr:      cfg.ServerAddress,
		Handler:   r,
		TLSConfig: manager.TLSConfig(),
	}

	log.Info("server has been started on: ", cfg.ServerAddress)
	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
		return err
	}

	return nil
}
