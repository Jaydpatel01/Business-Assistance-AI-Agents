"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Download, List, ArrowLeft, FileText, Play, Home, Users, Presentation } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartComponent } from "@/components/chart-component"
import { useToast } from "@/hooks/use-toast"
import { PresentationMode } from "@/components/presentation-mode"
import { SlideGenerator } from "@/components/slide-generator"
import type { Role } from "@/lib/assistant-config"

// Define slide type
interface SlideType {
  id: string
  title: string
  content: string
  bullets: string[]
  notes?: string
  role: Role
  slideType: string
  chartType: "bar" | "line" | "pie" | "area"
  chartData: { name: string; value: number }[]
  createdAt: Date | string
}

// Mock data for the presentation
const initialMockSlides = [
  {
    id: "1",
    title: "Market Expansion Strategy",
    content: "Our market expansion strategy focuses on three key regions with high growth potential.",
    bullets: [
      "North American market shows 23% YoY growth potential",
      "European expansion targeted for Q3 with projected 15% market share",
      "APAC region represents our biggest opportunity with 30% growth forecast",
    ],
    notes: "Emphasize the APAC opportunity during the presentation as it's our highest priority.",
    role: "CEO" as Role,
    slideType: "intro",
    chartType: "bar" as "bar" | "line" | "pie" | "area",
    chartData: [
      { name: "North America", value: 65 },
      { name: "Europe", value: 45 },
      { name: "APAC", value: 85 },
      { name: "LATAM", value: 30 },
    ],
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Financial Projections",
    content: "Based on our market analysis, we project significant revenue growth over the next 3 years.",
    bullets: [
      "Year 1: $2.4M revenue with 15% profit margin",
      "Year 2: $5.8M revenue with 22% profit margin",
      "Year 3: $12.3M revenue with 28% profit margin",
    ],
    notes: "Highlight the increasing profit margins as we scale operations.",
    role: "CFO" as Role,
    slideType: "chart",
    chartType: "line" as "bar" | "line" | "pie" | "area",
    chartData: [
      { name: "Year 1", value: 2.4 },
      { name: "Year 2", value: 5.8 },
      { name: "Year 3", value: 12.3 },
    ],
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Technology Implementation Roadmap",
    content: "Our technology roadmap focuses on scalable infrastructure and innovative features.",
    bullets: [
      "Phase 1: Core platform development and cloud infrastructure setup",
      "Phase 2: API integrations and third-party service connections",
      "Phase 3: Advanced analytics and machine learning capabilities",
    ],
    notes: "Emphasize our proprietary ML algorithms as a key differentiator.",
    role: "CTO" as Role,
    slideType: "timeline",
    chartType: "area" as "bar" | "line" | "pie" | "area",
    chartData: [
      { name: "Q1", value: 20 },
      { name: "Q2", value: 45 },
      { name: "Q3", value: 70 },
      { name: "Q4", value: 90 },
    ],
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "Talent Acquisition Strategy",
    content: "Our hiring plan focuses on building diverse teams with specialized expertise.",
    bullets: [
      "Engineering: 12 new hires across frontend, backend, and DevOps",
      "Product: 5 new hires including designers and product managers",
      "Sales & Marketing: 8 new hires to drive growth initiatives",
    ],
    notes: "Highlight our commitment to diversity and inclusion in hiring practices.",
    role: "HR" as Role,
    slideType: "chart",
    chartType: "pie" as "bar" | "line" | "pie" | "area",
    chartData: [
      { name: "Engineering", value: 12 },
      { name: "Product", value: 5 },
      { name: "Sales", value: 8 },
      { name: "Operations", value: 3 },
    ],
    createdAt: new Date(),
  },
  {
    id: "5",
    title: "Market Opportunity Summary",
    content: "The total addressable market represents a significant opportunity for our business.",
    bullets: [
      "TAM: $8.5 billion with 12% CAGR",
      "SAM: $3.2 billion in our target segments",
      "SOM: $450 million achievable within 5 years",
    ],
    notes: "Use this slide to emphasize the scale of the opportunity to investors.",
    role: "CEO" as Role,
    slideType: "summary",
    chartType: "bar" as "bar" | "line" | "pie" | "area",
    chartData: [
      { name: "TAM", value: 8.5 },
      { name: "SAM", value: 3.2 },
      { name: "SOM", value: 0.45 },
    ],
    createdAt: new Date(),
  },
]

// Agent data
const agentData = {
  CEO: {
    color: "#4f46e5", // indigo
  },
  CFO: {
    color: "#0ea5e9", // sky blue
  },
  CTO: {
    color: "#8b5cf6", // purple
  },
  HR: {
    color: "#ec4899", // pink
  },
}

