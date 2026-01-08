import OpenAI from "openai"
import { ASSISTANT_IDS, VOICE_MAPPING, type Role } from "./assistant-config"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Create a thread for a presentation
export async function createThread() {
  try {
    const thread = await openai.beta.threads.create()
    return thread.id
  } catch (error) {
    console.error("Error creating thread:", error)
    throw error
  }
}

// Add a message to a thread
export async function addMessageToThread(threadId: string, content: string) {
  try {
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content,
    })
  } catch (error) {
    console.error("Error adding message to thread:", error)
    throw error
  }
}

// Run an assistant on a thread
export async function runAssistant(threadId: string, role: Role, instructions?: string) {
  try {
    const assistantId = ASSISTANT_IDS[role]

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      instructions: instructions || `You are the ${role} of a company. Provide your perspective on the topic.`,
    })

    return run.id
  } catch (error) {
    console.error(`Error running ${role} assistant:`, error)
    throw error
  }
}

// Check the status of a run
export async function checkRunStatus(threadId: string, runId: string) {
  try {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId)
    return run.status
  } catch (error) {
    console.error("Error checking run status:", error)
    throw error
  }
}

// Get the latest message from a thread
export async function getLatestMessage(threadId: string) {
  try {
    const messages = await openai.beta.threads.messages.list(threadId)
    const latestMessage = messages.data[0]

    if (!latestMessage || latestMessage.role !== "assistant") {
      return null
    }

    // Extract the text content
    const content = latestMessage.content[0]
    if (content.type !== "text") {
      return null
    }

    return content.text.value
  } catch (error) {
    console.error("Error getting latest message:", error)
    throw error
  }
}

// Generate narration for a slide using the appropriate assistant
export async function generateNarrationForSlide(slide: any, role: Role) {
  try {
    // Create a new thread
    const threadId = await createThread()

    // Prepare the prompt
    let prompt = `Create a detailed narration for a presentation slide with the following information:
    
Title: ${slide.title}
Content: ${slide.content}
`

    if (slide.bullets && slide.bullets.length > 0) {
      prompt += `\nKey Points:\n${slide.bullets.map((bullet: string) => `- ${bullet}`).join("\n")}`
    }

    if (slide.notes) {
      prompt += `\nSpeaker Notes: ${slide.notes}`
    }

    prompt += `\n\nAs the ${role}, provide a detailed explanation of this slide in a conversational tone. 
    Keep your response between 100-150 words. Focus on the key insights and implications.`

    // Add the message to the thread
    await addMessageToThread(threadId, prompt)

    // Run the assistant
    const runId = await runAssistant(threadId, role)

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
      throw new Error(`Assistant run did not complete. Status: ${status}`)
    }

    // Get the response
    const response = await getLatestMessage(threadId)

    if (!response) {
      throw new Error("No response from assistant")
    }

    return response
  } catch (error) {
    console.error("Error generating narration:", error)
    throw error
  }
}

// Generate speech from text
export async function generateSpeech(text: string, role: Role) {
  try {
    const voice = VOICE_MAPPING[role]

    const response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: voice,
      input: text,
    })

    const buffer = await response.arrayBuffer()
    return buffer
  } catch (error) {
    console.error("Error generating speech:", error)
    throw error
  }
}
