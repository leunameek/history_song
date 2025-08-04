package server

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"

	"historySong/internal/auth"
)

type Server struct {
	port        int
	spotifyAuth *auth.SpotifyAuth
}

func NewServer() *http.Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	if port == 0 {
		port = 8080 // Default port
	}

	server := &Server{
		port:        port,
		spotifyAuth: auth.NewSpotifyAuth(),
	}

	// Declare Server config
	httpServer := &http.Server{
		Addr:         fmt.Sprintf(":%d", server.port),
		Handler:      server.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return httpServer
}
