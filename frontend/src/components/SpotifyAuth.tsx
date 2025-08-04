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
}

const SpotifyAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    // Check if user is already logged in (token in localStorage)
    const token = localStorage.getItem('spotify_token');
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token might be expired, clear it
        localStorage.removeItem('spotify_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile');
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

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear local storage and state
      localStorage.removeItem('spotify_token');
      setUser(null);
    } catch (err) {
      console.error('Error during logout:', err);
      setError('Failed to logout');
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      handleCallback(code, state);
    }
  }, []);

  const handleCallback = async (code: string, state: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/spotify/callback?code=${code}&state=${state}`);
      const data: AuthResponse = await response.json();

      if (data.token) {
        // Store token and user data
        localStorage.setItem('spotify_token', data.token);
        setUser(data.user);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Error during callback:', err);
      setError('Failed to complete authentication');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
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

      {user ? (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {user.display_name}!
            </h2>
            
            {user.image_url && (
              <img
                src={user.image_url}
                alt={user.display_name}
                className="w-20 h-20 rounded-full mx-auto mb-4"
              />
            )}
            
            <div className="text-gray-600 space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Logout from Spotify
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default SpotifyAuth; 