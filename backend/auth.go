package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

type authContextKey struct{}

func initFirebaseAuth() (*auth.Client, error) {
	if path := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"); path != "" {
		app, err := firebase.NewApp(context.Background(), nil, option.WithCredentialsFile(path))
		if err != nil {
			return nil, fmt.Errorf("error initializing Firebase app: %w", err)
		}

		client, err := app.Auth(context.Background())
		if err != nil {
			return nil, fmt.Errorf("error initializing Firebase auth client: %w", err)
		}

		return client, nil
	}

	if jsonData := os.Getenv("FIREBASE_SERVICE_ACCOUNT_JSON"); jsonData != "" {
		app, err := firebase.NewApp(context.Background(), nil, option.WithCredentialsJSON([]byte(jsonData)))
		if err != nil {
			return nil, fmt.Errorf("error initializing Firebase app: %w", err)
		}

		client, err := app.Auth(context.Background())
		if err != nil {
			return nil, fmt.Errorf("error initializing Firebase auth client: %w", err)
		}

		return client, nil
	}

	return nil, fmt.Errorf("missing Firebase credentials: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS")
}

func authMiddleware(client *auth.Client, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, err := getBearerToken(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		idToken, err := client.VerifyIDToken(r.Context(), token)
		if err != nil {
			http.Error(w, "invalid Firebase token: "+err.Error(), http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), authContextKey{}, idToken)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getBearerToken(r *http.Request) (string, error) {
	header := r.Header.Get("Authorization")
	if header == "" {
		return "", fmt.Errorf("missing Authorization header")
	}

	parts := strings.Fields(header)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return "", fmt.Errorf("invalid Authorization header format, expected Bearer token")
	}

	return parts[1], nil
}

func verifyTokenHandler(client *auth.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := getBearerToken(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		idToken, err := client.VerifyIDToken(r.Context(), token)
		if err != nil {
			http.Error(w, "invalid Firebase token: "+err.Error(), http.StatusUnauthorized)
			return
		}

		response := map[string]any{
			"uid":    idToken.UID,
			"claims": idToken.Claims,
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(response)
	}
}

func authorizedProfileHandler(w http.ResponseWriter, r *http.Request) {
	tokenValue := r.Context().Value(authContextKey{})
	if tokenValue == nil {
		http.Error(w, "missing auth context", http.StatusUnauthorized)
		return
	}

	idToken, ok := tokenValue.(*auth.Token)
	if !ok {
		http.Error(w, "invalid auth context", http.StatusUnauthorized)
		return
	}

	response := map[string]string{
		"message": "Autenticado com sucesso",
		"uid":     idToken.UID,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}
