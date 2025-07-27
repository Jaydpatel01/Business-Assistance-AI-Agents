/**
 * Role-Based Access Control (RBAC) API
 * Phase 5.2: Enterprise Security & Integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { z } from 'zod';

// RBAC Type Definitions
interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  level: 'organization' | 'team' | 'individual';
  isActive: boolean;
}

interface Permission {
  id: string;
  name: string;
  category: 'read' | 'write' | 'delete' | 'admin' | 'audit';
  resource: string;
  description?: string;
}

interface UserRoleAssignment {
  id?: string;
  userId: string;
  roleId: string;
  organizationId: string;
  assignedBy: string;
  assignedAt?: Date;
  expiresAt?: Date;
}

const UserRoleAssignmentSchema = z.object({
  userId: z.string(),
  roleId: z.string(),
  organizationId: z.string(),
  assignedBy: z.string(),
  expiresAt: z.date().optional()
});

// In-memory RBAC store (in production, use database)
class RBACManager {
  private roles = new Map<string, Role>();
  private permissions = new Map<string, Permission>();
  private userRoles = new Map<string, UserRoleAssignment[]>();

  constructor() {
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles() {
    // Initialize standard enterprise roles
    const defaultRoles: Role[] = [
      {
        id: 'super_admin',
        name: 'Super Administrator',
        description: 'Full system access and control',
        permissions: ['*'],
        level: 'organization',
        isActive: true
      },
      {
        id: 'org_admin',
        name: 'Organization Administrator',
        description: 'Organization-wide administrative access',
        permissions: [
          'read:all',
          'write:organization',
          'admin:users',
          'admin:roles',
          'audit:logs'
        ],
        level: 'organization',
        isActive: true
      },
      {
        id: 'executive',
        name: 'Executive',
        description: 'Senior leadership with strategic access',
        permissions: [
          'read:all',
          'write:decisions',
          'read:analytics',
          'write:strategic_sessions',
          'read:audit'
        ],
        level: 'organization',
        isActive: true
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Team management and operational access',
        permissions: [
          'read:team',
          'write:sessions',
          'read:analytics',
          'write:operational_decisions'
        ],
        level: 'team',
        isActive: true
      },
      {
        id: 'analyst',
        name: 'Business Analyst',
        description: 'Data analysis and reporting access',
        permissions: [
          'read:data',
          'write:analysis',
          'read:sessions',
          'write:reports'
        ],
        level: 'team',
        isActive: true
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access to permitted resources',
        permissions: [
          'read:basic',
          'read:assigned_sessions'
        ],
        level: 'individual',
        isActive: true
      }
    ];

    defaultRoles.forEach(role => {
      this.roles.set(role.id, role);
    });

    // Initialize standard permissions
    const defaultPermissions: Permission[] = [
      { id: 'read:all', name: 'Read All', category: 'read', resource: '*', description: 'Read access to all resources' },
      { id: 'write:decisions', name: 'Write Decisions', category: 'write', resource: 'decisions', description: 'Create and modify decisions' },
      { id: 'admin:users', name: 'Manage Users', category: 'admin', resource: 'users', description: 'Manage user accounts' },
      { id: 'admin:roles', name: 'Manage Roles', category: 'admin', resource: 'roles', description: 'Manage roles and permissions' },
      { id: 'audit:logs', name: 'Audit Logs', category: 'audit', resource: 'logs', description: 'Access and manage audit logs' }
    ];

    defaultPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });
  }

  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values()).filter(role => role.isActive);
  }

  async getPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }

  async getUserRoles(userId: string, organizationId: string): Promise<(UserRoleAssignment & { role?: Role })[]> {
    const userRoles = this.userRoles.get(`${userId}:${organizationId}`) || [];
    return userRoles.map(assignment => ({
      ...assignment,
      role: this.roles.get(assignment.roleId)
    }));
  }

  async assignRole(assignment: UserRoleAssignment): Promise<boolean> {
    const key = `${assignment.userId}:${assignment.organizationId}`;
    const existing = this.userRoles.get(key) || [];
    
    // Remove existing assignment for same role
    const filtered = existing.filter(a => a.roleId !== assignment.roleId);
    filtered.push({
      ...assignment,
      assignedAt: new Date(),
      id: `assignment_${Date.now()}`
    });
    
    this.userRoles.set(key, filtered);
    return true;
  }

  async revokeRole(userId: string, roleId: string, organizationId: string): Promise<boolean> {
    const key = `${userId}:${organizationId}`;
    const existing = this.userRoles.get(key) || [];
    const filtered = existing.filter(a => a.roleId !== roleId);
    this.userRoles.set(key, filtered);
    return true;
  }

  async hasPermission(userId: string, organizationId: string, permission: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId, organizationId);
    
    for (const assignment of userRoles) {
      if (!assignment.role) continue;
      
      // Check for wildcard permission
      if (assignment.role.permissions.includes('*')) {
        return true;
      }
      
      // Check for specific permission
      if (assignment.role.permissions.includes(permission)) {
        return true;
      }
    }
    
    return false;
  }
}

const rbacManager = new RBACManager();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const organizationId = session.user.company || 'default';

    switch (action) {
      case 'roles':
        const roles = await rbacManager.getRoles();
        return NextResponse.json({ success: true, data: roles });

      case 'permissions':
        const permissions = await rbacManager.getPermissions();
        return NextResponse.json({ success: true, data: permissions });

      case 'user-roles':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID required for user-roles action' },
            { status: 400 }
          );
        }
        const userRoles = await rbacManager.getUserRoles(userId, organizationId);
        return NextResponse.json({ success: true, data: userRoles });

      case 'check-permission':
        const permission = searchParams.get('permission');
        if (!userId || !permission) {
          return NextResponse.json(
            { error: 'User ID and permission required for check-permission action' },
            { status: 400 }
          );
        }
        const hasPermission = await rbacManager.hasPermission(userId, organizationId, permission);
        return NextResponse.json({ success: true, data: { hasPermission } });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('RBAC GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process RBAC request' },
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

    const body = await request.json();
    const { action } = body;
    const organizationId = session.user.company || 'default';

    // Check if user has admin permissions
    const hasAdminPermission = await rbacManager.hasPermission(
      session.user.id,
      organizationId,
      'admin:roles'
    );

    if (!hasAdminPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage roles' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'assign-role':
        const assignmentData = UserRoleAssignmentSchema.parse({
          ...body,
          organizationId,
          assignedBy: session.user.id
        });
        
        await rbacManager.assignRole(assignmentData);
        
        return NextResponse.json({
          success: true,
          message: 'Role assigned successfully'
        });

      case 'revoke-role':
        const { userId, roleId } = body;
        if (!userId || !roleId) {
          return NextResponse.json(
            { error: 'User ID and Role ID required' },
            { status: 400 }
          );
        }
        
        await rbacManager.revokeRole(userId, roleId, organizationId);
        
        return NextResponse.json({
          success: true,
          message: 'Role revoked successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('RBAC POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process RBAC request' },
      { status: 500 }
    );
  }
}
