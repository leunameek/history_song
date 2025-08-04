package server

import (
	"net/http"

	"historySong/internal/middleware"

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
	r.POST("/auth/logout", s.logoutHandler)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(s.spotifyAuth))
	{
		protected.GET("/profile", s.getProfileHandler)
		protected.GET("/me", s.getCurrentUserHandler)
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
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Generate JWT token
	token, err := s.spotifyAuth.GenerateJWT(session)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":           session.UserID,
			"display_name": session.DisplayName,
			"email":        session.Email,
			"image_url":    session.ImageURL,
		},
	})
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
