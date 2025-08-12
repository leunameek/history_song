# Search Feature 🎵

The HistorySong application now includes a powerful search functionality that allows you to search across Spotify's vast catalog of music, artists, albums, and playlists.

## Features

### 🔍 **Universal Search**
- Search for tracks, albums, artists, and playlists in one place
- Real-time search results with beautiful image displays
- Click any result to open it directly in Spotify

### 🎯 **Search Types**
- **All**: Search across all content types simultaneously
- **Tracks**: Find specific songs with album artwork
- **Albums**: Discover full albums and EPs
- **Artists**: Find musicians and bands
- **Playlists**: Discover curated playlists

### 🖼️ **Rich Visual Results**
- High-quality album artwork and artist photos
- Responsive grid layout that adapts to screen size
- Hover effects and smooth transitions
- Click to open in Spotify for full experience

## How to Use

### 1. **Access the Search Bar**
- Log into your HistorySong dashboard
- The search bar appears above your Top Tracks section

### 2. **Enter Your Search Query**
- Type any search term (artist name, song title, album, etc.)
- Press Enter or click the Search button

### 3. **Filter by Type (Optional)**
- Use the dropdown to search specific content types
- Choose "All" to search across everything

### 4. **Browse Results**
- Results are organized by type with clear sections
- Each result shows relevant information and artwork
- Click any result to open it in Spotify

## Search Examples

### **Artist Search**
- Search: "The Beatles"
- Results: Artist profile, albums, top tracks

### **Album Search**
- Search: "Abbey Road"
- Results: Album details, track listing, artwork

### **Song Search**
- Search: "Hey Jude"
- Results: Song details, album info, artist

### **Playlist Search**
- Search: "Workout Music"
- Results: Various workout playlists from different creators

## Technical Details

### **Backend API**
- **Endpoint**: `GET /api/search`
- **Parameters**:
  - `q`: Search query (required)
  - `type`: Content types (optional, defaults to all)
  - `limit`: Number of results (optional, max 50)

### **Frontend Component**
- **File**: `frontend/src/components/SearchBar.tsx`
- **Features**: Responsive design, error handling, loading states
- **Integration**: Seamlessly integrated into Dashboard

### **Spotify API Integration**
- Uses Spotify Web API search endpoint
- Supports all major content types
- Handles authentication and rate limiting

## Search Results Layout

### **Tracks Section**
- Album artwork (64x64px)
- Track name, artist, and album
- Horizontal layout for compact display

### **Albums Section**
- Album artwork (96x96px)
- Album name, artist, year, track count
- Centered layout for visual appeal

### **Artists Section**
- Artist photo (96x96px, circular)
- Artist name and top genres
- Centered layout with genre tags

### **Playlists Section**
- Playlist artwork (96x96px)
- Playlist name, creator, track count
- Centered layout with metadata

## Responsive Design

- **Mobile**: Single column layout for small screens
- **Tablet**: Two-column grid for medium screens
- **Desktop**: Four-column grid for large screens
- **Hover Effects**: Interactive elements on desktop

## Error Handling

- **Authentication Errors**: Clear messages for token issues
- **Search Errors**: Helpful error messages for failed searches
- **No Results**: Friendly messages when searches return empty
- **Loading States**: Visual feedback during search operations

## Future Enhancements

- **Search History**: Remember recent searches
- **Advanced Filters**: Date ranges, popularity filters
- **Saved Searches**: Bookmark favorite search queries
- **Search Analytics**: Track what users search for most
- **Voice Search**: Speech-to-text search capability

## Getting Started

1. **Ensure Backend is Running**
   ```bash
   go run cmd/api/main.go
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Log into Spotify**
   - Use the login button in the app
   - Grant necessary permissions

4. **Start Searching**
   - Navigate to your dashboard
   - Use the search bar to find music

## Troubleshooting

### **Search Not Working**
- Check if you're logged into Spotify
- Verify backend is running on port 8080
- Check browser console for error messages

### **No Results Found**
- Try different search terms
- Check spelling and formatting
- Use broader search terms

### **Images Not Loading**
- Check internet connection
- Verify Spotify API access
- Some content may not have images

## API Reference

### **Search Endpoint**
```
GET /api/search?q={query}&type={types}&limit={number}
```

### **Response Format**
```json
{
  "tracks": {
    "items": [...],
    "total": 100
  },
  "albums": {
    "items": [...],
    "total": 50
  },
  "artists": {
    "items": [...],
    "total": 25
  },
  "playlists": {
    "items": [...],
    "total": 30
  }
}
```

The search feature enhances the HistorySong experience by providing quick access to Spotify's entire music catalog, making it easy to discover new music and explore your favorite artists and albums.
