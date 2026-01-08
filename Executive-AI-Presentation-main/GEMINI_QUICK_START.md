# 🚀 Gemini API - Quick Start

## ✅ What's Been Done

1. ✅ Installed `@google/generative-ai` package
2. ✅ Installed `@google-cloud/text-to-speech` package  
3. ✅ Updated narration API to use Gemini
4. ✅ Updated voice mapping for Google Cloud TTS
5. ✅ Updated error messages

## 📝 What You Need to Do

### Step 1: Get Gemini API Key

1. Visit: **https://aistudio.google.com/app/apikey**
2. Sign in with Google
3. Click "**Create API Key**"
4. Copy the key (starts with `AIza...`)

### Step 2: Enable Text-to-Speech API

1. Go to: **https://console.cloud.google.com/**
2. Create/select a project
3. Enable "**Cloud Text-to-Speech API**"
4. Create an API key (or use the same one)

### Step 3: Update .env.local

Add these lines to your `.env.local` file:

```bash
# Gemini API Key (for text generation)
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# Google Cloud API Key (for Text-to-Speech)
# Can be the same key if Text-to-Speech API is enabled
GOOGLE_CLOUD_API_KEY=AIzaSyYourGoogleCloudApiKeyHere
```

**OR** if using the same key:

```bash
GEMINI_API_KEY=AIzaSyYourApiKeyHere
GOOGLE_CLOUD_API_KEY=AIzaSyYourApiKeyHere
```

### Step 4: Restart Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🎤 How It Works Now

1. **Gemini** generates enhanced narration text
2. **Google Cloud TTS** converts to natural voice
3. Audio plays automatically in presentation mode

## 💰 Cost Comparison

| Service | Cost per 100 slides |
|---------|-------------------|
| **Gemini** | ~$0.01-0.04 |
| **OpenAI** | ~$1-3 |

**Gemini is 25-100x cheaper!** 🎉

## 🧪 Test It

1. Go to: `http://localhost:3000/preview`
2. Enter presentation mode
3. Click "**Narrate**"
4. Enjoy Gemini-powered narration!

## 📚 Full Documentation

See `GEMINI_SETUP.md` for detailed instructions.

---

**Ready?** Just add your API keys and restart! 🚀

