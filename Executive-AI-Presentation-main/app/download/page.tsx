"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Download,
  FileText,
  Package,
  Volume2,
  Play,
  Pause,
  ArrowLeft,
  Check,
  Loader2,
  SkipBack,
  SkipForward,
  Volume,
  VolumeX,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import type { Role } from "@/app/slide-builder/page"

// Agent data
const agentData = {
  CEO: {
    color: "#4f46e5", // indigo
    voice: "Matthew",
  },
  CFO: {
    color: "#0ea5e9", // sky blue
    voice: "Daniel",
  },
  CTO: {
    color: "#8b5cf6", // purple
    voice: "James",
  },
  HR: {
    color: "#ec4899", // pink
    voice: "Emma",
  },
}

// Mock slides data
const mockSlides = [
  {
    id: "1",
    title: "Market Expansion Strategy",
    role: "CEO" as Role,
  },
  {
    id: "2",
    title: "Financial Projections",
    role: "CFO" as Role,
  },
  {
    id: "3",
    title: "Technology Implementation Roadmap",
    role: "CTO" as Role,
  },
  {
    id: "4",
    title: "Talent Acquisition Strategy",
    role: "HR" as Role,
  },
  {
    id: "5",
    title: "Market Opportunity Summary",
    role: "CEO" as Role,
  },
]

