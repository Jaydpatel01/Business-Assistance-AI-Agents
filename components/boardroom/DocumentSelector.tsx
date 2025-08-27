import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, FileText, BarChart3, Filter, RefreshCw } from 'lucide-react'
import { useDemoMode } from '@/hooks/use-demo-mode'

interface Document {
  id: string
  fileName: string
  category: string
  uploadedAt: string
  fileSize: number
  status?: string
}

// Mock documents for demo mode - moved outside component
const DEMO_DOCUMENTS: Document[] = [
  {
    id: '1',
    fileName: 'Q3 Financial Report.pdf',
    category: 'financial',
    uploadedAt: '2025-01-15',
    fileSize: 2048576,
    status: 'processed'
  },
  {
    id: '2',
    fileName: 'Strategic Plan 2025.docx',
    category: 'strategic',
    uploadedAt: '2025-01-10',
    fileSize: 1536000,
    status: 'processed'
  },
  {
    id: '3',
    fileName: 'Market Analysis Report.xlsx',
    category: 'strategic',
    uploadedAt: '2025-01-08',
    fileSize: 3072000,
    status: 'processed'
  },
  {
    id: '4',
    fileName: 'Tech Infrastructure Review.pdf',
    category: 'technical',
    uploadedAt: '2025-01-05',
    fileSize: 4096000,
    status: 'processed'
  }
]

interface DocumentSelectorProps {
  selectedDocuments?: string[]
  onDocumentSelectionChange?: (documentIds: string[]) => void
  maxDocuments?: number
}

export function DocumentSelector({ 
  selectedDocuments = [], 
  onDocumentSelectionChange,
  maxDocuments = 10 
}: DocumentSelectorProps) {
  const { isDemo } = useDemoMode()
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  const categories = [
    { value: 'all', label: 'All Documents', icon: FileText },
    { value: 'financial', label: 'Financial', icon: BarChart3 },
    { value: 'strategic', label: 'Strategic', icon: FileText },
    { value: 'technical', label: 'Technical', icon: FileText },
    { value: 'hr', label: 'Human Resources', icon: FileText },
    { value: 'general', label: 'General', icon: FileText }
  ]

  // Load documents
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true)
      
      // Check if demo mode (URL-based detection too)
      const isDemoFromUrl = typeof window !== 'undefined' && (
        window.location.search.includes('demo=true') || 
        window.location.pathname.includes('/demo-')
      )
      
      if (isDemo || isDemoFromUrl) {
        console.log('🎭 Demo mode: Using mock documents instead of API call')
        setDocuments(DEMO_DOCUMENTS)
        setIsLoading(false)
        return
      }
      
      try {
        const response = await fetch('/api/documents')
        if (response.ok) {
          const data = await response.json()
          setDocuments(data.data || [])
        }
      } catch (error) {
        console.error('Failed to load documents:', error)
        // Mock data for demo purposes
        setDocuments([
          {
            id: '1',
            fileName: 'Q3 Financial Report.pdf',
            category: 'financial',
            uploadedAt: '2025-01-15',
            fileSize: 2048576,
            status: 'processed'
          },
          {
            id: '2',
            fileName: 'Strategic Plan 2025.docx',
            category: 'strategic',
            uploadedAt: '2025-01-10',
            fileSize: 1048576,
            status: 'processed'
          },
          {
            id: '3',
            fileName: 'Tech Architecture Overview.pdf',
            category: 'technical',
            uploadedAt: '2025-01-08',
            fileSize: 3072000,
            status: 'processed'
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [isDemo]) // Only depend on isDemo

  // Filter documents based on search and category
  useEffect(() => {
    let filtered = documents

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.fileName.toLowerCase().includes(term)
      )
    }

    setFilteredDocuments(filtered)
  }, [documents, searchTerm, selectedCategory])

  const handleDocumentToggle = (documentId: string) => {
    let newSelection: string[]
    
    if (selectedDocuments.includes(documentId)) {
      newSelection = selectedDocuments.filter(id => id !== documentId)
    } else {
      if (selectedDocuments.length >= maxDocuments) {
        return // Don't allow more than max documents
      }
      newSelection = [...selectedDocuments, documentId]
    }
    
    onDocumentSelectionChange?.(newSelection)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category)
    return categoryData?.icon || FileText
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      financial: 'bg-green-100 text-green-800',
      strategic: 'bg-blue-100 text-blue-800',
      technical: 'bg-purple-100 text-purple-800',
      hr: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || colors.general
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading documents...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Document Context</span>
          </div>
          <Badge variant="secondary">
            {selectedDocuments.length}/{maxDocuments} selected
          </Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Select documents to provide additional context for AI agents
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Document List */}
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {documents.length === 0 ? (
                  <>
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No documents uploaded yet</p>
                    <p className="text-sm">Upload documents to enhance AI responses</p>
                  </>
                ) : (
                  <p>No documents match your search criteria</p>
                )}
              </div>
            ) : (
              filteredDocuments.map((document) => {
                const isSelected = selectedDocuments.includes(document.id)
                const Icon = getCategoryIcon(document.category)
                
                return (
                  <div
                    key={document.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleDocumentToggle(document.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleDocumentToggle(document.id)}
                    />
                    
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {document.fileName}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(document.category)}`}
                        >
                          {document.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(document.fileSize)}
                        </span>
                        {document.status && (
                          <Badge variant="outline" className="text-xs">
                            {document.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        {/* Selection Summary */}
        {selectedDocuments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-900 mb-1">
              Selected Documents ({selectedDocuments.length})
            </div>
            <div className="text-xs text-blue-700">
              These documents will be used to provide context for AI agent responses
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DocumentSelector
