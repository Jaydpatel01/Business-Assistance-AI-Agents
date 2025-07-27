/**
 * Advanced AI Workflow Types
 * Phase 5: Enhanced AI Capabilities & Enterprise Features
 */

export interface WorkflowStep {
  id: string;
  type: 'ai_analysis' | 'decision_point' | 'approval' | 'action' | 'condition' | 'escalation';
  name: string;
  description: string;
  required: boolean;
  timeoutMinutes?: number;
  
  // Conditional logic
  conditions?: WorkflowCondition[];
  nextSteps?: string[]; // Step IDs to execute next
  
  // AI-specific configuration
  aiConfig?: {
    prompt: string;
    requiredAgents: string[];
    confidenceThreshold: number;
    analysisType: 'risk' | 'financial' | 'strategic' | 'operational' | 'compliance';
  };
  
  // Approval configuration
  approvalConfig?: {
    requiredRoles: string[];
    approvalType: 'any' | 'all' | 'majority';
    escalationHours: number;
    escalationTo: string[];
  };
  
  // Action configuration
  actionConfig?: {
    type: 'email' | 'calendar' | 'task' | 'notification' | 'api_call';
    config: Record<string, string | number | boolean>;
  };
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: string | number | boolean;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'hr' | 'strategic' | 'operational' | 'compliance' | 'general';
  industry?: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedDuration: number; // minutes
  
  // Workflow definition
  steps: WorkflowStep[];
  startStepId: string;
  
  // Metadata
  createdBy: string;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
  
  // Configuration
  requiresDocuments: boolean;
  minParticipants: number;
  maxParticipants: number;
  requiredRoles: string[];
}

export interface WorkflowExecution {
  id: string;
  templateId: string;
  sessionId: string;
  initiatedBy: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  
  // Progress tracking
  currentStepId: string;
  completedSteps: string[];
  stepHistory: WorkflowStepExecution[];
  
  // Context and data
  context: Record<string, string | number | boolean | string[]>;
  documents: string[]; // Document IDs
  participants: string[]; // User IDs
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  estimatedCompletion: Date;
  
  // Results
  decisions: WorkflowDecision[];
  actions: WorkflowAction[];
  riskAssessment?: RiskAssessment;
}

export interface WorkflowStepExecution {
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  executedBy?: string;
  
  // Step-specific data
  inputData: Record<string, string | number | boolean | string[]>;
  outputData: Record<string, string | number | boolean | string[]>;
  aiResponse?: AIWorkflowResponse;
  approvals?: StepApproval[];
  
  // Error handling
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface AIWorkflowResponse {
  stepId: string;
  analysis: string;
  confidence: number;
  reasoning: string[];
  recommendations: string[];
  risks: string[];
  
  // Supporting data
  documentsUsed: string[];
  dataPoints: Record<string, string | number | boolean>;
  alternativeOptions: string[];
  
  // Decision support
  suggestedNextSteps: string[];
  escalationRequired: boolean;
  stakeholdersToNotify: string[];
}

export interface WorkflowDecision {
  id: string;
  stepId: string;
  description: string;
  decidedBy: string;
  decidedAt: Date;
  
  // Decision details
  option: string;
  reasoning: string;
  confidence: number;
  alternativesConsidered: string[];
  
  // Impact analysis
  stakeholdersAffected: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpActions: string[];
}

export interface WorkflowAction {
  id: string;
  stepId: string;
  type: 'email' | 'calendar' | 'task' | 'notification' | 'api_call';
  description: string;
  
  // Execution details
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  scheduledFor: Date;
  executedAt?: Date;
  executedBy?: string;
  
  // Configuration
  config: Record<string, string | number | boolean>;
  recipients?: string[];
  
  // Results
  result?: Record<string, string | number | boolean>;
  error?: string;
}

export interface StepApproval {
  id: string;
  stepId: string;
  approverRole: string;
  approverUserId: string;
  
  // Approval details
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  decision: 'approve' | 'reject' | 'request_changes';
  comments: string;
  approvedAt?: Date;
  
  // Escalation
  escalationLevel: number;
  escalatedTo?: string;
  escalatedAt?: Date;
}

export interface RiskAssessment {
  workflowId: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  
  // Risk categories
  financialRisk: number;
  operationalRisk: number;
  complianceRisk: number;
  reputationalRisk: number;
  strategicRisk: number;
  
  // Risk factors
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  requiredApprovals: string[];
  
  // Monitoring
  monitoringRequired: boolean;
  reviewDate?: Date;
  kpis: string[];
}

export interface RiskFactor {
  id: string;
  category: 'financial' | 'operational' | 'compliance' | 'reputational' | 'strategic';
  description: string;
  likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskScore: number;
  
  // Mitigation
  mitigationActions: string[];
  owner: string;
  dueDate?: Date;
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'resolved';
}

// Workflow Engine Configuration
export interface WorkflowEngineConfig {
  maxConcurrentWorkflows: number;
  defaultTimeout: number; // minutes
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number; // seconds
  };
  
  // AI Configuration
  aiProviders: {
    primary: string;
    fallback: string[];
    confidenceThreshold: number;
  };
  
  // Notification settings
  notifications: {
    email: boolean;
    slack: boolean;
    inApp: boolean;
    sms: boolean;
  };
  
  // Escalation settings
  escalation: {
    enabled: boolean;
    defaultEscalationHours: number;
    maxEscalationLevels: number;
  };
}

// Predefined workflow templates
export const WORKFLOW_TEMPLATES = {
  BUDGET_APPROVAL: 'budget_approval_workflow',
  HIRING_DECISION: 'hiring_decision_workflow',
  STRATEGIC_PLANNING: 'strategic_planning_workflow',
  RISK_ASSESSMENT: 'risk_assessment_workflow',
  PROJECT_APPROVAL: 'project_approval_workflow',
  VENDOR_SELECTION: 'vendor_selection_workflow',
  POLICY_CHANGE: 'policy_change_workflow',
  INCIDENT_RESPONSE: 'incident_response_workflow',
} as const;

export type WorkflowTemplateType = typeof WORKFLOW_TEMPLATES[keyof typeof WORKFLOW_TEMPLATES];
