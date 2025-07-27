"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, File, CheckCircle, AlertCircle, X, FileText, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useOnboarding } from "@/hooks/use-onboarding"
import { Document } from "@/lib/types"

interface DocumentUploadProps {
  sessionId?: string
  onUploadComplete?: (document: Document) => void
  maxFiles?: number
}

interface UploadedDocument {
  id: string
  fileName: string
  fileSize: number
  category: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  extractedTextLength?: number
  error?: string
}

const CATEGORIES = [
  { value: 'financial', label: 'Financial', icon: BarChart3 },
  { value: 'strategic', label: 'Strategic', icon: FileText },
  { value: 'technical', label: 'Technical', icon: File },
  { value: 'hr', label: 'Human Resources', icon: FileText },
  { value: 'general', label: 'General', icon: File }
]

export function DocumentUpload({ sessionId, onUploadComplete, maxFiles = 5 }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [category, setCategory] = useState<string>('general')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { markStepCompleted } = useOnboarding()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (documents.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)

    for (const file of acceptedFiles) {
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Add to documents list with uploading status
      const newDocument: UploadedDocument = {
        id: documentId,
        fileName: file.name,
        fileSize: file.size,
        category,
        status: 'uploading',
        progress: 0
      }

      setDocuments(prev => [...prev, newDocument])

      try {
        // Simulate upload progress
        const updateProgress = (progress: number) => {
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === documentId 
                ? { ...doc, progress, status: progress < 100 ? 'uploading' : 'processing' }
                : doc
            )
          )
        }

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          updateProgress(i)
        }

        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)
        formData.append('description', description)
        if (sessionId) {
          formData.append('sessionId', sessionId)
        }

        // Upload file
        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()

        if (result.success) {
          // Update document status to completed
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === documentId 
                ? { 
                    ...doc, 
                    status: 'completed', 
                    progress: 100,
                    extractedTextLength: result.data.extractedTextLength
                  }
                : doc
            )
          )

          toast({
            title: "Upload successful",
            description: `${file.name} has been processed and is ready for AI analysis`
          })

          // Mark onboarding step as completed
          markStepCompleted('upload-documents')

          onUploadComplete?.(result.data)
        } else {
          throw new Error(result.error || 'Upload failed')
        }

      } catch (error) {
        console.error('Upload error:', error)
        
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { 
                  ...doc, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : doc
          )
        )

        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        })
      }
    }

    setIsUploading(false)
  }, [category, description, sessionId, maxFiles, documents.length, toast, onUploadComplete, markStepCompleted])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <File className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload & Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
            <Textarea
              placeholder="Brief description of the documents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-blue-600">Drop the files here...</p>
              <p className="text-sm text-gray-500">Release to upload</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium">Drag & drop files here, or click to select</p>
              <p className="text-sm text-gray-500 mt-2">
                Supports PDF, Word, Excel, CSV, and text files up to 10MB each
              </p>
              <Button variant="outline" className="mt-4" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Choose Files'}
              </Button>
            </div>
          )}
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Uploaded Documents</h4>
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(doc.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <Badge variant="outline" className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                      {doc.extractedTextLength && (
                        <span>• {doc.extractedTextLength} chars extracted</span>
                      )}
                    </div>
                    {doc.error && (
                      <p className="text-sm text-red-600 mt-1">{doc.error}</p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {(doc.status === 'uploading' || doc.status === 'processing') && (
                  <div className="w-24 mx-3">
                    <Progress value={doc.progress} className="h-2" />
                  </div>
                )}

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Stats */}
        {documents.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            {documents.filter(d => d.status === 'completed').length} of {documents.length} documents processed
          </div>
        )}
      </CardContent>
    </Card>
  )
}
