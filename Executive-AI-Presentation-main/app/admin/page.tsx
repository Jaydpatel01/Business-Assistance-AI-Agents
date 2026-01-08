"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  RefreshCw,
  Download,
  Trash2,
  Eye,
  Filter,
  Search,
  Calendar,
  User,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChartComponent } from "@/components/chart-component"
import { useToast } from "@/hooks/use-toast"
import type { Role, SlideType } from "@/app/slide-builder/page"

// Agent data
const agentData = {
  CEO: {
    color: "#4f46e5", // indigo
    slides: 12,
    avgTime: "45s",
  },
  CFO: {
    color: "#0ea5e9", // sky blue
    slides: 8,
    avgTime: "52s",
  },
  CTO: {
    color: "#8b5cf6", // purple
    slides: 10,
    avgTime: "48s",
  },
  HR: {
    color: "#ec4899", // pink
    slides: 6,
    avgTime: "38s",
  },
}

// Mock slides data
const mockSlides = [
  {
    id: "1",
    number: 1,
    title: "Market Expansion Strategy",
    role: "CEO" as Role,
    slideType: "intro" as SlideType,
    createdAt: new Date(2023, 5, 15, 10, 30),
    content: "Our market expansion strategy focuses on three key regions with high growth potential.",
    bullets: [
      "North American market shows 23% YoY growth potential",
      "European expansion targeted for Q3 with projected 15% market share",
      "APAC region represents our biggest opportunity with 30% growth forecast",
    ],
  },
  {
    id: "2",
    number: 2,
    title: "Financial Projections",
    role: "CFO" as Role,
    slideType: "chart" as SlideType,
    createdAt: new Date(2023, 5, 15, 10, 32),
    content: "Based on our market analysis, we project significant revenue growth over the next 3 years.",
    bullets: [
      "Year 1: $2.4M revenue with 15% profit margin",
      "Year 2: $5.8M revenue with 22% profit margin",
      "Year 3: $12.3M revenue with 28% profit margin",
    ],
  },
  {
    id: "3",
    number: 3,
    title: "Technology Implementation Roadmap",
    role: "CTO" as Role,
    slideType: "timeline" as SlideType,
    createdAt: new Date(2023, 5, 15, 10, 35),
    content: "Our technology roadmap focuses on scalable infrastructure and innovative features.",
    bullets: [
      "Phase 1: Core platform development and cloud infrastructure setup",
      "Phase 2: API integrations and third-party service connections",
      "Phase 3: Advanced analytics and machine learning capabilities",
    ],
  },
  {
    id: "4",
    number: 4,
    title: "Talent Acquisition Strategy",
    role: "HR" as Role,
    slideType: "chart" as SlideType,
    createdAt: new Date(2023, 5, 15, 10, 38),
    content: "Our hiring plan focuses on building diverse teams with specialized expertise.",
    bullets: [
      "Engineering: 12 new hires across frontend, backend, and DevOps",
      "Product: 5 new hires including designers and product managers",
      "Sales & Marketing: 8 new hires to drive growth initiatives",
    ],
  },
  {
    id: "5",
    number: 5,
    title: "Market Opportunity Summary",
    role: "CEO" as Role,
    slideType: "summary" as SlideType,
    createdAt: new Date(2023, 5, 15, 10, 42),
    content: "The total addressable market represents a significant opportunity for our business.",
    bullets: [
      "TAM: $8.5 billion with 12% CAGR",
      "SAM: $3.2 billion in our target segments",
      "SOM: $450 million achievable within 5 years",
    ],
  },
]

// Slide type options
const slideTypeOptions = [
  { value: "intro", label: "Introduction Slide" },
  { value: "chart", label: "Chart/Data Slide" },
  { value: "summary", label: "Summary Slide" },
  { value: "comparison", label: "Comparison Slide" },
  { value: "timeline", label: "Timeline Slide" },
  { value: "quote", label: "Quote/Insight Slide" },
]

