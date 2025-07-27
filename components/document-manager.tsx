"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DocumentUpload } from "@/components/document-upload"
import { useToast } from "@/hooks/use-toast"
import { 
  FileText, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Upload,
  BarChart3,
  Clock,
  HardDrive,
  Zap,
  BookOpen
} from "lucide-react"

interface ProcessedDocument {
  id: string
  fileName: string
  fileSize: number
  category: string
  uploadedAt: string
  status: 'processed' | 'processing' | 'error'
  chunksCreated: number
  extractedTextLength: number
  metadata?: {
    description?: string
    uploadedBy?: string
    sessionId?: string
  }
}

interface DocumentStats {
  totalDocuments: number
  totalSize: number
  categories: Record<string, number>
  recentUploads: number
  processingQueue: number
}

interface DocumentManagerProps {
  sessionId?: string
  organizationId?: string
  showUpload?: boolean
}

export function DocumentManager({ sessionId, showUpload = true }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const { toast } = useToast()

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/documents')
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.data || [])
      
      // Calculate stats
      const docStats: DocumentStats = {
        totalDocuments: data.data?.length || 0,
        totalSize: data.data?.reduce((sum: number, doc: ProcessedDocument) => sum + doc.fileSize, 0) || 0,
        categories: {},
        recentUploads: 0,
        processingQueue: 0
      }

      data.data?.forEach((doc: ProcessedDocument) => {
        docStats.categories[doc.category] = (docStats.categories[doc.category] || 0) + 1
        
        const uploadDate = new Date(doc.uploadedAt)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        if (uploadDate > oneDayAgo) {
          docStats.recentUploads++
        }
        
        if (doc.status === 'processing') {
          docStats.processingQueue++
        }
      })

      setStats(docStats)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      toast({
        title: "Success",
        description: "Document deleted successfully"
      })
    } catch (error) {
      console.error('Failed to delete document:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive"
      })
    }
  }

  const handleSearchDocuments = async (query: string) => {
    if (!query.trim()) {
      fetchDocuments()
      return
    }

    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          query,
          maxResults: 10
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Display search results in a meaningful way
        console.log('RAG Search Results:', data.results)
        toast({
          title: "Search Complete",
          description: `Found ${data.results?.length || 0} relevant chunks`
        })
      }
    } catch {
      console.error('Search failed')
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <BarChart3 className="h-4 w-4" />
      case 'strategic': return <BookOpen className="h-4 w-4" />
      case 'technical': return <Zap className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Intelligence</h2>
          <p className="text-muted-foreground">
            Manage and search your AI-enhanced document library
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showUpload && (
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Documents</DialogTitle>
                </DialogHeader>
                <DocumentUpload 
                  sessionId={sessionId} 
                  onUploadComplete={() => {
                    fetchDocuments()
                    setShowUploadDialog(false)
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold">{stats.totalDocuments}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-600" />
                <span className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold">{stats.recentUploads}</span>
              </div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-2xl font-bold">{stats.processingQueue}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchDocuments(searchQuery)
                  }
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleSearchDocuments(searchQuery)} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Document List */}
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(doc.category)}
                  <div className="space-y-1">
                    <h4 className="font-medium">{doc.fileName}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{doc.category}</Badge>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{doc.chunksCreated} chunks</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={doc.status === 'processed' ? 'default' : 'secondary'}
                  >
                    {doc.status}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={(e) => {
                    e.stopPropagation()
                    setSelectedDocument(doc)
                  }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteDocument(doc.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || categoryFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Upload your first document to get started'
                  }
                </p>
                {showUpload && !searchQuery && categoryFilter === 'all' && (
                  <Button onClick={() => setShowUploadDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Details Dialog */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedDocument.category)}
                {selectedDocument.fileName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline" className="ml-2">{selectedDocument.category}</Badge>
                </div>
                <div>
                  <span className="font-medium">File Size:</span>
                  <span className="ml-2">{formatFileSize(selectedDocument.fileSize)}</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className="ml-2" variant={selectedDocument.status === 'processed' ? 'default' : 'secondary'}>
                    {selectedDocument.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span>
                  <span className="ml-2">{new Date(selectedDocument.uploadedAt).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Processing Results</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Text Extracted:</span>
                    <span className="ml-2 font-mono">{selectedDocument.extractedTextLength.toLocaleString()} chars</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chunks Created:</span>
                    <span className="ml-2 font-mono">{selectedDocument.chunksCreated}</span>
                  </div>
                </div>
              </div>

              {selectedDocument.metadata?.description && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedDocument.metadata.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
