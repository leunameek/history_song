# 🎵 Top Tracks Feature

This feature allows users to view their most listened songs from Spotify with detailed album information, including album types, release dates, and popularity metrics.

## 🚀 **Features**

### **Time Ranges**
- **4 Weeks** (`short_term`) - Recent listening habits
- **6 Months** (`medium_term`) - Medium-term favorites
- **1 Year** (`long_term`) - Long-term favorites

### **Track Information**
- **Track Name** - The song title
- **Album Name** - The album the track belongs to
- **Album Type** - Album, Single, EP, or Compilation
- **Release Date** - When the album was released
- **Duration** - Track length in minutes:seconds
- **Popularity** - Spotify's popularity score (0-100)
- **Album Cover** - High-quality album artwork
- **Spotify Link** - Direct link to the track on Spotify

### **Visual Features**
- **Ranking System** - Tracks are numbered by popularity
- **Color-coded Album Types** - Different colors for different album types
- **Popularity Bar** - Visual representation of track popularity
- **Responsive Design** - Works on desktop and mobile
- **Interactive UI** - Hover effects and smooth transitions

## 🔧 **Backend Implementation**

### **New API Endpoints**

#### **1. Get All Top Tracks**
```
GET /api/top-tracks
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "top_tracks": {
    "short_term": {
      "display_name": "4 weeks",
      "tracks": [
        {
          "id": "track_id",
          "name": "Track Name",
          "popularity": 85,
          "duration_ms": 180000,
          "external_urls": {
            "spotify": "https://open.spotify.com/track/..."
          },
          "album": {
            "id": "album_id",
            "name": "Album Name",
            "album_type": "album",
            "release_date": "2023-01-15",
            "images": [
              {
                "url": "https://i.scdn.co/image/...",
                "height": 640,
                "width": 640
              }
            ],
            "external_urls": {
              "spotify": "https://open.spotify.com/album/..."
            }
          }
        }
      ]
    },
    "medium_term": { ... },
    "long_term": { ... }
  }
}
```

#### **2. Get Top Tracks for Specific Time Range**
```
GET /api/top-tracks/:timeRange
Authorization: Bearer <jwt_token>
```

**Time Range Options:**
- `short_term` - ~4 weeks
- `medium_term` - ~6 months  
- `long_term` - ~1 year

**Response:**
```json
{
  "time_range": "short_term",
  "tracks": [ ... ]
}
```

### **New Backend Files**

#### **`internal/spotify/api.go`**
- **SpotifyAPI** - Client for Spotify Web API
- **GetUserTopTracks()** - Fetches user's top tracks
- **GetTrackDetails()** - Gets detailed track information
- **GetAlbumDetails()** - Gets detailed album information

#### **Updated `internal/server/routes.go`**
- **getTopTracksHandler()** - Handles single time range requests
- **getAllTopTracksHandler()** - Handles all time ranges request
- **Input validation** - Validates time range parameters

#### **Updated Authentication**
- **JWT Claims** - Now includes Spotify access token
- **Middleware** - Passes Spotify token to handlers
- **Token Management** - Secure token handling

## 🎨 **Frontend Implementation**

### **New Component: `TopTracks.tsx`**

#### **Features:**
- **Time Range Selector** - Toggle between different time periods
- **Track Cards** - Beautiful card layout for each track
- **Album Information** - Complete album details display
- **Popularity Visualization** - Progress bars for popularity
- **Error Handling** - Graceful error states and retry functionality
- **Loading States** - Smooth loading animations

#### **Key Functions:**

```typescript
// Format track duration
formatDuration(durationMs: number): string
// Returns: "3:45"

// Format release date
formatReleaseDate(dateString: string): string  
// Returns: "January 15, 2023"

// Get album type display name
getAlbumTypeDisplay(albumType: string): string
// Returns: "Album", "Single", "EP", etc.

// Get album type color classes
getAlbumTypeColor(albumType: string): string
// Returns: Tailwind CSS classes for styling
```

#### **UI Components:**