export default function DownloadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [exportProgress, setExportProgress] = useState<{
    pdf: number
    notes: number
    zip: number
  }>({
    pdf: 0,
    notes: 0,
    zip: 0,
  })
  const [downloadLinks, setDownloadLinks] = useState<{
    pdf: string | null
    notes: string | null
    zip: string | null
  }>({
    pdf: null,
    notes: null,
    zip: null,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          const newProgress = prev + 1
          if (newProgress >= 100) {
            setIsPlaying(false)
            if (currentSlideIndex < mockSlides.length - 1) {
              setCurrentSlideIndex((prev) => prev + 1)
              return 0
            }
            return 100
          }
          return newProgress
        })
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentSlideIndex])

  // Simulate export progress
  useEffect(() => {
    if (mounted) {
      // Simulate PDF export
      const pdfInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev.pdf < 100) {
            return { ...prev, pdf: prev.pdf + 5 }
          }
          clearInterval(pdfInterval)

          // Set download link when complete
          if (prev.pdf >= 95) {
            setDownloadLinks((prev) => ({ ...prev, pdf: "#" }))
          }

          return prev
        })
      }, 200)

      // Simulate notes export (starts after a delay)
      setTimeout(() => {
        const notesInterval = setInterval(() => {
          setExportProgress((prev) => {
            if (prev.notes < 100) {
              return { ...prev, notes: prev.notes + 10 }
            }
            clearInterval(notesInterval)

            // Set download link when complete
            if (prev.notes >= 90) {
              setDownloadLinks((prev) => ({ ...prev, notes: "#" }))
            }

            return prev
          })
        }, 150)
      }, 1000)

      // Simulate ZIP export (starts after both PDF and notes are at least 50% complete)
      const zipCheckInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev.pdf >= 50 && prev.notes >= 50 && prev.zip < 100) {
            // Start ZIP export
            const zipInterval = setInterval(() => {
              setExportProgress((innerPrev) => {
                if (innerPrev.zip < 100) {
                  return { ...innerPrev, zip: innerPrev.zip + 3 }
                }
                clearInterval(zipInterval)

                // Set download link when complete
                if (innerPrev.zip >= 97) {
                  setDownloadLinks((innerPrev) => ({ ...innerPrev, zip: "#" }))
                }

                return innerPrev
              })
            }, 300)

            clearInterval(zipCheckInterval)
          }
          return prev
        })
      }, 500)

      return () => {
        clearInterval(pdfInterval)
        clearInterval(zipCheckInterval)
      }
    }
  }, [mounted])

  const handleBackToPreview = () => {
    router.push("/preview")
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)

    if (!isPlaying) {
      setAudioProgress(0)
      toast({
        title: "Narration started",
        description: `Playing narration for slide ${currentSlideIndex + 1}`,
      })
    }
  }

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
      setAudioProgress(0)
      setIsPlaying(false)
    }
  }

  const handleNextSlide = () => {
    if (currentSlideIndex < mockSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
      setAudioProgress(0)
      setIsPlaying(false)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (value[0] === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleDownload = (type: "pdf" | "notes" | "zip") => {
    if (downloadLinks[type]) {
      toast({
        title: "Download started",
        description: `Your ${type.toUpperCase()} file is being downloaded.`,
      })
    } else {
      toast({
        title: "Still processing",
        description: `Please wait while we finish preparing your ${type.toUpperCase()} file.`,
      })
    }
  }

  if (!mounted) return null

  const currentSlide = mockSlides[currentSlideIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToPreview}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Preview
            </Button>
            <h1 className="text-xl font-semibold">Download & Narration</h1>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Export Section (Left Panel) */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Download className="h-5 w-5 mr-2 text-primary" />
                      <span>Download PDF Presentation</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("pdf")}
                      disabled={!downloadLinks.pdf}
                    >
                      {downloadLinks.pdf ? (
                        <>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing
                        </>
                      )}
                    </Button>
                  </div>
                  <Progress value={exportProgress.pdf} className="h-2" />
                  {exportProgress.pdf === 100 && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <Check className="h-4 w-4 mr-1" /> PDF ready for download
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      <span>Download Slide Notes</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("notes")}
                      disabled={!downloadLinks.notes}
                    >
                      {downloadLinks.notes ? (
                        <>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing
                        </>
                      )}
                    </Button>
                  </div>
                  <Progress value={exportProgress.notes} className="h-2" />
                  {exportProgress.notes === 100 && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <Check className="h-4 w-4 mr-1" /> Notes ready for download
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-primary" />
                      <span>Download Complete Package (ZIP)</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("zip")}
                      disabled={!downloadLinks.zip}
                    >
                      {downloadLinks.zip ? (
                        <>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing
                        </>
                      )}
                    </Button>
                  </div>
                  <Progress value={exportProgress.zip} className="h-2" />
                  {exportProgress.zip === 100 && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <Check className="h-4 w-4 mr-1" /> ZIP package ready for download
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The ZIP package includes the PDF presentation, slide notes, and audio narrations for offline use.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardHeader>
                <CardTitle>Download Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating Audio...</span>
                    <Badge variant="outline" className="text-green-600 dark:text-green-400">
                      Done
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Exporting PDF...</span>
                    <Badge
                      variant="outline"
                      className={exportProgress.pdf === 100 ? "text-green-600 dark:text-green-400" : ""}
                    >
                      {exportProgress.pdf === 100 ? "Done" : `${exportProgress.pdf}%`}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Exporting Notes...</span>
                    <Badge
                      variant="outline"
                      className={exportProgress.notes === 100 ? "text-green-600 dark:text-green-400" : ""}
                    >
                      {exportProgress.notes === 100 ? "Done" : `${exportProgress.notes}%`}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Creating ZIP Package...</span>
                    <Badge
                      variant="outline"
                      className={exportProgress.zip === 100 ? "text-green-600 dark:text-green-400" : ""}
                    >
                      {exportProgress.zip === 100
                        ? "Done"
                        : exportProgress.zip > 0
                          ? `${exportProgress.zip}%`
                          : "Waiting"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Narration Panel (Right Side) */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardHeader>
                <CardTitle>Narrated Mode Player</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${agentData[currentSlide.role].color}20`,
                        color: agentData[currentSlide.role].color,
                      }}
                    >
                      {currentSlide.role}
                    </Badge>
                    <span className="text-sm">Narrated by: {agentData[currentSlide.role].voice}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Slide {currentSlideIndex + 1} of {mockSlides.length}
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="text-lg font-medium mb-2">{currentSlide.title}</h3>
                  <div className="flex items-center space-x-1 mb-4">
                    {mockSlides.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentSlideIndex ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePrevSlide}
                          disabled={currentSlideIndex === 0}
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePlayPause}
                          className={isPlaying ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleNextSlide}
                          disabled={currentSlideIndex === mockSlides.length - 1}
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={handleToggleMute}>
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume className="h-4 w-4" />}
                        </Button>
                        <div className="w-24">
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={handleVolumeChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress value={audioProgress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.floor((audioProgress / 100) * 30)}s</span>
                        <span>30s</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Agent Voice Selection</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(agentData) as Role[]).map((role) => (
                      <div
                        key={role}
                        className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        style={{
                          borderColor: role === currentSlide.role ? agentData[role].color : undefined,
                          backgroundColor: role === currentSlide.role ? `${agentData[role].color}10` : undefined,
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: agentData[role].color }}
                        ></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{role}</div>
                          <div className="text-xs text-gray-500">{agentData[role].voice}</div>
                        </div>
                        {role === currentSlide.role && <Volume2 className="h-4 w-4 text-gray-400" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Each AI agent has a unique voice that reflects their executive role. You can preview the narration
                    for each slide before downloading.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
