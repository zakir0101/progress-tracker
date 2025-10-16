# Google OAuth Setup Guide for IGCSE Math Progress Tracker

## Overview
This guide explains how to set up Google OAuth authentication for both the Student Tracker and Teacher Dashboard.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity Services API

## Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in the required information:
   - **App name**: "IGCSE Math Progress Tracker"
   - **User support email**: Your email address
   - **Developer contact information**: Your email address

4. Add the following scopes:
   - `email`
   - `profile`
   - `openid`

5. Add test users (if in testing phase) or publish the app

## Step 3: Create OAuth 2.0 Client IDs

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Configure authorized JavaScript origins:
   - For local development: `http://localhost`, `http://localhost:8000`, `http://127.0.0.1`, `http://127.0.0.1:8000`
   - For ngrok: `https://your-subdomain.ngrok.io`
   - For production: Your production domain

5. Configure authorized redirect URIs:
   - Same as above, but add `/` at the end
   - Example: `https://your-subdomain.ngrok.io/`

6. Create separate client IDs for different environments if needed

## Step 4: Update HTML Files

Replace `YOUR_GOOGLE_OAUTH_CLIENT_ID` in both files:

### Student Tracker (`student_tracker.html`)
```html
<div id="g_id_onload"
  data-client_id="YOUR_ACTUAL_CLIENT_ID_HERE"
  ...>
</div>
```

### Teacher Dashboard (`teacher_dashboard.html`)
```html
<div id="g_id_onload"
  data-client_id="YOUR_ACTUAL_CLIENT_ID_HERE"
  ...>
</div>
```

## Step 5: Test the Setup

1. Open the HTML files in a web server (not directly from file system)
2. Click the Google Sign-In button
3. You should see the Google OAuth popup
4. After authentication, the user interface should switch to authenticated mode

## Common Issues and Solutions

### Issue 1: "invalid_client" Error
- **Cause**: Incorrect client ID or unauthorized domain
- **Solution**:
  - Verify the client ID matches exactly
  - Ensure your domain is in authorized JavaScript origins
  - Check if the OAuth consent screen is configured properly

### Issue 2: Popup Blocked
- **Cause**: Browser blocking popups
- **Solution**: Allow popups for your domain

### Issue 3: No Response from Google
- **Cause**: Network issues or incorrect configuration
- **Solution**:
  - Check browser console for errors
  - Verify internet connection
  - Ensure Google Identity Services script is loading

### Issue 4: CORS Errors
- **Cause**: Cross-origin requests blocked
- **Solution**: Serve files from a web server, not file:// protocol

## Using with ngrok

If testing with ngrok:

1. Start ngrok: `ngrok http 8000`
2. Update Google Cloud Console with the ngrok URL
3. Wait a few minutes for changes to propagate
4. Access your app via the ngrok URL

## Production Deployment

For production deployment:

1. Use a proper web server (Apache, Nginx, etc.)
2. Configure HTTPS (required for OAuth)
3. Update Google Cloud Console with your production domain
4. Publish the OAuth consent screen
5. Monitor usage in Google Cloud Console

## Security Considerations

- Keep your client ID confidential
- Use different client IDs for development and production
- Regularly review OAuth consent screen settings
- Monitor API usage and quotas
- Implement proper session management

## Troubleshooting

1. **Check Browser Console**: Look for JavaScript errors
2. **Verify Client ID**: Ensure it matches exactly
3. **Check Domains**: Verify authorized origins include your domain
4. **Test Different Browsers**: Some browsers may have different security settings
5. **Clear Cache**: Clear browser cache and cookies if issues persist

## Support

If you encounter issues:
1. Check this guide first
2. Review Google's [OAuth 2.0 documentation](https://developers.google.com/identity/oauth2)
3. Check the browser console for specific error messages
4. Verify all configuration steps were completed correctly