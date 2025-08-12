package server

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"historySong/internal/middleware"
	"historySong/internal/spotify"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Add your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true, // Enable cookies/auth
	}))

	// Public routes
	r.GET("/", s.HelloWorldHandler)
	r.GET("/health", s.healthHandler)

	// Spotify authentication routes
	r.GET("/auth/spotify", s.spotifyLoginHandler)
	r.GET("/auth/spotify/callback", s.spotifyCallbackHandler)
	r.GET("/auth/spotify/redirect", s.spotifyRedirectHandler) // New redirect endpoint
	r.POST("/auth/logout", s.logoutHandler)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(s.spotifyAuth))
	{
		protected.GET("/profile", s.getProfileHandler)
		protected.GET("/me", s.getCurrentUserHandler)

		// Top tracks endpoints
		protected.GET("/top-tracks/:timeRange", s.getTopTracksHandler)
		protected.GET("/top-tracks", s.getAllTopTracksHandler)

		// Album details endpoint
		protected.GET("/album/:albumId", s.getAlbumDetailsHandler)

		// Search endpoint
		protected.GET("/search", s.searchHandler)

		// Debug endpoint (remove in production)
		protected.GET("/debug/token", s.debugTokenHandler)
	}

	return r
}

func (s *Server) HelloWorldHandler(c *gin.Context) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	c.JSON(http.StatusOK, resp)
}

func (s *Server) healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "up",
		"message": "Server is healthy",
	})
}

// spotifyLoginHandler initiates Spotify OAuth flow
func (s *Server) spotifyLoginHandler(c *gin.Context) {
	authURL := s.spotifyAuth.GetAuthURL()
	c.JSON(http.StatusOK, gin.H{
		"auth_url": authURL,
	})
}

// spotifyCallbackHandler handles the OAuth callback from Spotify
func (s *Server) spotifyCallbackHandler(c *gin.Context) {
	session, err := s.spotifyAuth.HandleCallback(c)
	if err != nil {
		fmt.Printf("Error in callback handler: %v\n", err)

		// Check if it's an invalid_grant error
		if strings.Contains(err.Error(), "invalid_grant") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Authorization code expired or already used. Please try logging in again.",
				"code":  "AUTH_CODE_EXPIRED",
			})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		}
		return
	}

	fmt.Printf("Session created for user: %s\n", session.UserID)
	fmt.Printf("Access token length: %d\n", len(session.AccessToken))

	// Generate JWT token
	token, err := s.spotifyAuth.GenerateJWT(session)
	if err != nil {
		fmt.Printf("Error generating JWT: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		return
	}

	fmt.Printf("JWT token generated successfully, length: %d\n", len(token))

	// Redirect to frontend with token
	redirectURL := fmt.Sprintf("%s/auth/spotify/redirect?token=%s&user_id=%s&display_name=%s&email=%s&image_url=%s",
		"http://localhost:8080",
		token,
		session.UserID,
		session.DisplayName,
		session.Email,
		session.ImageURL,
	)

	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}

// logoutHandler handles user logout
func (s *Server) logoutHandler(c *gin.Context) {
	// In a real application, you might want to blacklist the token
	// For now, we'll just return a success response
	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}

// getProfileHandler returns the current user's profile
func (s *Server) getProfileHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	displayName := c.GetString("display_name")
	email := c.GetString("email")
	imageURL := c.GetString("image_url")

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":           userID,
			"display_name": displayName,
			"email":        email,
			"image_url":    imageURL,
		},
	})
}

// getCurrentUserHandler returns the current user information
func (s *Server) getCurrentUserHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	displayName := c.GetString("display_name")
	email := c.GetString("email")
	imageURL := c.GetString("image_url")

	c.JSON(http.StatusOK, gin.H{
		"id":           userID,
		"display_name": displayName,
		"email":        email,
		"image_url":    imageURL,
	})
}

