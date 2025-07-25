import { NextResponse } from 'next/server';
import { agentProfiles } from '@/lib/ai/agent-service';

export async function GET() {
  try {
    // Test scenario for demonstration
    const testScenario = {
      id: 'test-scenario',
      name: 'Q4 Budget Allocation Strategy',
      description: 'We need to allocate our $5M Q4 budget across marketing, R&D, and operations. Marketing is requesting $2M for a major campaign, R&D wants $2.5M for AI development, and operations needs $1M for infrastructure. How should we proceed?',
      parameters: {
        budget: 5000000,
        timeline: '3 months',
        departments: ['Marketing', 'R&D', 'Operations'],
        currentMarkets: ['North America', 'Europe'],
        teamSize: 150,
        revenue_growth: '15%',
        cash_reserves: '$20M'
      }
    };

    // Mock agent responses that would typically come from Gemini
    const mockResponses = {
      CEO: {
        summary: "Strategic balance needed between growth investments and operational stability.",
        perspective: `**CEO Perspective:**
        This budget allocation decision is critical for our Q4 performance and sets the foundation for 2026 growth. Given our 15% revenue growth and strong cash position, we can afford strategic investments while maintaining operational excellence.

        **Key Concerns/Opportunities:**
        - Market leadership opportunity with AI development investment
        - Marketing campaign timing aligns with holiday season peak
        - Infrastructure stability crucial for scaling operations

        **Recommendation:**
        Allocate $2.2M to R&D (prioritizing AI development), $2M to marketing (with performance milestones), and $800K to operations with contingency planning for additional infrastructure needs.`,
        confidence: 0.87,
        timestamp: new Date().toISOString(),
        agent: agentProfiles.ceo
      },
      CFO: {
        summary: "Financially viable allocation with emphasis on ROI tracking and risk management.",
        perspective: `**CFO Perspective:**
        Our current financial position supports this investment level, but we need structured oversight and clear ROI metrics for each allocation.

        **Key Concerns/Opportunities:**
        - Marketing ROI from previous campaigns averaged 3.2x
        - R&D investments show 18-month payback period typically
        - Infrastructure improvements reduce operational costs by 12%

        **Recommendation:**
        Approve phased budget release: 60% upfront, 40% based on Q1 performance metrics. Establish quarterly review gates and require detailed ROI projections from each department.`,
        confidence: 0.91,
        timestamp: new Date().toISOString(),
        agent: agentProfiles.cfo
      },
      CTO: {
        summary: "Technical infrastructure and AI development priorities well-aligned with market opportunities.",
        perspective: `**CTO Perspective:**
        The proposed R&D allocation aligns perfectly with our technology roadmap. AI development is critical for maintaining competitive advantage, and infrastructure improvements will support scaling.

        **Key Concerns/Opportunities:**
        - AI capabilities will differentiate us from competitors
        - Current infrastructure at 85% capacity - upgrade needed
        - Technical talent acquisition market remains competitive

        **Recommendation:**
        Prioritize $2.3M for R&D with focus on AI/ML capabilities, $1M for infrastructure (cloud migration and scaling), and establish technical advisory board for strategic guidance.`,
        confidence: 0.94,
        timestamp: new Date().toISOString(),
        agent: agentProfiles.cto
      },
      HR: {
        summary: "Talent retention and organizational development considerations for successful execution.",
        perspective: `**CHRO Perspective:**
        This budget allocation will require significant organizational change management and talent strategy alignment to ensure successful execution across all departments.

        **Key Concerns/Opportunities:**
        - R&D expansion requires 8-10 new technical hires
        - Marketing campaign will need temporary contractor support
        - Change management for infrastructure upgrades affects all teams

        **Recommendation:**
        Allocate 10% of each departmental budget for talent acquisition and training. Implement cross-functional project teams and establish clear communication channels for change management.`,
        confidence: 0.82,
        timestamp: new Date().toISOString(),
        agent: agentProfiles.hr
      }
    };

    // Mock decision synthesis
    const synthesis = {
      recommendation: "Proceed with strategic budget allocation: $2.2M R&D, $2M Marketing, $800K Operations with performance gates and cross-functional oversight.",
      rationale: "The combination of strong financial position, market opportunities, and technical readiness supports this balanced investment approach. All executive perspectives align on the strategic importance while emphasizing different risk mitigation strategies.",
      action_items: [
        {task: "Establish quarterly review gates with CFO oversight", owner: "CFO", timeline: "30 days"},
        {task: "Begin technical hiring process for R&D expansion", owner: "HR", timeline: "45 days"},
        {task: "Launch infrastructure upgrade project", owner: "CTO", timeline: "60 days"},
        {task: "Finalize marketing campaign strategy and metrics", owner: "Marketing", timeline: "30 days"}
      ],
      risks: [
        "Technical talent scarcity may delay R&D timeline",
        "Marketing campaign ROI dependent on holiday season performance",
        "Infrastructure upgrades may temporarily impact operations"
      ],
      confidence: "High",
      dissenting_views: {
        HR: "Recommends more conservative timeline for technical hiring given market constraints"
      }
    };

    return NextResponse.json({
      success: true,
      message: 'AI Agent system working correctly (using mock data due to API limits)',
      demo: {
        scenario: testScenario,
        responses: mockResponses,
        synthesis: synthesis,
        availableAgents: Object.keys(agentProfiles),
        note: "This is mock data - replace GEMINI_API_KEY with a valid key for live responses"
      }
    });

  } catch (error) {
    console.error('Demo endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
