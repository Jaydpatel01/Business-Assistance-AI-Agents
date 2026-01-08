"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import {
  Presentation,
  Download,
  Play,
  Plus,
  Edit,
  Copy,
  Trash2,
  Volume2,
  BarChart,
  PieChart,
  LineChart,
  LayoutDashboard,
  Briefcase,
  Calculator,
  Code,
  Users,
  Sparkles,
  FileText,
  ArrowRight,
  Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/loader"
import { ChartComponent } from "@/components/chart-component"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Types
export type Role = "CEO" | "CFO" | "CTO" | "HR"
export type SlideType = "intro" | "chart" | "summary" | "comparison" | "timeline" | "quote"

export interface Slide {
  id: string
  title: string
  content: string
  bullets: string[]
  notes?: string
  role: Role
  slideType: SlideType
  chartType?: "bar" | "line" | "pie" | "area"
  chartData?: any
  createdAt: Date
}

// Agent data
const agentData = {
  CEO: {
    icon: <Briefcase className="h-5 w-5" />,
    focusAreas: [
      "Vision & Strategy",
      "Market Analysis",
      "Competitive Positioning",
      "Value Proposition",
      "Growth Opportunities",
    ],
    slideStructure: [
      "Executive Summary",
      "Market Overview",
      "Strategic Direction",
      "Key Initiatives",
      "Expected Outcomes",
    ],
    templateStyle: "Vision-focused",
    dataModules: ["Market Trends", "Competitor Analysis", "SWOT Analysis", "Strategic Roadmap"],
    color: "#4f46e5", // indigo
  },
  CFO: {
    icon: <Calculator className="h-5 w-5" />,
    focusAreas: ["Financial Forecasting", "ROI Analysis", "Profit Margins", "Cost Structure", "Investment Planning"],
    slideStructure: [
      "Financial Overview",
      "Cost Analysis",
      "Revenue Projections",
      "ROI Calculations",
      "Budget Allocation",
    ],
    templateStyle: "Data-driven",
    dataModules: ["Financial Charts", "Cost Breakdown", "Profit Analysis", "Investment Scenarios"],
    color: "#0ea5e9", // sky blue
  },
  CTO: {
    icon: <Code className="h-5 w-5" />,
    focusAreas: ["Technical Roadmap", "Architecture", "Innovation Stack", "System Design", "Technology Trends"],
    slideStructure: [
      "Technical Overview",
      "Architecture Diagram",
      "Implementation Plan",
      "Technology Stack",
      "Innovation Roadmap",
    ],
    templateStyle: "Technical",
    dataModules: ["Architecture Diagrams", "Tech Stack Comparison", "Implementation Timeline", "Innovation Matrix"],
    color: "#8b5cf6", // purple
  },
  HR: {
    icon: <Users className="h-5 w-5" />,
    focusAreas: [
      "Talent Strategy",
      "Employee Engagement",
      "Diversity Metrics",
      "Culture Development",
      "Organizational Design",
    ],
    slideStructure: [
      "People Overview",
      "Talent Metrics",
      "Culture Initiatives",
      "Organizational Structure",
      "Engagement Strategy",
    ],
    templateStyle: "People-centric",
    dataModules: ["Workforce Demographics", "Engagement Metrics", "Talent Pipeline", "Culture Assessment"],
    color: "#ec4899", // pink
  },
}

// Slide type options
const slideTypeOptions = [
  { value: "intro", label: "Introduction Slide", icon: <FileText className="h-4 w-4" /> },
  { value: "chart", label: "Chart/Data Slide", icon: <BarChart className="h-4 w-4" /> },
  { value: "summary", label: "Summary Slide", icon: <LayoutDashboard className="h-4 w-4" /> },
  { value: "comparison", label: "Comparison Slide", icon: <ArrowRight className="h-4 w-4" /> },
  { value: "timeline", label: "Timeline Slide", icon: <LineChart className="h-4 w-4" /> },
  { value: "quote", label: "Quote/Insight Slide", icon: <Sparkles className="h-4 w-4" /> },
]

// Chart type options
const chartTypeOptions = [
  { value: "bar", label: "Bar Chart", icon: <BarChart className="h-4 w-4" /> },
  { value: "line", label: "Line Chart", icon: <LineChart className="h-4 w-4" /> },
  { value: "pie", label: "Pie Chart", icon: <PieChart className="h-4 w-4" /> },
  { value: "area", label: "Area Chart", icon: <LineChart className="h-4 w-4" /> },
]

