import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Role } from "@/lib/assistant-config"

type BoardroomPostMeetingRequest = {
  meetingSummary: string
  slidesMeta: { role: Role; titles: string[] }[]
  roles: Role[]
}

// Use only available models; avoid legacy/404 ones.
const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-lite"]

function cleanJsonText(raw: string) {
  const fenceRegex = /```json([\s\S]*?)```/i
  const match = raw.match(fenceRegex)
  const text = match ? match[1] : raw
  return text.replace(/```/g, "").trim()
}

function mockDiscussion(roles: Role[]) {
  const sample = [
    { role: roles[0] ?? "CEO", message: "Let's align on outcomes and time-to-value from these decks." },
    { role: roles[1] ?? "CFO", message: "Financial rigor first: ROI, margin, and cash impact." },
    { role: roles[2] ?? "CTO", message: "Tech feasibility and delivery timelines are critical." },
    { role: roles[3] ?? roles[0] ?? "CEO", message: "Talent and change management drive adoption—any risks?" },
  ]
  return sample
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BoardroomPostMeetingRequest
    const { meetingSummary, slidesMeta, roles } = body

    if (!meetingSummary || !slidesMeta || slidesMeta.length === 0 || !roles || roles.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
You are simulating a boardroom presentation after a prior strategy meeting.
Participants: ${roles.join(", ")}.
Meeting summary:
${meetingSummary}

Slides to be presented per role:
${slidesMeta
  .map((s) => `${s.role}: ${s.titles.slice(0, 5).join(" | ")}`)
  .join("\n")}

Requirements:
- Create a realistic Q&A discussion with 6-8 exchanges.
- Each exchange should be concise (1-2 sentences).
- Include probing questions and clarifying follow-ups referencing slide titles.
- Tone: professional, collaborative, incisive.
- Also provide a brief \"meetingHighlights\" summary and \"actionItems\" list.

Output JSON:
{
  "discussion": [
    {"role": "CEO", "message": "..."},
    {"role": "CFO", "message": "..."}
  ],
  "meetingHighlights": ["point1", "point2"],
  "actionItems": ["item1", "item2"]
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
          discussion: parsed.discussion || [],
          meetingHighlights: parsed.meetingHighlights || [],
          actionItems: parsed.actionItems || [],
          modelUsed: modelName,
        })
      } catch (err) {
        lastError = err
        continue
      }
    }

    // If all models fail, return a graceful mock discussion
    console.error("All models failed for boardroom; returning mock discussion.", lastError)
    return NextResponse.json({
      success: true,
      discussion: mockDiscussion(roles),
      meetingHighlights: ["Boardroom fallback summary", "Use real API once available"],
      actionItems: ["Provision valid Gemini model", "Re-run boardroom simulation"],
      modelUsed: "mock-fallback",
      fallback: true,
    })
  } catch (error: any) {
    console.error("Boardroom post meeting error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate boardroom discussion",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

