export const ASSISTANT_IDS = {
  CEO: "asst_vWGVpOmtxO1jWBPv7pxGwYs5",
  CTO: "asst_KcphLnj5aebwDdSGKdxpMXll",
  CFO: "asst_W7qNA36L7nmSZW7HGb6yTSbQ",
  HR: "asst_mpuBo67fT1fEbGi0Tt0a73CA",
}

// Google Cloud Text-to-Speech voice names (fallback)
export const VOICE_MAPPING = {
  CEO: "en-US-Neural2-D", // authoritative, deep male voice
  CFO: "en-US-Neural2-J", // serious, analytical female voice
  CTO: "en-US-Neural2-F", // technical, enthusiastic male voice
  HR: "en-US-Neural2-C", // warm, friendly female voice
}

// ElevenLabs voice IDs - humanized, natural voices
export const ELEVENLABS_VOICES = {
  CEO: "pNInz6obpgDQGcFmaJgB",  // Adam - deep, authoritative male voice
  CFO: "21m00Tcm4TlvDq8ikWAM",  // Rachel - professional female voice
  CTO: "ErXwobaYiN019PkySvjV",  // Antoni - clear, professional male voice
  HR: "EXAVITQu4vr4xnSDxMaL",   // Bella - warm, friendly female voice
}

// Gemini model configuration
export const GEMINI_MODEL = "gemini-2.5-flash" // Latest fast model for narration

export type Role = "CEO" | "CFO" | "CTO" | "HR"
