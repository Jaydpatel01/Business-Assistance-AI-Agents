import { AgentConfiguration } from "@/components/agent-configuration"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExecutiveRole } from "@/types/executive"

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Configuration</h1>
        <p className="text-muted-foreground">
          Customize AI agent personalities, expertise areas, and response styles to match your organizational needs.
        </p>
      </div>
      
      <Tabs defaultValue={ExecutiveRole.CEO} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value={ExecutiveRole.CEO}>CEO Agent</TabsTrigger>
          <TabsTrigger value={ExecutiveRole.CFO}>CFO Agent</TabsTrigger>
          <TabsTrigger value={ExecutiveRole.CTO}>CTO Agent</TabsTrigger>
          <TabsTrigger value={ExecutiveRole.CHRO}>HR Agent</TabsTrigger>
        </TabsList>
        
        <TabsContent value={ExecutiveRole.CEO} className="space-y-4">
          <AgentConfiguration agentType={ExecutiveRole.CEO} />
        </TabsContent>
        
        <TabsContent value={ExecutiveRole.CFO} className="space-y-4">
          <AgentConfiguration agentType={ExecutiveRole.CFO} />
        </TabsContent>
        
        <TabsContent value={ExecutiveRole.CTO} className="space-y-4">
          <AgentConfiguration agentType={ExecutiveRole.CTO} />
        </TabsContent>
        
        <TabsContent value={ExecutiveRole.CHRO} className="space-y-4">
          <AgentConfiguration agentType={ExecutiveRole.CHRO} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
