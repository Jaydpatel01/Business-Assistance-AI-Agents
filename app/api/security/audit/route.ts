/**
 * Security Audit API
 * Phase 5.2: Enterprise Security & Integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { EnterpriseSecurityManager } from '@/lib/security/enterprise-security';

const securityManager = new EnterpriseSecurityManager();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has audit permissions
    const context = await securityManager.authenticateRequest(request);
    if (!context) {
      return NextResponse.json(
        { error: 'Invalid security context' },
        { status: 403 }
      );
    }

    const hasPermission = await securityManager.checkPermission(
      context,
      'read:audit_logs'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access audit logs' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const organizationId = context.organizationId;

    // Generate compliance report
    const complianceReport = await securityManager.generateComplianceReport(
      organizationId,
      days
    );

    // Get security metrics
    const securityMetrics = await securityManager.getSecurityMetrics(organizationId);

    return NextResponse.json({
      success: true,
      data: {
        complianceReport,
        securityMetrics,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Security audit API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate security audit' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const context = await securityManager.authenticateRequest(request);
    if (!context) {
      return NextResponse.json(
        { error: 'Invalid security context' },
        { status: 403 }
      );
    }

    const hasPermission = await securityManager.checkPermission(
      context,
      'write:audit_logs'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create audit events' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, resource, details } = body;

    // Log custom audit event
    await securityManager.logAuditEvent({
      userId: context.userId,
      organizationId: context.organizationId,
      action,
      resource,
      ipAddress: context.ipAddress || 'unknown',
      userAgent: context.userAgent || 'unknown',
      success: true,
      details
    });

    return NextResponse.json({
      success: true,
      message: 'Audit event logged successfully'
    });

  } catch (error) {
    console.error('Security audit POST error:', error);
    return NextResponse.json(
      { error: 'Failed to log audit event' },
      { status: 500 }
    );
  }
}
