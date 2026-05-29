package handler

import (
	"encoding/json"
	"net/http"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func handleGRPCError(w http.ResponseWriter, err error) {
	grpcStatus, ok := status.FromError(err)
	if !ok {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	switch grpcStatus.Code() {
	case codes.InvalidArgument:
		http.Error(w, grpcStatus.Message(), http.StatusBadRequest)
	case codes.AlreadyExists:
		http.Error(w, grpcStatus.Message(), http.StatusConflict)
	case codes.PermissionDenied, codes.Unauthenticated:
		http.Error(w, grpcStatus.Message(), http.StatusUnauthorized)
	default:
		http.Error(w, grpcStatus.Message(), http.StatusInternalServerError)
	}
}

func writeJSON(w http.ResponseWriter, statusCode int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if err := json.NewEncoder(w).Encode(payload); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
