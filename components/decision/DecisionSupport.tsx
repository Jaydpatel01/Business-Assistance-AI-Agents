"use client";

/**
 * Enhanced Decision Support Component
 * Phase 5: Advanced AI Capabilities & Enterprise Features
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Users,
  DollarSign,
  BarChart3,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { DecisionRecommendation, RiskAssessment, OutcomePrediction, ActionItem } from '@/lib/ai/decision-engine';

interface DecisionSupportProps {
  sessionId: string;
  scenario: string;
  participants: string[];
  isAnalyzing?: boolean;
  recommendation?: DecisionRecommendation;
  onRequestAnalysis: () => void;
}

export default function DecisionSupport({
  sessionId,
  scenario,
  participants,
  isAnalyzing = false,
  recommendation,
  onRequestAnalysis
}: DecisionSupportProps) {
  const [activeTab, setActiveTab] = useState('overview');

  console.log(`🎯 Decision Support: Rendering for session ${sessionId}, scenario: ${scenario}`);

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'proceed': return 'text-green-600 bg-green-50 border-green-200';
      case 'proceed_with_caution': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'defer': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'reject': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'proceed': return <CheckCircle className="h-5 w-5" />;
      case 'proceed_with_caution': return <AlertTriangle className="h-5 w-5" />;
      case 'defer': return <Clock className="h-5 w-5" />;
      case 'reject': return <AlertTriangle className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  if (!recommendation && !isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Decision Support
              </CardTitle>
              <CardDescription>
                Get intelligent analysis, risk assessment, and outcome predictions
              </CardDescription>
            </div>
            <Button onClick={onRequestAnalysis} className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Analyze Decision
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for AI Analysis</h3>
            <p className="text-gray-600 mb-4">
              Get comprehensive decision support including risk assessment, outcome predictions, and actionable recommendations.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Risk Assessment
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Outcome Prediction
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Action Planning
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-500 animate-pulse" />
            AI Decision Analysis in Progress
          </CardTitle>
          <CardDescription>
            Analyzing scenario with advanced AI decision support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Risk Assessment</h4>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-purple-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Outcome Prediction</h4>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Recommendation Generation</h4>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-green-600 h-2 rounded-full w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                This typically takes 10-15 seconds for comprehensive analysis...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Decision Recommendation Header */}
      {recommendation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI Decision Analysis Complete
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis with risk assessment and predictions
                </CardDescription>
              </div>
              <Button variant="outline" onClick={onRequestAnalysis} size="sm">
                Re-analyze
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center justify-between p-4 rounded-lg border ${getRecommendationColor(recommendation.recommendation)}`}>
              <div className="flex items-center space-x-3">
                {getRecommendationIcon(recommendation.recommendation)}
                <div>
                  <h3 className="font-semibold text-lg capitalize">
                    {recommendation.recommendation.replace('_', ' ')}
                  </h3>
                  <p className="text-sm opacity-80">
                    Confidence: {recommendation.confidence}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  Risk Level: {recommendation.riskAssessment.overallRisk.toUpperCase()}
                </div>
                <div className="text-xs opacity-75">
                  Score: {recommendation.riskAssessment.riskScore}/100
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Tabs */}
      {recommendation && (
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="risks" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Risk Analysis
                </TabsTrigger>
                <TabsTrigger value="outcomes" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Predictions
                </TabsTrigger>
                <TabsTrigger value="actions" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Action Plan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-6">
                <div className="space-y-6">
                  {/* Key Reasoning */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Key Reasoning
                    </h4>
                    <div className="space-y-2">
                      {recommendation.reasoning.map((reason, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{recommendation.confidence}%</div>
                      <div className="text-sm text-gray-600">Confidence</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{recommendation.riskAssessment.riskScore}</div>
                      <div className="text-sm text-gray-600">Risk Score</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{recommendation.outcomePrediction.confidence}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{recommendation.actionItems.length}</div>
                      <div className="text-sm text-gray-600">Action Items</div>
                    </div>
                  </div>

                  {/* Business Impact Preview */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Expected Business Impact
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-green-800">Financial</div>
                          <div className="text-green-700">
                            ROI: {recommendation.outcomePrediction.businessImpact.financial.roi.min}-{recommendation.outcomePrediction.businessImpact.financial.roi.max}%
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-green-800">Operational</div>
                          <div className="text-green-700">
                            {recommendation.outcomePrediction.businessImpact.operational.efficiency}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-green-800">Timeline</div>
                          <div className="text-green-700">
                            {recommendation.outcomePrediction.timeToRealization}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risks" className="p-6">
                <RiskAnalysisTab riskAssessment={recommendation.riskAssessment} />
              </TabsContent>

              <TabsContent value="outcomes" className="p-6">
                <OutcomePredictionTab prediction={recommendation.outcomePrediction} />
              </TabsContent>

              <TabsContent value="actions" className="p-6">
                <ActionPlanTab 
                  actionItems={recommendation.actionItems}
                  participants={participants}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Alert */}
      {recommendation?.followUpRequired && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Follow-up Required</AlertTitle>
          <AlertDescription>
            This decision has significant complexity or risk factors that require ongoing monitoring and review. 
            Consider scheduling follow-up sessions to track progress and adjust as needed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Risk Analysis Tab Component
function RiskAnalysisTab({ riskAssessment }: { riskAssessment: RiskAssessment }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
          <div className="text-2xl font-bold text-gray-900">{riskAssessment.riskScore}</div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Risk Score: {riskAssessment.riskScore}/100
        </h3>
        <Badge className={getRiskColor(riskAssessment.overallRisk)}>
          {riskAssessment.overallRisk.toUpperCase()} RISK
        </Badge>
      </div>

      {/* Risk Factors */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Risk Factors</h4>
        <div className="space-y-3">
          {riskAssessment.riskFactors.map((factor, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="capitalize">
                  {factor.category}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Badge className={getRiskColor(factor.impact)} variant="secondary">
                    {factor.impact} impact
                  </Badge>
                  <Badge className={getRiskColor(factor.probability)} variant="secondary">
                    {factor.probability} probability
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-700">{factor.description}</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Severity</span>
                  <span>{factor.severity}/10</span>
                </div>
                <Progress value={factor.severity * 10} className="h-1 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mitigation Strategies */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Mitigation Strategies</h4>
        <div className="space-y-2">
          {riskAssessment.mitigationStrategies.map((strategy, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{strategy}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contingency Plans */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Contingency Plans</h4>
        <div className="space-y-2">
          {riskAssessment.contingencyPlans.map((plan, index) => (
            <div key={index} className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{plan}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Outcome Prediction Tab Component
function OutcomePredictionTab({ prediction }: { prediction: OutcomePrediction }) {
  return (
    <div className="space-y-6">
      {/* Primary Outcome */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
          <div className="text-2xl font-bold text-green-600">{prediction.confidence}%</div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Primary Expected Outcome
        </h3>
        <p className="text-gray-700">{prediction.primaryOutcome}</p>
      </div>

      {/* Alternative Scenarios */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Alternative Scenarios</h4>
        <div className="space-y-3">
          {prediction.alternativeOutcomes.map((outcome, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{outcome.scenario}</h5>
                <Badge variant="outline">{outcome.probability}% probability</Badge>
              </div>
              <p className="text-sm text-gray-700 mb-2">{outcome.description}</p>
              <Badge 
                className={
                  outcome.impact === 'positive' ? 'bg-green-100 text-green-800' :
                  outcome.impact === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {outcome.impact} impact
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Success Factors */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Critical Success Factors</h4>
        <div className="space-y-2">
          {prediction.successFactors.map((factor, index) => (
            <div key={index} className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Business Impact Details */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Detailed Business Impact</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Financial Impact
            </h5>
            <div className="space-y-2 text-sm text-gray-700">
              <div>Revenue: ${prediction.businessImpact.financial.revenue.min.toLocaleString()} - ${prediction.businessImpact.financial.revenue.max.toLocaleString()}</div>
              <div>Costs: ${prediction.businessImpact.financial.costs.min.toLocaleString()} - ${prediction.businessImpact.financial.costs.max.toLocaleString()}</div>
              <div>ROI: {prediction.businessImpact.financial.roi.min}% - {prediction.businessImpact.financial.roi.max}%</div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Operational Impact
            </h5>
            <div className="space-y-2 text-sm text-gray-700">
              <div>{prediction.businessImpact.operational.efficiency}</div>
              <div>{prediction.businessImpact.operational.resources}</div>
              <div>{prediction.businessImpact.operational.timeline}</div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              Strategic Impact
            </h5>
            <div className="space-y-2 text-sm text-gray-700">
              <div>{prediction.businessImpact.strategic.marketPosition}</div>
              <div>{prediction.businessImpact.strategic.competitiveAdvantage}</div>
              <div>{prediction.businessImpact.strategic.longTermValue}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Action Plan Tab Component
function ActionPlanTab({ actionItems, participants }: { actionItems: ActionItem[]; participants: string[] }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedActionItems = [...actionItems].sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Action Items ({actionItems.length})</h4>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          {participants.length} participants available
        </div>
      </div>

      <div className="space-y-4">
        {sortedActionItems.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">{item.description}</h5>
                  {item.assignee && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-3 w-3" />
                      <span>Assigned to: {item.assignee}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge className={getPriorityColor(item.priority)}>
                {item.priority}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                {item.deadline && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>Due: {(() => {
                      try {
                        const date = new Date(item.deadline);
                        return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
                      } catch {
                        return 'Invalid date';
                      }
                    })()}</span>
                  </div>
                )}
                {item.dependencies.length > 0 && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <ArrowRight className="h-3 w-3" />
                    <span>Depends on: {item.dependencies.length} item(s)</span>
                  </div>
                )}
              </div>
              <Button size="sm" variant="outline">
                Start Task
              </Button>
            </div>

            {item.dependencies.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Dependencies:</div>
                <div className="flex flex-wrap gap-1">
                  {item.dependencies.map((dep, depIndex) => (
                    <Badge key={depIndex} variant="outline" className="text-xs">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="text-sm text-gray-600 text-center">
          <Clock className="h-4 w-4 inline mr-1" />
          Estimated completion time: 2-4 weeks depending on complexity
        </div>
      </div>
    </div>
  );
}
