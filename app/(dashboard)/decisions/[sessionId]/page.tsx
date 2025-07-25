import { DecisionSummary } from "@/components/decision-summary"

interface DecisionPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function DecisionPage({ params }: DecisionPageProps) {
  const { sessionId } = await params
  return <DecisionSummary sessionId={sessionId} />
}
