import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { VOICE_MAPPING } from "@/lib/assistant-config"
import type { Role } from "@/lib/assistant-config"

// Initialize Gemini client
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json()
    const { text, role } = body

    if (!text) {
      return NextResponse.json(
        {
          error: "Missing text parameter",
          fallback: true,
        },
        { status: 400 },
      )
    }

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set")
      return NextResponse.json({
        success: false,
        message: "Gemini API key not available, using fallback mode",
        fallback: true,
        debug: "GEMINI_API_KEY environment variable is not set. Please add it to .env.local",
      })
    }

    // Validate API key format
    if (!process.env.GEMINI_API_KEY.startsWith("AIza")) {
      console.error("Invalid Gemini API key format")
      return NextResponse.json({
        success: false,
        message: "Invalid Gemini API key format, using fallback mode",
        fallback: true,
        debug: "Gemini API key must start with 'AIza'. Get your key from https://aistudio.google.com/app/apikey",
      })
    }

    if (!genAI) {
      return NextResponse.json({
        success: false,
        message: "Failed to initialize Gemini client",
        fallback: true,
        debug: "Gemini client initialization failed",
      })
    }

    // Determine voice based on role
    let voiceName = "en-US-Neural2-D" // default voice
    if (role && VOICE_MAPPING[role as Role]) {
      voiceName = VOICE_MAPPING[role as Role]
    }

    console.log(`Generating narration with Gemini for role ${role} with voice ${voiceName}`)

    try {
      // Step 1: Use Gemini to generate enhanced narration text
      // Try different model names in order of preference
      // Model names should be without "models/" prefix when using the SDK
      const modelNames = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]
      let narrationText = ""
      let lastError: any = null

      for (const modelName of modelNames) {
        try {
          console.log(`Trying model: ${modelName}`)
          // The SDK automatically handles the "models/" prefix
          const model = genAI.getGenerativeModel({ 
            model: modelName,
          })

          const prompt = `You are a professional ${role} presenting to stakeholders. Create a concise, engaging narration (100-150 words) for this slide content. Make it conversational and natural, suitable for voice narration. Keep it professional but engaging.

Slide content: ${text.substring(0, 500)}

Generate only the narration text, no additional formatting or explanations.`

          const result = await model.generateContent(prompt)
          const response = await result.response
          
          if (!response || !response.text) {
            throw new Error("No text generated from Gemini")
          }
          
          narrationText = response.text().trim()
          
          if (!narrationText || narrationText.length === 0) {
            throw new Error("Empty narration text generated")
          }
          
          console.log(`Successfully generated narration with model: ${modelName}`)
          break // Success, exit loop
        } catch (modelError: any) {
          console.log(`Model ${modelName} failed:`, modelError?.message)
          lastError = modelError
          // Continue to next model
          continue
        }
      }

      if (!narrationText || narrationText.length === 0) {
        throw lastError || new Error("All Gemini models failed")
      }

      console.log("Generated narration text:", narrationText.substring(0, 100) + "...")

      // Step 2: Return the narration text to be spoken by browser's Web Speech API
      // This avoids needing to enable Google Cloud Text-to-Speech API
      // The frontend will use browser's built-in SpeechSynthesis API
      return NextResponse.json({
        success: true,
        narrationText: narrationText,
        role: role,
        voiceName: voiceName,
        useBrowserTTS: true, // Flag to use browser TTS
      })
    } catch (geminiError: any) {
      console.error("Gemini/TTS API error:", geminiError)

      // Extract detailed error information
      const errorMessage = geminiError?.message || "Unknown error"
      const errorStatus = geminiError?.status || geminiError?.statusCode || 0
      const errorCode = geminiError?.code || "unknown"

      // Check for specific error types
      let userFriendlyMessage = "Gemini API error, using fallback mode"
      let debugInfo = ""

      if (errorStatus === 404) {
        userFriendlyMessage = "Gemini model not found (404). Check if model name is correct."
        debugInfo = "Model 'gemini-1.5-flash' might not be available. Try 'gemini-1.5-pro' or check API key."
      } else if (errorStatus === 401 || errorStatus === 403) {
        userFriendlyMessage = "Invalid or unauthorized API key"
        debugInfo = "Check your GEMINI_API_KEY in .env.local. Get a new key from https://aistudio.google.com/app/apikey"
      } else if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
        userFriendlyMessage = "API quota exceeded"
        debugInfo = "Check your usage at https://console.cloud.google.com/"
      }

      // Log detailed error for debugging
      console.error("Gemini Error Details:", {
        message: errorMessage,
        status: errorStatus,
        code: errorCode,
        apiKeyPresent: !!process.env.GEMINI_API_KEY,
        apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
        apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) || "none",
      })

      // Return detailed error response for debugging
      return NextResponse.json(
        {
          success: false,
          message: userFriendlyMessage,
          error: errorMessage,
          errorStatus: errorStatus,
          errorCode: errorCode,
          debug: debugInfo,
          fallback: true,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Error generating narration:", error)

    // Return a more detailed error response
    return NextResponse.json(
      {
        error: "Failed to generate narration",
        details: error instanceof Error ? error.message : "Unknown error",
        fallback: true,
      },
      { status: 200 },
    )
  }
}
