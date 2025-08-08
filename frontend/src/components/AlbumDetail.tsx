import { useState, useEffect } from 'react';
import PosterEditor from './PosterEditor';
import PosterCanvas from './PosterCanvas';

interface Track {
  id: string;
  name: string;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

interface Album {
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
  tracks?: {
    items: Track[];
  };
  total_tracks: number;
  label?: string;
  artists: Array<{
    name: string;
  }>;
}

interface AlbumDetailProps {
  albumId: string;
  onClose: () => void;
}

const AlbumDetail = ({ albumId, onClose }: AlbumDetailProps) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPosterEditor, setShowPosterEditor] = useState(false);
  const [showPosterPreview, setShowPosterPreview] = useState(false);

  const API_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchAlbumDetails();
  }, [albumId]);

  const fetchAlbumDetails = async () => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/album/${albumId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlbum(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch album details');
      }
    } catch (err) {
      console.error('Error fetching album details:', err);
      setError('Failed to fetch album details');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
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
    switch (albumType.toLowerCase()) {
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
    switch (albumType.toLowerCase()) {
      case 'album':
        return 'bg-blue-100 text-blue-800';
      case 'single':
        return 'bg-green-100 text-green-800';
      case 'compilation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading album details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!album) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Album Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Album Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Album Cover */}
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={album.images[0]?.url || '/placeholder-album.png'}
                  alt={album.name}
                  className="w-full rounded-lg shadow-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-album.png';
                  }}
                />
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getAlbumTypeColor(album.album_type)}`}>
                    {getAlbumTypeDisplay(album.album_type)}
                  </span>
                </div>
              </div>

              {/* Album Metadata */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{album.name}</h1>
                <p className="text-xl text-gray-600">{album.artists.map(artist => artist.name).join(', ')}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Released: {formatReleaseDate(album.release_date)}</span>
                  <span>•</span>
                  <span>{album.total_tracks} tracks</span>
                  {album.label && (
                    <>
                      <span>•</span>
                      <span>Label: {album.label}</span>
                    </>
                  )}
                </div>
              </div>

                             {/* Action Buttons */}
               <div className="flex space-x-3">
                 <a
                   href={album.external_urls.spotify}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                 >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                   </svg>
                   <span>Open in Spotify</span>
                 </a>
                 
                 <button
                   onClick={() => setShowPosterPreview(true)}
                   className="inline-flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                   </svg>
                   <span>View Poster</span>
                 </button>
                 
                 <button
                   onClick={() => setShowPosterEditor(true)}
                   className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                   </svg>
                   <span>Edit Poster</span>
                 </button>
               </div>
            </div>

            {/* Right Column - Tracklist */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Tracklist</h3>
              
              {album.tracks?.items ? (
                <div className="space-y-2">
                  {album.tracks.items.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500 w-8">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="font-medium text-gray-900">{track.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatDuration(track.duration_ms)}
                        </span>
                        <a
                          href={track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <p>Tracklist not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Poster Preview Modal */}
      {showPosterPreview && album && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Album Poster Preview</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPosterEditor(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Edit Poster
                </button>
                <button
                  onClick={() => setShowPosterPreview(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Poster Preview */}
            <div className="p-6 flex justify-center">
              <div className="bg-white border-2 border-gray-300 shadow-lg rounded-lg overflow-hidden">
                <PosterCanvas 
                  album={album} 
                  config={{
                    title: album.name,
                    subtitle: album.artists.map(artist => artist.name).join(', '),
                    backgroundColor: '#F0E6E6',
                    textColor: '#34302D',
                    accentColor: '#1db954',
                    fontSize: 24,
                    layout: 'vertical',
                    showQRCode: true,
                    showAlbumInfo: true,
                    showTracklist: true,
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Poster Editor Modal */}
      {showPosterEditor && album && (
        <PosterEditor
          album={album}
          onClose={() => setShowPosterEditor(false)}
        />
      )}
    </div>
  );
};

export default AlbumDetail; 