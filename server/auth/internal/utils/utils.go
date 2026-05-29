package utils

import (
	"fmt"
	"math/rand"
	"time"
)

func GenerateAccountID() string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	prefix := make([]byte, 3)
	for i := range prefix {
		prefix[i] = letters[r.Intn(len(letters))]
	}

	number := r.Intn(90000) + 10000

	return fmt.Sprintf("%s%d", string(prefix), number)
}
