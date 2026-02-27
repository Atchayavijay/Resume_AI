# Token Refresh Implementation Guide

## Overview

This application now has a comprehensive token refresh system that automatically handles access token expiration without forcing users to log in again. The system operates at multiple levels:

1. **Middleware Level** - Server-side token refresh for page navigation
2. **API Client Level** - Client-side token refresh for API calls
3. **Auth Context Level** - User authentication state management

## How It Works

### Access Tokens & Refresh Tokens

- **Access Token**: Short-lived token (typically 15 minutes) used for authenticating API requests
- **Refresh Token**: Long-lived token (typically 7 days) used to obtain new access tokens
- Both tokens are stored as HTTP-only cookies for security

### Token Refresh Flow

1. When an access token expires, a 401 Unauthorized response is returned
2. The system automatically calls `/api/auth/refresh` with the refresh token
3. If successful, a new access token (and refresh token) is issued
4. The original request is retried with the new access token
5. If refresh fails, the user is redirected to login

## Implementation Details

### 1. Middleware (`src/middleware.ts`)

The middleware intercepts requests to protected routes and automatically refreshes tokens when needed:

```typescript
// Protected routes
const protectedPaths = ['/builder', '/generate', '/templates'];
const protectedApiPrefixes = ['/api/resumes', '/api/export-pdf'];
```

**What it does:**
- Checks if the access token is valid
- If invalid/expired, attempts to refresh using the refresh token
- If refresh succeeds, allows the request to continue
- If refresh fails, redirects to login page

### 2. API Client (`src/lib/apiClient.ts`)

A wrapper around `fetch` that automatically handles token refresh for API calls:

```typescript
import { apiClient, api } from '@/lib/apiClient';

// Use apiClient directly
const response = await apiClient('/api/resumes');

// Or use convenience methods
const response = await api.get('/api/resumes');
const response = await api.post('/api/resumes', data);
const response = await api.put('/api/resumes', data);
const response = await api.delete('/api/resumes');
```

**Features:**
- Automatic token refresh on 401 responses
- Prevents multiple simultaneous refresh attempts
- Automatic retry of failed requests after refresh
- Redirects to login if refresh fails

### 3. Auth Context (`src/contexts/AuthContext.tsx`)

Manages user authentication state and provides auth methods:

```typescript
const { user, loading, isAuthenticated, refresh } = useAuth();
```

**What it does:**
- Initializes auth state on app load
- Attempts token refresh if access token is expired
- Provides login, signup, logout, and refresh methods

## Usage Guide

### For New API Calls

**Always use the API client instead of raw fetch:**

```typescript
// ❌ Don't do this
const response = await fetch('/api/resumes', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Do this instead
import { api } from '@/lib/apiClient';
const response = await api.get('/api/resumes');
```

### Common Patterns

**GET Request:**
```typescript
import { api } from '@/lib/apiClient';

const fetchResumes = async () => {
  const response = await api.get('/api/resumes');
  if (!response.ok) {
    throw new Error('Failed to fetch resumes');
  }
  return response.json();
};
```

**POST Request:**
```typescript
const createResume = async (data) => {
  const response = await api.post('/api/resumes', data);
  if (!response.ok) {
    throw new Error('Failed to create resume');
  }
  return response.json();
};
```

**PUT Request:**
```typescript
const updateResume = async (id, data) => {
  const response = await api.put('/api/resumes', { id, ...data });
  if (!response.ok) {
    throw new Error('Failed to update resume');
  }
  return response.json();
};
```

**DELETE Request:**
```typescript
const deleteResume = async (id) => {
  const response = await api.delete(`/api/resumes?id=${id}`);
  if (!response.ok) {
    throw new Error('Failed to delete resume');
  }
};
```

### Custom Headers

If you need custom headers, you can still pass them:

```typescript
const response = await apiClient('/api/upload', {
  method: 'POST',
  headers: {
    'X-Custom-Header': 'value',
  },
  body: formData,
});
```

## Migration Checklist

To migrate existing code to use the new API client:

1. Find all `fetch('/api/...)` calls
2. Import the API client: `import { api } from '@/lib/apiClient';`
3. Replace `fetch` with appropriate `api` method
4. Remove `credentials: 'include'` (handled automatically)
5. Test the functionality

## Debugging

### Check Token Refresh

Open your browser's developer console to see token refresh logs:

```
Access token expired, refreshing...
Token refreshed successfully
Retrying original request after token refresh...
```

### Check Cookies

In DevTools > Application > Cookies, you should see:
- `access_token` - Short-lived access token
- `refresh_token` - Long-lived refresh token

### Common Issues

**Issue: Infinite refresh loops**
- Check that refresh endpoint (`/api/auth/refresh`) is not in protected API prefixes
- Verify refresh token is valid and not blacklisted

**Issue: User logged out unexpectedly**
- Check if refresh token has expired (default: 7 days)
- Verify refresh token is being sent with requests
- Check server logs for refresh errors

**Issue: 401 still occurs after refresh**
- The refresh token may be invalid/expired
- User will be redirected to login (expected behavior)

## Security Considerations

1. **HTTP-Only Cookies**: Tokens are stored in HTTP-only cookies, preventing XSS attacks
2. **Token Rotation**: Each refresh generates a new refresh token and blacklists the old one
3. **Rate Limiting**: Refresh endpoint is rate-limited to prevent abuse
4. **Secure Flag**: Cookies should have `secure` flag in production (HTTPS only)
5. **SameSite**: Cookies have `SameSite=Lax` to prevent CSRF attacks

## Token Expiration Times

Current configuration:
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

To modify these, update the JWT signing functions in `src/lib/auth/jwt.ts`.

## Testing

### Manual Testing

1. Log in to the application
2. Wait for access token to expire (or modify expiry time to 1 minute for testing)
3. Try to access a protected route or make an API call
4. Verify that the token is automatically refreshed
5. Check that you're not logged out

### Automated Testing

```typescript
// Test API client with expired token
test('should refresh token on 401', async () => {
  // Mock expired access token
  // Make API call
  // Verify refresh was called
  // Verify request was retried
});
```

## Future Improvements

1. **Sliding Sessions**: Extend refresh token lifetime on activity
2. **Token Prefetching**: Refresh access token before it expires
3. **Offline Support**: Queue requests when offline, retry when online
4. **Multi-tab Sync**: Synchronize auth state across browser tabs
5. **Background Refresh**: Periodically refresh tokens in the background
