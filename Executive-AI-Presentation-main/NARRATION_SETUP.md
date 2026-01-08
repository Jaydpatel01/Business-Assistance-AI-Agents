# Narration Feature Setup Guide

## Why Narration Isn't Working

The narration feature requires an **OpenAI API key** to work. Currently, you're seeing:
- ❌ "Auto-advance mode (no audio)" 
- ❌ Fallback timer-based slides (8 seconds per slide)
- ❌ No voice audio

## Quick Fix: Add Your OpenAI API Key

### Step 1: Get Your API Key

1. Visit: **https://platform.openai.com/api-keys**
2. Sign in with your OpenAI account (or create one)
3. Click "**+ Create new secret key**"
4. Give it a name (e.g., "PresentAI")
5. Copy the key - it looks like: `sk-proj-abc123...`
6. ⚠️ **IMPORTANT**: Save it immediately - you won't see it again!

### Step 2: Add Key to Your Project

**Option A: Using Terminal**
```bash
cd "/Users/namanrathi946/Executive - AI/Executive-AI-Presentation"
nano .env.local
```

Then paste your key:
```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

Save with: `Ctrl+X` → `Y` → `Enter`

**Option B: Using VS Code or Cursor**
1. Open `.env.local` in your editor
2. Replace `your_openai_api_key_here` with your actual key
3. Save the file

### Step 3: Restart the Server

The server has been restarted automatically, but if narration still doesn't work:

```bash
# Stop the server
Ctrl+C

# Start again
npm run dev
```

## Testing Narration

### 1. Go to Presentation Mode
- Navigate to: http://localhost:3000/preview
- Click "**Enter Presentation Mode**"

### 2. Click the "Narrate" Button
- Look for the green "**Narrate**" button (top right)
- Click it to start narration for the current slide

### 3. Expected Behavior

✅ **With Valid API Key:**
- You'll see: "Starting narration generation..."
- Then: "Narrating..." with animated dots
- Audio will play automatically
- Slide advances after narration completes

❌ **Without API Key:**
- You'll see: "Auto-advance mode (no audio)"
- Slides advance after 8 seconds
- No audio plays

## How Narration Works

### Technical Details

1. **Text Generation**: AI creates narration text from slide content
2. **Text-to-Speech**: OpenAI TTS converts text to audio
3. **Voice Selection**: Each role has a unique voice:
   - CEO: "echo" (authoritative)
   - CFO: "onyx" (analytical)
   - CTO: "fable" (technical)
   - HR: "nova" (warm)

### API Usage

Each narration generates:
- ~100-200 words of text (GPT-4)
- ~10-30 seconds of audio (TTS)
- Costs: ~$0.01-0.05 per slide

## Troubleshooting

### Issue: "API key not available"

**Solution:**
- Check `.env.local` file exists
- Verify API key starts with `sk-`
- Ensure no extra spaces or quotes
- Restart the dev server

### Issue: "OpenAI API error"

**Possible Causes:**
1. Invalid API key
2. Expired API key
3. Insufficient credits
4. Rate limit exceeded

**Solutions:**
1. Verify key at: https://platform.openai.com/api-keys
2. Check billing at: https://platform.openai.com/account/billing
3. Add credits if needed ($5 minimum)

### Issue: Audio plays but no sound

**Check:**
- System volume is up
- Browser permissions allow audio
- Not in silent/focus mode
- Audio output device is working

### Issue: "Failed to parse presentation data"

**Solution:**
- This is a content generation issue
- Try a simpler topic
- Regenerate the slide
- Check console for errors

## API Pricing (OpenAI)

### Text Generation (GPT-4)
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- ~$0.01-0.02 per slide

### Text-to-Speech
- TTS-1: $15 per 1M characters
- ~$0.01-0.03 per slide

### Estimated Costs
- 10 slides with narration: ~$0.30-0.50
- 100 slides: ~$3-5
- Monthly (100 presentations): ~$30-50

## Features Requiring API Key

### ✅ Works WITHOUT API Key
- Slide builder interface
- Manual slide creation
- Preview mode (auto-advance)
- Static content display
- Chart visualization
- Slide editing

### ❌ Requires API Key
- AI-generated slides
- Narration generation
- Voice synthesis
- Boardroom discussion
- Auto slide regeneration

## Alternative: Free Tier Workaround

If you don't have an API key, you can:

1. **Use Mock Data**: The app includes sample slides
2. **Manual Creation**: Build slides without AI
3. **Auto-Advance**: Presentations work with 8-second timing
4. **Export**: PDF/PPTX export works without audio

## Security Best Practices

### ✅ DO:
- Keep `.env.local` in `.gitignore`
- Use environment variables
- Rotate keys periodically
- Monitor usage on OpenAI dashboard

### ❌ DON'T:
- Commit API keys to Git
- Share keys publicly
- Use personal keys in production
- Hard-code keys in source files

## Need Help?

1. **Check logs**: Look at browser console (F12)
2. **Debug mode**: Set `NODE_ENV=development`
3. **OpenAI Status**: Check https://status.openai.com
4. **API Docs**: https://platform.openai.com/docs

## Quick Test Command

Test if your API key works:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

If successful, you'll see a list of available models.

## Next Steps

1. ✅ Add your OpenAI API key to `.env.local`
2. ✅ Restart the dev server
3. ✅ Test narration in presentation mode
4. ✅ Check browser console for errors
5. ✅ Monitor API usage on OpenAI dashboard

---

**Remember**: The narration feature is a premium feature that uses OpenAI's API. It's optional - all other features work without it!

