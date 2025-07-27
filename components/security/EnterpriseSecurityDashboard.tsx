/**
 * Enterprise Security Dashboard
 * Phase 5.2: Enterprise Security & Integration
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Key,
  FileText,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  activeSessions: number;
  failedLoginAttempts: number;
  suspiciousActivity: number;
  complianceScore: number;
  lastSecurityIncident?: Date;
}

interface ComplianceReport {
  organizationId: string;
  period: { start: Date; end: Date };
  summary: {
    totalSessions: number;
    totalUsers: number;
    securityIncidents: number;
    complianceScore: number;
  };
  findings: ComplianceFinding[];
  recommendations: string[];
}

interface ComplianceFinding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  recommendation: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  level: 'organization' | 'team' | 'individual';
  isActive: boolean;
}

export default function EnterpriseSecurityDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Load security data
  const loadSecurityData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/security/audit');
      if (!response.ok) {
        throw new Error('Failed to load security data');
      }

      const data = await response.json();
      if (data.success) {
        setSecurityMetrics(data.data.securityMetrics);
        setComplianceReport(data.data.complianceReport);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadRBACData = useCallback(async () => {
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        fetch('/api/security/rbac?action=roles'),
        fetch('/api/security/rbac?action=permissions')
      ]);

      if (rolesRes.ok && permissionsRes.ok) {
        const rolesData = await rolesRes.json();
        
        if (rolesData.success) setRoles(rolesData.data);
      }
    } catch (error) {
      console.error('Error loading RBAC data:', error);
    }
  }, []);

  useEffect(() => {
    loadSecurityData();
    loadRBACData();
  }, [loadSecurityData, loadRBACData]);

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Validation Error",
        description: "Please select both user and role",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/security/rbac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign-role',
          userId: selectedUser,
          roleId: selectedRole
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Role assigned successfully"
        });
        setSelectedUser('');
        setSelectedRole('');
      } else {
        throw new Error(data.error || 'Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign role",
        variant: "destructive"
      });
    }
  };

  const exportComplianceReport = () => {
    if (!complianceReport) return;

    const dataStr = JSON.stringify(complianceReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Compliance report downloaded successfully"
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security metrics, compliance status, and access controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadSecurityData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={exportComplianceReport}
            disabled={!complianceReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.activeSessions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityMetrics?.failedLoginAttempts || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {securityMetrics?.suspiciousActivity || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceScoreColor(securityMetrics?.complianceScore || 0)}`}>
              {securityMetrics?.complianceScore || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="rbac">Access Control</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Report
              </CardTitle>
              <CardDescription>
                Security compliance status and findings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceReport ? (
                <div className="space-y-4">
                  {/* Report Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <div className="text-2xl font-bold">{complianceReport.summary.totalSessions}</div>
                      <div className="text-sm text-muted-foreground">Total Sessions</div>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <div className="text-2xl font-bold">{complianceReport.summary.totalUsers}</div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{complianceReport.summary.securityIncidents}</div>
                      <div className="text-sm text-muted-foreground">Security Incidents</div>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <div className={`text-2xl font-bold ${getComplianceScoreColor(complianceReport.summary.complianceScore)}`}>
                        {complianceReport.summary.complianceScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Compliance Score</div>
                    </div>
                  </div>

                  {/* Security Findings */}
                  {complianceReport.findings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Security Findings</h3>
                      <div className="space-y-3">
                        {complianceReport.findings.map((finding, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{finding.description}</h4>
                              <Badge variant={getSeverityColor(finding.severity)}>
                                {finding.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {finding.recommendation}
                            </p>
                            {finding.evidence.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <strong>Evidence:</strong> {finding.evidence.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {complianceReport.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {complianceReport.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No compliance data available. Click Refresh to load data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RBAC Tab */}
        <TabsContent value="rbac" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Role Assignment
                </CardTitle>
                <CardDescription>
                  Assign roles to users for access control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="user-select">User ID</Label>
                  <Input
                    id="user-select"
                    placeholder="Enter user ID"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role-select">Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={assignRole} className="w-full">
                  Assign Role
                </Button>
              </CardContent>
            </Card>

            {/* Available Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Available Roles
                </CardTitle>
                <CardDescription>
                  System roles and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div key={role.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{role.name}</h4>
                        <Badge variant="outline">{role.level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {role.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Permissions:</strong> {role.permissions.length} granted
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Security Audit Trail
              </CardTitle>
              <CardDescription>
                Recent security events and access logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Audit logs will be displayed here</p>
                <p className="text-sm">Real-time security events and user activities</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure enterprise security policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Security configuration panel</p>
                <p className="text-sm">Password policies, session timeouts, and more</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
