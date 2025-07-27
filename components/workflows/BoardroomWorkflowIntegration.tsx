"use client";

/**
 * Workflow Integration for Boardroom Sessions
 * Phase 5: Enhanced AI Capabilities & Enterprise Features
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Workflow, 
  Play, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Brain,
  Settings
} from 'lucide-react';
import WorkflowDashboard from './WorkflowDashboard';
import WorkflowExecutionViewer from './WorkflowExecutionViewer';

interface BoardroomWorkflowIntegrationProps {
  sessionId: string;
  scenarioType?: string;
  documents?: string[];
}

export default function BoardroomWorkflowIntegration({ 
  sessionId, 
  scenarioType = 'general',
  documents = [] 
}: BoardroomWorkflowIntegrationProps) {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showExecution, setShowExecution] = useState<string | null>(null);
  const [activeWorkflows] = useState([
    {
      id: 'wf_1737016800000_abc123',
      templateName: 'Budget Approval Workflow',
      currentStep: 'Budget Decision',
      progress: 65,
      status: 'in_progress' as const,
      estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000)
    }
  ]);

  const getRecommendedWorkflows = () => {
    const recommendations = {
      financial: [
        { id: 'budget_approval_workflow', name: 'Budget Approval', description: 'Structured budget review and approval process' },
        { id: 'risk_assessment_workflow', name: 'Financial Risk Assessment', description: 'Comprehensive financial risk analysis' }
      ],
      strategic: [
        { id: 'strategic_planning_workflow', name: 'Strategic Planning', description: 'Long-term strategic planning process' },
        { id: 'project_approval_workflow', name: 'Project Approval', description: 'Project evaluation and approval workflow' }
      ],
      hr: [
        { id: 'hiring_decision_workflow', name: 'Hiring Decision', description: 'Comprehensive hiring evaluation process' }
      ],
      operational: [
        { id: 'vendor_selection_workflow', name: 'Vendor Selection', description: 'Vendor evaluation and selection process' },
        { id: 'project_approval_workflow', name: 'Project Approval', description: 'Project proposal evaluation' }
      ],
      general: [
        { id: 'risk_assessment_workflow', name: 'Risk Assessment', description: 'General risk analysis workflow' },
        { id: 'project_approval_workflow', name: 'Project Approval', description: 'Standard approval process' }
      ]
    };

    return recommendations[scenarioType as keyof typeof recommendations] || recommendations.general;
  };

  const handleStartWorkflow = (templateId: string) => {
    console.log(`Starting workflow ${templateId} for session ${sessionId}`);
    setShowDashboard(false);
    // In real implementation, this would start the workflow via API
  };

  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 0) return 'Overdue';
    if (diffMins < 60) return `${diffMins}m remaining`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div className="space-y-4">
      {/* Quick Workflow Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Workflow className="h-5 w-5 text-purple-500" />
                AI Workflow Automation
              </CardTitle>
              <CardDescription>
                Intelligent decision workflows for structured analysis and approval
              </CardDescription>
            </div>
            <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Workflows
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Workflow Dashboard</DialogTitle>
                  <DialogDescription>
                    Manage and monitor AI-powered decision workflows
                  </DialogDescription>
                </DialogHeader>
                <WorkflowDashboard 
                  sessionId={sessionId} 
                  onStartWorkflow={handleStartWorkflow}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Active Workflows */}
          {activeWorkflows.length > 0 && (
            <div className="space-y-3 mb-4">
              <h4 className="font-medium text-gray-900">Active Workflows</h4>
              {activeWorkflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Play className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{workflow.templateName}</h5>
                      <p className="text-sm text-gray-600">Current: {workflow.currentStep}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${workflow.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{workflow.progress}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatTimeRemaining(workflow.estimatedCompletion)}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowExecution(workflow.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Workflows */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recommended for This Session</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {getRecommendedWorkflows().map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Brain className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{workflow.name}</h5>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleStartWorkflow(workflow.id)}
                    className="flex-shrink-0"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {documents.length} documents ready
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Workflow className="h-3 w-3" />
                AI analysis enabled
              </Badge>
            </div>
            <Button 
              onClick={() => setShowDashboard(true)}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              View All Templates
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Execution Viewer */}
      {showExecution && (
        <Dialog open={!!showExecution} onOpenChange={() => setShowExecution(null)}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Workflow Execution Details</DialogTitle>
              <DialogDescription>
                Monitor and interact with the active workflow
              </DialogDescription>
            </DialogHeader>
            <WorkflowExecutionViewer 
              executionId={showExecution}
              onClose={() => setShowExecution(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
