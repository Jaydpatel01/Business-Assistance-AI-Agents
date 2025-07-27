/**
 * Enterprise Security Framework
 * Phase 5: Advanced AI Capabilities & Enterprise Features
 */

import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { randomBytes } from 'crypto';

export interface SecurityContext {
  userId: string;
  organizationId: string;
  role: 'admin' | 'executive' | 'manager' | 'analyst' | 'viewer';
  permissions: string[];
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface SecurityPolicy {
  requireMFA: boolean;
  allowedIPRanges?: string[];
  sessionTimeout: number; // minutes
  passwordPolicy: PasswordPolicy;
  dataRetention: DataRetentionPolicy;
  auditLevel: 'minimal' | 'standard' | 'comprehensive';
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAge: number; // days
  preventReuse: number; // last N passwords
}

export interface DataRetentionPolicy {
  sessionData: number; // days
  auditLogs: number; // days
  documentStorage: number; // days
  analyticsData: number; // days
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  organizationId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: Record<string, unknown>;
  riskScore?: number;
}

export interface ComplianceReport {
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

export interface ComplianceFinding {
  category: 'access_control' | 'data_protection' | 'audit_trail' | 'user_management';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  recommendation: string;
}

export class EnterpriseSecurityManager {
  private readonly jwtSecret: Uint8Array;
  private readonly encryptionKey: Uint8Array;
  private auditEvents: AuditEvent[] = [];

  constructor() {
    // In production, these would come from secure environment variables
    this.jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
    this.encryptionKey = new TextEncoder().encode(process.env.ENCRYPTION_KEY || 'default-encryption-key');
  }

  /**
   * Authenticate and authorize user request
   */
  async authenticateRequest(request: NextRequest): Promise<SecurityContext | null> {
    try {
      console.log('🔐 Security: Authenticating request');

      const token = this.extractBearerToken(request);
      if (!token) {
        console.log('❌ Security: No authentication token found');
        return null;
      }

      const payload = await this.verifyJWT(token);
      if (!payload) {
        console.log('❌ Security: Invalid or expired token');
        return null;
      }

      const context: SecurityContext = {
        userId: payload.userId as string,
        organizationId: payload.organizationId as string,
        role: payload.role as SecurityContext['role'],
        permissions: payload.permissions as string[],
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: payload.sessionId as string
      };

      // Validate security constraints
      const isValid = this.validateSecurityConstraints(context);
      if (!isValid) {
        await this.logAuditEvent({
          userId: context.userId,
          organizationId: context.organizationId,
          action: 'authentication_failed',
          resource: 'api_access',
          ipAddress: context.ipAddress || 'unknown',
          userAgent: context.userAgent || 'unknown',
          success: false,
          details: { reason: 'security_constraints_violated' }
        });
        return null;
      }

      await this.logAuditEvent({
        userId: context.userId,
        organizationId: context.organizationId,
        action: 'authentication_success',
        resource: 'api_access',
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent || 'unknown',
        success: true
      });

      console.log(`✅ Security: Authenticated user ${context.userId} with role ${context.role}`);
      return context;

    } catch (error) {
      console.error('❌ Security: Authentication error:', error);
      return null;
    }
  }

