import { useState, useEffect } from 'react';

interface User {
  id: string;
  display_name: string;
  email: string;
  image_url: string;
}

interface AuthResponse {
  token: string;
  user: User;
  error?: string;
  code?: string;
}

const SpotifyAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:8080';

  // Handle token from URL parameters (after backend redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    console.log('Checking for parameters...');
    console.log('Token:', token ? 'Present' : 'Not present');
    console.log('Code:', code ? 'Present' : 'Not present');
    console.log('State:', state ? 'Present' : 'Not present');

    if (token) {
      // Token is already available from backend redirect
      console.log('Token found in URL, storing in localStorage...');
      localStorage.setItem('spotify_token', token);
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Reload the page to show the dashboard
      window.location.reload();
    } else if (code && state) {
      // Handle OAuth callback (fallback)
      console.log('Processing OAuth callback...');
      handleCallback(code, state);
    } else {
      console.log('No authentication parameters found');
    }
  }, []);

  const handleCallback = async (code: string, state: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Making callback request to backend...');
      const response = await fetch(`${API_BASE_URL}/auth/spotify/callback?code=${code}&state=${state}`);
      console.log('Callback response status:', response.status);
      
      const data: AuthResponse = await response.json();
      console.log('Callback response data:', data);

      if (data.token) {
        // Store token
        console.log('Storing token in localStorage');
        localStorage.setItem('spotify_token', data.token);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Reload the page to show the dashboard
        window.location.reload();
      } else {
        console.error('No token in response:', data);
        
        // Handle specific error cases
        if (data.code === 'AUTH_CODE_EXPIRED') {
          setError('Your login session expired. Please try logging in again.');
          // Clear any existing tokens
          localStorage.removeItem('spotify_token');
        } else {
          setError(data.error || 'Authentication failed');
        }
      }
    } catch (err) {
      console.error('Error during callback:', err);
      setError('Failed to complete authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the Spotify authorization URL
      const response = await fetch(`${API_BASE_URL}/auth/spotify`);
      const data = await response.json();

      if (data.auth_url) {
        // Redirect to Spotify for authorization
        window.location.href = data.auth_url;
      } else {
        setError('Failed to get authorization URL');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Failed to initiate login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-2 text-gray-600">Connecting to Spotify...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Connect with Spotify
        </h2>
        
        <p className="text-gray-600">
          Sign in with your Spotify account to access your music data and playlists.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Login with Spotify
        </button>
      </div>
    </div>
  );
};

export default SpotifyAuth; 