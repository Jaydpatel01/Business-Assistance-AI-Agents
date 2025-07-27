/**
 * Comprehensive Help System Component
 * 
 * Provides contextual help, tutorials, and guidance for users
 * Includes search functionality and interactive tutorials
 */

'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Play, 
  Users, 
  FileText, 
  BarChart3,
  MessageSquare,
  Shield,
  Lightbulb,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
  videoUrl?: string;
  relatedArticles?: string[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: {
    title: string;
    description: string;
    action?: string;
    tip?: string;
  }[];
  category: string;
  duration: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Business AI',
    description: 'Learn the basics of using AI agents for business decisions',
    category: 'basics',
    content: `Welcome to Business AI! This platform helps you make better business decisions using AI-powered executive agents.

## What You Can Do:
- Create business scenarios for AI analysis
- Start boardroom discussions with AI executives
- Upload documents to enhance AI context
- Export insights and decisions

## Your AI Executive Team:
- **CEO**: Strategic leadership and vision
- **CFO**: Financial analysis and planning
- **CTO**: Technology strategy and innovation
- **HR Director**: People and organizational development

## Getting Started:
1. Create your first scenario
2. Start a boardroom session
3. Ask questions and get AI insights
4. Upload relevant documents
5. Export your decisions`,
    difficulty: 'beginner',
    estimatedTime: '5 min',
    tags: ['basics', 'onboarding', 'ai-agents'],
    relatedArticles: ['creating-scenarios', 'boardroom-sessions']
  },
  {
    id: 'creating-scenarios',
    title: 'Creating Effective Business Scenarios',
    description: 'Best practices for setting up scenarios that get valuable AI insights',
    category: 'scenarios',
    content: `Business scenarios are the foundation of effective AI decision-making.

## Scenario Types:
- **Strategic Planning**: Long-term business strategy
- **Financial Planning**: Budget allocation and forecasting
- **Product Launches**: New product strategy and execution
- **Market Expansion**: Geographic or segment expansion
- **Crisis Management**: Risk mitigation and response

## Best Practices:
1. **Be Specific**: Include concrete numbers and timelines
2. **Provide Context**: Add industry, company size, and market conditions
3. **Define Goals**: Clear objectives and success metrics
4. **Include Constraints**: Budget, time, and resource limitations

## Example Scenario:
"We're a 50-person SaaS company considering expanding to European markets. 
Current revenue: $2M ARR. Budget: $500K for expansion. 
Timeline: 6 months to market entry."`,
    difficulty: 'beginner',
    estimatedTime: '7 min',
    tags: ['scenarios', 'planning', 'strategy'],
    relatedArticles: ['getting-started', 'boardroom-sessions']
  },
  {
    id: 'boardroom-sessions',
    title: 'Running Effective Boardroom Sessions',
    description: 'How to get the most value from AI-powered boardroom discussions',
    category: 'collaboration',
    content: `Boardroom sessions are where the magic happens - real-time collaboration with AI executives.

## Session Best Practices:
1. **Start with Context**: Begin with your scenario and key questions
2. **Ask Follow-ups**: Dig deeper into AI recommendations
3. **Challenge Assumptions**: Ask "what if" questions
4. **Seek Different Perspectives**: Use multiple AI agents
5. **Document Decisions**: Export key insights

## Effective Questions:
- "What are the main risks we should consider?"
- "How would you prioritize these initiatives?"
- "What financial implications should we expect?"
- "What would success look like in 6 months?"

## Collaboration Features:
- Real-time messaging with AI agents
- Live participant indicators
- Message threading and replies
- Session recording and playback`,
    difficulty: 'intermediate',
    estimatedTime: '10 min',
    tags: ['collaboration', 'ai-agents', 'sessions'],
    relatedArticles: ['creating-scenarios', 'document-intelligence']
  },
  {
    id: 'document-intelligence',
    title: 'Document Intelligence & RAG',
    description: 'Enhance AI responses with your business documents',
    category: 'documents',
    content: `Upload documents to give AI agents context about your business.

## Supported Document Types:
- Business plans and strategies
- Financial reports and projections
- Market research and analysis
- Company policies and procedures
- Product specifications and roadmaps

## How It Works:
1. **Upload**: Add documents to your library
2. **Processing**: AI extracts key information
3. **Integration**: Documents inform AI responses
4. **Search**: Find relevant information quickly

## Best Practices:
- Upload recent, relevant documents
- Organize with clear filenames
- Include context in document descriptions
- Regularly update your document library

## Security:
All documents are encrypted and only accessible to your organization.`,
    difficulty: 'intermediate',
    estimatedTime: '8 min',
    tags: ['documents', 'rag', 'intelligence'],
    relatedArticles: ['boardroom-sessions', 'analytics-insights']
  },
  {
    id: 'analytics-insights',
    title: 'Analytics & Business Insights',
    description: 'Track performance and extract business intelligence',
    category: 'analytics',
    content: `Monitor your decision-making process and outcomes with comprehensive analytics.

## Available Analytics:
- Session performance metrics
- Decision quality tracking
- AI agent effectiveness
- Document usage patterns
- User engagement statistics

## Key Metrics:
- **Decision Rate**: How quickly decisions are made
- **Consensus Score**: Agreement level among AI agents
- **Confidence Levels**: AI certainty in recommendations
- **Follow-up Rate**: Questions leading to deeper analysis

## Export Options:
- PDF reports for executive summaries
- CSV data for further analysis
- Interactive dashboards
- Custom visualizations

## Using Insights:
1. Identify high-performing decision patterns
2. Improve scenario quality based on outcomes
3. Optimize AI agent selection
4. Track ROI of business decisions`,
    difficulty: 'advanced',
    estimatedTime: '12 min',
    tags: ['analytics', 'insights', 'performance'],
    relatedArticles: ['document-intelligence', 'explainability']
  },
  {
    id: 'explainability',
    title: 'Understanding AI Decision Reasoning',
    description: 'How to interpret and trust AI recommendations',
    category: 'ai-transparency',
    content: `Our explainable AI system helps you understand how and why AI agents make recommendations.

## Explainability Features:
- **Reasoning Steps**: Step-by-step decision logic
- **Confidence Scores**: How certain the AI is
- **Evidence Sources**: What information influenced the decision
- **Alternative Options**: Other paths considered
- **Risk Assessment**: Potential downsides and mitigation

## Bias Detection:
- Automatic bias scanning
- Severity indicators
- Mitigation suggestions
- Feedback collection

## Building Trust:
1. Review reasoning explanations
2. Verify evidence sources
3. Consider alternative viewpoints
4. Provide feedback on accuracy
5. Track decision outcomes

## Feedback Loop:
Your feedback helps improve AI accuracy and reduces bias over time.`,
    difficulty: 'advanced',
    estimatedTime: '15 min',
    tags: ['explainability', 'ai-transparency', 'trust'],
    relatedArticles: ['analytics-insights', 'security']
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Understanding how your data is protected',
    category: 'security',
    content: `Enterprise-grade security protects your business data and decisions.

## Security Features:
- End-to-end encryption
- Role-based access control
- Single sign-on (SSO) support
- Multi-factor authentication
- Audit trail logging

## Data Privacy:
- Your data never leaves your tenant
- AI models are isolated per organization
- Regular security audits and compliance
- GDPR and SOC 2 compliance

## Access Control:
- **Admin**: Full platform access
- **Manager**: Team management and analytics
- **User**: Session participation and document access
- **Viewer**: Read-only access to completed sessions

## Best Practices:
1. Use strong passwords
2. Enable multi-factor authentication
3. Regularly review user permissions
4. Monitor audit logs
5. Keep access credentials secure`,
    difficulty: 'intermediate',
    estimatedTime: '8 min',
    tags: ['security', 'privacy', 'compliance'],
    relatedArticles: ['getting-started', 'explainability']
  }
];

