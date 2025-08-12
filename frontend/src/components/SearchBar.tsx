import { useState } from 'react';

interface SearchResult {
  tracks?: {
    items: Track[];
    total: number;
  };
  albums?: {
    items: Album[];
    total: number;
  };
  artists?: {
    items: Artist[];
    total: number;
  };
  playlists?: {
    items: Playlist[];
    total: number;
  };
}

interface Track {
  id: string;
  name: string;
  popularity: number;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  album: Album;
}

interface Album {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  total_tracks: number;
  label: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
  artists: {
    name: string;
  }[];
}

interface Artist {
  id: string;
  name: string;
  popularity: number;
  genres: string[];
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
  owner: {
    display_name: string;
  };
  tracks: {
    total: number;
  };
}

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('track,album,artist,playlist');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:8080';

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}&type=${searchType}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to perform search');
      }
    } catch (err) {
      console.error('Error performing search:', err);
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getImageUrl = (images: any[]) => {
    if (!images || images.length === 0) {
      return '/placeholder-album.png'; // You can add a placeholder image
    }
    // Get the smallest image that's still good quality (usually 300x300 or 64x64)
    const sortedImages = images.sort((a, b) => a.width - b.width);
    return sortedImages[0]?.url || images[0]?.url;
  };

  const openInSpotify = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Spotify</h2>
        <p className="text-gray-600">
          Search for tracks, albums, artists, and playlists across Spotify's vast catalog.
        </p>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for music, artists, albums, or playlists..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="track,album,artist,playlist">All</option>
            <option value="track">Tracks</option>
            <option value="album">Albums</option>
            <option value="artist">Artists</option>
            <option value="playlist">Playlists</option>
          </select>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results && (
        <div className="space-y-6">
          {/* Tracks */}
          {results.tracks && results.tracks.items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tracks ({results.tracks.total})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.tracks.items.map((track) => (
                  <div
                    key={track.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => openInSpotify(track.external_urls.spotify)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={getImageUrl(track.album.images)}
                        alt={track.album.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{track.name}</p>
                        <p className="text-xs text-gray-500 truncate">{track.album.artists[0]?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{track.album.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums */}
          {results.albums && results.albums.items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Albums ({results.albums.total})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.albums.items.map((album) => (
                  <div
                    key={album.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => openInSpotify(album.external_urls.spotify)}
                  >
                    <div className="text-center">
                      <img
                        src={getImageUrl(album.images)}
                        alt={album.name}
                        className="w-24 h-24 rounded-md object-cover mx-auto mb-3"
                      />
                      <p className="text-sm font-medium text-gray-900 truncate">{album.name}</p>
                      <p className="text-xs text-gray-500 truncate">{album.artists[0]?.name}</p>
                      <p className="text-xs text-gray-400">{album.release_date.split('-')[0]} • {album.total_tracks} tracks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artists */}
          {results.artists && results.artists.items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Artists ({results.artists.total})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.artists.items.map((artist) => (
                  <div
                    key={artist.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => openInSpotify(artist.external_urls.spotify)}
                  >
                    <div className="text-center">
                      <img
                        src={getImageUrl(artist.images)}
                        alt={artist.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
                      />
                      <p className="text-sm font-medium text-gray-900 truncate">{artist.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {artist.genres.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playlists */}
          {results.playlists && results.playlists.items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Playlists ({results.playlists.total})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.playlists.items.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => openInSpotify(playlist.external_urls.spotify)}
                  >
                    <div className="text-center">
                      <img
                        src={getImageUrl(playlist.images)}
                        alt={playlist.name}
                        className="w-24 h-24 rounded-md object-cover mx-auto mb-3"
                      />
                      <p className="text-sm font-medium text-gray-900 truncate">{playlist.name}</p>
                      <p className="text-xs text-gray-500 truncate">by {playlist.owner.display_name}</p>
                      <p className="text-xs text-gray-400">{playlist.tracks.total} tracks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {(!results.tracks || results.tracks.items.length === 0) &&
           (!results.albums || results.albums.items.length === 0) &&
           (!results.artists || results.artists.items.length === 0) &&
           (!results.playlists || results.playlists.items.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or search type</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
