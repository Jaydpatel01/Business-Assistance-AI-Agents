import { ExecutiveBoardroom } from "@/components/executive-boardroom"
import { ErrorBoundary } from "@/components/ui/error-boundary"

interface BoardSessionPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function BoardSessionPage({ params }: BoardSessionPageProps) {
  const { sessionId } = await params
  
  return (
    <ErrorBoundary>
      <ExecutiveBoardroom sessionId={sessionId} />
    </ErrorBoundary>
  )
}
