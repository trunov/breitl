package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"sync"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/trunov/breitl/server/http/internal/storage/postgres"
	pb "github.com/trunov/breitl/server/http/pb"
)

type Client struct {
	ID     string
	Conn   *websocket.Conn
	UserID int64
}

type Storager interface {
	StoreData(ctx context.Context, userID int64, data_type int, binary_data []byte, meta_info string) (*postgres.Credential, error)
	RetrieveCredentials(ctx context.Context, userID int64) ([]postgres.Credential, error)
}

type Handler struct {
	grpcClient pb.AuthClient
	storage    Storager
	version    string
	clients    map[string]*Client
	lock       sync.Mutex
}

type StoreRequest struct {
	DataType   string `json:"data_type"`
	BinaryData []byte `json:"binary_data"`
	MetaInfo   string `json:"meta_info"`
	ClientID   string `json:"client_id"`
}

func NewHandler(grpcClient pb.AuthClient, storage Storager, version string) *Handler {
	return &Handler{grpcClient: grpcClient, storage: storage, version: version, clients: make(map[string]*Client)}
}

func (h *Handler) AddClient(client *Client) {
	h.lock.Lock()
	defer h.lock.Unlock()
	h.clients[client.ID] = client
}

func (h *Handler) RemoveClient(clientID string) {
	h.lock.Lock()
	defer h.lock.Unlock()
	delete(h.clients, clientID)
}

// TODO: Create errorhandler package

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req RegRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response, err := h.grpcClient.Register(ctx, &pb.RegisterRequest{
		FullName:    req.FullName,
		CompanyName: req.CompanyName,
		Email:       req.Email,
		Password:    req.Password,
	})
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, RegisterResponse{
		AccountID: response.AccountId,
		UserID:    response.UserId,
		Token:     response.Token,
		ExpiresAt: response.ExpiresAt,
	})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response, err := h.grpcClient.Login(ctx, &pb.LoginRequest{
		AccountId: req.AccountID,
		Email:     req.Email,
		Password:  req.Password,
	})
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, LoginResponse{
		Token:     response.Token,
		ExpiresAt: response.ExpiresAt,
	})
}

// func (h *Handler) Store(w http.ResponseWriter, r *http.Request) {
// 	ctx := context.Background()

// 	token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")

// 	authResp, err := h.grpcClient.Authenticate(ctx, &pb.AuthenticateRequest{
// 		Token: token,
// 	})
// 	if err != nil {
// 		// TODO: check if token is expired error than StatusUnauthorized else Internal
// 		fmt.Println(err)
// 		http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 		return
// 	}
// 	userID := authResp.UserID

// 	fmt.Fprintf(w, "%d", userID)

// 	var req StoreRequest
// 	err = json.NewDecoder(r.Body).Decode(&req)
// 	if err != nil {
// 		http.Error(w, "Bad Request", http.StatusBadRequest)
// 		return
// 	}

// 	dataTypeToID := map[string]int{
// 		"Login/Password": 1,
// 		"Text data":      2,
// 		"Binary data":    3,
// 		"Bank card":      4,
// 	}

// 	cred, err := h.storage.StoreData(ctx, userID, dataTypeToID[req.DataType], req.BinaryData, req.MetaInfo)
// 	if err != nil {
// 		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
// 		return
// 	}

// 	h.BroadcastToUser(cred, req.ClientID)

// 	w.WriteHeader(http.StatusCreated)
// }

// func (h *Handler) RetrieveCredentials(w http.ResponseWriter, r *http.Request) {
// 	ctx := r.Context()

// 	token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
// 	if token == "" {
// 		http.Error(w, "Authorization token is required", http.StatusUnauthorized)
// 		return
// 	}

// 	authResp, err := h.grpcClient.Authenticate(ctx, &pb.AuthenticateRequest{
// 		Token: token,
// 	})
// 	if err != nil {
// 		// TODO: Properly check the error type to distinguish between unauthorized and other errors
// 		fmt.Println(err)
// 		http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 		return
// 	}
// 	userID := authResp.UserID

// 	credentials, err := h.storage.RetrieveCredentials(ctx, userID)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Error retrieving credentials: %v", err), http.StatusInternalServerError)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	err = json.NewEncoder(w).Encode(credentials)
// 	if err != nil {
// 		http.Error(w, "Failed to encode credentials", http.StatusInternalServerError)
// 		return
// 	}
// }

func (h *Handler) GetVersion(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte(h.version))
}

func GenerateUniqueID() string {
	return uuid.New().String()
}

func NewRouter(h *Handler) chi.Router {
	r := chi.NewRouter()

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/register", h.Register)
		r.Post("/login", h.Login)
		// r.Post("/store", h.Store)

		// r.Get("/store", h.RetrieveCredentials)
		r.Get("/version", h.GetVersion)
	})

	return r
}