// Generate random session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function SlideBuilderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [sessionId] = useState(generateSessionId())
  const [slides, setSlides] = useState<Slide[]>([])
  const [selectedRole, setSelectedRole] = useState<Role>("CEO")
  const [slideTopic, setSlideTopic] = useState("")
  const [slideType, setSlideType] = useState<SlideType>("intro")
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "area">("bar")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeAgentPanel, setActiveAgentPanel] = useState<Role | null>("CEO")
  const [previewSlide, setPreviewSlide] = useState<Slide | null>(null)
  const [agentSpeaking, setAgentSpeaking] = useState<Role | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update preview slide when inputs change
  useEffect(() => {
    if (slideTopic) {
      setPreviewSlide({
        id: "preview",
        title: slideTopic || "Your Slide Title",
        content: "This is a preview of how your slide will look. The content will be generated based on your inputs.",
        bullets: [
          "Key point one will appear here",
          "Important insight will be highlighted",
          "Data-driven conclusion will be shown",
        ],
        notes: "Speaker notes will appear here to help guide the presentation.",
        role: selectedRole,
        slideType: slideType,
        chartType: chartType,
        chartData: generateRandomChartData(chartType),
        createdAt: new Date(),
      })
    }
  }, [slideTopic, selectedRole, slideType, chartType])

  // Simulate agent speaking
  useEffect(() => {
    if (isGenerating) {
      setAgentSpeaking(selectedRole)
    } else {
      setAgentSpeaking(null)
    }
  }, [isGenerating, selectedRole])

  const handleGenerateSlide = async () => {
    if (!slideTopic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your slide.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create a new slide
      const newSlide: Slide = {
        id: uuidv4(),
        title: slideTopic,
        content: `This slide was generated by the ${selectedRole} agent focusing on ${agentData[selectedRole].focusAreas.join(", ")}.`,
        bullets: [
          `Key insight from ${selectedRole} perspective`,
          `Strategic recommendation based on ${agentData[selectedRole].dataModules[0]}`,
          `Action item derived from ${agentData[selectedRole].templateStyle} analysis`,
        ],
        notes: `Speaker notes: This slide presents the ${selectedRole}'s perspective on ${slideTopic}.`,
        role: selectedRole,
        slideType: slideType,
        chartType: slideType === "chart" ? chartType : undefined,
        chartData: slideType === "chart" ? generateRandomChartData(chartType) : undefined,
        createdAt: new Date(),
      }

      // Add the new slide to the slides array
      setSlides((prevSlides) => [...prevSlides, newSlide])

      // Show success toast
      toast({
        title: "Slide generated",
        description: `${selectedRole} agent has created a new slide.`,
      })

      // Clear the input field
      setSlideTopic("")

      // Scroll to the new slide in the carousel
      setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.scrollTo({
            left: carouselRef.current.scrollWidth,
            behavior: "smooth",
          })
        }
      }, 100)
    } catch (error) {
      console.error("Error generating slide:", error)
      toast({
        title: "Generation failed",
        description: "There was an error generating your slide. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteSlide = (id: string) => {
    setSlides(slides.filter((slide) => slide.id !== id))
    toast({
      title: "Slide deleted",
      description: "The slide has been removed from your presentation.",
    })
  }

  const handleDuplicateSlide = (slide: Slide) => {
    const duplicatedSlide = {
      ...slide,
      id: uuidv4(),
      title: `${slide.title} (Copy)`,
      createdAt: new Date(),
    }
    setSlides([...slides, duplicatedSlide])
    toast({
      title: "Slide duplicated",
      description: "A copy of the slide has been added to your presentation.",
    })
  }

  const handleEditSlide = (slide: Slide) => {
    // Set the form values to the slide's values for editing
    setSelectedRole(slide.role)
    setSlideTopic(slide.title)
    setSlideType(slide.slideType)
    if (slide.chartType) {
      setChartType(slide.chartType)
    }

    // Delete the slide
    setSlides(slides.filter((s) => s.id !== slide.id))

    toast({
      title: "Editing slide",
      description: "Make your changes and generate a new slide.",
    })
  }

  const handlePreviewPresentation = () => {
    if (slides.length === 0) {
      toast({
        title: "No slides to preview",
        description: "Please generate at least one slide first.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would save the slides to a store or context
    // and navigate to the preview page
    toast({
      title: "Preview mode",
      description: "Navigating to presentation preview...",
    })

    // Simulate navigation delay
    setTimeout(() => {
      router.push("/preview")
    }, 1000)
  }

  const handleExportPDF = () => {
    if (slides.length === 0) {
      toast({
        title: "No slides to export",
        description: "Please generate at least one slide first.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Export initiated",
      description: "Your presentation is being prepared for download as PDF.",
    })
    // PDF export logic would go here
  }

  function generateRandomChartData(type: "bar" | "line" | "pie" | "area") {
    if (type === "pie") {
      return [
        { name: "Segment A", value: Math.floor(Math.random() * 100) + 20 },
        { name: "Segment B", value: Math.floor(Math.random() * 100) + 20 },
        { name: "Segment C", value: Math.floor(Math.random() * 100) + 20 },
        { name: "Segment D", value: Math.floor(Math.random() * 100) + 20 },
      ]
    }

    return [
      { name: "Jan", value: Math.floor(Math.random() * 100) + 20 },
      { name: "Feb", value: Math.floor(Math.random() * 100) + 20 },
      { name: "Mar", value: Math.floor(Math.random() * 100) + 20 },
      { name: "Apr", value: Math.floor(Math.random() * 100) + 20 },
      { name: "May", value: Math.floor(Math.random() * 100) + 20 },
      { name: "Jun", value: Math.floor(Math.random() * 100) + 20 },
    ]
  }

  if (!mounted) return null

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Presentation className="h-6 w-6" />
              <span className="font-bold group-hover:text-primary transition-colors">PresentAI</span>
            </Link>
            <Badge variant="outline" className="ml-2">
              Session: {sessionId}
            </Badge>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-primary">
              <Link href="/summit">
                <Users className="mr-1 h-4 w-4" />
                AI Summit
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/preview">
                <Eye className="mr-1 h-4 w-4" />
                Preview
              </Link>
            </Button>
          </nav>

          <div className="flex items-center space-x-2">
            {/* Agent Avatars */}
            <div className="hidden lg:flex -space-x-2 mr-4">
              <TooltipProvider>
                {(["CEO", "CFO", "CTO", "HR"] as Role[]).map((role) => (
                  <Tooltip key={role}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-background",
                          role === activeAgentPanel ? "ring-2 ring-primary" : "",
                          role === agentSpeaking ? "animate-pulse" : "",
                        )}
                        style={{ backgroundColor: agentData[role].color }}
                        onClick={() => setActiveAgentPanel(role)}
                      >
                        {agentData[role].icon}
                        {role === agentSpeaking && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {role} Agent {role === agentSpeaking ? "(Speaking)" : ""}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>

            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            <Button onClick={handlePreviewPresentation}>
              <Play className="mr-2 h-4 w-4" /> Preview Presentation
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Agent Tools Section (Left Sidebar) */}
          <div className="col-span-12 md:col-span-3 space-y-4">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Agent Toolkits</h2>
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="CEO"
                  value={activeAgentPanel || undefined}
                  onValueChange={(value) => setActiveAgentPanel((value as Role) || null)}
                >
                  {(Object.keys(agentData) as Role[]).map((role) => (
                    <AccordionItem key={role} value={role}>
                      <AccordionTrigger className="py-3">
                        <div className="flex items-center">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full mr-2"
                            style={{ backgroundColor: `${agentData[role].color}30`, color: agentData[role].color }}
                          >
                            {agentData[role].icon}
                          </div>
                          <span>{role} Agent</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-1">
                        <div className="space-y-3 text-sm">
                          <div>
                            <h4 className="font-medium mb-1">Focus Areas:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {agentData[role].focusAreas.map((area, index) => (
                                <li key={index}>{area}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-1">Slide Structure:</h4>
                            <ol className="list-decimal pl-5 space-y-1">
                              {agentData[role].slideStructure.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ol>
                          </div>

                          <div>
                            <h4 className="font-medium mb-1">Template Style:</h4>
                            <Badge
                              variant="secondary"
                              style={{ backgroundColor: `${agentData[role].color}20`, color: agentData[role].color }}
                            >
                              {agentData[role].templateStyle}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="font-medium mb-1">Data Modules:</h4>
                            <div className="flex flex-wrap gap-1">
                              {agentData[role].dataModules.map((module, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {module}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            className="w-full mt-2"
                            style={{ backgroundColor: agentData[role].color }}
                            onClick={() => setSelectedRole(role)}
                          >
                            Select {role} Agent
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Slide Input Panel (Main Workspace) */}
          <div className="col-span-12 md:col-span-5 space-y-4">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Create New Slide</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agent-role">Agent Role</Label>
                    <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
                      <SelectTrigger id="agent-role" className="bg-white/50 dark:bg-gray-800/50">
                        <SelectValue placeholder="Select an agent role" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(agentData) as Role[]).map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center">
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded-full mr-2"
                                style={{ backgroundColor: `${agentData[role].color}30`, color: agentData[role].color }}
                              >
                                {agentData[role].icon}
                              </div>
                              <span>{role} Agent</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="slide-topic">Slide Topic</Label>
                    <Input
                      id="slide-topic"
                      placeholder="Enter the topic for this slide..."
                      value={slideTopic}
                      onChange={(e) => setSlideTopic(e.target.value)}
                      className="bg-white/50 dark:bg-gray-800/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slide-type">Slide Type</Label>
                    <Select value={slideType} onValueChange={(value) => setSlideType(value as SlideType)}>
                      <SelectTrigger id="slide-type" className="bg-white/50 dark:bg-gray-800/50">
                        <SelectValue placeholder="Select a slide type" />
                      </SelectTrigger>
                      <SelectContent>
                        {slideTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              {option.icon}
                              <span className="ml-2">{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {slideType === "chart" && (
                    <div>
                      <Label htmlFor="chart-type">Chart Type</Label>
                      <Select
                        value={chartType}
                        onValueChange={(value) => setChartType(value as "bar" | "line" | "pie" | "area")}
                      >
                        <SelectTrigger id="chart-type" className="bg-white/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="Select a chart type" />
                        </SelectTrigger>
                        <SelectContent>
                          {chartTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                {option.icon}
                                <span className="ml-2">{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateSlide}
                    disabled={isGenerating || !slideTopic}
                    className="w-full mt-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    style={{
                      background: `linear-gradient(to right, ${agentData[selectedRole].color}, ${agentData[selectedRole].color}CC)`,
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="mr-2" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> Generate Slide
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Slide Timeline / Carousel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Slide Timeline</h2>
                <Badge variant="outline">{slides.length} Slides</Badge>
              </div>

              <div
                ref={carouselRef}
                className="flex space-x-4 overflow-x-auto pb-4 pt-2 px-1 snap-x"
                style={{ scrollbarWidth: "thin" }}
              >
                {slides.length === 0 ? (
                  <div className="flex items-center justify-center w-full h-32 border border-dashed rounded-lg border-gray-300 dark:border-gray-700">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No slides yet. Generate your first slide!</p>
                    </div>
                  </div>
                ) : (
                  slides.map((slide, index) => (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="min-w-[250px] snap-start"
                    >
                      <Card className="h-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-3">
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
                            <span className="text-xs text-gray-500">#{index + 1}</span>
                          </div>

                          <h3 className="font-medium text-sm line-clamp-1 mb-1">{slide.title}</h3>

                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            {slideTypeOptions.find((option) => option.value === slide.slideType)?.icon}
                            <span className="ml-1">
                              {slideTypeOptions.find((option) => option.value === slide.slideType)?.label}
                            </span>
                          </div>

                          <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="ghost" size="icon" onClick={() => handleEditSlide(slide)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDuplicateSlide(slide)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSlide(slide.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Live Slide Preview Component (Right Panel) */}
          <div className="col-span-12 md:col-span-4">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Live Preview</h2>
                  {previewSlide && (
                    <Badge
                      variant="outline"
                      style={{ borderColor: agentData[selectedRole].color, color: agentData[selectedRole].color }}
                    >
                      {selectedRole} View
                    </Badge>
                  )}
                </div>

                {previewSlide ? (
                  <motion.div
                    key={`${previewSlide.title}-${previewSlide.slideType}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
                    style={{ borderColor: agentData[selectedRole].color }}
                  >
                    <div className="flex items-center mb-1">
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: agentData[selectedRole].color }}
                      ></div>
                      <span className="text-xs text-gray-500">Generated by {selectedRole}</span>
                    </div>

                    <h3 className="text-xl font-bold mb-3" style={{ color: agentData[selectedRole].color }}>
                      {previewSlide.title}
                    </h3>

                    <p className="text-sm mb-3">{previewSlide.content}</p>

                    {previewSlide.bullets.length > 0 && (
                      <div className="mb-4">
                        <ul className="space-y-2">
                          {previewSlide.bullets.map((bullet, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="flex items-start text-sm"
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0"
                                style={{ backgroundColor: agentData[selectedRole].color }}
                              ></div>
                              <span>{bullet}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {previewSlide.slideType === "chart" && previewSlide.chartType && (
                      <div className="h-[180px] mt-4 mb-3">
                        <ChartComponent
                          type={previewSlide.chartType}
                          data={previewSlide.chartData || []}
                          color={agentData[selectedRole].color}
                        />
                      </div>
                    )}

                    {previewSlide.notes && (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <FileText className="h-3 w-3 mr-1" />
                          <span>Speaker Notes</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{previewSlide.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-end mt-3">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Volume2 className="h-3 w-3 mr-1" /> Narrate
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] border border-dashed rounded-lg border-gray-300 dark:border-gray-700">
                    <Eye className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
                      Enter a slide topic and select options to see a live preview of your slide
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
