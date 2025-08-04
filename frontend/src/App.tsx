import { useState } from 'react'
import SpotifyAuth from './components/SpotifyAuth'

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState<string>('')

  const fetchData = () => {
    fetch(`http://localhost:${import.meta.env.VITE_PORT}/`)
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => console.error('Error fetching data:', error))
  }

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

        {/* Original demo content */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            API Test Section
          </h2>
          <div className="text-center space-y-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Count is {count}
            </button>
            
            <button
              onClick={fetchData}
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Fetch from Server
            </button>

            {message && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-700">Server Response:</p>
                <p className="text-gray-900 font-medium">{message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          Built with Vite, React, Go, and Spotify API
        </div>
      </div>
    </div>
  )
}

export default App