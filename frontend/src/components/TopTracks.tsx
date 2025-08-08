import { useState, useEffect } from 'react';
import AlbumDetail from './AlbumDetail';

interface Track {
  id: string;
  name: string;
  popularity: number;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  album: {
    id: string;
    name: string;
    album_type: string;
    release_date: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    external_urls: {
      spotify: string;
    };
  };
}

interface TopTracksData {
  short_term: {
    display_name: string;
    tracks: Track[];
  };
  medium_term: {
    display_name: string;
    tracks: Track[];
  };
  long_term: {
    display_name: string;
    tracks: Track[];
  };
}

const TopTracks = () => {
  const [topTracks, setTopTracks] = useState<TopTracksData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchTopTracks();
  }, []);

  const fetchTopTracks = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('spotify_token');
      console.log('Token from localStorage:', token ? 'Found' : 'Not found');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      console.log('Making request to:', `${API_BASE_URL}/api/top-tracks`);
      const response = await fetch(`${API_BASE_URL}/api/top-tracks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Top tracks data:', data);
        setTopTracks(data.top_tracks);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError(`Failed to fetch top tracks: ${errorData.error || response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching top tracks:', err);
      setError(`Failed to fetch top tracks: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (durationMs: number): string => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatReleaseDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAlbumTypeDisplay = (albumType: string): string => {
    switch (albumType) {
      case 'album':
        return 'Album';
      case 'single':
        return 'Single';
      case 'compilation':
        return 'Compilation';
      default:
        return albumType.charAt(0).toUpperCase() + albumType.slice(1);
    }
  };

  const getAlbumTypeColor = (albumType: string): string => {
    switch (albumType) {
      case 'album':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer';
      case 'single':
        return 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer';
      case 'compilation':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer';
    }
  };

  const handleAlbumTypeClick = (albumId: string) => {
    setSelectedAlbumId(albumId);
  };

  const handleCloseAlbumDetail = () => {
    setSelectedAlbumId(null);
  };

  const renderTrack = (track: Track, index: number) => (
    <div key={track.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
          {index + 1}
        </div>

        {/* Album Cover */}
        <div className="flex-shrink-0">
          <img
            src={track.album.images[0]?.url || '/placeholder-album.png'}
            alt={track.album.name}
            className="w-16 h-16 rounded-md object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-album.png';
            }}
          />
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {track.name}
            </h3>
            <span className="text-sm text-gray-500">
              • {formatDuration(track.duration_ms)}
            </span>
          </div>

          {/* Album Info */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-600 font-medium">
              {track.album.name}
            </span>
            <button
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${getAlbumTypeColor(track.album.album_type)}`}
              onClick={() => handleAlbumTypeClick(track.album.id)}
              title={`View ${getAlbumTypeDisplay(track.album.album_type)} details`}
            >
              {getAlbumTypeDisplay(track.album.album_type)}
            </button>
          </div>

          {/* Release Date */}
          <p className="text-sm text-gray-500">
            Released: {formatReleaseDate(track.album.release_date)}
          </p>
        </div>

        {/* Popularity */}
        <div className="flex-shrink-0 text-right">
          <div className="text-sm text-gray-500 mb-1">Popularity</div>
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${track.popularity}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{track.popularity}%</div>
        </div>

        {/* Spotify Link */}
        <div className="flex-shrink-0">
          <a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );

  const renderTimeRangeSection = (timeRange: string, data: { display_name: string; tracks: Track[] }) => (
    <div key={timeRange} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Top Tracks - {data.display_name}
        </h2>
        <span className="text-sm text-gray-500">
          {data.tracks.length} tracks
        </span>
      </div>
      
      <div className="grid gap-4">
        {data.tracks.map((track, index) => renderTrack(track, index))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-2 text-gray-600">Loading your top tracks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading top tracks</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <button
                onClick={fetchTopTracks}
                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topTracks) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Show:</span>
          <div className="flex space-x-2">
            {Object.entries(topTracks).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedTimeRange(key)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedTimeRange === key
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {data.display_name}
              </button>
            ))}
            <button
              onClick={() => setSelectedTimeRange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTimeRange === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Tracks Display */}
      <div className="space-y-8">
        {selectedTimeRange === 'all' ? (
          Object.entries(topTracks).map(([key, data]) => renderTimeRangeSection(key, data))
        ) : (
          renderTimeRangeSection(selectedTimeRange, topTracks[selectedTimeRange as keyof TopTracksData])
        )}
      </div>

      {/* Album Detail Modal */}
      {selectedAlbumId && (
        <AlbumDetail
          albumId={selectedAlbumId}
          onClose={handleCloseAlbumDetail}
        />
      )}
    </div>
  );
};

export default TopTracks; 