export default function AdminPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [slides, setSlides] = useState(mockSlides)
  const [filteredSlides, setFilteredSlides] = useState(mockSlides)
  const [selectedSlide, setSelectedSlide] = useState<(typeof mockSlides)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all")
  const [slideTypeFilter, setSlideTypeFilter] = useState<SlideType | "all">("all")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  }>({
    key: "number",
    direction: "ascending",
  })
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...slides]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (slide) =>
          slide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slide.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((slide) => slide.role === roleFilter)
    }

    // Apply slide type filter
    if (slideTypeFilter !== "all") {
      result = result.filter((slide) => slide.slideType === slideTypeFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "ascending"
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime()
      }

      if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredSlides(result)
  }, [slides, searchQuery, roleFilter, slideTypeFilter, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "ascending" ? "descending" : "ascending",
    })
  }

  const handleViewSlide = (slide: (typeof mockSlides)[0]) => {
    setSelectedSlide(slide)
    setIsViewModalOpen(true)
  }

  const handleDeleteSlide = (id: string) => {
    setSlides(slides.filter((slide) => slide.id !== id))
    toast({
      title: "Slide deleted",
      description: "The slide has been removed from the presentation.",
    })
  }

  const handleRegenerateSlide = (id: string) => {
    toast({
      title: "Regenerating slide",
      description: "The slide is being regenerated with the same parameters.",
    })
    // In a real app, this would call the API to regenerate the slide
  }

  const handleDownloadSlide = (id: string) => {
    toast({
      title: "Downloading slide",
      description: "The individual slide is being prepared for download.",
    })
    // In a real app, this would trigger the download of the slide
  }

  const handleExportLogs = (format: "json" | "csv") => {
    toast({
      title: `Exporting logs as ${format.toUpperCase()}`,
      description: "The session logs are being prepared for download.",
    })
    // In a real app, this would trigger the export of logs
  }

  if (!mounted) return null

  // Calculate statistics
  const totalSlides = slides.length
  const slidesByRole = {
    CEO: slides.filter((slide) => slide.role === "CEO").length,
    CFO: slides.filter((slide) => slide.role === "CFO").length,
    CTO: slides.filter((slide) => slide.role === "CTO").length,
    HR: slides.filter((slide) => slide.role === "HR").length,
  }

  const slidesByType = {
    intro: slides.filter((slide) => slide.slideType === "intro").length,
    chart: slides.filter((slide) => slide.slideType === "chart").length,
    summary: slides.filter((slide) => slide.slideType === "summary").length,
    comparison: slides.filter((slide) => slide.slideType === "comparison").length,
    timeline: slides.filter((slide) => slide.slideType === "timeline").length,
    quote: slides.filter((slide) => slide.slideType === "quote").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              PresentAI Admin
            </Link>
            <Badge variant="outline">Session: ABC123</Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleExportLogs("json")}>
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
            <Button variant="outline" onClick={() => handleExportLogs("csv")}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-8">
          {/* Agent Activity Dashboard (Top Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(agentData) as Role[]).map((role) => (
              <Card
                key={role}
                className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: agentData[role].color }}></div>
                    {role} Agent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">{slidesByRole[role]}</div>
                      <div className="text-xs text-gray-500">Total Slides</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{agentData[role].avgTime}</div>
                      <div className="text-xs text-gray-500">Avg. Time/Slide</div>
                    </div>
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${agentData[role].color}20` }}
                    >
                      <User className="h-5 w-5" style={{ color: agentData[role].color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts and Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardHeader>
                <CardTitle>Slides by Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ChartComponent
                    type="pie"
                    data={[
                      { name: "CEO", value: slidesByRole.CEO },
                      { name: "CFO", value: slidesByRole.CFO },
                      { name: "CTO", value: slidesByRole.CTO },
                      { name: "HR", value: slidesByRole.HR },
                    ]}
                    color="#4f46e5"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardHeader>
                <CardTitle>Slides by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ChartComponent
                    type="bar"
                    data={[
                      { name: "Intro", value: slidesByType.intro },
                      { name: "Chart", value: slidesByType.chart },
                      { name: "Summary", value: slidesByType.summary },
                      { name: "Compare", value: slidesByType.comparison },
                      { name: "Timeline", value: slidesByType.timeline },
                      { name: "Quote", value: slidesByType.quote },
                    ]}
                    color="#8b5cf6"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Slide Summary Table */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <CardHeader>
              <CardTitle>Slide Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search slides..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as Role | "all")}>
                      <SelectTrigger className="w-[130px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="CEO">CEO</SelectItem>
                        <SelectItem value="CFO">CFO</SelectItem>
                        <SelectItem value="CTO">CTO</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={slideTypeFilter}
                      onValueChange={(value) => setSlideTypeFilter(value as SlideType | "all")}
                    >
                      <SelectTrigger className="w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {slideTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort("number")}>
                          <div className="flex items-center">
                            #
                            {sortConfig.key === "number" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                          <div className="flex items-center">
                            Slide Title
                            {sortConfig.key === "title" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("role")}>
                          <div className="flex items-center">
                            Agent Role
                            {sortConfig.key === "role" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("slideType")}>
                          <div className="flex items-center">
                            Slide Type
                            {sortConfig.key === "slideType" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                          <div className="flex items-center">
                            Created At
                            {sortConfig.key === "createdAt" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSlides.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                            No slides found matching your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSlides.map((slide) => (
                          <TableRow key={slide.id}>
                            <TableCell className="font-medium">{slide.number}</TableCell>
                            <TableCell>{slide.title}</TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>
                              {slideTypeOptions.find((option) => option.value === slide.slideType)?.label}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                <span>
                                  {slide.createdAt.toLocaleDateString()}{" "}
                                  {slide.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewSlide(slide)}>
                                    <Eye className="h-4 w-4 mr-2" /> View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRegenerateSlide(slide.id)}>
                                    <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownloadSlide(slide.id)}>
                                    <Download className="h-4 w-4 mr-2" /> Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteSlide(slide.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slide Timeline Visualization */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <CardHeader>
              <CardTitle>Slide Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pt-4 pb-12">
                <div className="absolute left-0 right-0 h-0.5 top-8 bg-gray-200 dark:bg-gray-700"></div>
                <div className="relative flex justify-between">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="flex flex-col items-center cursor-pointer"
                      onClick={() => handleViewSlide(slide)}
                    >
                      <div
                        className="w-4 h-4 rounded-full z-10 mb-2"
                        style={{ backgroundColor: agentData[slide.role].color }}
                      ></div>
                      <div
                        className="text-xs font-medium px-2 py-1 rounded-md"
                        style={{
                          backgroundColor: `${agentData[slide.role].color}20`,
                          color: agentData[slide.role].color,
                        }}
                      >
                        {slide.role}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {slide.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="text-xs font-medium mt-1 max-w-[80px] text-center truncate">{slide.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Slide Content Preview Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Slide Preview</DialogTitle>
          </DialogHeader>

          {selectedSlide && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${agentData[selectedSlide.role].color}20`,
                    color: agentData[selectedSlide.role].color,
                  }}
                >
                  {selectedSlide.role}
                </Badge>
                <div className="text-sm text-gray-500">Slide #{selectedSlide.number}</div>
              </div>

              <h2 className="text-2xl font-bold">{selectedSlide.title}</h2>

              <p>{selectedSlide.content}</p>

              <div>
                <h3 className="text-sm font-medium mb-2">Key Points:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedSlide.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center text-sm text-gray-500 pt-2 border-t">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  Created on {selectedSlide.createdAt.toLocaleDateString()} at{" "}
                  {selectedSlide.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => handleRegenerateSlide(selectedSlide.id)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
                </Button>
                <Button variant="outline" onClick={() => handleDownloadSlide(selectedSlide.id)}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-600"
                  onClick={() => {
                    handleDeleteSlide(selectedSlide.id)
                    setIsViewModalOpen(false)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
