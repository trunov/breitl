package jwt

import (
	"crypto/ed25519"
	"encoding/pem"
	"errors"
	"os"
)

func LoadEd25519PrivateKey(path string) (ed25519.PrivateKey, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(raw)
	if block == nil {
		return nil, errors.New("failed to decode private key PEM")
	}

	if block.Type != "ED25519 PRIVATE KEY" {
		return nil, errors.New("invalid private key type")
	}

	if len(block.Bytes) != ed25519.PrivateKeySize {
		return nil, errors.New("invalid ed25519 private key size")
	}

	return ed25519.PrivateKey(block.Bytes), nil
}

func LoadEd25519PublicKey(path string) (ed25519.PublicKey, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(raw)
	if block == nil {
		return nil, errors.New("failed to decode public key PEM")
	}

	if block.Type != "ED25519 PUBLIC KEY" {
		return nil, errors.New("invalid public key type")
	}

	if len(block.Bytes) != ed25519.PublicKeySize {
		return nil, errors.New("invalid ed25519 public key size")
	}

	return ed25519.PublicKey(block.Bytes), nil
}
