import { NextRequest, NextResponse } from "next/server"
import { ELEVENLABS_VOICES, type Role } from "@/lib/assistant-config"

// Fallback voice ID if role not found (Rachel - professional female voice)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

// ElevenLabs current free-tier compatible model
const ELEVEN_MODEL_ID = "eleven_multilingual_v2"

export async function POST(request: NextRequest) {
  try {
    const { text, role } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      console.log("ElevenLabs API key not found, falling back to browser TTS")
      return NextResponse.json({
        useBrowserTTS: true,
        text,
        message: "ElevenLabs API key not configured",
      })
    }

    const voiceId = ELEVENLABS_VOICES[role as Role] || DEFAULT_VOICE_ID

    console.log(`Generating ElevenLabs audio for role: ${role}, voice: ${voiceId}`)

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: ELEVEN_MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("ElevenLabs API error:", response.status, errorText)

      // Return fallback to browser TTS
      return NextResponse.json({
        useBrowserTTS: true,
        text,
        message: `ElevenLabs API error: ${response.status}`,
      })
    }

    // Get the audio buffer
    const audioBuffer = await response.arrayBuffer()

    // Return the audio as a response
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("ElevenLabs TTS error:", error)
    return NextResponse.json(
      {
        useBrowserTTS: true,
        message: "Failed to generate audio",
      },
      { status: 500 },
    )
  }
}

