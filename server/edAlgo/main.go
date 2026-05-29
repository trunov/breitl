package main

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/pem"
	"os"
)

func main() {
	publicKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		panic(err)
	}

	privatePEM := pem.EncodeToMemory(&pem.Block{
		Type:  "ED25519 PRIVATE KEY",
		Bytes: privateKey,
	})

	publicPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "ED25519 PUBLIC KEY",
		Bytes: publicKey,
	})

	if err := os.WriteFile("ed25519_private.pem", privatePEM, 0600); err != nil {
		panic(err)
	}

	if err := os.WriteFile("ed25519_public.pem", publicPEM, 0644); err != nil {
		panic(err)
	}
}
