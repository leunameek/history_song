import { useState, useEffect } from 'react'
import SpotifyAuth from './components/SpotifyAuth'
import Dashboard from './components/Dashboard'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('spotify_token')
    setIsAuthenticated(!!token)
  }, [])

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  // Show dashboard if authenticated
  if (isAuthenticated) {
    return <Dashboard />
  }

  // Show login page if not authenticated
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            HistorySong
          </h1>
          <p className="text-gray-600">
            Your Spotify music history and analytics
          </p>
        </div>

        {/* Spotify Authentication Component */}
        <SpotifyAuth />

        <div className="text-center text-gray-500 text-sm">
          Built with Vite, React, Go, and Spotify API
        </div>
      </div>
    </div>
  )
}

export default App