"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, FileSpreadsheet, FileJson } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BrandingSettingsDialog } from "./BrandingSettingsDialog"
import { BrandingConfig, defaultBranding } from "@/lib/pdf/branding-config"

interface ExportDialogProps {
  sessionId: string
  sessionName: string
  trigger?: React.ReactNode
}

export function ExportDialog({ sessionId, sessionName, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json' | 'excel'>('pdf')
  const [reportType, setReportType] = useState<'executive' | 'detailed' | 'transcript'>('executive')
  const [includeTranscript, setIncludeTranscript] = useState(true)
  const [includeReasoning, setIncludeReasoning] = useState(true)
  const [includeCitations, setIncludeCitations] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)

    try {
      toast({
        title: "Generating Export",
        description: `Preparing your ${format.toUpperCase()} report...`,
      })

      const response = await fetch('/api/boardroom/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          format,
          reportType,
          options: {
            includeTranscript,
            includeReasoning,
            includeCitations,
            maxMessages: 50,
          },
          branding: format === 'pdf' ? branding : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate export')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Generate filename based on format
      const ext = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : format === 'excel' ? 'xlsx' : 'json'
      const prefix = reportType === 'executive' ? 'executive-summary' : 'session-report'
      a.download = `${prefix}-${sessionName.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 30)}-${new Date().toISOString().split('T')[0]}.${ext}`
      
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: `Your ${format.toUpperCase()} report has been downloaded successfully.`,
      })

      setOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Export Failed",
        description: "Failed to generate export. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Export Session Report</DialogTitle>
              <DialogDescription>
                Choose your export format and options for {sessionName}
              </DialogDescription>
            </div>
            {format === 'pdf' && (
              <BrandingSettingsDialog
                currentBranding={branding}
                onSave={setBranding}
              />
            )}
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as typeof format)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center cursor-pointer flex-1">
                  <FileText className="h-4 w-4 mr-2 text-red-500" />
                  <div>
                    <div className="font-medium">PDF Document</div>
                    <div className="text-xs text-muted-foreground">Professional report with formatting</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer flex-1">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />
                  <div>
                    <div className="font-medium">CSV Spreadsheet</div>
                    <div className="text-xs text-muted-foreground">Data table for Excel/Sheets</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center cursor-pointer flex-1">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                  <div>
                    <div className="font-medium">Excel Workbook</div>
                    <div className="text-xs text-muted-foreground">Multi-sheet report with formatting</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center cursor-pointer flex-1">
                  <FileJson className="h-4 w-4 mr-2 text-blue-500" />
                  <div>
                    <div className="font-medium">JSON Data</div>
                    <div className="text-xs text-muted-foreground">Raw data for integration</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* PDF Report Type */}
          {format === 'pdf' && (
            <div className="space-y-3">
              <Label>Report Type</Label>
              <RadioGroup value={reportType} onValueChange={(value) => setReportType(value as typeof reportType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="executive" id="executive" />
                  <Label htmlFor="executive" className="cursor-pointer">
                    <div className="font-medium">Executive Summary</div>
                    <div className="text-xs text-muted-foreground">2-3 pages with key insights and charts</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="detailed" id="detailed" />
                  <Label htmlFor="detailed" className="cursor-pointer">
                    <div className="font-medium">Detailed Report</div>
                    <div className="text-xs text-muted-foreground">Full transcript with all messages</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <Label>Include in Export</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="transcript" 
                  checked={includeTranscript}
                  onCheckedChange={(checked) => setIncludeTranscript(checked as boolean)}
                />
                <Label htmlFor="transcript" className="text-sm cursor-pointer">
                  Full Transcript
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="reasoning" 
                  checked={includeReasoning}
                  onCheckedChange={(checked) => setIncludeReasoning(checked as boolean)}
                />
                <Label htmlFor="reasoning" className="text-sm cursor-pointer">
                  Reasoning & Confidence Scores
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="citations" 
                  checked={includeCitations}
                  onCheckedChange={(checked) => setIncludeCitations(checked as boolean)}
                />
                <Label htmlFor="citations" className="text-sm cursor-pointer">
                  Document Citations
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