const tutorials: Tutorial[] = [
  {
    id: 'first-scenario',
    title: 'Create Your First Scenario',
    description: 'Step-by-step guide to creating an effective business scenario',
    category: 'basics',
    duration: '5 minutes',
    steps: [
      {
        title: 'Navigate to Scenarios',
        description: 'Click on "Scenarios" in the main navigation',
        action: 'Go to /scenarios',
        tip: 'You can also use the quick action button on the dashboard'
      },
      {
        title: 'Start New Scenario',
        description: 'Click the "Create New Scenario" button',
        action: 'Click create button',
        tip: 'Choose a template to get started faster'
      },
      {
        title: 'Add Scenario Details',
        description: 'Fill in the scenario name, description, and parameters',
        tip: 'Be specific about budget, timeline, and success metrics'
      },
      {
        title: 'Set Parameters',
        description: 'Define budget, timeline, and key constraints',
        tip: 'Realistic constraints lead to better AI recommendations'
      },
      {
        title: 'Save and Start',
        description: 'Save your scenario and start your first boardroom session',
        action: 'Click save and start session'
      }
    ]
  },
  {
    id: 'effective-questioning',
    title: 'Asking Effective Questions',
    description: 'Learn how to get valuable insights from AI agents',
    category: 'collaboration',
    duration: '7 minutes',
    steps: [
      {
        title: 'Start with Context',
        description: 'Begin by explaining your situation and goals',
        tip: 'More context leads to more relevant recommendations'
      },
      {
        title: 'Ask Open-Ended Questions',
        description: 'Use "how", "what", and "why" questions for deeper insights',
        tip: 'Avoid yes/no questions - they limit AI reasoning'
      },
      {
        title: 'Request Multiple Perspectives',
        description: 'Ask different AI agents for their viewpoints',
        tip: 'CEO, CFO, CTO, and HR bring different expertise'
      },
      {
        title: 'Dig Deeper',
        description: 'Follow up with "why" and "how" questions',
        tip: 'Challenge assumptions and ask for alternatives'
      },
      {
        title: 'Seek Action Items',
        description: 'Ask for specific next steps and timelines',
        tip: 'Convert insights into actionable business plans'
      }
    ]
  },
  {
    id: 'document-upload',
    title: 'Upload and Organize Documents',
    description: 'Enhance AI responses with your business context',
    category: 'documents',
    duration: '6 minutes',
    steps: [
      {
        title: 'Go to Documents',
        description: 'Navigate to the Documents section',
        action: 'Go to /documents'
      },
      {
        title: 'Upload Files',
        description: 'Drag and drop or select files to upload',
        tip: 'PDFs, Word docs, and text files work best'
      },
      {
        title: 'Add Descriptions',
        description: 'Provide context about each document',
        tip: 'Good descriptions help AI find relevant information'
      },
      {
        title: 'Organize with Tags',
        description: 'Use tags to categorize your documents',
        tip: 'Tags like "strategy", "financial", "product" work well'
      },
      {
        title: 'Test Document Search',
        description: 'Search for key terms to verify documents are indexed',
        tip: 'This ensures AI can find relevant information during sessions'
      }
    ]
  }
];

