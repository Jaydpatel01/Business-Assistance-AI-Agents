"use client";

/**
 * Interactive Workflow Step Component
 * Phase 5: Enhanced AI Capabilities & Enterprise Features
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Users, 
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';

interface AIResponse {
  analysis: string;
  confidence: number;
  recommendations: string[];
  risks: string[];
}

interface WorkflowStepProps {
  executionId: string;
  stepId: string;
  stepName: string;
  stepType: 'ai_analysis' | 'decision_point' | 'approval' | 'action' | 'condition' | 'escalation';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  aiResponse?: AIResponse;
  requiresDecision?: boolean;
  requiresApproval?: boolean;
  onSubmitDecision?: (decision: string, reasoning: string) => void;
  onSubmitApproval?: (approval: 'approve' | 'reject' | 'request_changes', comments: string) => void;
}

export default function WorkflowStep({
  stepName,
  stepType,
  description,
  status,
  aiResponse,
  requiresDecision,
  requiresApproval,
  onSubmitDecision,
  onSubmitApproval
}: WorkflowStepProps) {
  const [decision, setDecision] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [approvalDecision, setApprovalDecision] = useState<'approve' | 'reject' | 'request_changes' | ''>('');
  const [approvalComments, setApprovalComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitDecision = async () => {
    if (!decision.trim() || !onSubmitDecision) return;
    
    setSubmitting(true);
    try {
      await onSubmitDecision(decision, reasoning);
      setDecision('');
      setReasoning('');
    } catch (error) {
      console.error('Failed to submit decision:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApproval = async () => {
    if (!approvalDecision || !onSubmitApproval) return;
    
    setSubmitting(true);
    try {
      await onSubmitApproval(approvalDecision, approvalComments);
      setApprovalDecision('');
      setApprovalComments('');
    } catch (error) {
      console.error('Failed to submit approval:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepTypeIcon = () => {
    switch (stepType) {
      case 'ai_analysis':
        return <Brain className="h-5 w-5 text-purple-500" />;
      case 'decision_point':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'approval':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'action':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getStepTypeIcon()}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {stepName}
                {getStatusIcon()}
              </CardTitle>
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Analysis Results */}
        {aiResponse && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Analysis Results
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Confidence:</span>
                <span className={`font-semibold ${getConfidenceColor(aiResponse.confidence)}`}>
                  {Math.round(aiResponse.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">{aiResponse.analysis}</p>
            </div>

            {/* Confidence Bar */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>AI Confidence Level</span>
                <span>{Math.round(aiResponse.confidence * 100)}%</span>
              </div>
              <Progress 
                value={aiResponse.confidence * 100} 
                className="h-2"
              />
            </div>

            {/* Recommendations */}
            {aiResponse.recommendations.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Recommendations
                </h5>
                <ul className="space-y-1">
                  {aiResponse.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {aiResponse.risks.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Identified Risks
                </h5>
                <ul className="space-y-1">
                  {aiResponse.risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Decision Input */}
        {requiresDecision && status === 'in_progress' && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Make Decision
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decision
                  </label>
                  <Textarea
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    placeholder="Enter your decision..."
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reasoning (Optional)
                  </label>
                  <Textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="Explain your reasoning..."
                    className="min-h-[60px]"
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitDecision}
                  disabled={!decision.trim() || submitting}
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Decision'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Approval Input */}
        {requiresApproval && status === 'in_progress' && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Approval Required
              </h4>
              
              <div className="space-y-4">
                {/* Approval Options */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={approvalDecision === 'approve' ? 'default' : 'outline'}
                    onClick={() => setApprovalDecision('approve')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant={approvalDecision === 'reject' ? 'default' : 'outline'}
                    onClick={() => setApprovalDecision('reject')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant={approvalDecision === 'request_changes' ? 'default' : 'outline'}
                    onClick={() => setApprovalDecision('request_changes')}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Changes
                  </Button>
                </div>
                
                {/* Comments */}
                {approvalDecision && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comments {approvalDecision === 'request_changes' ? '(Required)' : '(Optional)'}
                    </label>
                    <Textarea
                      value={approvalComments}
                      onChange={(e) => setApprovalComments(e.target.value)}
                      placeholder={
                        approvalDecision === 'approve' 
                          ? 'Add any comments about your approval...'
                          : approvalDecision === 'reject'
                          ? 'Explain why you are rejecting...'
                          : 'Specify what changes are needed...'
                      }
                      className="min-h-[80px]"
                    />
                  </div>
                )}
                
                <Button 
                  onClick={handleSubmitApproval}
                  disabled={
                    !approvalDecision || 
                    (approvalDecision === 'request_changes' && !approvalComments.trim()) ||
                    submitting
                  }
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : `Submit ${approvalDecision.replace('_', ' ')}`}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Completed Status */}
        {status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-800">Step Completed</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              This workflow step has been successfully completed.
            </p>
          </div>
        )}

        {/* Failed Status */}
        {status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-800">Step Failed</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              This workflow step encountered an error and needs attention.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
