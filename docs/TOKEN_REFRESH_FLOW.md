# Token Refresh Flow Diagram

## Before Fix: ❌ User Gets Logged Out

```
User navigates to /builder
        ↓
Middleware checks access_token
        ↓
Access token expired? YES
        ↓
❌ REDIRECT TO /login
        ↓
User forced to log in again (Bad UX!)
```

## After Fix: ✅ User Stays Logged In

### Flow 1: Page Navigation with Expired Access Token

```
User navigates to /builder
        ↓
Middleware checks access_token
        ↓
Access token expired? YES
        ↓
Middleware calls /api/auth/refresh
        ↓
Refresh token valid? YES
        ↓
✅ New access_token issued
✅ New refresh_token issued (rotation)
        ↓
✅ User sees /builder page
        ↓
User stays logged in! 🎉
```

### Flow 2: API Call with Expired Access Token

```
User clicks "Save Resume"
        ↓
apiClient calls POST /api/resumes
        ↓
API returns 401 Unauthorized
        ↓
apiClient detects 401
        ↓
apiClient calls POST /api/auth/refresh
        ↓
Refresh token valid? YES
        ↓
✅ New tokens issued
        ↓
apiClient retries POST /api/resumes
        ↓
✅ Resume saved successfully
        ↓
User stays logged in! 🎉
```

### Flow 3: Both Tokens Expired (Expected Behavior)

```
User navigates after 7+ days
        ↓
Middleware checks access_token
        ↓
Access token expired? YES
        ↓
Middleware calls /api/auth/refresh
        ↓
Refresh token expired? YES
        ↓
❌ REDIRECT TO /login
        ↓
User logs in again (Expected after 7 days)
```

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                              │
│  ┌──────────────┐                                           │
│  │  Component   │                                           │
│  │  (e.g.       │   Uses apiClient                          │
│  │  Templates,  │────────────┐                              │
│  │  Builder)    │            │                              │
│  └──────────────┘            ↓                              │
│                    ┌─────────────────┐                      │
│                    │   apiClient     │                      │
│                    │   (Auto-retry   │                      │
│                    │   with refresh) │                      │
│                    └─────────┬───────┘                      │
│                              │                              │
└──────────────────────────────┼──────────────────────────────┘
                               │ HTTP Request
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Server                          │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │              Middleware                       │           │
│  │  1. Check access_token                        │           │
│  │  2. If invalid → Try refresh                  │           │
│  │  3. If refresh works → Continue               │           │
│  │  4. If refresh fails → Redirect to login      │           │
│  └────────────────┬─────────────────────────────┘           │
│                   │                                          │
│                   ↓ (if token valid)                         │
│  ┌─────────────────────────────┐                            │
│  │   API Route Handler          │                            │
│  │   (e.g., /api/resumes)       │                            │
│  │   Process request            │                            │
│  └─────────────────────────────┘                            │
│                                                              │
│  ┌─────────────────────────────┐                            │
│  │   /api/auth/refresh          │                            │
│  │   1. Verify refresh_token    │                            │
│  │   2. Blacklist old tokens    │                            │
│  │   3. Issue new tokens        │                            │
│  │   4. Set cookies             │                            │
│  └─────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Token Lifecycle

```
User Logs In
    ↓
┌─────────────────────────────────────┐
│ Access Token:  Valid (15 min)       │
│ Refresh Token: Valid (7 days)       │
└─────────────────────────────────────┘
    ↓
    │ After 15 minutes...
    ↓
┌─────────────────────────────────────┐
│ Access Token:  ❌ Expired            │
│ Refresh Token: ✅ Still Valid        │
└─────────────────────────────────────┘
    ↓
    │ User makes request
    ↓
┌─────────────────────────────────────┐
│ System Automatically Refreshes       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Access Token:  ✅ New (15 min)       │
│ Refresh Token: ✅ New (7 days)       │
│ Old Refresh:   🚫 Blacklisted        │
└─────────────────────────────────────┘
    ↓
    │ After 7 days of inactivity...
    ↓
┌─────────────────────────────────────┐
│ Access Token:  ❌ Expired            │
│ Refresh Token: ❌ Expired            │
└─────────────────────────────────────┘
    ↓
    │ User makes request
    ↓
┌─────────────────────────────────────┐
│ Redirect to Login                    │
└─────────────────────────────────────┘
```

