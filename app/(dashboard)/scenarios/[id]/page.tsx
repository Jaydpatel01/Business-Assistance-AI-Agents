import { ScenarioEditor } from "@/components/scenario-editor"

interface ScenarioPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const { id } = await params
  return <ScenarioEditor scenarioId={id} />
}