1. **Time Range Selector**
   - Buttons for 4 weeks, 6 months, 1 year, and "All"
   - Active state highlighting
   - Smooth transitions

2. **Track Card**
   - Rank number (1, 2, 3, etc.)
   - Album cover image
   - Track name and duration
   - Album name and type badge
   - Release date
   - Popularity bar
   - Spotify link

3. **Responsive Layout**
   - Grid layout for desktop
   - Stack layout for mobile
   - Hover effects and shadows

## 🔐 **Security & Permissions**

### **Required Spotify Scopes**
The following scopes are needed for this feature:

```go
Scopes: []string{
    "user-read-private",      // Read user profile
    "user-read-email",        // Read user email
    "user-top-read",          // Read user's top tracks
}
```

### **Authentication Flow**
1. User logs in with Spotify OAuth
2. Backend receives access token
3. Token is stored in JWT claims
4. Frontend uses JWT for API requests
5. Backend extracts Spotify token from JWT
6. Backend makes authenticated requests to Spotify API

## 📊 **Data Flow**

```
User clicks "Login with Spotify"
    ↓
Spotify OAuth flow
    ↓
Backend receives access token
    ↓
JWT created with Spotify token
    ↓
Frontend stores JWT
    ↓
Frontend requests top tracks
    ↓
Backend extracts Spotify token from JWT
    ↓
Backend calls Spotify API
    ↓
Spotify returns top tracks data
    ↓
Backend returns formatted data
    ↓
Frontend displays tracks
```

## 🎯 **Usage Examples**

### **1. View All Time Ranges**
```typescript
const response = await fetch('/api/top-tracks', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});
const data = await response.json();
// data.top_tracks.short_term, medium_term, long_term
```

### **2. View Specific Time Range**
```typescript
const response = await fetch('/api/top-tracks/short_term', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});
const data = await response.json();
// data.tracks - array of tracks for 4 weeks
```

### **3. Frontend Component Usage**
```tsx
import TopTracks from './components/TopTracks';

function App() {
  return (
    <div>
      <TopTracks />
    </div>
  );
}
```

## 🧪 **Testing**

### **Backend Tests**
```bash
# Test Spotify API module
go test ./internal/spotify/...

# Test server routes
go test ./internal/server/...

# Test authentication
go test ./internal/auth/...
```

### **Frontend Testing**
The component includes:
- **Error handling** - Network errors, authentication errors
- **Loading states** - Spinner while fetching data
- **Empty states** - When no tracks are available
- **Responsive design** - Works on all screen sizes

## 🚀 **Getting Started**

### **1. Start the Backend**
```bash
go run cmd/api/main.go
```

### **2. Start the Frontend**
```bash
cd frontend
npm run dev
```

### **3. Login and View Tracks**
1. Visit `http://localhost:5173`
2. Click "Login with Spotify"
3. Authorize the application
4. View your top tracks!

## 🔮 **Future Enhancements**

### **Potential Features**
- **Track Playback** - Play tracks directly in the app
- **Playlist Creation** - Create playlists from top tracks
- **Analytics** - Charts and graphs of listening patterns
- **Export** - Export data to CSV/JSON
- **Sharing** - Share top tracks on social media
- **Comparisons** - Compare different time periods
- **Artist Analysis** - Most listened artists
- **Genre Breakdown** - Favorite music genres

### **Technical Improvements**
- **Caching** - Cache API responses for better performance
- **Pagination** - Load more tracks on demand
- **Real-time Updates** - WebSocket for live updates
- **Offline Support** - Service worker for offline access
- **Progressive Web App** - Install as native app

## 📝 **API Reference**

### **Spotify Web API Endpoints Used**
- `GET /v1/me/top/tracks` - Get user's top tracks
- `GET /v1/tracks/{id}` - Get track details
- `GET /v1/albums/{id}` - Get album details

### **Response Format**
All responses follow Spotify's standard JSON format with additional metadata for album information and release dates.

---

This feature provides a comprehensive view of your listening history with beautiful visualizations and detailed information about each track and album! 