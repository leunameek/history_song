#!/bin/bash

echo "🧹 Clearing Authentication Data"
echo "==============================="
echo ""

echo "This script will help you clear authentication data and start fresh."
echo ""

# Check if we're in a browser environment
if command -v curl >/dev/null 2>&1; then
    echo "1. Testing backend connectivity..."
    if curl -s http://localhost:8080/health > /dev/null; then
        echo "✅ Backend is running"
    else
        echo "❌ Backend is not running"
        echo "   Please start it with: go run cmd/api/main.go"
    fi
    echo ""
fi

echo "2. Instructions to clear authentication data:"
echo ""
echo "   📱 In your browser:"
echo "   a) Open Developer Tools (F12)"
echo "   b) Go to Application/Storage tab"
echo "   c) Find 'Local Storage'"
echo "   d) Clear all items for localhost:5173"
echo "   e) Or run this in the console:"
echo ""
echo "      localStorage.clear();"
echo ""
echo "   🔄 Alternative - Clear everything:"
echo "   a) Open Developer Tools (F12)"
echo "   b) Right-click the refresh button"
echo "   c) Select 'Empty Cache and Hard Reload'"
echo ""

echo "3. After clearing data:"
echo "   a) Go to http://localhost:5173"
echo "   b) Click 'Login with Spotify'"
echo "   c) Complete the OAuth flow"
echo "   d) Check the console for debug messages"
echo ""

echo "4. If you still get errors:"
echo "   a) Check the backend logs for detailed error messages"
echo "   b) Ensure your Spotify app has the correct scopes"
echo "   c) Try logging in with a different browser"
echo ""

echo "🔧 Backend restart command:"
echo "   go run cmd/api/main.go"
echo ""
echo "🔧 Frontend restart command:"
echo "   cd frontend && npm run dev" 