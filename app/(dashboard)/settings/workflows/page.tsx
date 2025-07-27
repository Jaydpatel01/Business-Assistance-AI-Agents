"use client";

/**
 * Workflow Settings & Templates Page
 * Phase 5: Enhanced AI Capabilities & Enterprise Features
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Workflow, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  FileText,
  Brain,
  CheckCircle,
  AlertTriangle,
  Copy
} from 'lucide-react';
import WorkflowDashboard from '@/components/workflows/WorkflowDashboard';

export default function WorkflowSettings() {
  const [activeTab, setActiveTab] = useState('templates');
  const [engineSettings, setEngineSettings] = useState({
    maxConcurrentWorkflows: 100,
    defaultTimeout: 60,
    retryMaxAttempts: 3,
    retryBackoffMultiplier: 2,
    aiConfidenceThreshold: 0.7,
    enableEmailNotifications: true,
    enableSlackNotifications: false,
    enableInAppNotifications: true,
    escalationEnabled: true,
    escalationHours: 24,
    maxEscalationLevels: 3
  });

  const [templates] = useState([
    {
      id: 'budget_approval_workflow',
      name: 'Budget Approval Workflow',
      description: 'Standard workflow for budget approval processes',
      category: 'financial',
      complexity: 'moderate' as const,
      estimatedDuration: 120,
      isActive: true,
      isPublic: true,
      usageCount: 156,
      rating: 4.5,
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      steps: 3
    },
    {
      id: 'hiring_decision_workflow',
      name: 'Hiring Decision Workflow',
      description: 'Comprehensive workflow for hiring decisions',
      category: 'hr',
      complexity: 'complex' as const,
      estimatedDuration: 180,
      isActive: true,
      isPublic: true,
      usageCount: 89,
      rating: 4.3,
      lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      steps: 5
    },
    {
      id: 'risk_assessment_workflow',
      name: 'Risk Assessment Workflow',
      description: 'Comprehensive risk analysis and mitigation planning',
      category: 'compliance',
      complexity: 'moderate' as const,
      estimatedDuration: 90,
      isActive: true,
      isPublic: false,
      usageCount: 78,
      rating: 4.4,
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      steps: 4
    }
  ]);

  const handleSettingsChange = (setting: string, value: string | number | boolean) => {
    setEngineSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <FileText className="h-4 w-4 text-green-500" />;
      case 'hr': return <Users className="h-4 w-4 text-blue-500" />;
      case 'compliance': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'strategic': return <Brain className="h-4 w-4 text-orange-500" />;
      case 'operational': return <Settings className="h-4 w-4 text-gray-500" />;
      default: return <Workflow className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure AI workflow automation, templates, and engine settings
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="engine">Engine Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Workflow Templates</h2>
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Search templates..." 
                className="w-64"
              />
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      {getCategoryIcon(template.category)}
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge className={getComplexityColor(template.complexity)}>
                        {template.complexity}
                      </Badge>
                      {template.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Template Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(template.estimatedDuration)}
                      </div>
                      <div className="flex items-center">
                        <Workflow className="h-4 w-4 mr-1" />
                        {template.steps} steps
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {template.usageCount} uses
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        ★ {template.rating}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center text-sm ${template.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${template.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {template.isActive ? 'Active' : 'Inactive'}
                      </div>
                      <span className="text-sm text-gray-500">
                        Modified {template.lastModified.toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Copy className="h-3 w-3" />
                        Clone
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <WorkflowDashboard />
        </TabsContent>

        {/* Engine Settings Tab */}
        <TabsContent value="engine" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Engine Configuration</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Performance Settings
                  </CardTitle>
                  <CardDescription>
                    Configure workflow engine performance parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="maxConcurrent">Max Concurrent Workflows</Label>
                    <Input
                      id="maxConcurrent"
                      type="number"
                      value={engineSettings.maxConcurrentWorkflows}
                      onChange={(e) => handleSettingsChange('maxConcurrentWorkflows', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultTimeout">Default Timeout (minutes)</Label>
                    <Input
                      id="defaultTimeout"
                      type="number"
                      value={engineSettings.defaultTimeout}
                      onChange={(e) => handleSettingsChange('defaultTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="retryAttempts">Max Retry Attempts</Label>
                    <Input
                      id="retryAttempts"
                      type="number"
                      value={engineSettings.retryMaxAttempts}
                      onChange={(e) => handleSettingsChange('retryMaxAttempts', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* AI Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure AI analysis and decision support
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="confidenceThreshold">AI Confidence Threshold</Label>
                    <Input
                      id="confidenceThreshold"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={engineSettings.aiConfidenceThreshold}
                      onChange={(e) => handleSettingsChange('aiConfidenceThreshold', parseFloat(e.target.value))}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Minimum confidence level required for AI recommendations
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how workflow notifications are delivered
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Switch
                      id="emailNotifications"
                      checked={engineSettings.enableEmailNotifications}
                      onCheckedChange={(checked) => handleSettingsChange('enableEmailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slackNotifications">Slack Notifications</Label>
                    <Switch
                      id="slackNotifications"
                      checked={engineSettings.enableSlackNotifications}
                      onCheckedChange={(checked) => handleSettingsChange('enableSlackNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                    <Switch
                      id="inAppNotifications"
                      checked={engineSettings.enableInAppNotifications}
                      onCheckedChange={(checked) => handleSettingsChange('enableInAppNotifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Escalation Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Escalation Settings
                  </CardTitle>
                  <CardDescription>
                    Configure automatic escalation policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="escalationEnabled">Enable Escalation</Label>
                    <Switch
                      id="escalationEnabled"
                      checked={engineSettings.escalationEnabled}
                      onCheckedChange={(checked) => handleSettingsChange('escalationEnabled', checked)}
                    />
                  </div>
                  {engineSettings.escalationEnabled && (
                    <>
                      <div>
                        <Label htmlFor="escalationHours">Escalation Timeout (hours)</Label>
                        <Input
                          id="escalationHours"
                          type="number"
                          value={engineSettings.escalationHours}
                          onChange={(e) => handleSettingsChange('escalationHours', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxEscalationLevels">Max Escalation Levels</Label>
                        <Input
                          id="maxEscalationLevels"
                          type="number"
                          value={engineSettings.maxEscalationLevels}
                          onChange={(e) => handleSettingsChange('maxEscalationLevels', parseInt(e.target.value))}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Save Settings */}
            <div className="flex justify-end pt-6">
              <Button className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Workflow className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Total Templates</p>
                    <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Active Templates</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {templates.filter(t => t.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-purple-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Total Usage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Performance</CardTitle>
              <CardDescription>Usage statistics and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(template.category)}
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <p className="text-gray-600">Usage</p>
                        <p className="font-medium">{template.usageCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Rating</p>
                        <p className="font-medium">★ {template.rating}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Duration</p>
                        <p className="font-medium">{formatDuration(template.estimatedDuration)}</p>
                      </div>
                    </div>
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
