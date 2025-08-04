package middleware

import (
	"net/http"
	"strings"

	"historySong/internal/auth"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT tokens and sets user context
func AuthMiddleware(spotifyAuth *auth.SpotifyAuth) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Check if it's a Bearer token
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := tokenParts[1]

		// Validate JWT token
		claims, err := spotifyAuth.ValidateJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set user information in context
		c.Set("user_id", claims.UserID)
		c.Set("display_name", claims.DisplayName)
		c.Set("email", claims.Email)
		c.Set("image_url", claims.ImageURL)

		c.Next()
	}
}

// OptionalAuthMiddleware validates JWT tokens if present but doesn't require them
func OptionalAuthMiddleware(spotifyAuth *auth.SpotifyAuth) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.Next()
			return
		}

		tokenString := tokenParts[1]

		claims, err := spotifyAuth.ValidateJWT(tokenString)
		if err != nil {
			c.Next()
			return
		}

		// Set user information in context if token is valid
		c.Set("user_id", claims.UserID)
		c.Set("display_name", claims.DisplayName)
		c.Set("email", claims.Email)
		c.Set("image_url", claims.ImageURL)

		c.Next()
	}
}
