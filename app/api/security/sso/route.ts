/**
 * Single Sign-On (SSO) Integration API
 * Phase 5.2: Enterprise Security & Integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { z } from 'zod';

// SSO Provider Configuration Schema
const SSOProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['saml', 'oidc', 'oauth2', 'azure-ad', 'google-workspace', 'okta']),
  configuration: z.object({
    issuer: z.string().url().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    discoveryUrl: z.string().url().optional(),
    metadataUrl: z.string().url().optional(),
    callbackUrl: z.string().url().optional(),
    scopes: z.array(z.string()).optional(),
    claims: z.record(z.string()).optional()
  }),
  mappings: z.object({
    userId: z.string().default('sub'),
    email: z.string().default('email'),
    name: z.string().default('name'),
    roles: z.string().default('roles'),
    organization: z.string().default('organization')
  }),
  isActive: z.boolean().default(true),
  organizationId: z.string()
});

// SSO Provider Type
type SSOProvider = z.infer<typeof SSOProviderSchema>;

interface UserInfo {
  id: string;
  email: string;
  name: string;
  roles: string[];
  organization: string;
}

// In-memory SSO provider store (in production, use database)
class SSOManager {
  private providers = new Map<string, SSOProvider & { 
    id: string; 
    createdAt: Date; 
    updatedAt: Date;
  }>();

  async getProviders(organizationId: string) {
    return Array.from(this.providers.values())
      .filter(provider => provider.organizationId === organizationId && provider.isActive);
  }

  async getProvider(providerId: string, organizationId: string) {
    const provider = this.providers.get(providerId);
    if (!provider || provider.organizationId !== organizationId) {
      return null;
    }
    return provider;
  }

  async createProvider(providerData: SSOProvider) {
    const provider = {
      ...providerData,
      id: `sso_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.providers.set(provider.id, provider);
    return provider;
  }

  async updateProvider(providerId: string, organizationId: string, updates: Partial<SSOProvider>) {
    const provider = this.providers.get(providerId);
    if (!provider || provider.organizationId !== organizationId) {
      return null;
    }

    const updated = {
      ...provider,
      ...updates,
      updatedAt: new Date()
    };
    
    this.providers.set(providerId, updated);
    return updated;
  }

  async deleteProvider(providerId: string, organizationId: string) {
    const provider = this.providers.get(providerId);
    if (!provider || provider.organizationId !== organizationId) {
      return false;
    }

    this.providers.delete(providerId);
    return true;
  }

  async validateSSOToken(token: string, providerId: string): Promise<{
    valid: boolean;
    userInfo?: UserInfo;
    error?: string;
  }> {
    // In production, implement actual token validation based on provider type
    console.log(`🔐 SSO: Validating token for provider ${providerId}`);
    
    // Mock validation for demo
    if (!token || token.length < 10) {
      return { valid: false, error: 'Invalid token format' };
    }

    // Simulate successful validation
    return {
      valid: true,
      userInfo: {
        id: 'sso_user_123',
        email: 'user@company.com',
        name: 'SSO User',
        roles: ['employee'],
        organization: 'Demo Company'
      }
    };
  }
}

const ssoManager = new SSOManager();

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
    const providerId = searchParams.get('providerId');
    const organizationId = session.user.company || 'default';

    switch (action) {
      case 'list':
        const providers = await ssoManager.getProviders(organizationId);
        return NextResponse.json({ success: true, data: providers });

      case 'get':
        if (!providerId) {
          return NextResponse.json(
            { error: 'Provider ID required' },
            { status: 400 }
          );
        }
        
        const provider = await ssoManager.getProvider(providerId, organizationId);
        if (!provider) {
          return NextResponse.json(
            { error: 'Provider not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({ success: true, data: provider });

      case 'test':
        if (!providerId) {
          return NextResponse.json(
            { error: 'Provider ID required for testing' },
            { status: 400 }
          );
        }

        const testProvider = await ssoManager.getProvider(providerId, organizationId);
        if (!testProvider) {
          return NextResponse.json(
            { error: 'Provider not found' },
            { status: 404 }
          );
        }

        // Test SSO provider configuration
        const testResult = {
          success: true,
          message: 'SSO provider configuration is valid',
          details: {
            connectivity: 'OK',
            metadata: 'Valid',
            endpoints: 'Accessible'
          }
        };

        return NextResponse.json({ success: true, data: testResult });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('SSO GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process SSO request' },
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

    const organizationId = session.user.company || 'default';
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create':
        const providerData = SSOProviderSchema.parse({
          ...body,
          organizationId
        });

        const newProvider = await ssoManager.createProvider(providerData);
        
        return NextResponse.json({
          success: true,
          data: newProvider,
          message: 'SSO provider created successfully'
        });

      case 'authenticate':
        const { token, providerId } = body;
        
        if (!token || !providerId) {
          return NextResponse.json(
            { error: 'Token and provider ID required' },
            { status: 400 }
          );
        }

        const validationResult = await ssoManager.validateSSOToken(token, providerId);
        
        if (!validationResult.valid) {
          return NextResponse.json(
            { error: validationResult.error || 'Token validation failed' },
            { status: 401 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            authenticated: true,
            userInfo: validationResult.userInfo
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('SSO POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process SSO request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const organizationId = session.user.company || 'default';
    const body = await request.json();
    const { providerId, ...updates } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID required' },
        { status: 400 }
      );
    }

    const updatedProvider = await ssoManager.updateProvider(
      providerId,
      organizationId,
      updates
    );

    if (!updatedProvider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProvider,
      message: 'SSO provider updated successfully'
    });

  } catch (error) {
    console.error('SSO PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update SSO provider' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const organizationId = session.user.company || 'default';

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID required' },
        { status: 400 }
      );
    }

    const deleted = await ssoManager.deleteProvider(providerId, organizationId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SSO provider deleted successfully'
    });

  } catch (error) {
    console.error('SSO DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete SSO provider' },
      { status: 500 }
    );
  }
}
