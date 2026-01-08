import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

type CollaborativeSummaryRequest = {
  meetingSummary: string
  boardroomDiscussion: { role: string; message: string }[]
  actionItems?: string[]
}

// Use only available models; avoid legacy/404 ones.
const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-lite"]

function cleanJsonText(raw: string) {
  const fenceRegex = /```json([\s\S]*?)```/i
  const match = raw.match(fenceRegex)
  const text = match ? match[1] : raw
  return text.replace(/```/g, "").trim()
}

function mockSummary() {
  return {
    executiveSummary:
      "Teams aligned on strategic priorities, financial discipline, scalable delivery, and talent readiness to support near-term execution and longer-term growth.",
    keyDecisions: [
      "Prioritize top three initiatives with clear owners and KPIs",
      "Stage-gate funding tied to ROI and milestone proof",
      "Adopt biweekly steering reviews for progress and risk",
    ],
    risks: [
      "Execution bandwidth and dependency clashes",
      "Budget pressure vs. delivery timelines",
      "Change management and adoption risk",
    ],
    nextSteps: [
      "Publish final owners, KPIs, and timelines",
      "Lock comms plan and cadence with stakeholders",
      "Confirm resource plan and address gaps",
    ],
    ownerUpdates: [
      "CEO: Alignment on outcomes and governance cadence",
      "CFO: Funding guardrails and ROI checkpoints",
      "CTO: Delivery milestones and technical risks",
      "HR: Talent gaps, hiring, and adoption enablement",
    ],
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CollaborativeSummaryRequest
    const { meetingSummary, boardroomDiscussion, actionItems } = body

    if (!meetingSummary || !boardroomDiscussion || boardroomDiscussion.length === 0) {
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
Create a concise collaborative summary for company owners after a multi-role meeting and boardroom presentation.

Meeting summary:
${meetingSummary}

Boardroom discussion (recent):
${boardroomDiscussion
  .slice(0, 10)
  .map((m) => `${m.role}: ${m.message}`)
  .join("\n")}

Prior action items (if any):
${(actionItems || []).join("\n")}

Output JSON:
{
  "executiveSummary": "3-5 sentence summary",
  "keyDecisions": ["decision1", "decision2"],
  "risks": ["risk1", "risk2"],
  "nextSteps": ["step1", "step2"],
  "ownerUpdates": ["item1", "item2"]
}
Return JSON only.`
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
          executiveSummary: parsed.executiveSummary || "",
          keyDecisions: parsed.keyDecisions || [],
          risks: parsed.risks || [],
          nextSteps: parsed.nextSteps || [],
          ownerUpdates: parsed.ownerUpdates || [],
          modelUsed: modelName,
        })
      } catch (err) {
        lastError = err
        continue
      }
    }

    // Fallback mock summary if all models fail
    console.error("All models failed for collaborative summary; returning mock summary.", lastError)
    const fallback = mockSummary()
    return NextResponse.json({ success: true, ...fallback, modelUsed: "mock-fallback", fallback: true })
  } catch (error: any) {
    console.error("Collaborative summary error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate collaborative summary",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

