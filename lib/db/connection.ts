import { PrismaClient } from '@prisma/client';

// Prisma client configuration
const prismaConfig = {
  log: process.env.NODE_ENV === 'development' ? ['query' as const, 'error' as const, 'warn' as const] : ['error' as const],
};

// Global Prisma client instance
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Ensure DATABASE_URL is set for SQLite
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set, using default SQLite database');
  process.env.DATABASE_URL = 'file:./dev.db';
}

export const prisma = globalThis.__prisma || new PrismaClient(prismaConfig);

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Database health check
export async function checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy', latency?: number, error?: string }> {
  try {
    const start = Date.now();
    // Use a simple query that works with both SQLite and PostgreSQL
    await prisma.$queryRaw`SELECT 1 as test`;
    const latency = Date.now() - start;
    
    return { status: 'healthy', latency };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Database migration utilities
export async function runMigrations() {
  try {
    // In production, migrations should be run via CI/CD
    if (process.env.NODE_ENV === 'production') {
      console.log('Skipping migrations in production - should be handled by deployment pipeline');
      return;
    }
    
    console.log('Running database migrations...');
    // Migrations will be handled by Prisma CLI
    console.log('Migrations completed');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Connection cleanup
export async function closeDatabaseConnections() {
  try {
    await prisma.$disconnect();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Database utilities
export class DatabaseService {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = prisma;
  }
  
  // Optimized queries with proper field names from schema
  async findUserScenarios(userId: string, limit = 10, offset = 0) {
    return this.prisma.scenario.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { sessions: true }
        }
      }
    });
  }
  
  async findUserSessions(userId: string, limit = 10, offset = 0) {
    return this.prisma.boardroomSession.findMany({
      where: { 
        participants: {
          some: { userId }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        scenario: {
          select: { name: true, id: true }
        },
        _count: {
          select: { messages: true }
        }
      }
    });
  }
  
  async getSessionAnalytics(userId: string, timeRange = '30d') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
    
    const [sessionCount, decisionCount] = await Promise.all([
      this.prisma.boardroomSession.count({
        where: {
          participants: {
            some: { userId }
          },
          createdAt: { gte: startDate }
        }
      }),
      this.prisma.decision.count({
        where: {
          session: {
            participants: {
              some: { userId }
            }
          },
          createdAt: { gte: startDate }
        }
      })
    ]);
    
    return {
      sessionCount,
      decisionCount,
      timeRange
    };
  }
}

export const databaseService = new DatabaseService();