  /**
   * Generate secure JWT token for authenticated user
   */
  async generateSecureToken(user: {
    userId: string;
    organizationId: string;
    role: string;
    permissions: string[];
  }): Promise<string> {
    console.log(`🔑 Security: Generating token for user ${user.userId}`);

    const sessionId = this.generateSessionId();
    const payload = {
      userId: user.userId,
      organizationId: user.organizationId,
      role: user.role,
      permissions: user.permissions,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(this.jwtSecret);

    return token;
  }

  /**
   * Check if user has required permission for action
   */
  async checkPermission(context: SecurityContext, permission: string, resource?: string): Promise<boolean> {
    console.log(`🔒 Security: Checking permission ${permission} for user ${context.userId}`);

    // Super admin has all permissions
    if (context.role === 'admin') {
      return true;
    }

    // Check explicit permissions
    if (context.permissions.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    const rolePermissions = this.getRolePermissions(context.role);
    if (rolePermissions.includes(permission)) {
      return true;
    }

    // Log permission denial
    await this.logAuditEvent({
      userId: context.userId,
      organizationId: context.organizationId,
      action: 'permission_denied',
      resource: resource || 'unknown',
      ipAddress: context.ipAddress || 'unknown',
      userAgent: context.userAgent || 'unknown',
      success: false,
      details: { permission, role: context.role }
    });

    console.log(`❌ Security: Permission ${permission} denied for user ${context.userId}`);
    return false;
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(data: string): Promise<string> {
    console.log('🔐 Security: Encrypting sensitive data');
    
    // Simple XOR encryption for demo - use proper encryption in production
    const encrypted = Buffer.from(data)
      .map((byte, index) => byte ^ this.encryptionKey[index % this.encryptionKey.length]);
    
    return Buffer.from(encrypted).toString('base64');

    return Buffer.from(encrypted).toString('base64');
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData: string): Promise<string> {
    console.log('🔓 Security: Decrypting sensitive data');
    
    // Simple XOR decryption for demo - use proper decryption in production
    const decrypted = Buffer.from(encryptedData, 'base64')
      .map((byte, index) => byte ^ this.encryptionKey[index % this.encryptionKey.length])
      .toString();

    return decrypted;
  }

  /**
   * Generate compliance report for organization
   */
  async generateComplianceReport(organizationId: string, days: number = 30): Promise<ComplianceReport> {
    console.log(`📊 Security: Generating compliance report for org ${organizationId}`);

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    const relevantEvents = this.auditEvents.filter(event => 
      event.organizationId === organizationId &&
      event.timestamp >= startDate &&
      event.timestamp <= endDate
    );

    const summary = {
      totalSessions: relevantEvents.filter(e => e.action === 'session_created').length,
      totalUsers: new Set(relevantEvents.map(e => e.userId)).size,
      securityIncidents: relevantEvents.filter(e => !e.success).length,
      complianceScore: this.calculateComplianceScore(relevantEvents)
    };

    const findings = this.analyzeComplianceFindings(relevantEvents);
    const recommendations = this.generateComplianceRecommendations(findings);

    return {
      organizationId,
      period: { start: startDate, end: endDate },
      summary,
      findings,
      recommendations
    };
  }

  /**
   * Log security audit event
   */
  async logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'riskScore'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      riskScore: this.calculateRiskScore(event)
    };

    this.auditEvents.push(auditEvent);
    console.log(`📝 Security: Logged audit event ${auditEvent.id}: ${auditEvent.action}`);

    // In production, persist to secure audit database
    // await this.persistAuditEvent(auditEvent);
  }

  /**
   * Get security dashboard metrics
   */
  async getSecurityMetrics(organizationId: string): Promise<{
    activeSessions: number;
    failedLoginAttempts: number;
    suspiciousActivity: number;
    complianceScore: number;
    lastSecurityIncident?: Date;
  }> {
    const recentEvents = this.auditEvents.filter(event => 
      event.organizationId === organizationId &&
      event.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );

    const activeSessions = recentEvents.filter(e => e.action === 'session_created').length;
    const failedLoginAttempts = recentEvents.filter(e => e.action === 'authentication_failed').length;
    const suspiciousActivity = recentEvents.filter(e => e.riskScore && e.riskScore > 70).length;
    const complianceScore = this.calculateComplianceScore(recentEvents);

    const securityIncidents = recentEvents.filter(e => !e.success);
    const lastSecurityIncident = securityIncidents.length > 0 
      ? new Date(Math.max(...securityIncidents.map(e => e.timestamp.getTime())))
      : undefined;

    return {
      activeSessions,
      failedLoginAttempts,
      suspiciousActivity,
      complianceScore,
      lastSecurityIncident
    };
  }

  // Private helper methods

  private extractBearerToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  private async verifyJWT(token: string): Promise<Record<string, unknown> | null> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret);
      return payload;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    return forwarded?.split(',')[0].trim() || realIP || 'unknown';
  }

