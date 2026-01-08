import { NextResponse } from "next/server"
import { generateNarrationForSlide, generateSpeech } from "@/lib/assistant-utils"
import type { Role } from "@/lib/assistant-config"

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json()
    const { slide, role } = body

    if (!slide || !role) {
      return NextResponse.json({ error: "Missing slide or role parameter" }, { status: 400 })
    }

    // Generate narration text using the appropriate assistant
    const narrationText = await generateNarrationForSlide(slide, role as Role)

    // Generate speech from the narration text
    const audioBuffer = await generateSpeech(narrationText, role as Role)

    // Return the audio data
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error in generate-narration API:", error)

    // Return a detailed error response
    return NextResponse.json(
      {
        error: "Failed to generate narration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
