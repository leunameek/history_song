package spotify

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// SpotifyAPI handles requests to Spotify Web API
type SpotifyAPI struct {
	baseURL string
}

// NewSpotifyAPI creates a new Spotify API client
func NewSpotifyAPI() *SpotifyAPI {
	return &SpotifyAPI{
		baseURL: "https://api.spotify.com/v1",
	}
}

// TopTracksResponse represents the response from Spotify's top tracks endpoint
type TopTracksResponse struct {
	Items []Track `json:"items"`
}

// Track represents a Spotify track with album information
type Track struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Popularity  int    `json:"popularity"`
	DurationMS  int    `json:"duration_ms"`
	ExternalURL struct {
		Spotify string `json:"spotify"`
	} `json:"external_urls"`
	Album Album `json:"album"`
}

// Album represents a Spotify album
type Album struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	AlbumType   string `json:"album_type"` // album, single, compilation
	ReleaseDate string `json:"release_date"`
	TotalTracks int    `json:"total_tracks"`
	Label       string `json:"label"`
	Images      []struct {
		URL    string `json:"url"`
		Height int    `json:"height"`
		Width  int    `json:"width"`
	} `json:"images"`
	ExternalURL struct {
		Spotify string `json:"spotify"`
	} `json:"external_urls"`
	Artists []struct {
		Name string `json:"name"`
	} `json:"artists"`
	Tracks *struct {
		Items []Track `json:"items"`
	} `json:"tracks,omitempty"`
}

// GetUserTopTracks fetches user's top tracks for a given time range
func (s *SpotifyAPI) GetUserTopTracks(accessToken, timeRange string, limit int) (*TopTracksResponse, error) {
	url := fmt.Sprintf("%s/me/top/tracks?time_range=%s&limit=%d", s.baseURL, timeRange, limit)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("spotify API error: %s - %s", resp.Status, string(body))
	}

	var topTracks TopTracksResponse
	if err := json.NewDecoder(resp.Body).Decode(&topTracks); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &topTracks, nil
}

// GetTrackDetails fetches detailed information about a specific track
func (s *SpotifyAPI) GetTrackDetails(accessToken, trackID string) (*Track, error) {
	url := fmt.Sprintf("%s/tracks/%s", s.baseURL, trackID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("spotify API error: %s - %s", resp.Status, string(body))
	}

	var track Track
	if err := json.NewDecoder(resp.Body).Decode(&track); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &track, nil
}

// GetAlbumDetails fetches detailed information about a specific album including tracks
func (s *SpotifyAPI) GetAlbumDetails(accessToken, albumID string) (*Album, error) {
	url := fmt.Sprintf("%s/albums/%s?market=from_token", s.baseURL, albumID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("spotify API error: %s - %s", resp.Status, string(body))
	}

	var album Album
	if err := json.NewDecoder(resp.Body).Decode(&album); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &album, nil
}
