import { ExecutiveBoardroom } from "@/components/executive-boardroom"

interface BoardroomPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function BoardroomPage({ params }: BoardroomPageProps) {
  const { sessionId } = await params
  return <ExecutiveBoardroom sessionId={sessionId} />
}
