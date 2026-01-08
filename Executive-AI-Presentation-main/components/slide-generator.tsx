"use client"

import { useState } from "react"
import { Loader2, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface SlideGeneratorProps {
  onSlidesGenerated: (slides: any[]) => void
}

export function SlideGenerator({ onSlidesGenerated }: SlideGeneratorProps) {
  const [topic, setTopic] = useState("")
  const [numSlides, setNumSlides] = useState("3")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  const handleGenerateSlides = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for the slides.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Generate slides based on the topic
      const response = await fetch("/api/generate-slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          numSlides: Number.parseInt(numSlides),
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()

      // Call the callback with the generated slides
      onSlidesGenerated(data.slides)

      toast({
        title: "Slides generated",
        description: `${data.slides.length} new slides have been added to your presentation.`,
      })

      // Reset form
      setTopic("")
      setShowForm(false)
    } catch (error) {
      console.error("Error generating slides:", error)
      toast({
        title: "Error",
        description: "Failed to generate slides. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full">
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full py-8 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 bg-transparent hover:bg-gray-100 hover:border-gray-400 transition-all"
          variant="ghost"
        >
          <Plus className="h-5 w-5" />
          <span>Generate More Slides</span>
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Generate Additional Slides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Presentation Topic</Label>
              <Input
                id="topic"
                placeholder="Enter a topic for your slides..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numSlides">Number of Slides</Label>
              <Select value={numSlides} onValueChange={setNumSlides} disabled={isGenerating}>
                <SelectTrigger id="numSlides">
                  <SelectValue placeholder="Select number of slides" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Slide</SelectItem>
                  <SelectItem value="3">3 Slides</SelectItem>
                  <SelectItem value="5">5 Slides</SelectItem>
                  <SelectItem value="10">10 Slides</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerateSlides} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Slides
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
