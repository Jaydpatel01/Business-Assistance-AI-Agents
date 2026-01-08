"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Presentation, Download, Play } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RoleSelector } from "@/components/role-selector"
import { SlideCard } from "@/components/slide-card"
import { Loader } from "@/components/loader"
import { ProgressIndicator } from "@/components/progress-indicator"
import { PresentationMode } from "@/components/presentation-mode"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

export type Role = "CEO" | "CFO" | "CTO" | "HR"
export type Slide = {
  id: string
  title: string
  content: string
  bullets: string[]
  notes?: string
  chartType?: "bar" | "line" | "pie" | "area"
  chartData?: any
}

export default function GeneratePage() {
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [topic, setTopic] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [presentation, setPresentation] = useState<Slide[] | null>(null)
  const [presentationMode, setPresentationMode] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mounted, setMounted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isPlaying && presentation) {
      timerRef.current = setTimeout(() => {
        if (currentSlideIndex < presentation.length - 1) {
          setCurrentSlideIndex(currentSlideIndex + 1)
        } else {
          setIsPlaying(false)
        }
      }, 5000)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isPlaying, currentSlideIndex, presentation])

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your presentation.",
        variant: "destructive",
      })
      return
    }

    if (!selectedRole) {
      toast({
        title: "Role required",
        description: "Please select an executive role.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setPresentation(null)

    try {
      const response = await fetch("/api/generate-presentation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          role: selectedRole,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate presentation")
      }

      const data = await response.json()
      setPresentation(data.slides)
    } catch (error) {
      console.error("Error generating presentation:", error)
      toast({
        title: "Generation failed",
        description: "There was an error generating your presentation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditSlide = (id: string, updatedSlide: Partial<Slide>) => {
    if (!presentation) return

    setPresentation(presentation.map((slide) => (slide.id === id ? { ...slide, ...updatedSlide } : slide)))
  }

  const handleDeleteSlide = (id: string) => {
    if (!presentation) return

    setPresentation(presentation.filter((slide) => slide.id !== id))
  }

  const handleRegenerateSlide = async (id: string) => {
    if (!presentation || !selectedRole) return

    const slideToRegenerate = presentation.find((slide) => slide.id === id)
    if (!slideToRegenerate) return

    try {
      const response = await fetch("/api/regenerate-slide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          role: selectedRole,
          slideTitle: slideToRegenerate.title,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate slide")
      }

      const data = await response.json()

      setPresentation(presentation.map((slide) => (slide.id === id ? { ...data.slide, id } : slide)))

      toast({
        title: "Slide regenerated",
        description: "The slide has been successfully regenerated.",
      })
    } catch (error) {
      console.error("Error regenerating slide:", error)
      toast({
        title: "Regeneration failed",
        description: "There was an error regenerating the slide. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = () => {
    toast({
      title: "Export initiated",
      description: "Your presentation is being prepared for download as PDF.",
    })
    // PDF export logic would go here
  }

  const handleExportPPTX = () => {
    toast({
      title: "Export initiated",
      description: "Your presentation is being prepared for download as PPTX.",
    })
    // PPTX export logic would go here
  }

  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode)
    setCurrentSlideIndex(0)
  }

  const nextSlide = () => {
    if (presentation && currentSlideIndex < presentation.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  if (!mounted) return null

  if (presentationMode && presentation) {
    return (
      <PresentationMode
        slides={presentation}
        currentIndex={currentSlideIndex}
        onNext={nextSlide}
        onPrev={prevSlide}
        onExit={togglePresentationMode}
        isPlaying={isPlaying}
        onTogglePlay={togglePlayPause}
        role={selectedRole as Role}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <Presentation className="h-6 w-6" />
              <span className="font-bold">PresentAI</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            {presentation && (
              <>
                <Button variant="outline" onClick={togglePresentationMode}>
                  <Play className="mr-2 h-4 w-4" /> Present
                </Button>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="mr-2 h-4 w-4" /> Export PDF
                </Button>
                <Button variant="outline" onClick={handleExportPPTX}>
                  <Download className="mr-2 h-4 w-4" /> Export PPTX
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            className="col-span-full lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardHeader>
                <CardTitle>Generate Presentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">Presentation Topic</Label>
                  <Textarea
                    id="topic"
                    placeholder="Enter your business topic or idea..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="min-h-[100px] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select Executive Role</Label>
                  <RoleSelector selectedRole={selectedRole} onSelectRole={setSelectedRole} />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic || !selectedRole}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="mr-2" /> Generating...
                    </>
                  ) : (
                    "Generate Presentation"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <div className="col-span-full lg:col-span-2 relative">
            {presentation && !isMobile && (
              <ProgressIndicator
                totalSlides={presentation.length}
                currentSlide={currentSlideIndex}
                onSelectSlide={(index) => setCurrentSlideIndex(index)}
              />
            )}

            {isGenerating ? (
              <motion.div
                className="flex flex-col items-center justify-center h-full min-h-[400px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Loader size={48} />
                <p className="mt-4 text-lg">Generating your presentation...</p>
                <p className="text-sm text-gray-500">This may take a minute</p>
              </motion.div>
            ) : presentation ? (
              <motion.div
                className="space-y-6 pl-0 md:pl-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h2
                  className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {topic} - {selectedRole} Perspective
                </motion.h2>

                <AnimatePresence>
                  <div className="space-y-8">
                    {presentation.map((slide, index) => (
                      <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <SlideCard
                          slide={slide}
                          onEdit={(updatedSlide) => handleEditSlide(slide.id, updatedSlide)}
                          onDelete={() => handleDeleteSlide(slide.id)}
                          onRegenerate={() => handleRegenerateSlide(slide.id)}
                          role={selectedRole as Role}
                        />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center h-full min-h-[400px] border rounded-lg p-6 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 border-gray-200/50 dark:border-gray-800/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Presentation className="h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-xl font-medium">No presentation generated yet</h3>
                <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
                  Enter a topic and select an executive role, then click "Generate Presentation" to create your slides.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
