import { SummaryBox } from "@/components/summary-box"

interface SummaryPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { sessionId } = await params
  return <SummaryBox sessionId={sessionId} />
}
