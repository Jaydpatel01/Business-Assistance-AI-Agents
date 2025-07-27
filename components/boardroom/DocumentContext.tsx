import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, ExternalLink } from 'lucide-react'

interface DocumentCitation {
  id: string
  name: string
  relevanceScore: number
  excerpt: string
  citationIndex: number
}

interface DocumentContextProps {
  documentsUsed: number
  citations: DocumentCitation[]
  isVisible?: boolean
  onToggleVisibility?: () => void
}

export function DocumentContext({ 
  documentsUsed, 
  citations, 
  isVisible = true,
  onToggleVisibility 
}: DocumentContextProps) {
  if (documentsUsed === 0) {
    return null
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 0.8) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRelevanceLabel = (score: number) => {
    if (score >= 0.9) return 'Highly Relevant'
    if (score >= 0.8) return 'Very Relevant'
    if (score >= 0.7) return 'Relevant'
    return 'Moderately Relevant'
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50/50">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-blue-100/50 transition-colors"
        onClick={onToggleVisibility}
      >
        <CardTitle className="flex items-center justify-between text-sm font-medium text-blue-900">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Document Context</span>
            <Badge variant="secondary" className="text-xs">
              {documentsUsed} document{documentsUsed !== 1 ? 's' : ''} used
            </Badge>
          </div>
          <div className="text-xs text-blue-600">
            {isVisible ? 'Click to hide' : 'Click to show'}
          </div>
        </CardTitle>
      </CardHeader>
      
      {isVisible && (
        <CardContent className="space-y-3">
          <p className="text-sm text-blue-700 mb-3">
            AI agents used the following company documents to provide contextual insights:
          </p>
          
          {citations.map((citation) => (
            <div
              key={citation.id}
              className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    [{citation.citationIndex}]
                  </span>
                  <h4 className="font-medium text-sm text-gray-900 truncate max-w-xs">
                    {citation.name}
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getRelevanceColor(citation.relevanceScore)}`}
                  >
                    {getRelevanceLabel(citation.relevanceScore)}
                  </Badge>
                  <button className="text-blue-600 hover:text-blue-800 p-1">
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                {citation.excerpt}
              </p>
              
              <div className="mt-2 text-xs text-gray-500">
                Relevance Score: {Math.round(citation.relevanceScore * 100)}%
              </div>
            </div>
          ))}
          
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
            💡 <strong>How it works:</strong> AI agents automatically search your company documents 
            to provide relevant context for their recommendations. Citations show which documents 
            influenced each response.
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default DocumentContext
