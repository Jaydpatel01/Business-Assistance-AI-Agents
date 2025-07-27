"use client";

/**
 * Workflow Execution Viewer
 * Phase 5: Enhanced AI Capabilities & Enterprise Features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  ArrowRight,
  Brain,
  TrendingUp
} from 'lucide-react';
import WorkflowStep from './WorkflowStep';

interface StepHistoryItem {
  stepId: string;
  name: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  aiResponse?: {
    analysis: string;
    confidence: number;
    recommendations: string[];
    risks: string[];
  };
}

interface WorkflowExecutionDetail {
  id: string;
  templateId: string;
  templateName: string;
  sessionId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  
  currentStep: {
    id: string;
    name: string;
    type: string;
    status: string;
    startedAt: Date;
    description: string;
  };
  
  stepHistory: Array<{
    stepId: string;
    name: string;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    aiResponse?: {
      analysis: string;
      confidence: number;
      recommendations: string[];
      risks: string[];
    };
  }>;
  
  participants: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  
  documents: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  
  context: Record<string, string | number | boolean>;
  
  timeline: {
    startedAt: Date;
    estimatedCompletion: Date;
    steps: Array<{
      name: string;
      completed?: boolean;
      current?: boolean;
      pending?: boolean;
      estimatedDuration: number;
    }>;
  };
}

interface WorkflowExecutionViewerProps {
  executionId: string;
  onClose?: () => void;
}

export default function WorkflowExecutionViewer({ executionId, onClose }: WorkflowExecutionViewerProps) {
  const [execution, setExecution] = useState<WorkflowExecutionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/workflows?action=execution&executionId=${executionId}`);
        const data = await response.json();
        
        if (data.execution) {
          setExecution({
            ...data.execution,
            currentStep: {
              ...data.execution.currentStep,
              startedAt: new Date(data.execution.currentStep.startedAt)
            },
            stepHistory: data.execution.stepHistory.map((step: StepHistoryItem) => ({
              ...step,
              startedAt: new Date(step.startedAt),
              completedAt: step.completedAt ? new Date(step.completedAt) : undefined
            })),
            timeline: {
              ...data.execution.timeline,
              startedAt: new Date(data.execution.timeline.startedAt),
              estimatedCompletion: new Date(data.execution.timeline.estimatedCompletion)
            }
          });
        }
      } catch (error) {
        console.error('Failed to load execution details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [executionId]);

  const loadExecutionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflows?action=execution&executionId=${executionId}`);
      const data = await response.json();
      
      if (data.execution) {
        setExecution({
          ...data.execution,
          currentStep: {
            ...data.execution.currentStep,
            startedAt: new Date(data.execution.currentStep.startedAt)
          },
          stepHistory: data.execution.stepHistory.map((step: StepHistoryItem) => ({
            ...step,
            startedAt: new Date(step.startedAt),
            completedAt: step.completedAt ? new Date(step.completedAt) : undefined
          })),
          timeline: {
            ...data.execution.timeline,
            startedAt: new Date(data.execution.timeline.startedAt),
            estimatedCompletion: new Date(data.execution.timeline.estimatedCompletion)
          }
        });
      }
    } catch (error) {
      console.error('Failed to load execution details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDecision = async (decision: string, reasoning: string) => {
    if (!execution) return;
    
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decision',
          executionId: execution.id,
          stepId: execution.currentStep.id,
          decision,
          reasoning
        })
      });

      if (response.ok) {
        await loadExecutionDetails(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to submit decision:', error);
    }
  };

  const handleSubmitApproval = async (approval: 'approve' | 'reject' | 'request_changes', comments: string) => {
    if (!execution) return;
    
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approval',
          executionId: execution.id,
          stepId: execution.currentStep.id,
          approval,
          comments
        })
      });

      if (response.ok) {
        await loadExecutionDetails(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to submit approval:', error);
    }
  };

  const formatDuration = (startedAt: Date, completedAt?: Date) => {
    const end = completedAt || new Date();
    const durationMs = end.getTime() - startedAt.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!execution) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow Not Found</h3>
          <p className="text-gray-600">The requested workflow execution could not be found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {execution.templateName}
            <Badge className={getStatusColor(execution.status)}>
              {execution.status.replace('_', ' ')}
            </Badge>
          </h2>
          <p className="text-gray-600 mt-1">
            Execution ID: {execution.id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadExecutionDetails} variant="outline" size="sm">
            Refresh
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Overall Progress</h3>
              <span className="text-sm font-medium text-gray-600">{execution.progress}%</span>
            </div>
            <Progress value={execution.progress} className="h-3" />
            
            {/* Current Step */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Current Step:</span>
                <span>{execution.currentStep.name}</span>
              </div>
              <div className="text-gray-600">
                Started {formatDuration(execution.currentStep.startedAt)} ago
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="current">Current Step</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="context">Context</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {execution.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <span className="font-medium">{participant.name}</span>
                      <Badge variant="secondary">{participant.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {execution.documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between">
                      <span className="font-medium text-sm">{document.name}</span>
                      <Badge variant="outline">{document.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Workflow Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {execution.timeline.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : step.current ? (
                        <Play className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${step.current ? 'text-blue-600' : ''}`}>
                          {step.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {step.estimatedDuration}m
                        </span>
                      </div>
                    </div>
                    {index < execution.timeline.steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Step Tab */}
        <TabsContent value="current">
          <WorkflowStep
            executionId={execution.id}
            stepId={execution.currentStep.id}
            stepName={execution.currentStep.name}
            stepType={execution.currentStep.type as 'ai_analysis' | 'decision_point' | 'approval' | 'action' | 'condition' | 'escalation'}
            description={execution.currentStep.description}
            status={execution.currentStep.status as 'pending' | 'in_progress' | 'completed' | 'failed'}
            requiresDecision={execution.currentStep.type === 'decision_point'}
            requiresApproval={execution.currentStep.type === 'approval'}
            onSubmitDecision={handleSubmitDecision}
            onSubmitApproval={handleSubmitApproval}
          />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          {execution.stepHistory.map((step) => (
            <Card key={step.stepId}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">{step.name}</h4>
                      <Badge className={getStatusColor(step.status)}>
                        {step.status}
                      </Badge>
                    </div>
                    
                    {step.aiResponse && (
                      <div className="mt-3 space-y-2">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-purple-500" />
                            <span className="font-medium text-sm">AI Analysis</span>
                            <span className="text-sm text-gray-600">
                              Confidence: {Math.round(step.aiResponse.confidence * 100)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{step.aiResponse.analysis}</p>
                        </div>
                        
                        {step.aiResponse.recommendations.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              Recommendations:
                            </p>
                            <ul className="text-sm text-gray-600 ml-5 mt-1">
                              {step.aiResponse.recommendations.map((rec, i) => (
                                <li key={i} className="list-disc">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-gray-600">
                    <p>Started: {step.startedAt.toLocaleTimeString()}</p>
                    {step.completedAt && (
                      <p>Duration: {formatDuration(step.startedAt, step.completedAt)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Context Tab */}
        <TabsContent value="context">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Context & Data</CardTitle>
              <CardDescription>
                Key data points and context used throughout the workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(execution.context).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-900 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-600 font-mono text-sm">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