export function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'basics', label: 'Getting Started', icon: Play },
    { id: 'scenarios', label: 'Scenarios', icon: FileText },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-transparency', label: 'AI Transparency', icon: Lightbulb },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const filteredArticles = useMemo(() => {
    return helpArticles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const nextTutorialStep = () => {
    if (activeTutorial && currentTutorialStep < activeTutorial.steps.length - 1) {
      setCurrentTutorialStep(prev => prev + 1);
    }
  };

  const prevTutorialStep = () => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(prev => prev - 1);
    }
  };

  const startTutorial = (tutorial: Tutorial) => {
    setActiveTutorial(tutorial);
    setCurrentTutorialStep(0);
  };

  const closeTutorial = () => {
    setActiveTutorial(null);
    setCurrentTutorialStep(0);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Help & Documentation
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs defaultValue="articles" className="space-y-4">
              <TabsList>
                <TabsTrigger value="articles">Articles</TabsTrigger>
                <TabsTrigger value="tutorials">Interactive Tutorials</TabsTrigger>
                <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
              </TabsList>

              <TabsContent value="articles" className="space-y-4">
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="gap-2"
                      >
                        <Icon className="h-3 w-3" />
                        {category.label}
                      </Button>
                    );
                  })}
                </div>

                {/* Articles */}
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {filteredArticles.map((article) => (
                      <Card key={article.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{article.title}</h4>
                              <Badge className={getDifficultyColor(article.difficulty)}>
                                {article.difficulty}
                              </Badge>
                              <Badge variant="outline">{article.estimatedTime}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{article.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {article.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tutorials" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutorials.map((tutorial) => (
                    <Card key={tutorial.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{tutorial.title}</h4>
                          <Badge variant="outline">{tutorial.duration}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => startTutorial(tutorial)} size="sm" className="gap-2">
                            <Play className="h-3 w-3" />
                            Start Tutorial
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {tutorial.steps.length} steps
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="quickstart" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        1. Create a Scenario
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Start by creating a business scenario to analyze
                      </p>
                      <Button size="sm" variant="outline">Go to Scenarios</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        2. Start Discussion
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Begin a boardroom session with AI executives
                      </p>
                      <Button size="sm" variant="outline">New Session</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        3. Upload Documents
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Add context with your business documents
                      </p>
                      <Button size="sm" variant="outline">Upload Files</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        4. Review Analytics
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Track decisions and export insights
                      </p>
                      <Button size="sm" variant="outline">View Analytics</Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutorial Modal */}
      {activeTutorial && (
        <Dialog open={!!activeTutorial} onOpenChange={() => closeTutorial()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                {activeTutorial.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Step {currentTutorialStep + 1} of {activeTutorial.steps.length}
                </span>
                <Badge variant="outline">{activeTutorial.duration}</Badge>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${((currentTutorialStep + 1) / activeTutorial.steps.length) * 100}%` }}
                />
              </div>

              <Card className="p-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">
                    {activeTutorial.steps[currentTutorialStep].title}
                  </h4>
                  <p className="text-muted-foreground">
                    {activeTutorial.steps[currentTutorialStep].description}
                  </p>
                  {activeTutorial.steps[currentTutorialStep].tip && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Tip</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {activeTutorial.steps[currentTutorialStep].tip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevTutorialStep}
                  disabled={currentTutorialStep === 0}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {currentTutorialStep === activeTutorial.steps.length - 1 ? (
                    <Button onClick={closeTutorial} className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Complete Tutorial
                    </Button>
                  ) : (
                    <Button onClick={nextTutorialStep}>
                      Next Step
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
