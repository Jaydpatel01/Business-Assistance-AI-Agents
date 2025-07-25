import { DocumentUpload } from "@/components/document-upload"

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <p className="text-muted-foreground">
          Upload and manage documents to enhance AI agent responses with your organization's knowledge base.
        </p>
      </div>
      
      <DocumentUpload />
    </div>
  )
}