// getTopTracksHandler returns user's top tracks for a specific time range
func (s *Server) getTopTracksHandler(c *gin.Context) {
	timeRange := c.Param("timeRange")
	spotifyToken := c.GetString("spotify_token")

	// Validate time range
	validRanges := map[string]bool{
		"short_term":  true, // ~4 weeks
		"medium_term": true, // ~6 months
		"long_term":   true, // ~1 year
	}

	if !validRanges[timeRange] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid time range. Use: short_term, medium_term, or long_term",
		})
		return
	}

	spotifyAPI := spotify.NewSpotifyAPI()
	topTracks, err := spotifyAPI.GetUserTopTracks(spotifyToken, timeRange, 20)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to fetch top tracks: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"time_range": timeRange,
		"tracks":     topTracks.Items,
	})
}

// getAllTopTracksHandler returns user's top tracks for all time ranges
func (s *Server) getAllTopTracksHandler(c *gin.Context) {
	spotifyToken := c.GetString("spotify_token")
	spotifyAPI := spotify.NewSpotifyAPI()

	// Define time ranges and their human-readable names
	timeRanges := map[string]string{
		"short_term":  "4 weeks",
		"medium_term": "6 months",
		"long_term":   "1 year",
	}

	results := make(map[string]interface{})

	for timeRange, displayName := range timeRanges {
		topTracks, err := spotifyAPI.GetUserTopTracks(spotifyToken, timeRange, 20)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch %s top tracks: %v", displayName, err),
			})
			return
		}

		results[timeRange] = gin.H{
			"display_name": displayName,
			"tracks":       topTracks.Items,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"top_tracks": results,
	})
}

// spotifyRedirectHandler redirects to frontend with token
func (s *Server) spotifyRedirectHandler(c *gin.Context) {
	token := c.Query("token")
	userID := c.Query("user_id")
	displayName := c.Query("display_name")
	email := c.Query("email")
	imageURL := c.Query("image_url")

	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No token provided",
		})
		return
	}

	// Redirect to frontend with token
	frontendURL := "http://localhost:5173"
	redirectURL := fmt.Sprintf("%s?token=%s&user_id=%s&display_name=%s&email=%s&image_url=%s",
		frontendURL,
		token,
		userID,
		displayName,
		email,
		imageURL,
	)

	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}

// getAlbumDetailsHandler fetches detailed album information from Spotify
func (s *Server) getAlbumDetailsHandler(c *gin.Context) {
	albumId := c.Param("albumId")
	if albumId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Album ID is required"})
		return
	}

	spotifyToken := c.GetString("spotify_token")
	if spotifyToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No Spotify token found"})
		return
	}

	// Create Spotify API client
	spotifyAPI := spotify.NewSpotifyAPI()

	// Fetch album details
	album, err := spotifyAPI.GetAlbumDetails(spotifyToken, albumId)
	if err != nil {
		fmt.Printf("Error fetching album details: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch album details"})
		return
	}

	c.JSON(http.StatusOK, album)
}

// searchHandler performs a search across Spotify's catalog
func (s *Server) searchHandler(c *gin.Context) {
	query := c.Query("q")
	types := c.Query("type")
	limitStr := c.Query("limit")

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	if types == "" {
		types = "track,album,artist,playlist" // Default to search all types
	}

	limit := 20 // Default limit
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = min(parsedLimit, 50) // Spotify API max is 50
		}
	}

	spotifyToken := c.GetString("spotify_token")
	if spotifyToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No Spotify token found"})
		return
	}

	// Create Spotify API client
	spotifyAPI := spotify.NewSpotifyAPI()

	// Perform search
	searchResults, err := spotifyAPI.Search(spotifyToken, query, types, limit)
	if err != nil {
		fmt.Printf("Error performing search: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to perform search"})
		return
	}

	c.JSON(http.StatusOK, searchResults)
}

// debugTokenHandler returns debug information about the current token
func (s *Server) debugTokenHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	displayName := c.GetString("display_name")
	spotifyToken := c.GetString("spotify_token")

	c.JSON(http.StatusOK, gin.H{
		"user_id":               userID,
		"display_name":          displayName,
		"has_spotify_token":     len(spotifyToken) > 0,
		"spotify_token_length":  len(spotifyToken),
		"spotify_token_preview": spotifyToken[:min(20, len(spotifyToken))] + "...",
	})
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
