import { NextResponse } from "next/server"
import { createThread, addMessageToThread, runAssistant, checkRunStatus, getLatestMessage } from "@/lib/assistant-utils"
import type { Role } from "@/lib/assistant-config"

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json()
    const { topic, roles } = body

    if (!topic || !roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json({ error: "Missing topic or roles parameter" }, { status: 400 })
    }

    // Create a thread for the discussion
    const threadId = await createThread()

    // Initial prompt to set up the discussion
    const initialPrompt = `We're having a boardroom discussion about: "${topic}". 
    Each executive will provide their perspective in turn.`

    await addMessageToThread(threadId, initialPrompt)

    // Collect responses from each role
    const discussion: { role: Role; message: string }[] = []

    for (const role of roles) {
      // Run the assistant for this role
      const runId = await runAssistant(
        threadId,
        role as Role,
        `You are the ${role} of the company. Provide your perspective on "${topic}" in a concise way (2-3 sentences). 
        Consider what has been said before in the discussion.`,
      )

      // Poll for completion
      let status = await checkRunStatus(threadId, runId)
      let attempts = 0
      const maxAttempts = 30 // 30 seconds timeout

      while (status !== "completed" && status !== "failed" && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second
        status = await checkRunStatus(threadId, runId)
        attempts++
      }

      if (status !== "completed") {
        throw new Error(`Assistant run for ${role} did not complete. Status: ${status}`)
      }

      // Get the response
      const response = await getLatestMessage(threadId)

      if (!response) {
        throw new Error(`No response from ${role} assistant`)
      }

      // Add to the discussion
      discussion.push({ role: role as Role, message: response })

      // Add this response to the thread for context for the next role
      await addMessageToThread(threadId, `The ${role} said: ${response}`)
    }

    return NextResponse.json({ discussion })
  } catch (error) {
    console.error("Error in boardroom-discussion API:", error)

    return NextResponse.json(
      {
        error: "Failed to generate boardroom discussion",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