export default function PreviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all")
  const [mockSlides, setMockSlides] = useState<SlideType[]>(initialMockSlides)
  const [filteredSlides, setFilteredSlides] = useState<SlideType[]>(initialMockSlides)
  const [presentationMode, setPresentationMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (roleFilter === "all") {
      setFilteredSlides(mockSlides)
    } else {
      setFilteredSlides(mockSlides.filter((slide) => slide.role === roleFilter))
    }
    setCurrentSlideIndex(0)
  }, [roleFilter, mockSlides])

  const handleNextSlide = () => {
    if (currentSlideIndex < filteredSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const handleBackToBuilder = () => {
    router.push("/") // Navigate to the home page instead of /slide-builder
  }

  const handleDownload = () => {
    toast({
      title: "Download initiated",
      description: "Your presentation is being prepared for download.",
    })
    // Download logic would go here
  }

  const handleStartNarration = () => {
    setIsPlaying(!isPlaying)

    if (!isPlaying) {
      toast({
        title: "Narration started",
        description: "The presentation will automatically advance slides after narration.",
      })
    } else {
      toast({
        title: "Narration paused",
        description: "You can manually navigate between slides.",
      })
    }
  }

  const handleJumpToSlide = (index: number) => {
    setCurrentSlideIndex(index)
    setSidebarOpen(false)
  }

  const handleExitPresentationMode = () => {
    setPresentationMode(false)
    setIsPlaying(false) // Stop auto-play when exiting presentation mode
  }

  const handleEnterPresentationMode = () => {
    setPresentationMode(true)
  }

  const handleSlidesGenerated = (newSlides: SlideType[]) => {
    // Add the new slides to the existing slides
    setMockSlides([...mockSlides, ...newSlides])

    // Show a success message
    toast({
      title: "Slides added",
      description: `${newSlides.length} new slides have been added to your presentation.`,
    })
  }

  if (!mounted) return null

  // Get the current slide's role for presentation mode
  const currentSlideRole = filteredSlides[currentSlideIndex]?.role || "CEO"

  if (presentationMode) {
    return (
      <PresentationMode
        slides={filteredSlides}
        currentIndex={currentSlideIndex}
        onNext={handleNextSlide}
        onPrev={handlePrevSlide}
        onExit={handleExitPresentationMode}
        isPlaying={isPlaying}
        onTogglePlay={handleStartNarration}
        role={currentSlideRole}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 text-white hover:text-primary transition-colors">
            <Presentation className="h-5 w-5" />
            <span className="font-bold">PresentAI</span>
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <h1 className="text-white font-medium">Presentation Preview</h1>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-1" /> Home
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Link href="/slide-builder">
              <FileText className="h-4 w-4 mr-1" /> Slide Builder
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Link href="/summit">
              <Users className="h-4 w-4 mr-1" /> AI Summit
            </Link>
          </Button>
        </nav>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnterPresentationMode}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Play className="h-4 w-4 mr-2" /> Enter Presentation Mode
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>

          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <List className="h-4 w-4 mr-2" /> Slides
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gray-900 border-gray-800">
              <SheetHeader>
                <SheetTitle className="text-white">Presentation Slides</SheetTitle>
              </SheetHeader>

              <div className="py-4">
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-2">Filter by Role</label>
                  <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as Role | "all")}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="CEO">CEO</SelectItem>
                      <SelectItem value="CFO">CFO</SelectItem>
                      <SelectItem value="CTO">CTO</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mt-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {filteredSlides.map((slide, index) => (
                    <Card
                      key={slide.id}
                      className={`p-3 cursor-pointer transition-all duration-200 bg-gray-800 border-gray-700 hover:bg-gray-700 ${
                        currentSlideIndex === index ? "ring-2" : ""
                      }`}
                      style={{
                        ringColor: agentData[slide.role].color,
                        borderLeft: currentSlideIndex === index ? `4px solid ${agentData[slide.role].color}` : "",
                      }}
                      onClick={() => handleJumpToSlide(index)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: `${agentData[slide.role].color}20`,
                            color: agentData[slide.role].color,
                          }}
                        >
                          {slide.role}
                        </Badge>
                        <span className="text-xs text-gray-400">#{index + 1}</span>
                      </div>
                      <h3 className="text-sm text-white font-medium line-clamp-2">{slide.title}</h3>
                    </Card>
                  ))}

                  {/* Slide Generator */}
                  <div className="mt-6">
                    <SlideGenerator onSlidesGenerated={handleSlidesGenerated} />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Presentation Viewer */}
      <div className="flex-1 flex items-center justify-center relative">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevSlide}
          disabled={currentSlideIndex === 0}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-0"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextSlide}
          disabled={currentSlideIndex === filteredSlides.length - 1}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-0"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl px-8"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black p-12 rounded-xl border border-white/10 shadow-2xl">
              <div className="flex items-center mb-2">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: agentData[filteredSlides[currentSlideIndex].role].color }}
                ></div>
                <span className="text-white/60 text-sm">{filteredSlides[currentSlideIndex].role} Perspective</span>
              </div>

              <h2
                className="text-4xl font-bold text-white mb-8"
                style={{ color: agentData[filteredSlides[currentSlideIndex].role].color }}
              >
                {filteredSlides[currentSlideIndex].title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <motion.p
                    className="text-white/90 text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {filteredSlides[currentSlideIndex].content}
                  </motion.p>

                  {filteredSlides[currentSlideIndex].bullets.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <h4 className="text-white/80 font-medium mb-3">Key Points:</h4>
                      <ul className="space-y-3 text-white/80">
                        {filteredSlides[currentSlideIndex].bullets.map((bullet, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                            className="flex items-start"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-2 mr-2"
                              style={{ backgroundColor: agentData[filteredSlides[currentSlideIndex].role].color }}
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
                  <ChartComponent
                    type={filteredSlides[currentSlideIndex].chartType}
                    data={filteredSlides[currentSlideIndex].chartData}
                    color={agentData[filteredSlides[currentSlideIndex].role].color}
                  />
                </motion.div>
              </div>

              {filteredSlides[currentSlideIndex].notes && (
                <motion.div
                  className="mt-8 pt-4 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="flex items-center text-white/60 text-sm mb-1">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Speaker Notes</span>
                  </div>
                  <p className="text-white/80 text-sm">{filteredSlides[currentSlideIndex].notes}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Progress Bar */}
      <div className="p-4 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <span className="text-white/60 text-sm">
            Slide {currentSlideIndex + 1} of {filteredSlides.length}
          </span>

          <div className="flex items-center space-x-1">
            {filteredSlides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlideIndex ? "bg-white" : "bg-white/30 hover:bg-white/50"
                }`}
                onClick={() => setCurrentSlideIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
