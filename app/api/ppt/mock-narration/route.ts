import { NextResponse } from "next/server"

// This is a fallback API that returns a mock response
// when the OpenAI API is unavailable or having issues
export async function POST(req: Request) {
  try {
    // We're not actually generating audio here, just simulating a response
    // In a real implementation, you could use a local TTS library or pre-recorded audio

    // Add a small delay to simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return a success response
    return NextResponse.json({
      success: true,
      message: "Using fallback auto-advance mode",
      fallback: true,
      duration: 8000, // Suggest 8 seconds for auto-advance
    })
  } catch (error: any) {
    console.error("Error in mock-narration API:", error)

    // Even if there's an error, return a success response to ensure the UI can continue
    return NextResponse.json(
      {
        success: true, // Still return success to allow the client to continue
        error: "Failed to generate mock narration, but continuing with auto-advance",
        details: error.message || "Unknown error",
        fallback: true,
        duration: 8000, // Default duration
      },
      { status: 200 }, // Always return 200
    )
  }
}
