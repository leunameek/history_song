# Spotify Authentication Setup

This guide will help you set up Spotify OAuth authentication for your application.

## Prerequisites

1. A Spotify account
2. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

## Step 1: Create a Spotify App

1. Log in to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in the required information:
   - **App name**: Your app name (e.g., "HistorySong")
   - **App description**: Brief description of your app
   - **Website**: Your website URL (can be placeholder for now)
   - **Redirect URI**: `http://localhost:8080/auth/spotify/callback`
   - **API/SDKs**: Select "Web API"
4. Accept the terms and click "Save"

## Step 2: Get Your Credentials

After creating the app, you'll see:
- **Client ID**: Copy this value
- **Client Secret**: Click "Show Client Secret" and copy this value

## Step 3: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Server Configuration
PORT=8080

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URL=http://localhost:8080/auth/spotify/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- Replace `your_spotify_client_id_here` with your actual Spotify Client ID
- Replace `your_spotify_client_secret_here` with your actual Spotify Client Secret
- Generate a strong random string for `JWT_SECRET` (at least 32 characters)
- Make sure the redirect URL matches exactly what you configured in Spotify

## Step 4: Test the Authentication

1. Start your server: `go run cmd/api/main.go`
2. Test the login endpoint: `GET http://localhost:8080/auth/spotify`
3. You should receive a response with an `auth_url`
4. Open the `auth_url` in your browser to test the OAuth flow

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

## Authentication Flow

1. **Login**: User calls `GET /auth/spotify` to get the authorization URL
2. **Redirect**: User is redirected to Spotify for authorization
3. **Callback**: Spotify redirects back to `/auth/spotify/callback` with an authorization code
4. **Token Exchange**: Server exchanges the code for access tokens
5. **JWT Generation**: Server generates a JWT token with user information
6. **Response**: Server returns the JWT token and user data

## Using Protected Endpoints

To access protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## Security Considerations

1. **Environment Variables**: Never commit your `.env` file to version control
2. **JWT Secret**: Use a strong, random secret for JWT signing
3. **HTTPS**: Use HTTPS in production
4. **Token Expiration**: JWT tokens expire with the Spotify access token
5. **State Parameter**: The OAuth flow includes state parameter validation

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Make sure the redirect URI in your `.env` matches exactly what's configured in Spotify
2. **"Missing required environment variables"**: Check that all required variables are set in your `.env` file
3. **CORS errors**: Ensure the frontend URL is correctly configured in the CORS settings

### Debug Mode

To enable debug logging, set the Gin mode to debug:

```go
gin.SetMode(gin.DebugMode)
```

## Next Steps

After setting up authentication, you can:
1. Add user data persistence to a database
2. Implement token refresh logic
3. Add more Spotify API endpoints
4. Create a frontend interface for the authentication flow 