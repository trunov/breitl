package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/trunov/breitl/backend/server/auth/internal/domain/models"
	"github.com/trunov/breitl/backend/server/auth/internal/utils"
)

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrDuplicateUserEmail = errors.New("user email already exists in account")
)

type dbStorage struct {
	dbpool *pgxpool.Pool
}

func NewDBStorage(conn *pgxpool.Pool) *dbStorage {
	return &dbStorage{dbpool: conn}
}

func (s *dbStorage) RegisterAccountWithOwner(
	ctx context.Context,
	companyName string,
	ownerFullName string,
	email string,
	passwordHash string,
) (models.Account, models.User, error) {
	tx, err := s.dbpool.Begin(ctx)
	if err != nil {
		return models.Account{}, models.User{}, fmt.Errorf("begin tx: %w", err)
	}

	defer func() {
		_ = tx.Rollback(ctx)
	}()

	accountID := utils.GenerateAccountID()

	account := models.Account{
		ID:   accountID,
		Name: "Default account",
	}

	insertAccountQuery := `
		INSERT INTO accounts (id, name)
		VALUES ($1, $2)
		RETURNING id, name
	`

	if err := tx.QueryRow(ctx, insertAccountQuery, account.ID, account.Name).Scan(
		&account.ID,
		&account.Name,
	); err != nil {
		return models.Account{}, models.User{}, fmt.Errorf("insert account: %w", err)
	}

	user := models.User{
		AccountID:    account.ID,
		CompanyName:  companyName,
		FullName:     ownerFullName,
		Email:        strings.ToLower(email),
		PasswordHash: passwordHash,
		Role:         models.RoleOwner,
		IsActive:     true,
	}

	insertUserQuery := `
		INSERT INTO users (
			account_id,
			company_name,
			full_name,
			email,
			password_hash,
			role,
			is_active
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, account_id, company_name, full_name, email, password_hash, role, is_active
	`

	err = tx.QueryRow(
		ctx,
		insertUserQuery,
		user.AccountID,
		user.CompanyName,
		user.FullName,
		user.Email,
		user.PasswordHash,
		user.Role,
		user.IsActive,
	).Scan(
		&user.ID,
		&user.AccountID,
		&user.CompanyName,
		&user.FullName,
		&user.Email,
		// no need for passwordhash return imo
		&user.PasswordHash,
		&user.Role,
		&user.IsActive,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return models.Account{}, models.User{}, ErrDuplicateUserEmail
		}

		return models.Account{}, models.User{}, fmt.Errorf("insert owner user: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return models.Account{}, models.User{}, fmt.Errorf("commit tx: %w", err)
	}

	return account, user, nil
}

func (s *dbStorage) FindUserByAccountAndEmail(
	ctx context.Context,
	accountID string,
	email string,
) (models.User, error) {
	var user models.User

	query := `
		SELECT
			id,
			account_id,
			full_name,
			email,
			password_hash,
			role,
			is_active
		FROM users
		WHERE account_id = $1
		  AND lower(email) = lower($2)
	`

	err := s.dbpool.QueryRow(ctx, query, accountID, email).Scan(
		&user.ID,
		&user.AccountID,
		&user.FullName,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
		&user.IsActive,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.User{}, ErrUserNotFound
		}

		return models.User{}, fmt.Errorf("find user by account and email: %w", err)
	}

	return user, nil
}
