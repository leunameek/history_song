#!/bin/bash

echo "🔍 Spotify Authentication Debug Script"
echo "======================================"
echo ""

# Check if backend is running
echo "1. Testing backend connectivity..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start it with: go run cmd/api/main.go"
    exit 1
fi

echo ""
echo "2. Testing Spotify auth endpoint..."
AUTH_RESPONSE=$(curl -s http://localhost:8080/auth/spotify)
if echo "$AUTH_RESPONSE" | grep -q "auth_url"; then
    echo "✅ Spotify auth endpoint is working"
    echo "   Auth URL: $(echo "$AUTH_RESPONSE" | jq -r '.auth_url' | head -c 100)..."
else
    echo "❌ Spotify auth endpoint failed"
    echo "   Response: $AUTH_RESPONSE"
fi

echo ""
echo "3. Checking environment variables..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "   SPOTIFY_CLIENT_ID: $(grep SPOTIFY_CLIENT_ID .env | cut -d'=' -f2 | head -c 20)..."
    echo "   SPOTIFY_REDIRECT_URL: $(grep SPOTIFY_REDIRECT_URL .env | cut -d'=' -f2)"
else
    echo "❌ .env file not found"
fi

echo ""
echo "4. Instructions for debugging:"
echo ""
echo "   a) Open your browser and go to: http://localhost:5173"
echo "   b) Open Developer Tools (F12)"
echo "   c) Go to Console tab"
echo "   d) Click 'Login with Spotify'"
echo "   e) Complete the OAuth flow"
echo "   f) Check the console for debug messages"
echo ""
echo "   The debug messages will show:"
echo "   - If the token is being stored in localStorage"
echo "   - If the API requests are being made"
echo "   - What responses are being received"
echo ""
echo "5. Common issues and solutions:"
echo ""
echo "   ❌ 'No authentication token found'"
echo "   → The JWT token isn't being stored properly"
echo "   → Check if the callback is working"
echo ""
echo "   ❌ 'Invalid or expired token'"
echo "   → The JWT token is invalid or expired"
echo "   → Try logging out and logging in again"
echo ""
echo "   ❌ 'Failed to fetch top tracks'"
echo "   → The Spotify API call is failing"
echo "   → Check if the Spotify token is in the JWT"
echo ""
echo "   ❌ 'user-top-read scope required'"
echo "   → The Spotify app doesn't have the right permissions"
echo "   → Update the scopes in your Spotify app settings"
echo ""

echo "🔧 To restart the backend with debug logging:"
echo "   go run cmd/api/main.go"
echo ""
echo "🔧 To check the backend logs:"
echo "   Look for messages starting with 'Session created', 'JWT validated', etc." 