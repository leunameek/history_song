# 🔧 Troubleshooting Guide

This guide will help you debug authentication issues with the Spotify integration.

## 🚨 **Common Issues & Solutions**

### **1. "No authentication token found"**

**Symptoms:**
- Frontend shows "No authentication token found. Please log in again."
- Top tracks component fails to load

**Debug Steps:**
1. **Check localStorage:**
   ```javascript
   // In browser console
   console.log('Token:', localStorage.getItem('spotify_token'));
   ```

2. **Check if login completed:**
   - Look for "Storing token in localStorage" in console
   - Check if user profile is displayed

3. **Test debug endpoint:**
   ```bash
   # After logging in, test this endpoint
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8080/api/debug/token
   ```

**Solutions:**
- **Log out and log in again** - The token might be expired
- **Clear browser cache** - Old tokens might be cached
- **Check backend logs** - Look for "Session created" messages

### **2. "Invalid or expired token"**

**Symptoms:**
- API calls return 401 Unauthorized
- Backend logs show "JWT validation error"

**Debug Steps:**
1. **Check JWT token format:**
   ```javascript
   // In browser console
   const token = localStorage.getItem('spotify_token');
   console.log('Token length:', token?.length);
   console.log('Token starts with:', token?.substring(0, 20));
   ```

2. **Check backend logs:**
   - Look for "JWT validation error" messages
   - Check if "JWT validated for user" appears

**Solutions:**
- **Log out and log in again** - Generate a fresh token
- **Check JWT_SECRET** - Ensure it's set in .env file
- **Verify token expiration** - JWT tokens expire with Spotify tokens

### **3. "Failed to fetch top tracks"**

**Symptoms:**
- Top tracks component shows error
- Backend logs show Spotify API errors

**Debug Steps:**
1. **Check Spotify token in JWT:**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8080/api/debug/token
   ```

2. **Check Spotify scopes:**
   - Ensure your Spotify app has `user-top-read` scope
   - Check if user authorized the app properly

3. **Test Spotify API directly:**
   ```bash
   # Extract Spotify token from JWT and test
   curl -H "Authorization: Bearer SPOTIFY_TOKEN" "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5"
   ```

**Solutions:**
- **Re-authorize Spotify app** - User might not have granted top tracks permission
- **Update Spotify app scopes** - Add `user-top-read` to your app settings
- **Check Spotify token expiration** - Tokens expire after 1 hour

### **4. "user-top-read scope required"**

**Symptoms:**
- Spotify API returns 403 Forbidden
- Error mentions missing scopes

**Debug Steps:**
1. **Check current scopes in code:**
   ```go
   // In internal/auth/spotify.go
   Scopes: []string{
       "user-read-private",
       "user-read-email",
       "user-top-read",  // This should be present
       // ...
   }
   ```

2. **Check Spotify app settings:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Select your app
   - Check if `user-top-read` is in the scopes

**Solutions:**
- **Add scope to Spotify app** - Update app settings in Spotify Developer Dashboard
- **Re-authorize user** - User needs to log in again to grant new permissions
- **Update code scopes** - Ensure `user-top-read` is in the scopes array

## 🔍 **Step-by-Step Debugging**

### **Step 1: Check Backend Status**
```bash
# Run the debug script
./debug-auth.sh

# Check if backend is running
curl http://localhost:8080/health
```

### **Step 2: Test Authentication Flow**
1. **Open browser console** (F12)
2. **Go to** http://localhost:5173
3. **Click "Login with Spotify"**
4. **Complete OAuth flow**
5. **Check console messages**

### **Step 3: Verify Token Storage**
```javascript
// In browser console
console.log('JWT Token:', localStorage.getItem('spotify_token'));
console.log('Token exists:', !!localStorage.getItem('spotify_token'));
```

### **Step 4: Test API Endpoints**
```bash
# Test with your JWT token
JWT_TOKEN="your_jwt_token_here"

# Test debug endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:8080/api/debug/token

# Test top tracks endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:8080/api/top-tracks
```

### **Step 5: Check Backend Logs**
Look for these messages in your backend terminal:
- ✅ `Session created for user: [user_id]`
- ✅ `Access token length: [length]`
- ✅ `JWT token generated successfully, length: [length]`
- ✅ `JWT validated for user: [user_id]`
- ✅ `Spotify token length: [length]`

## 🛠️ **Quick Fixes**

### **Reset Everything**
```bash
# 1. Stop backend and frontend
# 2. Clear browser data
# 3. Restart backend
go run cmd/api/main.go

# 4. Restart frontend
cd frontend && npm run dev

# 5. Log in again
```

### **Check Environment Variables**
```bash
# Ensure these are set in .env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URL=http://localhost:8080/auth/spotify/callback
JWT_SECRET=your_jwt_secret
```

### **Update Spotify App Settings**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Add these scopes:
   - `user-read-private`
   - `user-read-email`
   - `user-top-read`
4. Save changes
5. Re-authorize the app

## 📋 **Debug Checklist**

- [ ] Backend is running on port 8080
- [ ] Frontend is running on port 5173
- [ ] .env file exists with correct values
- [ ] Spotify app has correct scopes
- [ ] User completed OAuth flow
- [ ] JWT token is stored in localStorage
- [ ] JWT token contains Spotify access token
- [ ] Spotify API calls are successful
- [ ] No CORS errors in browser console

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the browser console** for detailed error messages
2. **Check the backend logs** for authentication errors
3. **Verify your Spotify app settings** in the Developer Dashboard
4. **Try the debug endpoints** to isolate the issue
5. **Clear all browser data** and start fresh

## 📞 **Getting Help**

When asking for help, include:
- **Error messages** from browser console
- **Backend logs** showing authentication flow
- **Steps you've tried** from this guide
- **Your environment** (OS, browser, etc.)
- **Screenshots** of any error dialogs

---

This troubleshooting guide should help you identify and fix most authentication issues. If you're still stuck, the debug information will help pinpoint exactly where the problem is occurring. 