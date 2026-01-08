import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Role } from "@/lib/assistant-config"

type AgentMeetingRequest = {
  topic: string
  roles: Role[]
}

// Use only available models (checked via ListModels). Avoid legacy/blocked ones.
const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-lite"]

function cleanJsonText(raw: string) {
  // Strip markdown code fences if present
  const fenceRegex = /```json([\s\S]*?)```/i
  const match = raw.match(fenceRegex)
  const text = match ? match[1] : raw
  // Trim and remove stray triple backticks
  return text.replace(/```/g, "").trim()
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AgentMeetingRequest
    const { topic, roles } = body

    if (!topic || !roles || roles.length === 0) {
      return NextResponse.json({ error: "Missing topic or roles" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    let lastError: any = null

    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const prompt = `
Simulate a realistic but concise strategy meeting on the topic: "${topic}".
Participants: ${roles.join(", ")}.

Requirements:
- 8-10 turns total.
- Each turn is short (1-2 sentences), professional, and references previous points.
- Provide one actionable sub-topic for each role to own after the meeting.
- Meeting tone: collaborative, focused, decisive.

Output as JSON with keys:
{
  "transcript": [
    {"role": "CEO", "message": "..."},
    {"role": "CFO", "message": "..."},
    ...
  ],
  "perRoleTopics": {
    "CEO": "Subtopic CEO owns",
    "CFO": "Subtopic CFO owns",
    ...
  },
  "meetingSummary": "3-5 sentence recap",
  "keyPoints": ["point1", "point2", "point3"]
}
`
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        let parsed
        try {
          parsed = JSON.parse(cleanJsonText(text))
        } catch (err) {
          throw new Error(`Failed to parse JSON: ${text}`)
        }

        return NextResponse.json({
          success: true,
          transcript: parsed.transcript || [],
          perRoleTopics: parsed.perRoleTopics || {},
          meetingSummary: parsed.meetingSummary || "",
          keyPoints: parsed.keyPoints || [],
          modelUsed: modelName,
        })
      } catch (err) {
        lastError = err
        console.error(`Model ${modelName} failed:`, err)
        continue
      }
    }

    throw lastError || new Error("All models failed")
  } catch (error: any) {
    console.error("Agent meeting error:", error)
    return NextResponse.json(
      {
        error: "Failed to simulate meeting",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

