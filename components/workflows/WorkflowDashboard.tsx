"use client";

/**
 * Advanced Workflow Dashboard
 * Phase 5: Enhanced AI Capabilities & Enterprise Features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, FileText, CheckCircle, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedDuration: number;
  requiresDocuments: boolean;
  minParticipants: number;
  maxParticipants: number;
  tags: string[];
  usageCount: number;
  rating: number;
}

interface WorkflowExecution {
  id: string;
  templateId: string;
  templateName: string;
  sessionId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  currentStep: string;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  participants: string[];
  documentsCount: number;
  decisionsCount?: number;
  awaitingApproval?: boolean;
}

interface WorkflowDashboardProps {
  sessionId?: string;
  onStartWorkflow?: (templateId: string) => void;
}

export default function WorkflowDashboard({ sessionId, onStartWorkflow }: WorkflowDashboardProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');

  useEffect(() => {
    loadWorkflowData();
  }, []);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      
      // Load templates
      const templatesResponse = await fetch('/api/workflows?action=templates');
      const templatesData = await templatesResponse.json();
      setTemplates(templatesData.templates || []);

      // Load executions
      const executionsResponse = await fetch('/api/workflows?action=executions');
      const executionsData = await executionsResponse.json();
      setExecutions((executionsData.executions || []).map((exec: WorkflowExecution) => ({
        ...exec,
        startedAt: new Date(exec.startedAt),
        completedAt: exec.completedAt ? new Date(exec.completedAt) : undefined,
        estimatedCompletion: exec.estimatedCompletion ? new Date(exec.estimatedCompletion) : undefined
      })));
    } catch (error) {
      console.error('Failed to load workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkflow = async (templateId: string) => {
    if (!sessionId) {
      console.error('Session ID required to start workflow');
      return;
    }

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          templateId,
          sessionId,
          context: { startedFromDashboard: true },
          documents: []
        })
      });

      const data = await response.json();
      if (data.execution) {
        await loadWorkflowData(); // Refresh data
        if (onStartWorkflow) {
          onStartWorkflow(templateId);
        }
      }
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
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

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Workflow Automation</h2>
          <p className="text-gray-600 mt-1">
            Intelligent decision workflows with automated analysis and approval processes
          </p>
        </div>
        <Button onClick={loadWorkflowData} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Play className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executions.filter(e => e.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executions.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executions.filter(e => e.awaitingApproval).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-purple-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-bold text-gray-900">2.3h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="history">Workflow History</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    <Badge className={getComplexityColor(template.complexity)}>
                      {template.complexity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Template Details */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(template.estimatedDuration)}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {template.minParticipants}-{template.maxParticipants} people
                      </div>
                      {template.requiresDocuments && (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Documents required
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Usage Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Used {template.usageCount} times</span>
                      <span>★ {template.rating.toFixed(1)}</span>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                      <Button 
                        onClick={() => handleStartWorkflow(template.id)}
                        className="w-full"
                        disabled={!sessionId}
                      >
                        Start Workflow
                      </Button>
                      {!sessionId && (
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Select a session to start workflows
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Workflows Tab */}
        <TabsContent value="active" className="space-y-4">
          {executions.filter(e => e.status === 'in_progress' || e.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Pause className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Workflows</h3>
                <p className="text-gray-600">Start a new workflow from the templates tab</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {executions
                .filter(e => e.status === 'in_progress' || e.status === 'pending')
                .map((execution) => (
                  <Card key={execution.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{execution.templateName}</CardTitle>
                          <CardDescription>
                            Current Step: {execution.currentStep}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{execution.progress}%</span>
                          </div>
                          <Progress value={execution.progress} className="h-2" />
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Started</p>
                            <p className="font-medium">{formatRelativeTime(execution.startedAt)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Participants</p>
                            <p className="font-medium">{execution.participants.length} people</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Documents</p>
                            <p className="font-medium">{execution.documentsCount}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">ETA</p>
                            <p className="font-medium">
                              {execution.estimatedCompletion 
                                ? formatRelativeTime(execution.estimatedCompletion)
                                : 'Unknown'
                              }
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          {execution.awaitingApproval && (
                            <Button size="sm">
                              Review Approval
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {executions
              .filter(e => e.status === 'completed' || e.status === 'failed')
              .map((execution) => (
                <Card key={execution.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{execution.templateName}</h4>
                        <p className="text-sm text-gray-600">
                          {formatRelativeTime(execution.startedAt)} • {execution.participants.length} participants
                        </p>
                        {execution.decisionsCount && (
                          <p className="text-sm text-gray-600">
                            {execution.decisionsCount} decisions made
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                        {execution.completedAt && (
                          <p className="text-sm text-gray-500 mt-1">
                            Duration: {Math.round((execution.completedAt.getTime() - execution.startedAt.getTime()) / (1000 * 60))}m
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
