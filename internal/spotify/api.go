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

// SearchResponse represents the response from Spotify's search endpoint
type SearchResponse struct {
	Tracks    *SearchTracksResponse    `json:"tracks,omitempty"`
	Albums    *SearchAlbumsResponse    `json:"albums,omitempty"`
	Artists   *SearchArtistsResponse   `json:"artists,omitempty"`
	Playlists *SearchPlaylistsResponse `json:"playlists,omitempty"`
}

// SearchTracksResponse represents tracks in search results
type SearchTracksResponse struct {
	Items []Track `json:"items"`
	Total int     `json:"total"`
}

// SearchAlbumsResponse represents albums in search results
type SearchAlbumsResponse struct {
	Items []Album `json:"items"`
	Total int     `json:"total"`
}

// SearchArtistsResponse represents artists in search results
type SearchArtistsResponse struct {
	Items []Artist `json:"items"`
	Total int      `json:"total"`
}

// SearchPlaylistsResponse represents playlists in search results
type SearchPlaylistsResponse struct {
	Items []Playlist `json:"items"`
	Total int        `json:"total"`
}

// Artist represents a Spotify artist
type Artist struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	Popularity int      `json:"popularity"`
	Genres     []string `json:"genres"`
	Images     []struct {
		URL    string `json:"url"`
		Height int    `json:"height"`
		Width  int    `json:"width"`
	} `json:"images"`
	ExternalURL struct {
		Spotify string `json:"spotify"`
	} `json:"external_urls"`
}

// Playlist represents a Spotify playlist
type Playlist struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Images      []struct {
		URL    string `json:"url"`
		Height int    `json:"height"`
		Width  int    `json:"width"`
	} `json:"images"`
	ExternalURL struct {
		Spotify string `json:"spotify"`
	} `json:"external_urls"`
	Owner struct {
		DisplayName string `json:"display_name"`
	} `json:"owner"`
	Tracks struct {
		Total int `json:"total"`
	} `json:"tracks"`
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

// Search performs a search across Spotify's catalog
func (s *SpotifyAPI) Search(accessToken, query, types string, limit int) (*SearchResponse, error) {
	url := fmt.Sprintf("%s/search?q=%s&type=%s&limit=%d&market=from_token",
		s.baseURL, query, types, limit)

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

	var searchResponse SearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&searchResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &searchResponse, nil
}
