#!/bin/bash

echo "🎵 HistorySong Spotify Authentication Setup"
echo "=========================================="
echo ""

# Check if .env file already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

echo "📝 Creating .env file..."
echo ""

# Create .env file
cat > .env << EOF
# Server Configuration
PORT=8080

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URL=http://localhost:8080/auth/spotify/callback

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Go to https://developer.spotify.com/dashboard"
echo "2. Create a new app"
echo "3. Set the redirect URI to: http://localhost:8080/auth/spotify/callback"
echo "4. Copy your Client ID and Client Secret"
echo "5. Update the .env file with your Spotify credentials"
echo ""
echo "📖 For detailed instructions, see SPOTIFY_SETUP.md"
echo ""
echo "🚀 To start the application:"
echo "   Backend:  go run cmd/api/main.go"
echo "   Frontend: cd frontend && npm run dev" 