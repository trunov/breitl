package models

type UserRole string

const (
	RoleOwner     UserRole = "owner"
	RoleManager   UserRole = "manager"
	RoleWarehouse UserRole = "warehouse"
	RoleViewer    UserRole = "viewer"
)

type User struct {
	ID           string
	AccountID    string
	FullName     string
	Email        string
	PasswordHash string
	Role         UserRole
	IsActive     bool
}
