package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/spotify"
)

// SpotifyAuth handles Spotify OAuth authentication
type SpotifyAuth struct {
	config *oauth2.Config
	state  string
}

// SpotifyUser represents a Spotify user profile
type SpotifyUser struct {
	ID          string `json:"id"`
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
	Images      []struct {
		URL string `json:"url"`
	} `json:"images"`
	Country     string `json:"country"`
	Product     string `json:"product"`
	Type        string `json:"type"`
	URI         string `json:"uri"`
	Href        string `json:"href"`
	ExternalURL struct {
		Spotify string `json:"spotify"`
	} `json:"external_urls"`
}

// UserSession represents the user session data
type UserSession struct {
	UserID      string    `json:"user_id"`
	DisplayName string    `json:"display_name"`
	Email       string    `json:"email"`
	ImageURL    string    `json:"image_url"`
	AccessToken string    `json:"access_token"`
	ExpiresAt   time.Time `json:"expires_at"`
}

// Claims for JWT token
type Claims struct {
	UserID      string `json:"user_id"`
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
	ImageURL    string `json:"image_url"`
	jwt.RegisteredClaims
}

// NewSpotifyAuth creates a new SpotifyAuth instance
func NewSpotifyAuth() *SpotifyAuth {
	clientID := os.Getenv("SPOTIFY_CLIENT_ID")
	clientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")
	redirectURL := os.Getenv("SPOTIFY_REDIRECT_URL")
	jwtSecret := os.Getenv("JWT_SECRET")

	if clientID == "" || clientSecret == "" || redirectURL == "" || jwtSecret == "" {
		panic("Missing required environment variables: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URL, JWT_SECRET")
	}

	config := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			"user-read-private",
			"user-read-email",
			"user-read-playback-state",
			"user-modify-playback-state",
			"user-read-currently-playing",
			"playlist-read-private",
			"playlist-read-collaborative",
			"playlist-modify-public",
			"playlist-modify-private",
		},
		Endpoint: spotify.Endpoint,
	}

	return &SpotifyAuth{
		config: config,
		state:  generateRandomState(),
	}
}

// GetAuthURL returns the Spotify authorization URL
func (sa *SpotifyAuth) GetAuthURL() string {
	return sa.config.AuthCodeURL(sa.state, oauth2.AccessTypeOffline)
}

// HandleCallback processes the OAuth callback from Spotify
func (sa *SpotifyAuth) HandleCallback(c *gin.Context) (*UserSession, error) {
	code := c.Query("code")
	state := c.Query("state")

	// Verify state parameter
	if state != sa.state {
		return nil, fmt.Errorf("invalid state parameter")
	}

	// Exchange code for token
	token, err := sa.config.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange token: %v", err)
	}

	// Get user profile
	user, err := sa.getUserProfile(token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed to get user profile: %v", err)
	}

	// Create user session
	session := &UserSession{
		UserID:      user.ID,
		DisplayName: user.DisplayName,
		Email:       user.Email,
		ImageURL:    sa.getUserImageURL(user),
		AccessToken: token.AccessToken,
		ExpiresAt:   time.Now().Add(token.Expiry.Sub(time.Now())),
	}

	return session, nil
}

// getUserProfile fetches the user profile from Spotify
func (sa *SpotifyAuth) getUserProfile(accessToken string) (*SpotifyUser, error) {
	req, err := http.NewRequest("GET", "https://api.spotify.com/v1/me", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("spotify API error: %s - %s", resp.Status, string(body))
	}

	var user SpotifyUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

// getUserImageURL extracts the user's profile image URL
func (sa *SpotifyAuth) getUserImageURL(user *SpotifyUser) string {
	if len(user.Images) > 0 {
		return user.Images[0].URL
	}
	return ""
}

// GenerateJWT creates a JWT token for the user session
func (sa *SpotifyAuth) GenerateJWT(session *UserSession) (string, error) {
	secret := os.Getenv("JWT_SECRET")

	claims := Claims{
		UserID:      session.UserID,
		DisplayName: session.DisplayName,
		Email:       session.Email,
		ImageURL:    session.ImageURL,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(session.ExpiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidateJWT validates and parses a JWT token
func (sa *SpotifyAuth) ValidateJWT(tokenString string) (*Claims, error) {
	secret := os.Getenv("JWT_SECRET")

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// RefreshToken refreshes the Spotify access token
func (sa *SpotifyAuth) RefreshToken(refreshToken string) (*oauth2.Token, error) {
	token := &oauth2.Token{
		RefreshToken: refreshToken,
	}

	tokenSource := sa.config.TokenSource(context.Background(), token)
	newToken, err := tokenSource.Token()
	if err != nil {
		return nil, err
	}

	return newToken, nil
}

// generateRandomState generates a random state parameter for OAuth
func generateRandomState() string {
	// In production, use a cryptographically secure random generator
	return "random-state-" + fmt.Sprintf("%d", time.Now().Unix())
}
