# Testing the Token Refresh Fix

## Quick Test Guide

Your application is already running on **http://localhost:4000**

### Test 1: Basic Token Refresh (Recommended)

1. **Open the application** in your browser: `http://localhost:4000`

2. **Log in** to your account

3. **Open Browser DevTools** (F12)
   - Go to the **Console** tab to see refresh logs
   - Go to **Application > Cookies** to see token cookies

4. **Simulate token expiry:**
   - In Application > Cookies, find the `access_token` cookie
   - Delete it (right-click → Delete)
   - Leave `refresh_token` intact

5. **Navigate to a protected page:**
   - Click on "Templates" or "Builder"
   - OR make an API call (e.g., try to save a resume)

6. **Expected Result:** ✅
   - You should see console logs: "Access token expired, refreshing..."
   - The page loads successfully WITHOUT redirecting to login
   - A new `access_token` appears in cookies
   - You stay logged in!

### Test 2: Both Tokens Expired

1. **Log in**

2. **Open DevTools** > Application > Cookies

3. **Delete both cookies:**
   - Delete `access_token`
   - Delete `refresh_token`

4. **Navigate to a protected page**

5. **Expected Result:** ✅
   - You are redirected to the login page
   - This is correct behavior when both tokens are expired

### Test 3: API Call After Token Expiry

1. **Log in**

2. **Open DevTools Console**

3. **Delete `access_token` cookie** (keep refresh_token)

4. **Trigger an API call:**
   - Go to Templates page (it fetches resumes)
   - OR go to Builder and try to save
   - OR go to Generate page

5. **Expected Result:** ✅
   - Console shows: "Received 401, attempting token refresh..."
   - Console shows: "Token refreshed successfully"
   - Console shows: "Retrying original request after token refresh..."
   - The API call succeeds
   - You stay logged in!

### Test 4: Long Session Test

1. **Log in**

2. **Keep the app open in a tab**

3. **Wait 15+ minutes** (access token expires)
   - OR temporarily change access token expiry to 1 minute in `src/lib/auth/jwt.ts`:
     ```typescript
     // Line 31 in jwt.ts
     expiresIn: '1m', // Changed from '15m' for testing
     ```

4. **After 15 minutes, interact with the app:**
   - Navigate to a different page
   - Click a button that makes an API call

5. **Expected Result:** ✅
   - The app automatically refreshes your token
   - You stay logged in without any interruption
   - No redirect to login page

## Console Messages to Look For

### Successful Refresh (Middleware)
```
[No explicit log in production, but network tab shows]
POST /api/auth/refresh → 200 OK
```

### Successful Refresh (API Client)
```
Received 401, attempting token refresh...
Token refreshed successfully
Retrying original request after token refresh...
```

### Refresh Failed (Both tokens expired)
```
Token refresh failed
[Browser redirects to /login]
```

## Cookie Inspection

### After Login (Both tokens present):
- `access_token` - HttpOnly, SameSite=Lax
- `refresh_token` - HttpOnly, SameSite=Lax

### After Token Refresh (New tokens issued):
- `access_token` - Updated with new value
- `refresh_token` - Updated with new value (token rotation)

## Network Tab Inspection

### When Token Refresh Happens:

1. **Initial request fails:**
   ```
   GET /api/resumes → 401 Unauthorized
   ```

2. **Automatic refresh:**
   ```
   POST /api/auth/refresh → 200 OK
   Set-Cookie: access_token=...
   Set-Cookie: refresh_token=...
   ```

3. **Retry succeeds:**
   ```
   GET /api/resumes → 200 OK
   ```

## Troubleshooting

### Issue: Still getting logged out

**Check:**
1. Are both cookies being deleted? (Should only delete access_token for testing)
2. Is the refresh token valid? (Not blacklisted, not expired)
3. Check browser console for error messages
4. Check Network tab to see if refresh request is being made

**Solution:**
- Clear all cookies and log in fresh
- Make sure the refresh endpoint is working: `POST localhost:4000/api/auth/refresh`

### Issue: Infinite redirect loop

**Possible cause:** Middleware trying to refresh its own refresh endpoint

**Solution:** Already handled in the code - refresh endpoint is not in protected routes

### Issue: 401 still appears

**This is normal!** The first request will return 401, then:
- The apiClient automatically refreshes
- The request is retried
- The retry succeeds

The 401 is expected and handled automatically.

## Advanced Testing

### Test Multiple Simultaneous Requests

1. Delete `access_token`
2. Open DevTools Console
3. Run this in console:
   ```javascript
   // Make multiple API calls simultaneously
   Promise.all([
     fetch('/api/resumes', { credentials: 'include' }),
     fetch('/api/resumes', { credentials: 'include' }),
     fetch('/api/resumes', { credentials: 'include' })
   ]).then(responses => {
     console.log('All requests completed:', responses.map(r => r.status));
   });
   ```

**Expected:** Only ONE refresh request is made, all API calls succeed

## Success Criteria

✅ Users stay logged in when access token expires (if refresh token is valid)
✅ Automatic token refresh happens transparently
✅ Users are only logged out when BOTH tokens are expired
✅ No infinite redirect loops
✅ API calls automatically retry after token refresh
✅ Multiple simultaneous requests only trigger one refresh

## Production Considerations

### Before deploying to production:

1. ✅ Ensure HTTPS is enabled (cookies marked as `Secure`)
2. ✅ Set appropriate cookie `maxAge` based on your policy
3. ✅ Monitor refresh endpoint for abuse (rate limiting is already in place)
4. ✅ Set up logging/monitoring for failed refresh attempts
5. ⚠️ Consider adding refresh metrics to track user sessions

### Environment Variables

Make sure these are set in production:
```
JWT_ACCESS_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<different-long-random-string>
```

## Support

If you encounter any issues:
1. Check the console for error messages
2. Check the Network tab for failed requests
3. Review the implementation in `docs/TOKEN_REFRESH.md`
4. Check the summary in `docs/TOKEN_REFRESH_IMPLEMENTATION.md`

---

## Quick Reference

**Access Token Lifetime:** 15 minutes
**Refresh Token Lifetime:** 7 days

**Protected Routes:**
- `/builder`
- `/generate`
- `/templates`

**Protected API Endpoints:**
- `/api/resumes/*`
- `/api/export-pdf/*`

**Token Refresh Endpoint:**
- `POST /api/auth/refresh` (automatically called)
