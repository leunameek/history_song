package auth

import (
	"os"
	"testing"
	"time"
)

func TestSpotifyAuth_GenerateAndValidateJWT(t *testing.T) {
	// Set up test environment variables
	os.Setenv("SPOTIFY_CLIENT_ID", "test_client_id")
	os.Setenv("SPOTIFY_CLIENT_SECRET", "test_client_secret")
	os.Setenv("SPOTIFY_REDIRECT_URL", "http://localhost:8080/auth/spotify/callback")
	os.Setenv("JWT_SECRET", "test_jwt_secret_key_for_testing_purposes_only")

	// Create SpotifyAuth instance
	auth := NewSpotifyAuth()

	// Create a test session
	session := &UserSession{
		UserID:      "test_user_id",
		DisplayName: "Test User",
		Email:       "test@example.com",
		ImageURL:    "https://example.com/image.jpg",
		AccessToken: "test_access_token",
		ExpiresAt:   time.Now().Add(time.Hour),
	}

	// Generate JWT token
	token, err := auth.GenerateJWT(session)
	if err != nil {
		t.Fatalf("Failed to generate JWT: %v", err)
	}

	if token == "" {
		t.Fatal("Generated token is empty")
	}

	// Validate JWT token
	claims, err := auth.ValidateJWT(token)
	if err != nil {
		t.Fatalf("Failed to validate JWT: %v", err)
	}

	// Verify claims
	if claims.UserID != session.UserID {
		t.Errorf("Expected UserID %s, got %s", session.UserID, claims.UserID)
	}

	if claims.DisplayName != session.DisplayName {
		t.Errorf("Expected DisplayName %s, got %s", session.DisplayName, claims.DisplayName)
	}

	if claims.Email != session.Email {
		t.Errorf("Expected Email %s, got %s", session.Email, claims.Email)
	}

	if claims.ImageURL != session.ImageURL {
		t.Errorf("Expected ImageURL %s, got %s", session.ImageURL, claims.ImageURL)
	}
}

func TestSpotifyAuth_InvalidJWT(t *testing.T) {
	// Set up test environment variables
	os.Setenv("SPOTIFY_CLIENT_ID", "test_client_id")
	os.Setenv("SPOTIFY_CLIENT_SECRET", "test_client_secret")
	os.Setenv("SPOTIFY_REDIRECT_URL", "http://localhost:8080/auth/spotify/callback")
	os.Setenv("JWT_SECRET", "test_jwt_secret_key_for_testing_purposes_only")

	// Create SpotifyAuth instance
	auth := NewSpotifyAuth()

	// Test with invalid token
	_, err := auth.ValidateJWT("invalid_token")
	if err == nil {
		t.Fatal("Expected error for invalid token, got nil")
	}

	// Test with empty token
	_, err = auth.ValidateJWT("")
	if err == nil {
		t.Fatal("Expected error for empty token, got nil")
	}
}

func TestSpotifyAuth_GetAuthURL(t *testing.T) {
	// Set up test environment variables
	os.Setenv("SPOTIFY_CLIENT_ID", "test_client_id")
	os.Setenv("SPOTIFY_CLIENT_SECRET", "test_client_secret")
	os.Setenv("SPOTIFY_REDIRECT_URL", "http://localhost:8080/auth/spotify/callback")
	os.Setenv("JWT_SECRET", "test_jwt_secret_key_for_testing_purposes_only")

	// Create SpotifyAuth instance
	auth := NewSpotifyAuth()

	// Get auth URL
	authURL := auth.GetAuthURL()

	if authURL == "" {
		t.Fatal("Auth URL is empty")
	}

	// Check if it contains expected components
	if !contains(authURL, "accounts.spotify.com") {
		t.Errorf("Auth URL should contain Spotify accounts URL, got: %s", authURL)
	}

	if !contains(authURL, "test_client_id") {
		t.Errorf("Auth URL should contain client ID, got: %s", authURL)
	}

	if !contains(authURL, "state=") {
		t.Errorf("Auth URL should contain state parameter, got: %s", authURL)
	}
}

// Helper function to check if a string contains a substring
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
		(len(s) > len(substr) && (s[:len(substr)] == substr ||
			s[len(s)-len(substr):] == substr ||
			func() bool {
				for i := 1; i <= len(s)-len(substr); i++ {
					if s[i:i+len(substr)] == substr {
						return true
					}
				}
				return false
			}())))
}
