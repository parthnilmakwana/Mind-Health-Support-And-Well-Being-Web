# Gemini API Setup Guide for Mind Health Support

## Quick Setup Instructions

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Your API Key

1. Open the `config.js` file in your project
2. Find this line:
   ```javascript
   API_KEY: 'YOUR_GEMINI_API_KEY',
   ```
3. Replace `'YOUR_GEMINI_API_KEY'` with your actual API key:
   ```javascript
   API_KEY: 'AIzaSyB...', // Your actual key here
   ```

### 3. Test Your Setup

1. Open `index.html` in your web browser
2. Click the chat button to open the chatbot
3. Type a message like "Hello, I'm feeling anxious today"
4. You should receive an AI-powered response from Gemini

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your API key to version control** (Git, etc.)
2. **Don't share your API key publicly**
3. **Consider using environment variables for production**
4. **Monitor your API usage** to avoid unexpected charges

## For Production Deployment

### Option 1: Environment Variables (Recommended)
Create a `.env` file (don't commit this):
```
GEMINI_API_KEY=your_actual_api_key_here
```

Then modify `config.js` to read from environment variables.

### Option 2: Server-Side Proxy
For maximum security, create a backend service that:
1. Stores your API key securely
2. Acts as a proxy between your frontend and Gemini API
3. Validates requests and manages rate limiting

## Troubleshooting

### Common Issues:

1. **"API key not configured" warning**
   - Make sure you've replaced `'YOUR_GEMINI_API_KEY'` with your actual key
   - Check for any typos in the key

2. **CORS errors**
   - This is normal for local development
   - The app will fall back to local responses if Gemini API fails

3. **Rate limiting**
   - Gemini API has usage limits
   - The app includes fallback responses for when the API is unavailable

## Features

Your Mind Health Support chatbot now includes:

✅ **Gemini AI Integration** - Advanced AI responses
✅ **Fallback System** - Works even when API is unavailable  
✅ **Crisis Detection** - Automatic detection of crisis situations
✅ **Mental Health Focus** - Specialized for mental health support
✅ **Conversation Context** - Remembers previous messages
✅ **Secure Configuration** - Easy to configure and maintain

## Support

If you need help:
1. Check the browser console for error messages
2. Verify your API key is correct
3. Test with simple messages first
4. Check your internet connection

The chatbot will work with or without the Gemini API - it includes comprehensive fallback responses for all mental health topics.
