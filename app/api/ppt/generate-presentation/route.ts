import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { v4 as uuidv4 } from "uuid"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { GEMINI_MODEL } from "@/lib/assistant-config"

function cleanJsonText(raw: string) {
  const fenceRegex = /```json([\s\S]*?)```/i
  const match = raw.match(fenceRegex)
  const text = match ? match[1] : raw
  return text.replace(/```/g, "").trim()
}

function mockSlides(topic: string, role: string) {
  const base = [
    {
      title: `${topic} — Executive Overview`,
      content: `Overview of ${topic} from a ${role} perspective.`,
      bullets: ["Context", "Objectives", "Key levers", "Risks"],
      notes: "Auto-generated fallback slide.",
    },
    {
      title: `${topic} — Strategy & Plan`,
      content: `Strategic approach to ${topic}.`,
      bullets: ["Pillars", "Timeline", "Owners", "Resources"],
      notes: "Auto-generated fallback slide.",
    },
    {
      title: `${topic} — Metrics & Outcomes`,
      content: `Success metrics for ${topic}.`,
      bullets: ["KPIs", "Targets", "Milestones", "Reporting cadence"],
      notes: "Auto-generated fallback slide.",
    },
    {
      title: `${topic} — Risks & Mitigation`,
      content: `Risks and mitigations for ${topic}.`,
      bullets: ["Top risks", "Mitigations", "Escalation path"],
      notes: "Auto-generated fallback slide.",
    },
  ]
  return base.map((s) => ({
    ...s,
    id: uuidv4(),
    role,
    chartType: getRandomChartType(),
    chartData: [
      { name: "Q1", value: Math.floor(Math.random() * 80) + 20 },
      { name: "Q2", value: Math.floor(Math.random() * 80) + 20 },
      { name: "Q3", value: Math.floor(Math.random() * 80) + 20 },
      { name: "Q4", value: Math.floor(Math.random() * 80) + 20 },
    ],
  }))
}

// Role-specific prompt templates
const promptTemplates = {
  CEO: `You are a professional CEO presenting to stakeholders. Generate a business presentation for the topic: {TOPIC}. 
  Focus on vision, strategy, market analysis, positioning, and value proposition.
  Return a JSON array of slides, where each slide has a title, content, bullets (array of bullet points), and optional notes.
  Generate 5-7 slides that would make a complete presentation from a CEO's perspective.
  Include data visualization suggestions for each slide (e.g., market trends, competitive analysis, growth projections).
  Make the content visionary, strategic, and focused on business impact.`,

  CFO: `You are a professional CFO presenting to stakeholders. Generate a business presentation for the topic: {TOPIC}. 
  Focus on financial forecasting, ROI analysis, profit margins, and cost breakdown.
  Return a JSON array of slides, where each slide has a title, content, bullets (array of bullet points), and optional notes.
  Generate 5-7 slides that would make a complete presentation from a CFO's perspective.
  Include data visualization suggestions for each slide (e.g., financial charts, cost breakdowns, ROI projections).
  Make the content financially focused, with emphasis on numbers, projections, and business metrics.`,

  CTO: `You are a professional CTO presenting to stakeholders. Generate a business presentation for the topic: {TOPIC}. 
  Focus on technical roadmap, architecture, innovation stack, and system design.
  Return a JSON array of slides, where each slide has a title, content, bullets (array of bullet points), and optional notes.
  Generate 5-7 slides that would make a complete presentation from a CTO's perspective.
  Include data visualization suggestions for each slide (e.g., architecture diagrams, technology comparisons, implementation timelines).
  Make the content technically focused but accessible to non-technical stakeholders.`,

  HR: `You are a professional HR Director presenting to stakeholders. Generate a business presentation for the topic: {TOPIC}. 
  Focus on talent strategy, employee engagement, diversity metrics, and culture insights.
  Return a JSON array of slides, where each slide has a title, content, bullets (array of bullet points), and optional notes.
  Generate 5-7 slides that would make a complete presentation from an HR perspective.
  Include data visualization suggestions for each slide (e.g., workforce demographics, engagement metrics, hiring projections).
  Make the content people-focused, with emphasis on organizational impact and culture.`,
}

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-lite"]

export async function POST(req: Request) {
  try {
    const { topic, role } = await req.json()

    if (!topic || !role || !promptTemplates[role as keyof typeof promptTemplates]) {
      return NextResponse.json({ error: "Missing required fields or invalid role" }, { status: 400 })
    }

    // First try Gemini (preferred)
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey)
      for (const modelName of GEMINI_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName })
          const prompt = promptTemplates[role as keyof typeof promptTemplates].replace("{TOPIC}", topic) + `
Return JSON only, no prose.`
          const result = await model.generateContent(prompt)
          const response = await result.response
          const text = response.text()
          let parsed
          try {
            parsed = JSON.parse(cleanJsonText(text))
          } catch (err) {
            throw new Error(`Failed to parse JSON: ${text}`)
          }
          const slides = (parsed.slides || parsed || []).map((slide: any) => ({
            ...slide,
            id: uuidv4(),
            chartType: slide.chartType || getRandomChartType(),
          }))
          return NextResponse.json({ slides })
        } catch (err) {
          console.error(`Gemini model ${modelName} failed`, err)
          continue
        }
      }
    }

    // Fallback to OpenAI GPT-4o
    try {
      const prompt = promptTemplates[role as keyof typeof promptTemplates].replace("{TOPIC}", topic)
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.7,
        maxTokens: 2500,
      })
      let slides = JSON.parse(text)
      slides = slides.map((slide: any) => ({
        ...slide,
        id: uuidv4(),
        chartType: slide.chartType || getRandomChartType(),
      }))
      return NextResponse.json({ slides })
    } catch (err) {
      console.error("OpenAI generation failed, using mock slides. Error:", err)
      const slides = mockSlides(topic, role)
      return NextResponse.json({ slides, fallback: true })
    }
  } catch (error) {
    console.error("Error generating presentation:", error)
    return NextResponse.json({ error: "Failed to generate presentation" }, { status: 500 })
  }
}

function getRandomChartType() {
  const types = ["bar", "line", "pie", "area"]
  return types[Math.floor(Math.random() * types.length)]
}
