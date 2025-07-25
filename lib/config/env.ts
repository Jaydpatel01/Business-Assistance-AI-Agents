import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Core Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  APP_NAME: z.string(),

  // Database
  DATABASE_URL: z.string().url(),
  SHADOW_DATABASE_URL: z.string().url().optional(),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // AI Services
  AI_PROVIDER: z.enum(['gemini', 'openai', 'anthropic', 'mistral']),
  GEMINI_API_KEY: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),

  // Model assignments
  AI_MODEL_CEO: z.string(),
  AI_MODEL_CFO: z.string(),
  AI_MODEL_CTO: z.string(),
  AI_MODEL_HR: z.string(),
  AI_MODEL: z.string(),

  // Optional services
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY: z.string().optional(),
});

// Validate and parse environment variables
function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
      APP_NAME: process.env.APP_NAME,
      DATABASE_URL: process.env.DATABASE_URL,
      SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      AI_PROVIDER: process.env.AI_PROVIDER,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      AI_API_KEY: process.env.AI_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
      AI_MODEL_CEO: process.env.AI_MODEL_CEO,
      AI_MODEL_CFO: process.env.AI_MODEL_CFO,
      AI_MODEL_CTO: process.env.AI_MODEL_CTO,
      AI_MODEL_HR: process.env.AI_MODEL_HR,
      AI_MODEL: process.env.AI_MODEL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
        .map(err => err.path.join('.'));
      
      console.error('❌ Environment Configuration Error:');
      console.error('Missing or invalid environment variables:');
      missingVars.forEach(varName => {
        console.error(`  - ${varName}`);
      });
      console.error('\nPlease check your .env.local file.');
      
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    throw error;
  }
}

// Validate required API keys based on provider
function validateApiKeys() {
  const provider = process.env.AI_PROVIDER;
  
  switch (provider) {
    case 'gemini':
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is required when AI_PROVIDER is set to "gemini"');
      }
      break;
    case 'openai':
      if (!process.env.AI_API_KEY) {
        throw new Error('AI_API_KEY is required when AI_PROVIDER is set to "openai"');
      }
      break;
    case 'anthropic':
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is required when AI_PROVIDER is set to "anthropic"');
      }
      break;
    case 'mistral':
      if (!process.env.MISTRAL_API_KEY) {
        throw new Error('MISTRAL_API_KEY is required when AI_PROVIDER is set to "mistral"');
      }
      break;
    default:
      throw new Error(`Unknown AI_PROVIDER: ${provider}`);
  }
}

// Export environment configuration
export const env = validateEnv();

// Validate API keys if in production or if specifically requested
if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_API_KEYS === 'true') {
  validateApiKeys();
}

// Helper functions
export function getApiKey(): string {
  const provider = env.AI_PROVIDER;
  
  switch (provider) {
    case 'gemini':
      return env.GEMINI_API_KEY!;
    case 'openai':
      return env.AI_API_KEY!;
    case 'anthropic':
      return env.ANTHROPIC_API_KEY!;
    case 'mistral':
      return env.MISTRAL_API_KEY!;
    default:
      throw new Error(`No API key available for provider: ${provider}`);
  }
}

export function getModelForAgent(agentType: 'ceo' | 'cfo' | 'cto' | 'hr'): string {
  const modelMap = {
    ceo: env.AI_MODEL_CEO,
    cfo: env.AI_MODEL_CFO,
    cto: env.AI_MODEL_CTO,
    hr: env.AI_MODEL_HR,
  };
  
  return modelMap[agentType] || env.AI_MODEL;
}

export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}
