# HistorySong 🎵

A modern web application for analyzing your Spotify music history and listening patterns. Built with Go (backend) and React (frontend) with full Spotify OAuth authentication.

## Features

- 🔐 **Spotify OAuth Authentication** - Secure login with your Spotify account
- 🎯 **JWT Token Management** - Secure session handling
- 🛡️ **Protected API Routes** - Secure endpoints for user data
- 🎵 **Top Tracks Analysis** - View your most listened songs with detailed album information
- 📊 **Multiple Time Ranges** - 4 weeks, 6 months, and 1 year listening history
- 🎨 **Modern UI** - Clean, responsive interface with Tailwind CSS
- ⚡ **Fast Development** - Hot reload with Vite and Air
- 🧪 **Comprehensive Testing** - Unit tests for authentication system

## Tech Stack

### Backend
- **Go** - High-performance server
- **Gin** - HTTP web framework
- **JWT** - JSON Web Tokens for authentication
- **OAuth2** - Spotify authentication flow
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## Quick Start

### Prerequisites
- Go 1.24+ 
- Node.js 18+
- Spotify account

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd historySong
```

### 2. Environment Setup

Run the setup script to create your environment file:

```bash
./setup-env.sh
```

This will create a `.env` file with a secure JWT secret. You'll need to add your Spotify credentials.

### 3. Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Set the redirect URI to: `http://localhost:8080/auth/spotify/callback`
4. Copy your Client ID and Client Secret
5. Update the `.env` file with your credentials

### 4. Install Dependencies

```bash
# Backend dependencies
go mod download

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 5. Start the Application

```bash
# Terminal 1: Start the backend
go run cmd/api/main.go

# Terminal 2: Start the frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the application!

## API Endpoints

### Public Endpoints
- `GET /` - Hello world endpoint
- `GET /health` - Health check
- `GET /auth/spotify` - Get Spotify login URL
- `GET /auth/spotify/callback` - OAuth callback (handled by Spotify)
- `POST /auth/logout` - Logout endpoint

### Protected Endpoints (require JWT token)
- `GET /api/profile` - Get user profile
- `GET /api/me` - Get current user info
- `GET /api/top-tracks` - Get all top tracks (4 weeks, 6 months, 1 year)
- `GET /api/top-tracks/:timeRange` - Get top tracks for specific time range

## Authentication Flow

1. **Login**: User clicks "Login with Spotify" button
2. **Redirect**: User is redirected to Spotify for authorization
3. **Callback**: Spotify redirects back with authorization code
4. **Token Exchange**: Server exchanges code for access tokens
5. **JWT Generation**: Server generates JWT token with user info
6. **Session**: Frontend stores JWT token for authenticated requests

## Project Structure

```
historySong/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── auth/
│   │   ├── spotify.go          # Spotify OAuth implementation
│   │   └── spotify_test.go     # Authentication tests
│   ├── middleware/
│   │   └── auth.go             # JWT authentication middleware
│   ├── spotify/
│   │   ├── api.go              # Spotify Web API client
│   │   └── api_test.go         # API client tests
│   └── server/
│       ├── server.go           # Server configuration
│       └── routes.go           # API route definitions
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SpotifyAuth.tsx # Spotify auth component
│   │   │   └── TopTracks.tsx   # Top tracks display component
│   │   └── App.tsx             # Main React component
│   └── package.json
├── .env                        # Environment variables (create with setup-env.sh)
├── setup-env.sh               # Environment setup script
├── SPOTIFY_SETUP.md           # Detailed Spotify setup guide
└── TOP_TRACKS_FEATURE.md      # Top tracks feature documentation
```

## Development

### Running Tests

```bash
# Run all tests
go test ./...

# Run specific test packages
go test ./internal/auth/...
go test ./internal/server/...
```

### Hot Reload

The backend uses Air for hot reloading. Configuration is in `.air.toml`.

### Frontend Development

The frontend uses Vite for fast development with hot module replacement.

## Environment Variables

Required environment variables (set in `.env`):

```env
# Server Configuration
PORT=8080

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URL=http://localhost:8080/auth/spotify/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## Security Features

- **JWT Tokens**: Secure session management
- **OAuth2 Flow**: Industry-standard authentication
- **CORS Protection**: Configured for development and production
- **Environment Variables**: Secure credential management
- **Input Validation**: Request validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For detailed Spotify setup instructions, see [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md).

For issues and questions, please open an issue on GitHub.
