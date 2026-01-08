# Gemini API Setup Guide

## Overview

The narration feature now uses **Google Gemini API** for text generation and **Google Cloud Text-to-Speech** for voice synthesis.

## Step 1: Get Your Gemini API Key

1. Go to: **https://makersuite.google.com/app/apikey**
   OR
   **https://aistudio.google.com/app/apikey**

2. Sign in with your Google account

3. Click "**Create API Key**"

4. Copy the API key (it looks like: `AIza...`)

## Step 2: Enable Google Cloud Text-to-Speech API

### Option A: Using Google Cloud Console (Recommended)

1. Go to: **https://console.cloud.google.com/**

2. Create a new project or select an existing one

3. Enable the Text-to-Speech API:
   - Go to: **APIs & Services** → **Library**
   - Search for "**Cloud Text-to-Speech API**"
   - Click "**Enable**"

4. Create an API Key:
   - Go to: **APIs & Services** → **Credentials**
   - Click "**Create Credentials**" → "**API Key**"
   - Copy the API key
   - (Optional) Restrict the key to "Cloud Text-to-Speech API" for security

### Option B: Quick Setup (Same Key)

If you want to use the same key for both Gemini and TTS:
- Use your Gemini API key
- Make sure Text-to-Speech API is enabled in your Google Cloud project
- The same API key should work for both

## Step 3: Add API Keys to Your Project

Open `.env.local` file and add:

```bash
# Gemini API Key (for text generation)
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# Google Cloud API Key (for Text-to-Speech)
# You can use the same key as Gemini if Text-to-Speech API is enabled
GOOGLE_CLOUD_API_KEY=AIzaSyYourGoogleCloudApiKeyHere
```

**OR** if using the same key for both:

```bash
# Single API key for both Gemini and Text-to-Speech
GEMINI_API_KEY=AIzaSyYourApiKeyHere
GOOGLE_CLOUD_API_KEY=AIzaSyYourApiKeyHere
```

## Step 4: Restart the Server

After adding the keys, restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Voice Options

Each role has a unique voice:

- **CEO**: `en-US-Neural2-D` - Authoritative, deep male voice
- **CFO**: `en-US-Neural2-J` - Serious, analytical female voice
- **CTO**: `en-US-Neural2-F` - Technical, enthusiastic male voice
- **HR**: `en-US-Neural2-C` - Warm, friendly female voice

## How It Works

1. **Text Generation**: Gemini AI generates enhanced narration text from slide content
2. **Voice Synthesis**: Google Cloud Text-to-Speech converts text to natural-sounding speech
3. **Audio Delivery**: MP3 audio is streamed to the browser

## Testing

1. Go to: `http://localhost:3000/preview`
2. Enter presentation mode
3. Click "**Narrate**" button
4. You should hear the narration!

## Troubleshooting

### Error: "Gemini API key not available"

**Solution:**
- Check `.env.local` file exists
- Verify `GEMINI_API_KEY` is set
- Restart the dev server after adding the key

### Error: "TTS API failed"

**Possible Causes:**
1. Text-to-Speech API not enabled
2. Invalid API key
3. API key doesn't have TTS permissions

**Solutions:**
1. Enable Text-to-Speech API in Google Cloud Console
2. Verify API key is correct
3. Check API key restrictions in Google Cloud Console

### Error: "No audio content in TTS response"

**Solution:**
- Check Google Cloud Console for API errors
- Verify Text-to-Speech API is enabled
- Check billing/quota in Google Cloud Console

## Pricing

### Gemini API
- **Free Tier**: 60 requests per minute
- **Paid**: $0.00025 per 1K characters (input)
- **Very affordable** for narration use case

### Google Cloud Text-to-Speech
- **Free Tier**: 0-4 million characters/month
- **Paid**: $4 per 1 million characters
- **Per slide**: ~$0.0001-0.0004 (very cheap!)

### Estimated Costs
- **10 slides**: ~$0.001-0.004 (less than 1 cent!)
- **100 slides**: ~$0.01-0.04
- **1000 slides**: ~$0.10-0.40

**Much cheaper than OpenAI!**

## API Limits

### Gemini
- **Rate Limit**: 60 requests per minute (free tier)
- **Daily Limit**: Varies by tier

### Text-to-Speech
- **Free Tier**: 4M characters/month
- **Rate Limit**: 100 requests/second

## Security

- Keep `.env.local` in `.gitignore` ✅
- Never commit API keys to Git ✅
- Restrict API keys in Google Cloud Console (recommended) ✅

## Comparison: Gemini vs OpenAI

| Feature | Gemini | OpenAI |
|---------|--------|--------|
| Text Generation | ✅ | ✅ |
| Voice Quality | ✅ Excellent | ✅ Excellent |
| Cost | 💰 Very Cheap | 💰 Moderate |
| Free Tier | ✅ Generous | ⚠️ Limited |
| Setup | ⚠️ Requires 2 APIs | ✅ Single API |

## Next Steps

1. ✅ Get Gemini API key
2. ✅ Enable Text-to-Speech API
3. ✅ Add keys to `.env.local`
4. ✅ Restart server
5. ✅ Test narration!

---

**Need Help?**
- Gemini Docs: https://ai.google.dev/docs
- TTS Docs: https://cloud.google.com/text-to-speech/docs
- Google Cloud Console: https://console.cloud.google.com/

