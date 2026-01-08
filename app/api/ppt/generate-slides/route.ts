import { NextResponse } from "next/server"
import OpenAI from "openai"
import { v4 as uuidv4 } from "uuid"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { GEMINI_MODEL } from "@/lib/assistant-config"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Chart types
const chartTypes = ["bar", "line", "pie", "area"]

// Slide types
const slideTypes = ["intro", "chart", "timeline", "summary", "comparison"]

function cleanJsonText(raw: string) {
  const fenceRegex = /```json([\s\S]*?)```/i
  const match = raw.match(fenceRegex)
  const text = match ? match[1] : raw
  return text.replace(/```/g, "").trim()
}

function mockSlides(topic: string, count: number) {
  const slides = []
  for (let i = 0; i < count; i++) {
    slides.push({
      id: uuidv4(),
      title: `${topic} — Slide ${i + 1}`,
      content: `Auto-generated fallback content for ${topic}.`,
      bullets: ["Point 1", "Point 2", "Point 3"],
      notes: "Fallback slide.",
      role: ["CEO", "CFO", "CTO", "HR"][i % 4],
      slideType: slideTypes[i % slideTypes.length],
      chartType: chartTypes[i % chartTypes.length],
      chartData: [
        { name: "A", value: Math.floor(Math.random() * 80) + 20 },
        { name: "B", value: Math.floor(Math.random() * 80) + 20 },
        { name: "C", value: Math.floor(Math.random() * 80) + 20 },
      ],
      createdAt: new Date().toISOString(),
    })
  }
  return slides
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json()
    const { topic, numSlides = 3 } = body

    if (!topic) {
      return NextResponse.json({ error: "Missing topic parameter" }, { status: 400 })
    }

    // Limit the number of slides to generate
    const slidesToGenerate = Math.min(Math.max(1, numSlides), 10)

    // First try Gemini
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey)
      const modelNames = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-lite"]
      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName })
          const prompt = `You are a presentation slide generator. Create ${slidesToGenerate} slides for a business presentation on the topic "${topic}". 
Each slide should have a title, content, 3-5 bullet points, optional speaker notes, and a role (CEO, CFO, CTO, or HR).
Also include chart data for visualization. Make the content professional and insightful.

Return the slides as a JSON array with the following structure for each slide:
{
  "id": "unique-id",
  "title": "Slide Title",
  "content": "Main content paragraph",
  "bullets": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "notes": "Speaker notes for this slide",
  "role": "CEO" | "CFO" | "CTO" | "HR",
  "slideType": "intro" | "chart" | "timeline" | "summary" | "comparison",
  "chartType": "bar" | "line" | "pie" | "area",
  "chartData": [{"name": "Label1", "value": 42}, {"name": "Label2", "value": 58}],
  "createdAt": "2023-06-15T10:30:00Z"
}

Distribute the roles evenly across the slides. Make sure the chart data is appropriate for the chart type.
For pie charts, use 3-5 data points. For line/bar/area charts, use 4-8 data points.
Make sure the content is coherent and flows well from one slide to the next.
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

          const slides = parsed.slides || parsed || []
          const processedSlides = slides.map((slide: any) => ({
            ...slide,
            id: slide.id || uuidv4(),
            createdAt: slide.createdAt || new Date().toISOString(),
          }))

          return NextResponse.json({ slides: processedSlides })
        } catch (err) {
          console.error(`Gemini model ${modelName} failed`, err)
          continue
        }
      }
    }

    // Fallback to OpenAI
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a presentation slide generator. Create ${slidesToGenerate} slides for a business presentation on the topic "${topic}". 
          Each slide should have a title, content, 3-5 bullet points, optional speaker notes, and a role (CEO, CFO, CTO, or HR).
          Also include chart data for visualization. Make the content professional and insightful.
          
          Return the slides as a JSON array with the following structure for each slide:
          {
            "id": "unique-id",
            "title": "Slide Title",
            "content": "Main content paragraph",
            "bullets": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
            "notes": "Speaker notes for this slide",
            "role": "CEO" | "CFO" | "CTO" | "HR",
            "slideType": "intro" | "chart" | "timeline" | "summary" | "comparison",
            "chartType": "bar" | "line" | "pie" | "area",
            "chartData": [{"name": "Label1", "value": 42}, {"name": "Label2", "value": 58}],
            "createdAt": "2023-06-15T10:30:00Z"
          }
          
          Distribute the roles evenly across the slides. Make sure the chart data is appropriate for the chart type.
          For pie charts, use 3-5 data points. For line/bar/area charts, use 4-8 data points.
          Make sure the content is coherent and flows well from one slide to the next.`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      })

      const content = response.choices[0].message.content
      if (!content) {
        throw new Error("No content in response")
      }

      let parsedContent
      try {
        parsedContent = JSON.parse(content)
      } catch (e) {
        console.error("Failed to parse JSON:", content)
        throw new Error("Invalid JSON response from OpenAI")
      }

      const slides = parsedContent.slides || []
      const processedSlides = slides.map((slide: any) => ({
        ...slide,
        id: slide.id || uuidv4(),
        createdAt: slide.createdAt || new Date().toISOString(),
      }))

      return NextResponse.json({ slides: processedSlides })
    } catch (err) {
      console.error("OpenAI generation failed, using mock slides. Error:", err)
      const slides = mockSlides(topic, slidesToGenerate)
      return NextResponse.json({ slides, fallback: true })
    }
  } catch (error) {
    console.error("Error generating slides:", error)

    // Return a detailed error response
    return NextResponse.json(
      {
        error: "Failed to generate slides",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
