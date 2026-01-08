"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  Play,
  Loader2,
  Users,
  Mic,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Brain,
  Presentation,
  RefreshCw,
  Layers,
  Home,
  FileSliders,
  Eye,
  Volume2,
  Square,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/assistant-config"
import { AnimatedBackground } from "@/components/animated-background"

type Slide = {
  id: string
  title: string
  content: string
  bullets: string[]
  notes?: string
  chartType?: "bar" | "line" | "pie" | "area"
  chartData?: { name: string; value: number }[]
}

type TranscriptEntry = { role: Role; message: string }

const roleList: Role[] = ["CEO", "CFO", "CTO", "HR"]
const roleColors: Record<Role, string> = {
  CEO: "#4f46e5",
  CFO: "#0ea5e9",
  CTO: "#8b5cf6",
  HR: "#ec4899",
}

export default function SummitWorkflowPage() {
  const [topic, setTopic] = useState("")
  const [roles, setRoles] = useState<Role[]>(roleList)
  const [isMeetingLoading, setIsMeetingLoading] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [perRoleTopics, setPerRoleTopics] = useState<Record<Role, string>>({})
  const [meetingSummary, setMeetingSummary] = useState("")
  const [keyPoints, setKeyPoints] = useState<string[]>([])
  const [meetingModel, setMeetingModel] = useState<string | null>(null)

  const [isSlidesLoading, setIsSlidesLoading] = useState(false)
  const [slidesByRole, setSlidesByRole] = useState<Record<Role, Slide[]>>({})

  const [isBoardroomLoading, setIsBoardroomLoading] = useState(false)
  const [boardroomDiscussion, setBoardroomDiscussion] = useState<{ role: Role; message: string }[]>([])
  const [meetingHighlights, setMeetingHighlights] = useState<string[]>([])
  const [actionItems, setActionItems] = useState<string[]>([])

  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [finalSummary, setFinalSummary] = useState<{
    executiveSummary: string
    keyDecisions: string[]
    risks: string[]
    nextSteps: string[]
    ownerUpdates: string[]
  } | null>(null)

  const selectedRolesSet = useMemo(() => new Set(roles), [roles])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState<number | null>(null)
  const [voiceEngine, setVoiceEngine] = useState<"elevenlabs" | "browser" | null>(null)
  const audioRef = useState<HTMLAudioElement | null>(null)

  // Browser TTS fallback
  const speakWithBrowser = (text: string, role: Role) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    setVoiceEngine("browser")
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const roleVoices: Record<Role, string[]> = {
      CEO: ["Alex", "Daniel", "Tom"],
      CFO: ["Samantha", "Victoria", "Karen"],
      CTO: ["Alex", "Fred", "Tom"],
      HR: ["Samantha", "Victoria", "Karen"],
    }
    const preferred = roleVoices[role] || []
    const selected =
      voices.find((v) => preferred.some((p) => v.name.includes(p))) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
    if (selected) utterance.voice = selected
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
    utterance.onend = () => {
      setIsSpeaking(false)
      setCurrentSpeakingIndex(null)
    }
    window.speechSynthesis.speak(utterance)
  }

  // ElevenLabs TTS with fallback to browser TTS
  const speak = async (text: string, role: Role, index?: number) => {
    // Stop any current audio
    if (audioRef[0]) {
      audioRef[0].pause()
      audioRef[0] = null
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }

    setIsSpeaking(true)
    if (index !== undefined) setCurrentSpeakingIndex(index)

    try {
      const response = await fetch("/api/elevenlabs-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, role }),
      })

      // Check if we got JSON (fallback) or audio
      const contentType = response.headers.get("content-type")
      
      if (contentType?.includes("application/json")) {
        // Fallback to browser TTS
        const data = await response.json()
        if (data.useBrowserTTS) {
          console.log("Using browser TTS fallback:", data.message)
          speakWithBrowser(text, role)
          return
        }
      }

      if (contentType?.includes("audio/mpeg")) {
        // Play ElevenLabs audio
        setVoiceEngine("elevenlabs")
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audioRef[0] = audio
        
        audio.onended = () => {
          setIsSpeaking(false)
          setCurrentSpeakingIndex(null)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.onerror = () => {
          console.log("Audio playback error, falling back to browser TTS")
          setIsSpeaking(false)
          setCurrentSpeakingIndex(null)
          speakWithBrowser(text, role)
        }

        await audio.play()
        return
      }

      // Default fallback
      speakWithBrowser(text, role)
    } catch (error) {
      console.error("ElevenLabs TTS error:", error)
      speakWithBrowser(text, role)
    }
  }

  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef[0]) {
      audioRef[0].pause()
      audioRef[0] = null
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setCurrentSpeakingIndex(null)
  }

  useEffect(() => {
    // Warm-up voices for fallback
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices()
    }
    // Cleanup on unmount
    return () => {
      stopSpeaking()
    }
  }, [])

  const toggleRole = (role: Role) => {
    if (selectedRolesSet.has(role)) {
      setRoles(roles.filter((r) => r !== role))
    } else {
      setRoles([...roles, role])
    }
  }

  const startMeeting = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic")
      return
    }
    if (roles.length === 0) {
      alert("Select at least one role")
      return
    }
    setIsMeetingLoading(true)
    setTranscript([])
    setPerRoleTopics({})
    setMeetingSummary("")
    setKeyPoints([])
    setMeetingModel(null)
    try {
      const res = await fetch("/api/agent-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, roles }),
      })
      if (!res.ok) throw new Error("Failed to start meeting")
      const data = await res.json()
      setTranscript(data.transcript || [])
      setPerRoleTopics(data.perRoleTopics || {})
      setMeetingSummary(data.meetingSummary || "")
      setKeyPoints(data.keyPoints || [])
      setMeetingModel(data.modelUsed || null)
    } catch (err) {
      console.error(err)
      alert("Meeting simulation failed. Check console for details.")
    } finally {
      setIsMeetingLoading(false)
    }
  }

  const generateSlides = async () => {
    setIsSlidesLoading(true)
    const slidesMap: Record<Role, Slide[]> = {}
    try {
      await Promise.all(
        roles.map(async (role) => {
          const subtopic = perRoleTopics[role] || `${role} perspective on ${topic}`
          const res = await fetch("/api/generate-presentation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic: subtopic, role }),
          })
          if (!res.ok) throw new Error(`Failed to generate slides for ${role}`)
          const data = await res.json()
          slidesMap[role] = data.slides || []
        }),
      )
      setSlidesByRole(slidesMap)
    } catch (err) {
      console.error(err)
      alert("Slide generation failed. Check console for details.")
    } finally {
      setIsSlidesLoading(false)
    }
  }

  const simulateBoardroom = async () => {
    if (!meetingSummary || Object.keys(slidesByRole).length === 0) {
      alert("Generate meeting and slides first.")
      return
    }
    setIsBoardroomLoading(true)
    try {
      const slidesMeta = roles.map((role) => ({
        role,
        titles: (slidesByRole[role] || []).map((s) => s.title).slice(0, 6),
      }))
      const res = await fetch("/api/boardroom-post-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingSummary,
          slidesMeta,
          roles,
        }),
      })
      if (!res.ok) throw new Error("Boardroom simulation failed")
      const data = await res.json()
      setBoardroomDiscussion(data.discussion || [])
      setMeetingHighlights(data.meetingHighlights || [])
      setActionItems(data.actionItems || [])
    } catch (err) {
      console.error(err)
      alert("Boardroom simulation failed.")
    } finally {
      setIsBoardroomLoading(false)
    }
  }

  const generateFinalSummary = async () => {
    if (!meetingSummary || boardroomDiscussion.length === 0) {
      alert("Run meeting and boardroom first.")
      return
    }
    setIsSummaryLoading(true)
    try {
      const res = await fetch("/api/collaborative-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingSummary,
          boardroomDiscussion,
          actionItems,
        }),
      })
      if (!res.ok) throw new Error("Failed to generate summary")
      const data = await res.json()
      setFinalSummary({
        executiveSummary: data.executiveSummary || "",
        keyDecisions: data.keyDecisions || [],
        risks: data.risks || [],
        nextSteps: data.nextSteps || [],
        ownerUpdates: data.ownerUpdates || [],
      })
    } catch (err) {
      console.error(err)
      alert("Summary generation failed.")
    } finally {
      setIsSummaryLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gray-950">
      {/* Dark gradient overlay for consistent visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 z-0" />
      <AnimatedBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen text-white">
        {/* Header - dark theme for summit */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-950/90 backdrop-blur-md transition-all duration-300">
          <div className="container flex h-16 items-center">
            <div className="mr-4 flex">
              <Link href="/" className="flex items-center space-x-2 group">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  <Presentation className="h-6 w-6 text-white" />
                </motion.div>
                <span className="font-bold text-white group-hover:text-primary transition-colors">PresentAI</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Executive AI Summit
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <nav className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="text-gray-300 hover:text-white hover:bg-white/10">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-1" />
                    Home
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-gray-300 hover:text-white hover:bg-white/10">
                  <Link href="/slide-builder">
                    <FileSliders className="h-4 w-4 mr-1" />
                    Slide Builder
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-gray-300 hover:text-white hover:bg-white/10">
                  <Link href="/preview">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-purple-600 text-white" size="sm">
                  <Link href="/slide-builder">Get Started</Link>
                </Button>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-10 space-y-8">
        {/* Hero / Intro */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr] items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              New • Multi-agent workflow
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">
              Agents meet, align, and generate executive-ready presentations—automatically.
            </h1>
            <p className="text-gray-300">
              Simulated "Google Meet" for your C-suite agents → auto-generated slide decks → boardroom Q&A →
              collaborative summary. Fully automated, role-aware, and narrated.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={startMeeting} disabled={isMeetingLoading} className="bg-primary">
                {isMeetingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                Start AI Meeting
              </Button>
              <Button variant="outline" asChild className="border-gray-500 text-white bg-gray-800 hover:bg-gray-700 hover:border-gray-400">
                <Link href="/preview">Go to Preview</Link>
              </Button>
            </div>
            <div className="flex gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-400" /> Gemini for narration text
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-400" /> ElevenLabs humanized voices
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-400" /> OpenAI GPT-4o for slide content
              </div>
            </div>
          </div>
          <Card className="bg-gray-900/80 border-gray-700 backdrop-blur shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-primary" />
                Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Main Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Global Market Expansion 2026"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Roles in the meeting</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {roleList.map((role) => {
                    const active = selectedRolesSet.has(role)
                    return (
                      <Button
                        key={role}
                        variant={active ? "default" : "outline"}
                        size="sm"
                        className={cn("border-gray-600 text-gray-300", active && "bg-primary text-white border-primary")}
                        onClick={() => toggleRole(role)}
                      >
                        <Users className="h-4 w-4 mr-1" /> {role}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick nav */}
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "1) Meeting", anchor: "#meeting" },
            { label: "2) Slides", anchor: "#slides" },
            { label: "3) Boardroom", anchor: "#boardroom" },
            { label: "4) Summary", anchor: "#summary" },
          ].map((item) => (
            <Button
              key={item.anchor}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800"
              asChild
            >
              <a href={item.anchor}>{item.label}</a>
            </Button>
          ))}
        </div>

        {/* Step 1: Meeting */}
        <SectionShell
          anchorId="meeting"
          title="Step 1 — Agent meeting (Google Meet style)"
          description="Simulated live discussion; each role speaks with its own voice. Outputs per-role topics and a meeting summary."
          actionLabel="Run meeting"
          onAction={startMeeting}
          loading={isMeetingLoading}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mic className="h-4 w-4 text-primary" />
                Live Transcript
                <div className="ml-auto flex items-center gap-2">
                  {meetingModel && <Badge className="text-xs bg-blue-600/20 text-blue-400 border-blue-600/30">Text: {meetingModel}</Badge>}
                  {voiceEngine && (
                    <Badge className={cn(
                      "text-xs",
                      voiceEngine === "elevenlabs" 
                        ? "bg-green-600/20 text-green-400 border-green-600/30" 
                        : "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                    )}>
                      Voice: {voiceEngine === "elevenlabs" ? "ElevenLabs" : "Browser TTS"}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="h-72 overflow-auto space-y-3 pr-2">
                {transcript.length === 0 && (
                  <div className="text-gray-500 text-sm">Run the meeting to see the conversation.</div>
                )}
                {transcript.map((t, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg bg-gray-800 border border-gray-700 flex items-start gap-2 transition-all",
                      currentSpeakingIndex === idx && "ring-2 ring-primary bg-gray-700"
                    )}
                    style={{ borderLeft: `3px solid ${roleColors[t.role]}` }}
                  >
                    <div className="mt-0.5 h-2 w-2 rounded-full" style={{ backgroundColor: roleColors[t.role] }} />
                    <div className="flex-1">
                      <div className="text-xs font-semibold" style={{ color: roleColors[t.role] }}>
                        {t.role}
                      </div>
                      <div className="text-sm text-gray-300">{t.message}</div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 text-gray-400 hover:text-white",
                        currentSpeakingIndex === idx && "text-primary animate-pulse"
                      )}
                      onClick={() => currentSpeakingIndex === idx ? stopSpeaking() : speak(t.message, t.role, idx)}
                      title={currentSpeakingIndex === idx ? "Stop" : "Play voice (ElevenLabs)"}
                    >
                      {currentSpeakingIndex === idx ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Per-role subtopics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role}
                      className="p-3 rounded-lg bg-gray-800/80 border border-gray-700 flex items-start gap-2"
                      style={{ borderLeft: `3px solid ${roleColors[role]}` }}
                    >
                      <div className="text-xs font-semibold" style={{ color: roleColors[role] }}>
                        {role}
                      </div>
                      <div className="text-sm text-gray-300">
                        {perRoleTopics[role] || "Will be determined after meeting."}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Meeting summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-300">
                    {meetingSummary || "Run the meeting to get a summary."}
                  </p>
                  {keyPoints.length > 0 && (
                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="font-semibold text-white">Key points:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        {keyPoints.map((k, i) => (
                          <li key={i}>{k}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionShell>

        {/* Step 2: Slide generation */}
        <SectionShell
          anchorId="slides"
          title="Step 2 — Generate domain-specific slides per role"
          description="Each role gets a subtopic from the meeting. We generate full slide decks per role."
          actionLabel="Generate slides"
          onAction={generateSlides}
          loading={isSlidesLoading}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => {
              const slides = slidesByRole[role] || []
              return (
                <Card key={role} className="bg-gray-900/80 border-gray-700 h-full flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: roleColors[role] }} />
                      <CardTitle className="text-sm text-white">{role} deck</CardTitle>
                    </div>
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      {slides.length} slides
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-300 flex-1">
                    <div className="text-xs uppercase text-gray-500">Subtopic</div>
                    <div>{perRoleTopics[role] || "Awaiting meeting output"}</div>
                    <div className="text-xs uppercase text-gray-500 mt-2">Slide titles</div>
                    {slides.length === 0 && <div className="text-gray-500">Not generated yet.</div>}
                    <ul className="list-disc pl-4 space-y-1">
                      {slides.slice(0, 5).map((s) => (
                        <li key={s.id}>{s.title}</li>
                      ))}
                    </ul>
                    {slides.length > 5 && (
                      <div className="text-gray-500 text-xs">+ {slides.length - 5} more</div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </SectionShell>

        {/* Step 3: Boardroom presentation & Q&A */}
        <SectionShell
          anchorId="boardroom"
          title="Step 3 — Boardroom presentation & cross-Q&A"
          description="Agents present their decks and ask each other questions based on their slides."
          actionLabel="Simulate boardroom"
          onAction={simulateBoardroom}
          loading={isBoardroomLoading}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gray-900/80 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm text-white">Discussion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-auto pr-2">
                {boardroomDiscussion.length === 0 && (
                  <div className="text-gray-500 text-sm">Run the simulation to see boardroom dialogue.</div>
                )}
                {boardroomDiscussion.map((d, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-gray-800/80 border border-gray-700"
                    style={{ borderLeft: `3px solid ${roleColors[d.role]}` }}
                  >
                    <div className="text-xs font-semibold" style={{ color: roleColors[d.role] }}>
                      {d.role}
                    </div>
                    <div className="text-sm text-gray-300">{d.message}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="space-y-3">
              <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm text-white">Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {meetingHighlights.length === 0 && <div className="text-gray-500 text-sm">None yet.</div>}
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                    {meetingHighlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm text-white">Action items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {actionItems.length === 0 && <div className="text-gray-500 text-sm">None yet.</div>}
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                    {actionItems.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionShell>

        {/* Step 4: Collaborative summary */}
        <SectionShell
          anchorId="summary"
          title="Step 4 — Collaborative owner summary"
          description="A single executive summary combining all perspectives, decisions, risks, and next steps."
          actionLabel="Generate summary"
          onAction={generateFinalSummary}
          loading={isSummaryLoading}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-gray-900/80 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm text-white">Executive summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                {finalSummary?.executiveSummary || "Generate to see summary."}
              </CardContent>
            </Card>
            <div className="space-y-3">
              <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm text-white">Key decisions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-gray-300">
                  <ListOrEmpty items={finalSummary?.keyDecisions} />
                </CardContent>
              </Card>
              <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm text-white">Risks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-gray-300">
                  <ListOrEmpty items={finalSummary?.risks} />
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-gray-900/80 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm text-white">Next steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-gray-300">
                <ListOrEmpty items={finalSummary?.nextSteps} />
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm text-white">Owner updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-gray-300">
                <ListOrEmpty items={finalSummary?.ownerUpdates} />
              </CardContent>
            </Card>
          </div>
        </SectionShell>
        </main>

        {/* Footer - dark theme for summit */}
        <footer className="w-full border-t border-white/10 bg-gray-950/80 backdrop-blur mt-auto">
          <div className="container py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <Link href="/" className="flex items-center space-x-2 text-white">
                  <Presentation className="h-6 w-6" />
                  <span className="font-bold">PresentAI</span>
                </Link>
                <p className="text-sm text-gray-400">
                  Create executive-level presentations with AI-powered intelligence.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-white">Product</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link href="/slide-builder" className="hover:text-primary transition-colors">
                      Slide Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/summit" className="hover:text-primary transition-colors flex items-center gap-1">
                      <Users className="h-3 w-3" /> AI Summit
                    </Link>
                  </li>
                  <li>
                    <Link href="/boardroom" className="hover:text-primary transition-colors">
                      Boardroom
                    </Link>
                  </li>
                  <li>
                    <Link href="/preview" className="hover:text-primary transition-colors">
                      Preview
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-white">Resources</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      API
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Support
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-white">Company</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-primary transition-colors">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-primary transition-colors">
                      Privacy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
              <p>© 2025 PresentAI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function SectionShell({
  title,
  description,
  children,
  actionLabel,
  onAction,
  loading,
  anchorId,
}: {
  title: string
  description: string
  children: React.ReactNode
  actionLabel: string
  onAction: () => void
  loading?: boolean
  anchorId?: string
}) {
  return (
    <motion.section
      id={anchorId}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 scroll-mt-24"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <Button onClick={onAction} disabled={loading} className="bg-primary whitespace-nowrap">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {actionLabel}
        </Button>
      </div>
      {children}
    </motion.section>
  )
}

function ListOrEmpty({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <div className="text-gray-500">None yet.</div>
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  )
}

