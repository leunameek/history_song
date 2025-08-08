package spotify

import (
	"testing"
)

func TestNewSpotifyAPI(t *testing.T) {
	api := NewSpotifyAPI()
	if api == nil {
		t.Fatal("NewSpotifyAPI() returned nil")
	}

	if api.baseURL != "https://api.spotify.com/v1" {
		t.Errorf("Expected baseURL to be 'https://api.spotify.com/v1', got '%s'", api.baseURL)
	}
}

func TestGetAlbumTypeDisplay(t *testing.T) {
	// This is a helper function we can add to the API module
	// For now, let's test the logic that would be used in the frontend

	testCases := []struct {
		albumType string
		expected  string
	}{
		{"album", "Album"},
		{"single", "Single"},
		{"compilation", "Compilation"},
		{"ep", "Ep"},
		{"", ""},
	}

	for _, tc := range testCases {
		result := getAlbumTypeDisplay(tc.albumType)
		if result != tc.expected {
			t.Errorf("getAlbumTypeDisplay('%s') = '%s', expected '%s'", tc.albumType, result, tc.expected)
		}
	}
}

func TestGetAlbumTypeColor(t *testing.T) {
	testCases := []struct {
		albumType string
		expected  string
	}{
		{"album", "bg-blue-100 text-blue-800"},
		{"single", "bg-green-100 text-green-800"},
		{"compilation", "bg-purple-100 text-purple-800"},
		{"ep", "bg-gray-100 text-gray-800"},
		{"", "bg-gray-100 text-gray-800"},
	}

	for _, tc := range testCases {
		result := getAlbumTypeColor(tc.albumType)
		if result != tc.expected {
			t.Errorf("getAlbumTypeColor('%s') = '%s', expected '%s'", tc.albumType, result, tc.expected)
		}
	}
}

// Helper functions for testing (these would be in the frontend, but we're testing the logic)
func getAlbumTypeDisplay(albumType string) string {
	switch albumType {
	case "album":
		return "Album"
	case "single":
		return "Single"
	case "compilation":
		return "Compilation"
	default:
		if albumType == "" {
			return ""
		}
		return string(albumType[0]&^32) + albumType[1:] // Capitalize first letter
	}
}

func getAlbumTypeColor(albumType string) string {
	switch albumType {
	case "album":
		return "bg-blue-100 text-blue-800"
	case "single":
		return "bg-green-100 text-green-800"
	case "compilation":
		return "bg-purple-100 text-purple-800"
	default:
		return "bg-gray-100 text-gray-800"
	}
}
