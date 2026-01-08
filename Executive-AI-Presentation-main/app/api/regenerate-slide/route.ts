import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { topic, role, slideTitle } = await req.json()

    if (!topic || !role || !slideTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prompt = `You are a professional ${role} presenting to stakeholders. 
    Regenerate a single slide titled "${slideTitle}" for a presentation about: ${topic}.
    
    Return a JSON object with the following structure:
    {
      "title": "Slide title",
      "content": "Main slide content/description",
      "bullets": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "notes": "Optional speaker notes"
    }
    
    Make the slide content detailed, professional, and aligned with a ${role}'s perspective.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Parse the response
    let slide
    try {
      slide = JSON.parse(text)
    } catch (error) {
      console.error("Error parsing AI response:", error)
      return NextResponse.json({ error: "Failed to parse slide data" }, { status: 500 })
    }

    return NextResponse.json({ slide })
  } catch (error) {
    console.error("Error regenerating slide:", error)
    return NextResponse.json({ error: "Failed to regenerate slide" }, { status: 500 })
  }
}