## Code Execution Flow

### Example: User Saves Resume After 16 Minutes

```javascript
// 1. User clicks Save (access token is expired)
await api.post('/api/resumes', resumeData);

// 2. apiClient makes request
const response = await fetch('/api/resumes', {
  method: 'POST',
  credentials: 'include', // Sends expired access_token cookie
  body: JSON.stringify(resumeData)
});

// 3. Server returns 401
// response.status = 401

// 4. apiClient detects 401, calls refresh
if (response.status === 401) {
  console.log('Received 401, attempting token refresh...');
  
  const refreshRes = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include' // Sends valid refresh_token cookie
  });
  
  if (refreshRes.ok) {
    console.log('Token refreshed successfully');
    
    // 5. Server sets new cookies
    // Set-Cookie: access_token=NEW_TOKEN
    // Set-Cookie: refresh_token=NEW_TOKEN
    
    // 6. Retry original request with new token
    console.log('Retrying original request...');
    return fetch('/api/resumes', {
      method: 'POST',
      credentials: 'include', // Now sends NEW access_token cookie
      body: JSON.stringify(resumeData)
    });
  }
}

// 7. ✅ Resume saved successfully!
```

## Security Features

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. HTTP-Only Cookies                                        │
│     ├─ Cannot be accessed via JavaScript                    │
│     └─ Prevents XSS attacks                                 │
│                                                              │
│  2. Token Rotation                                           │
│     ├─ New refresh token on each refresh                    │
│     └─ Old refresh token is blacklisted                     │
│                                                              │
│  3. Token Blacklisting                                       │
│     ├─ Used tokens are invalidated                          │
│     └─ Prevents replay attacks                              │
│                                                              │
│  4. Rate Limiting                                            │
│     ├─ Limits refresh attempts per IP                       │
│     └─ Prevents brute force                                 │
│                                                              │
│  5. Short Access Token Lifetime                              │
│     ├─ 15 minutes validity                                  │
│     └─ Minimizes damage if leaked                           │
│                                                              │
│  6. SameSite Cookies                                         │
│     ├─ SameSite=Lax setting                                 │
│     └─ Prevents CSRF attacks                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Comparison: Before vs After

### Before Fix

| Scenario | Behavior | User Experience |
|----------|----------|-----------------|
| Access token expires | Redirect to login | ❌ Poor - Logged out unexpectedly |
| API call with expired token | 401 Error | ❌ Poor - Action fails |
| Navigate after 16 min | Redirect to login | ❌ Poor - Must log in again |

### After Fix

| Scenario | Behavior | User Experience |
|----------|----------|-----------------|
| Access token expires | Auto-refresh → Continue | ✅ Great - Seamless |
| API call with expired token | Auto-refresh → Retry → Success | ✅ Great - Works transparently |
| Navigate after 16 min | Auto-refresh → Page loads | ✅ Great - No interruption |
| Both tokens expired (7+ days) | Redirect to login | ✅ Expected - Reasonable timeout |

## Performance Impact

```
Scenario: API call with expired access token

┌────────────────────────────┐
│ Before Fix (User logged out)│
├────────────────────────────┤
│ 1. User makes request      │ 50ms
│ 2. Server returns 401      │ 10ms
│ 3. Redirect to login       │ 20ms
│ 4. User sees login page    │ 
│ 5. User logs in again      │ (Manual action)
│ 6. User navigates back     │ (Manual action)
│ 7. User makes request again│ (Manual action)
├────────────────────────────┤
│ Total: User frustration ∞  │
└────────────────────────────┘

┌────────────────────────────┐
│ After Fix (Auto-refresh)    │
├────────────────────────────┤
│ 1. User makes request      │ 50ms
│ 2. Server returns 401      │ 10ms
│ 3. Auto-refresh called     │ 100ms
│ 4. New tokens issued       │ 20ms
│ 5. Retry original request  │ 50ms
│ 6. Request succeeds        │ 
├────────────────────────────┤
│ Total: ~230ms overhead     │
│ (Completely transparent!)  │
└────────────────────────────┘
```

The automatic refresh adds ~230ms overhead but is completely transparent to the user. This is much better than forcing them to log in again!
