"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX, Loader2, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChartComponent } from "@/components/chart-component"
import { getRoleColor } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Role } from "@/lib/assistant-config"

interface Slide {
  id: string
  title: string
  content: string
  bullets: string[]
  notes?: string
  role: Role
  slideType: string
  chartType: "bar" | "line" | "pie" | "area"
  chartData: { name: string; value: number }[]
  createdAt: Date
}

interface PresentationModeProps {
  slides: Slide[]
  currentIndex: number
  onNext: () => void
  onPrev: () => void
  onExit: () => void
  isPlaying: boolean
  onTogglePlay: () => void
  role: Role
}

export function PresentationMode({
  slides,
  currentIndex,
  onNext,
  onPrev,
  onExit,
  isPlaying,
  onTogglePlay,
  role,
}: PresentationModeProps) {
  const [mounted, setMounted] = useState(false)
  const [isNarrating, setIsNarrating] = useState(false)
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false)
  const [narrationFailed, setNarrationFailed] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [autoAdvanceProgress, setAutoAdvanceProgress] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const currentSlide = slides[currentIndex]
  const roleColor = getRoleColor(currentSlide?.role || role)

  // Auto-advance duration in milliseconds (8 seconds per slide if narration fails)
  const AUTO_ADVANCE_DURATION = 8000

  // Add a new state for fallback mode
  const [usingFallbackMode, setUsingFallbackMode] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Create audio element
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()

      // Set up audio event listeners
      audioRef.current.addEventListener("ended", handleAudioEnded)
      audioRef.current.addEventListener("error", handleAudioError)
      audioRef.current.addEventListener("play", () => {
        console.log("Audio started playing")
        setDebugInfo((prev) => prev + "\nAudio started playing")
      })
      audioRef.current.addEventListener("pause", () => {
        console.log("Audio paused")
        setDebugInfo((prev) => prev + "\nAudio paused")
      })
    }

    // Add keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        onNext()
      } else if (e.key === "ArrowLeft") {
        onPrev()
      } else if (e.key === "Escape") {
        onExit()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)

      // Clean up audio element and listeners
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleAudioEnded)
        audioRef.current.removeEventListener("error", handleAudioError)
        audioRef.current.pause()
        audioRef.current = null
      }

      // Clean up speech synthesis
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }

      // Clear any timers
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [onNext, onPrev, onExit])

  // Handle audio ended event
  const handleAudioEnded = () => {
    console.log("Audio ended, advancing to next slide")
    setDebugInfo((prev) => prev + "\nAudio ended, advancing to next slide")
    setIsNarrating(false)
    // Advance to next slide after narration completes
    if (currentIndex < slides.length - 1) {
      onNext()
    } else {
      // End of presentation
      onTogglePlay()
      toast({
        title: "Presentation complete",
        description: "You've reached the end of the presentation.",
      })
    }
  }

  // Handle audio error event
  const handleAudioError = (e: Event) => {
    console.error("Audio playback error:", e)
    setDebugInfo((prev) => prev + "\nAudio error: " + JSON.stringify(e))
    setIsNarrating(false)
    setNarrationFailed(true)

    // Start timer-based auto-advance as fallback
    startTimerBasedAutoAdvance()

    toast({
      title: "Narration unavailable",
      description: "Using automatic timing instead.",
      variant: "destructive",
    })
  }

  // Update the startTimerBasedAutoAdvance function
  const startTimerBasedAutoAdvance = () => {
    // Clear any existing timers
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    // Reset progress
    setAutoAdvanceProgress(0)

    // Set fallback mode indicator
    setUsingFallbackMode(true)

    // Start progress animation
    const startTime = Date.now()
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / AUTO_ADVANCE_DURATION) * 100, 100)
      setAutoAdvanceProgress(progress)
    }, 50)

    // Set timer to advance to next slide
    autoAdvanceTimerRef.current = setTimeout(() => {
      if (currentIndex < slides.length - 1) {
        onNext()
      } else {
        // End of presentation
        onTogglePlay()
        toast({
          title: "Presentation complete",
          description: "You've reached the end of the presentation.",
        })
      }
    }, AUTO_ADVANCE_DURATION)
  }

  // Generate narration for the current slide
  const generateNarration = async () => {
    if (!audioEnabled) {
      startTimerBasedAutoAdvance()
      return
    }

    setIsGeneratingNarration(true)
    setNarrationFailed(false)
    setDebugInfo("Starting narration generation...")

    try {
      // Create a simple narration text from the slide content
      const slideRole = currentSlide.role || role
      let narrationText = currentSlide.content

      // Add bullet points to narration
      if (currentSlide.bullets && currentSlide.bullets.length > 0) {
        narrationText += ". Key points include: " + currentSlide.bullets.join(". ")
      }

      // Log the narration text
      console.log("Narration text:", narrationText)
      setDebugInfo((prev) => prev + "\nNarration text: " + narrationText.substring(0, 50) + "...")

      // First try the main API
      try {
        const response = await fetch("/api/simple-narration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: narrationText.substring(0, 200), // Limit text length to avoid API issues
            role: slideRole,
          }),
        })

        // Check if the response is OK
        if (!response.ok) {
          const errorText = await response.text()
          setDebugInfo((prev) => prev + "\nAPI error: " + errorText)
          throw new Error(`API returned status ${response.status}: ${errorText}`)
        }

        // Check if the response is JSON (narration text) or audio
        const contentType = response.headers.get("content-type") || ""
        
        // Clone response for reading (in case we need to check both)
        const responseClone = response.clone()
        
        if (contentType.includes("application/json")) {
          const jsonResponse = await response.json()
          setDebugInfo((prev) => prev + "\nReceived JSON response: " + JSON.stringify(jsonResponse, null, 2))

          if (jsonResponse.fallback) {
            // The API indicated we should use fallback mode
            let errorDetails = "\nAPI indicated fallback mode"
            if (jsonResponse.error) {
              errorDetails += `\nError: ${jsonResponse.error}`
            }
            if (jsonResponse.errorType) {
              errorDetails += `\nError Type: ${jsonResponse.errorType}`
            }
            if (jsonResponse.errorCode) {
              errorDetails += `\nError Code: ${jsonResponse.errorCode}`
            }
            if (jsonResponse.errorStatus) {
              errorDetails += `\nStatus: ${jsonResponse.errorStatus}`
            }
            if (jsonResponse.debug) {
              errorDetails += `\nDebug: ${jsonResponse.debug}`
            }
            setDebugInfo((prev) => prev + errorDetails)
            
            // Create error with full details for better error handling
            const errorMsg = jsonResponse.error || jsonResponse.message || "API indicated fallback mode"
            const error = new Error(errorMsg)
            ;(error as any).errorType = jsonResponse.errorType
            ;(error as any).errorCode = jsonResponse.errorCode
            ;(error as any).errorStatus = jsonResponse.errorStatus
            throw error
          }

          // Check if this is a success response with narration text for browser TTS
          if (jsonResponse.success && jsonResponse.narrationText && jsonResponse.useBrowserTTS) {
            setDebugInfo((prev) => prev + "\nUsing browser Web Speech API for narration")
            
            // Use browser's built-in SpeechSynthesis API
            if ("speechSynthesis" in window) {
              setIsGeneratingNarration(false)
              setIsNarrating(true)

              // Cancel any ongoing speech
              window.speechSynthesis.cancel()

              // Wait for voices to load
              const loadVoices = () => {
                return new Promise<void>((resolve) => {
                  const voices = window.speechSynthesis.getVoices()
                  if (voices.length > 0) {
                    resolve()
                  } else {
                    window.speechSynthesis.onvoiceschanged = () => resolve()
                  }
                })
              }

              await loadVoices()

              // Create speech utterance
              const utterance = new SpeechSynthesisUtterance(jsonResponse.narrationText)
              
              // Set voice properties based on role
              const voices = window.speechSynthesis.getVoices()
              const roleVoices: { [key: string]: string[] } = {
                CEO: ["Alex", "Daniel", "Tom"], // Authoritative male voices
                CFO: ["Samantha", "Victoria", "Karen"], // Serious female voices
                CTO: ["Alex", "Fred", "Tom"], // Technical male voices
                HR: ["Samantha", "Victoria", "Karen"], // Warm female voices
              }
              
              const preferredVoices = roleVoices[slideRole] || ["Alex"]
              const selectedVoice = voices.find((v) => 
                preferredVoices.some((name) => v.name.includes(name))
              ) || voices.find((v) => v.lang.startsWith("en")) || voices[0]
              
              if (selectedVoice) {
                utterance.voice = selectedVoice
                setDebugInfo((prev) => prev + `\nUsing voice: ${selectedVoice.name}`)
              }

              utterance.rate = 1.0
              utterance.pitch = 1.0
              utterance.volume = 1.0

              // Handle speech end
              utterance.onend = () => {
                setDebugInfo((prev) => prev + "\nSpeech ended")
                setIsNarrating(false)
                handleAudioEnded()
              }

              // Handle speech error gracefully
              utterance.onerror = (event) => {
                console.error("Speech synthesis error:", event)
                setDebugInfo((prev) => prev + `\nSpeech error: ${event.error || "unknown"}`)
                setIsNarrating(false)
                window.speechSynthesis.cancel()
                startTimerBasedAutoAdvance()
              }

              // Start speaking
              try {
                window.speechSynthesis.speak(utterance)
                setDebugInfo((prev) => prev + "\nStarted browser speech synthesis")
              } catch (speakError) {
                console.error("Failed to start speech synthesis:", speakError)
                setDebugInfo((prev) => prev + `\nFailed to start speech synthesis: ${String(speakError)}`)
                setIsNarrating(false)
                window.speechSynthesis.cancel()
                startTimerBasedAutoAdvance()
              }
              
              return // Success, exit function
            } else {
              throw new Error("Browser does not support Speech Synthesis API")
            }
          }
          
          // If JSON but not browser TTS response, throw error
          throw new Error("Unexpected JSON response format")
        }

        // If not JSON, try to get audio blob (legacy support)
        if (!contentType.includes("application/json")) {
          try {
        const audioBlob = await response.blob()
        setDebugInfo((prev) => prev + "\nReceived audio blob: " + audioBlob.size + " bytes")

        // Play audio if still on the same slide
        if (audioRef.current) {
          const audioUrl = URL.createObjectURL(audioBlob)
          audioRef.current.src = audioUrl
          setDebugInfo((prev) => prev + "\nSet audio source to blob URL")

          setIsGeneratingNarration(false)
          setIsNarrating(true)

          try {
            await audioRef.current.play()
            setDebugInfo((prev) => prev + "\nAudio.play() called successfully")
          } catch (playError) {
            console.error("Error playing audio:", playError)
            setDebugInfo((prev) => prev + "\nError playing audio: " + JSON.stringify(playError))
            throw new Error("Error playing audio")
          }
            }
          } catch (blobError) {
            // If blob parsing fails, it's probably not audio
            throw new Error("Unexpected response format")
          }
        } else {
          throw new Error("Unexpected JSON response format")
        }
      } catch (mainApiError) {
        // Main API failed, try the fallback API
        setDebugInfo((prev) => prev + "\nMain API failed, trying fallback...")
        console.log("Main API failed, trying fallback:", mainApiError)

        // Use the mock-narration fallback API
        const fallbackResponse = await fetch("/api/mock-narration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: narrationText.substring(0, 200),
            role: slideRole,
          }),
        })

        if (!fallbackResponse.ok) {
          throw new Error(`Fallback API failed with status ${fallbackResponse.status}`)
        }

        // Start timer-based auto-advance as fallback
        setDebugInfo((prev) => prev + "\nUsing timer-based auto-advance as fallback")
        startTimerBasedAutoAdvance()
      }
    } catch (error) {
      console.error("Error in narration process:", error)
      setDebugInfo(
        (prev) => prev + "\nError in narration process: " + (error instanceof Error ? error.message : String(error)),
      )
      setIsGeneratingNarration(false)
      setNarrationFailed(true)

      // Always fall back to timer-based auto-advance
      startTimerBasedAutoAdvance()

      // Show specific error message based on error type
      let errorTitle = "Using auto-advance mode"
      let errorDescription = "Narration is unavailable. Slides will advance automatically."
      
      // Check for quota errors
      const errorAny = error as any
      if (
        (error instanceof Error && error.message.includes("quota")) ||
        errorAny?.errorType === "insufficient_quota" ||
        errorAny?.errorCode === "insufficient_quota" ||
        errorAny?.errorStatus === 429
      ) {
        errorTitle = "API Quota Exceeded"
        errorDescription = "Your Gemini/Google Cloud API quota has been exceeded. Please check your usage at console.cloud.google.com"
      } else if (
        errorAny?.errorStatus === 401 ||
        (error instanceof Error && error.message.includes("401")) ||
        (error instanceof Error && error.message.includes("API key"))
      ) {
        errorTitle = "Invalid API Key"
        errorDescription = "Your Gemini API key is invalid or missing. Please check your .env.local file and add GEMINI_API_KEY"
      } else if (error instanceof Error && error.message.includes("TTS")) {
        errorTitle = "Text-to-Speech Error"
        errorDescription = "Text-to-Speech API error. Make sure Text-to-Speech API is enabled in Google Cloud Console."
      } else if (error instanceof Error && error.message) {
        // Show the actual error message if available
        errorDescription = error.message.substring(0, 150)
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      })
    } finally {
      setIsGeneratingNarration(false)
    }
  }

  // Explicitly start narration (new function)
  const startNarration = () => {
    // Stop any existing narration
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Clear any existing timers
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }

    setAutoAdvanceProgress(0)
    setNarrationFailed(false)
    setIsNarrating(false)

    // Start new narration
    generateNarration()

    toast({
      title: "Starting narration",
      description: `${currentSlide.role} is now presenting this slide.`,
    })
  }

  // Toggle audio enabled/disabled
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)

    if (audioRef.current) {
      if (audioEnabled) {
        // Turning audio off
        audioRef.current.pause()
        setIsNarrating(false)
        startTimerBasedAutoAdvance()

        toast({
          title: "Audio disabled",
          description: "Using automatic timing instead.",
        })
      } else {
        // Turning audio on
        if (autoAdvanceTimerRef.current) {
          clearTimeout(autoAdvanceTimerRef.current)
          autoAdvanceTimerRef.current = null
        }

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }

        setAutoAdvanceProgress(0)

        toast({
          title: "Audio enabled",
          description: "Use the narrate button to start voice narration.",
        })
      }
    }
  }

  // Handle slide changes
  useEffect(() => {
    // Clear any existing timers
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }

    // Reset progress
    setAutoAdvanceProgress(0)

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      setIsNarrating(false)
    }

    // Stop any speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsNarrating(false)
    }

    // Reset states for the new slide
    setNarrationFailed(false)
    setIsGeneratingNarration(false)
    setDebugInfo("")

    // Cleanup function
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [currentIndex])

  if (!mounted) return null

  // Update the render function to show fallback mode indicator
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {/* Control buttons - fixed position with higher z-index to ensure visibility */}
      <div className="fixed top-4 right-4 flex space-x-2 z-[100]">
        {/* New Narrate Button */}
        <Button
          variant="default"
          onClick={startNarration}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          disabled={isGeneratingNarration || !audioEnabled}
          title="Start narration for this slide"
        >
          <Mic className="h-4 w-4" />
          <span>Narrate</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleAudio}
          className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          title={audioEnabled ? "Disable audio" : "Enable audio"}
        >
          {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onTogglePlay}
          className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          disabled={isGeneratingNarration}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onExit}
          className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Fallback mode indicator */}
      {usingFallbackMode && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm flex items-center z-[100]">
          <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse mr-2"></div>
          Auto-advance mode (no audio)
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
        {slides.map((_, index) => (
          <div key={index} className={`w-2 h-2 rounded-full ${currentIndex === index ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onPrev}
        disabled={currentIndex === 0 || isGeneratingNarration}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-0"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={currentIndex === slides.length - 1 || isGeneratingNarration}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-0"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl px-8"
        >
          <div className="bg-gradient-to-br from-gray-900 to-black p-12 rounded-xl border border-white/10 shadow-2xl">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: roleColor }}></div>
              <span className="text-white/60 text-sm">{currentSlide.role} Perspective</span>

              {/* Narration status indicators */}
              {isGeneratingNarration && (
                <div className="flex items-center ml-4">
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin mr-2" />
                  <span className="text-white/60 text-xs">Generating narration...</span>
                </div>
              )}

              {isNarrating && !isGeneratingNarration && (
                <div className="flex items-center ml-4">
                  <div className="flex space-x-1 ml-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse delay-150"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse delay-300"></div>
                  </div>
                  <span className="text-white/60 text-xs ml-2">Narrating...</span>
                </div>
              )}

              {/* Auto-advance indicator */}
              {autoAdvanceProgress > 0 && (
                <div className="flex items-center ml-4">
                  <div className="flex space-x-1 ml-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-150"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-300"></div>
                  </div>
                  <span className="text-white/60 text-xs ml-2">Auto-advancing...</span>
                </div>
              )}
            </div>

            {/* Progress bar for auto-advance */}
            {autoAdvanceProgress > 0 && (
              <div className="w-full h-1 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-100"
                  style={{ width: `${autoAdvanceProgress}%` }}
                />
              </div>
            )}

            <h2 className="text-4xl font-bold text-white mb-8" style={{ color: roleColor }}>
              {currentSlide.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <motion.p
                  className="text-white/90 text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {currentSlide.content}
                </motion.p>

                {currentSlide.bullets.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h4 className="text-white/80 font-medium mb-3">Key Points:</h4>
                    <ul className="space-y-3 text-white/80">
                      {currentSlide.bullets.map((bullet, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                          className="flex items-start"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-2 mr-2"
                            style={{ backgroundColor: roleColor }}
                          ></div>
                          <span>{bullet}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              <motion.div
                className="h-[300px]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <ChartComponent type={currentSlide.chartType} data={currentSlide.chartData} color={roleColor} />
              </motion.div>
            </div>

            {currentSlide.notes && (
              <motion.div
                className="mt-8 pt-4 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <p className="text-white/60 text-sm">Speaker Notes:</p>
                <p className="text-white/80 text-sm mt-1">{currentSlide.notes}</p>
              </motion.div>
            )}

            {/* Debug info (hidden in production) */}
            {process.env.NODE_ENV === "development" && debugInfo && (
              <div className="mt-4 p-2 bg-black/50 rounded text-xs text-white/60 font-mono max-h-32 overflow-y-auto">
                <pre>{debugInfo}</pre>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
