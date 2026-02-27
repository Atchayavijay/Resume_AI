# 401 Unauthorized Error - PDF Download Issue

## Problem Summary

When attempting to download a PDF from the Resume Preview component, you encountered:
- **Error 1**: `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- **Error 2**: `Error: Enqueuing failed` (at ResumePreview.tsx:150)

## Root Cause

The `/api/export-pdf` endpoint requires **user authentication** to prevent abuse and track usage via rate limiting. When the user is not authenticated (or the authentication token has expired), the API returns a 401 status code.

### Why Authentication Fails:

1. **Missing or Expired Access Token**
   - Access tokens expire after 15 minutes (set in `cookies.ts`)
   - User may not be logged in
   - Browser may have cleared cookies

2. **Cookie Configuration**
   - Cookies use `sameSite: 'strict'` which might block in some scenarios
   - `httpOnly: true` prevents JavaScript access (security feature)

3. **Missing credentials in fetch**
   - The original fetch request didn't include `credentials: 'include'` to send cookies

## Solutions Implemented

### 1. ✅ Added `credentials: 'include'` to fetch request
```typescript
const response = await fetch('/api/export-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ← Ensures cookies are sent
  body: JSON.stringify({...}),
});
```

### 2. ✅ Improved Error Handling
The code now distinguishes between authentication errors and other failures:

```typescript
if (!response.ok) {
  if (response.status === 401) {
    throw new Error('Authentication required. Please sign in to download your resume.');
  }
  const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
  throw new Error(errorData.error || 'PDF generation failed');
}
```

### 3. ✅ Proactive Authentication Check
Added authentication check BEFORE attempting download:

```typescript
const { isAuthenticated } = useAuth();

const handleDownloadPDF = async () => {
  if (!previewRef.current) return;
  
  // Check authentication before attempting download
  if (!isAuthenticated) {
    alert('Please sign in to download your resume.');
    return;
  }
  
  // ... proceed with download
};
```

## How to Test

1. **Not Logged In**: Try downloading without signing in → Should show alert
2. **Logged In**: Sign in and try downloading → Should work normally
3. **Expired Token**: Wait 15+ minutes after login, then try downloading → Should show better error message

## Additional Notes

### Access Token Lifetime
- Access tokens: **15 minutes** (line 20 in `cookies.ts`)
- Refresh tokens: **7 days** (line 11 in `cookies.ts`)

### Token Refresh Flow
The `AuthContext` automatically attempts to refresh expired access tokens using the refresh token. If the refresh token is also expired, the user needs to log in again.

### Rate Limiting
The API has rate limiting in place (implemented in `route.ts` line 22-28). If you hit the limit:
- You'll get a 429 status code
- Error message will tell you when you can try again

## Files Modified

1. `src/components/ResumePreview.tsx`
   - Added `useAuth` hook import
   - Added proactive authentication check
   - Added `credentials: 'include'` to fetch request
   - Improved error handling with specific messages

## Alternative Solutions (Not Implemented)

If you want to allow unauthenticated PDF downloads, you have these options:

### Option A: Make endpoint public (Not Recommended)
- Remove authentication check in `src/app/api/export-pdf/route.ts`
- Risk: No rate limiting per user, potential abuse

### Option B: Use a separate public endpoint
- Create `/api/export-pdf-public` with stricter rate limiting by IP
- Keep authenticated endpoint for logged-in users with generous limits

### Option C: Client-side PDF generation
- Use libraries like `jsPDF` or `html2canvas`
- Generate PDF entirely in the browser
- No server-side rendering needed
- May have quality/formatting issues