  private validateSecurityConstraints(context: SecurityContext): boolean {
    // In production, implement:
    // - IP whitelist validation
    // - Rate limiting
    // - Device fingerprinting
    // - Geolocation checks
    // - Time-based access controls

    console.log(`🔍 Security: Validating constraints for user ${context.userId}`);
    return true; // Simplified for demo
  }

  private getRolePermissions(role: string): string[] {
    const permissions = {
      admin: ['*'], // All permissions
      executive: ['read:all', 'write:decisions', 'read:analytics', 'manage:sessions'],
      manager: ['read:team', 'write:sessions', 'read:analytics'],
      analyst: ['read:data', 'write:analysis', 'read:sessions'],
      viewer: ['read:basic']
    };

    return permissions[role as keyof typeof permissions] || [];
  }

  private generateSessionId(): string {
    return randomBytes(16).toString('hex');
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${randomBytes(8).toString('hex')}`;
  }

  private calculateRiskScore(event: Omit<AuditEvent, 'id' | 'timestamp' | 'riskScore'>): number {
    let score = 0;

    // Failed actions increase risk
    if (!event.success) score += 40;

    // Suspicious actions
    if (['authentication_failed', 'permission_denied', 'unauthorized_access'].includes(event.action)) {
      score += 30;
    }

    // Administrative actions have inherent risk
    if (['user_created', 'permission_changed', 'data_exported'].includes(event.action)) {
      score += 20;
    }

    return Math.min(100, score);
  }

  private calculateComplianceScore(events: AuditEvent[]): number {
    if (events.length === 0) return 100;

    const successfulEvents = events.filter(e => e.success).length;
    const baseScore = (successfulEvents / events.length) * 100;

    // Deduct points for security incidents
    const securityIncidents = events.filter(e => e.riskScore && e.riskScore > 70).length;
    const deduction = Math.min(30, securityIncidents * 5);

    return Math.max(0, baseScore - deduction);
  }

  private analyzeComplianceFindings(events: AuditEvent[]): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];

    // Check for failed authentication attempts
    const failedAuth = events.filter(e => e.action === 'authentication_failed');
    if (failedAuth.length > 10) {
      findings.push({
        category: 'access_control',
        severity: 'medium',
        description: `High number of failed authentication attempts: ${failedAuth.length}`,
        evidence: failedAuth.slice(0, 5).map(e => `${e.timestamp.toISOString()}: ${e.ipAddress}`),
        recommendation: 'Implement rate limiting and account lockout policies'
      });
    }

    // Check for permission violations
    const permissionDenied = events.filter(e => e.action === 'permission_denied');
    if (permissionDenied.length > 5) {
      findings.push({
        category: 'access_control',
        severity: 'low',
        description: `Multiple permission violations detected: ${permissionDenied.length}`,
        evidence: permissionDenied.slice(0, 3).map(e => `${e.userId}: ${e.details?.permission || 'unknown'}`),
        recommendation: 'Review user permissions and provide additional training'
      });
    }

    return findings;
  }

  private generateComplianceRecommendations(findings: ComplianceFinding[]): string[] {
    const recommendations = [
      'Enable multi-factor authentication for all users',
      'Implement regular security training programs',
      'Conduct quarterly access reviews',
      'Enable real-time security monitoring'
    ];

    // Add specific recommendations based on findings
    if (findings.some(f => f.category === 'access_control')) {
      recommendations.push('Strengthen access control policies and procedures');
    }

    if (findings.some(f => f.severity === 'high' || f.severity === 'critical')) {
      recommendations.push('Immediate security assessment and remediation required');
    }

    return recommendations;
  }
}
