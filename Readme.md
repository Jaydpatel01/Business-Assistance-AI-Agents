# Boardroom AI Navigator - Enterprise Decision Intelligence Platform (2025 Edition)

![Boardroom AI Navigator Logo](https://via.placeholder.com/500x100.png?text=Boardroom+AI+Navigator)

## Executive Summary

Boardroom AI Navigator is a cutting-edge, enterprise-grade SaaS platform designed to revolutionize strategic decision-making for modern businesses. By simulating executive boardroom discussions with advanced AI agents, the platform empowers leaders, strategy teams, and analysts to explore complex scenarios, gain deep insights from organizational data, and make more informed choices with confidence. 

The core of Boardroom AI Navigator lies in its multi-agent reasoning capabilities, where AI personas representing different executive roles (CEO, CFO, CTO, HR) collaborate and provide diverse perspectives, with the flexibility to add customized roles in the future. This, combined with robust data integration, advanced analytics, and real-time collaborative features, allows organizations to test strategies, assess risks, and understand potential outcomes before committing resources. Our competitive advantage stems from our commitment to explainable AI, ensuring transparency in decision processes, a live and interactive collaboration environment, and an edge-optimized architecture for global accessibility and performance.

## 📑 Table of Contents

- [Executive Summary](#executive-summary)
- [Feature Matrix](#-feature-matrix)
- [Competitive Analysis](#-competitive-analysis)
- [Getting Started for Cursor AI](#-getting-started-for-cursor-ai)
- [AI Agent Framework](#-ai-agent-framework)
  - [Prompt Engineering](#prompt-engineering)
  - [Agent Model Assignment](#agent-model-assignment)
  - [Final Decision Summary Mechanism](#final-decision-summary-mechanism)
- [UI Implementation](#-ui-implementation)
- [Development Best Practices](#-development-best-practices)
  - [Testing](#testing)
  - [Storybook Integration](#storybook-integration)
  - [CI/CD](#cicd-continuous-integration--continuous-deployment)
  - [Telemetry and Metrics](#telemetry-and-metrics)
- [Deployment Options](#-deployment-options)
  - [Development Environment](#development-environment)
  - [Production Deployment](#production-deployment)
  - [Scaling Considerations](#scaling-considerations)
- [Security Architecture](#-security-architecture)
- [Sample Interaction Formats](#-sample-interaction-formats)
  - [Example Input JSON](#example-input-json)
  - [Example Response JSON](#example-response-json)
  - [Application Screenshot](#application-screenshot)
- [Project Provenance](#-project-provenance)
- [Customization Guide: Adding More Agent Types](#customization-guide-adding-more-agent-types)
- [Use Case Scenarios](#-use-case-scenarios)
  - [Strategic Investment Review](#strategic-investment-review)
  - [Hiring Freeze Decision](#hiring-freeze-decision)
  - [Market Expansion Strategy](#market-expansion-strategy)
- [Future Roadmap Ideas](#-future-roadmap-ideas)
- [System Architecture](#system-architecture)
  - [Key Components](#key-components)
- [Troubleshooting and FAQs](#troubleshooting-and-faqs)
  - [Database Connection Issues](#database-connection-issues)
  - [AI Model Errors](#ai-model-errors)
  - [Next.js Build Issues](#nextjs-build-issues)
  - [UI Component Rendering Problems](#ui-component-rendering-problems)
  - [Database Schema Issues](#database-schema-issues)
  - [Common FAQs](#common-faqs)
- [Implementation Sequence for Cursor AI](#implementation-sequence-for-cursor-ai)
- [Export Options](#-export-options)
  - [Document Exports](#document-exports)
  - [Data Exports](#data-exports)
  - [Collaboration Exports](#collaboration-exports)

## 🔍 Feature Matrix

| Feature                    | Description                                | Status     |
|---------------------------|--------------------------------------------|------------|
| Multi-Agent AI Simulation | Executive decision-making via AI personas  | ✅ Complete |
| Scenario Planning         | Strategic simulations & what-if analysis   | ✅ Complete |
| Real-Time Collaboration   | Live cursors, replies, and async sessions  | ✅ Complete |
| Vector Search (RAG)       | Contextual grounding via internal data     | 🛠 Planned  |
| Role-Based Access Control | CASL or ORY Keto for secure permissions    | ✅ Complete |
| Explainability Tools      | Agent response reasoning and history trace | 🛠 Planned  |

## 🏆 Competitive Analysis

Boardroom AI Navigator offers unique advantages in the emerging multi-agent AI marketplace:

| Platform             | Agent Roles             | Real-time Chat | Role Memory | Decision Simulation | UI Type                 |
|---------------------|-------------------------|---------------|------------|---------------------|------------------------|
| **Boardroom AI (Ours)** | ✅ C-Suite Focused      | ✅ Real-time   | ✅ Persistent | ✅ Strategic & Financial | Boardroom-style layout |
| ChatGPT              | ❌ Single persona       | ✅ Basic       | Limited    | ❌ Not business-focused | Chat-only UI           |
| Google A2A           | ✅ (emerging)           | Protocol-level | In dev     | ⚠️ (not business UX)   | N/A (Developer API)    |
| Notion AI            | ❌ Document-focused     | ✅ Document    | ❌ None     | ❌ No simulation      | Doc-centric            |
| Anthropic Claude     | ✅ Basic role-play      | ✅ Limited     | ❌ Session-only | ❌ No simulation      | Chat-only UI           |

**Our Advantage:** Unlike general-purpose AI assistants, Boardroom AI Navigator is explicitly designed for enterprise decision-making with specialized executive personas, persistent context memory, and a collaborative boardroom environment that mimics real-world executive decision processes.

### 🚀 Getting Started for Cursor AI

To quickly get started building this project in Cursor AI, follow these streamlined steps:

#### Step 1: 📋 Project Setup

```powershell
# Create project root folder
mkdir boardroom-ai-navigator
cd boardroom-ai-navigator
   
# Initialize Next.js project with all required configurations
npx create-next-app@latest . --typescript --tailwind --eslint --app --use-npm
   
# Install key dependencies
npm install next-auth @prisma/client @auth/prisma-adapter openai zod liveblocks @liveblocks/react @liveblocks/client @tanstack/react-query daisyui lucide-react
```

#### Step 2: 🔐 Environment Configuration

```powershell
# Create .env.local with required configuration
@"
# ========== Core Application ==========
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
APP_NAME="Boardroom AI Navigator"

# ========== Database ==========
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/boardroom
SHADOW_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/boardroom_shadow
# For production with Vercel Postgres, this will be automatically set

# ========== Authentication ==========
NEXTAUTH_SECRET=generate-a-32-char-random-string  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Optional OAuth Providers
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# ========== AI Services ==========
# Provider Selection
AI_PROVIDER=openai  # Options: openai, azure, anthropic, mistral

# API Keys (use only what you need)
AI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key
# MISTRAL_API_KEY=your-mistral-api-key

# Model Assignment for Agent Roles
AI_MODEL_CEO=gpt-4-turbo
AI_MODEL_CFO=claude-3-opus  # If using Anthropic
AI_MODEL_CTO=gpt-4
AI_MODEL_HR=claude-3-sonnet  # For empathy-focused responses
# Fallback model
AI_MODEL=gpt-4-turbo

# ========== Vector Database (for RAG) ==========
VECTOR_DB=vercel_kv  # Options: vercel_kv, pinecone, supabase
# PINECONE_API_KEY=your-pinecone-key
# PINECONE_ENVIRONMENT=your-pinecone-environment
# PINECONE_INDEX=your-pinecone-index-name

# ========== Storage ==========
STORAGE_PROVIDER=vercel_blob  # Options: vercel_blob, s3, azure_blob
# For Vercel Blob Storage
# BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# ========== Real-time Collaboration ==========
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your-liveblocks-key
# If using Socket.io instead
# WEBSOCKET_URL=ws://localhost:3001

# ========== Telemetry & Monitoring ==========
# SENTRY_DSN=your-sentry-dsn
# HIGHLIGHT_PROJECT_ID=your-highlight-project-id

# ========== Email (optional) ==========
# RESEND_API_KEY=your-resend-api-key
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-smtp-username
# SMTP_PASSWORD=your-smtp-password
"@ > .env.local

# Create a .env.example file without sensitive values for version control
@"
# Core Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
APP_NAME="Boardroom AI Navigator"

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/boardroom

# Authentication
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000

   # AI Services
   AI_PROVIDER=openai
   AI_API_KEY=your-api-key
   AI_MODEL_CEO=gpt-4-turbo
   AI_MODEL_CFO=claude-3-opus
   AI_MODEL_CTO=gpt-4
   AI_MODEL_HR=claude-3-sonnet
   AI_MODEL=gpt-4-turbo
   "@ > .env.example
   ```

#### Step 3: 🗄️ Database Schema Setup with Prisma

```powershell
# Install Prisma and dependencies
npm install prisma @prisma/client
npm install @auth/prisma-adapter

# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql

# Create Prisma schema
@"
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

// User and Authentication Models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("user") // user, admin, etc.
  organizationId String?   // For multi-tenancy
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  scenarios     Scenario[] // Scenarios created by the user
  participants  Participant[] // Sessions where the user is a participant
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Core Business Models
model Scenario {
  id          String   @id @default(cuid())
  name        String
  description String?   @db.Text
  status      String   // draft, active, archived
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
  organizationId String? // For multi-tenancy
  
  // JSON fields for flexible configuration
  parameters  Json?    // Scenario-specific parameters (budget, timeline, etc.)
  tags        String[] // For categorization and filtering
  
  // Relations
  sessions    Session[]
}

model Session {
  id          String   @id @default(cuid())
  name        String
  scenarioId  String
  scenario    Scenario @relation(fields: [scenarioId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  startedAt   DateTime?
  endedAt     DateTime?
  status      String   // scheduled, active, completed
  
  // Relations
  messages    Message[]
  decisions   Decision[]
  participants Participant[]
  documents   Document[]
}

model Participant {
  id        String   @id @default(cuid())
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      String   // observer, facilitator, participant
  joinedAt  DateTime @default(now())
  leftAt    DateTime?
  
  // Relations
  messages  Message[]
  
  @@unique([sessionId, userId])
}

model Message {
  id            String   @id @default(cuid())
  sessionId     String
  session       Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  participantId String?
  participant   Participant? @relation(fields: [participantId], references: [id])
  content       String   @db.Text
  agentType     String?  // CEO, CFO, CTO, HR, etc. (null for human users)
  parentId      String?  // For threaded replies
  parent        Message? @relation("MessageReplies", fields: [parentId], references: [id])
  replies       Message[] @relation("MessageReplies")
  createdAt     DateTime @default(now())
  metadata      Json?    // For storing additional message data
}

model Decision {
  id          String   @id @default(cuid())
  sessionId   String
  session     Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  title       String
  description String   @db.Text
  status      String   // proposed, approved, rejected
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  metadata    Json?    // For storing voting results, etc.
}

model Document {
  id          String   @id @default(cuid())
  sessionId   String
  session     Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  name        String
  type        String   // pdf, image, spreadsheet, etc.
  url         String
  createdAt   DateTime @default(now())
  metadata    Json?    // For storing document analysis, etc.
}

// Vector Store for RAG (Retrieval Augmented Generation)
model VectorEmbedding {
  id          String   @id @default(cuid())
  content     String   @db.Text
  embedding   Unsupported("vector")?  // This requires PostgreSQL with pgvector extension
  metadata    Json
  createdAt   DateTime @default(now())
  organizationId String? // For multi-tenancy
}
"@ > prisma/schema.prisma

# Create Prisma client
@"
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
"@ > lib/db/prisma.ts

# Run database migrations
npx prisma migrate dev --name init
```

#### Step 4: 🛡️ Authentication Setup

```powershell
# Install NextAuth.js
npm install next-auth

# Create auth API route
@"
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Implement your own authentication logic here
        // For development, return a mock user
        return {
          id: "1",
          name: "Demo User",
          email: "demo@example.com",
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
"@ > app/api/auth/[...nextauth]/route.ts
```
```

#### 🧠 AI Agent Framework

##### Prompt Engineering
The prompts for each executive AI agent are dynamically constructed to ensure contextual relevance and persona consistency. Key factors influencing prompt generation include:

1.  **Agent Role**: The specific C-suite persona (e.g., CEO, CFO, CTO, CMO, CHRO). Each role has a base prompt defining its core responsibilities, expertise, and communication style.
    *   *Example*: A CFO's base prompt would emphasize financial implications, risk assessment, and ROI.
2.  **Scenario Context**: The details of the business scenario under discussion (e.g., market entry, product launch, M&A). This provides the immediate subject matter for the agent.
3.  **Discussion History**: Recent messages and decisions within the current session to maintain conversational flow and build upon previous points.
4.  **User Inputs/Queries**: Direct questions or instructions from users interacting with the agents.
5.  **Retrieved Knowledge (RAG)**: Relevant information fetched from connected data sources (e.g., internal documents, market reports) to ground the agent's responses in facts.

Prompts can be managed as template literals within the code or, for greater flexibility and easier updates, loaded from external Markdown (`.md`) or JSON files. This allows non-developers to refine prompts.

*Example `ceo-prompt.md` (if using file-based prompts):*
```markdown
You are the CEO of [CompanyName].
Your primary focus is on long-term strategic vision, market positioning, and overall company growth.
You are known for being decisive, inspiring, and forward-thinking.

Current Scenario:
{{scenarioDetails}}

Discussion So Far:
{{discussionHistory}}

Based on this, provide your strategic perspective on how to proceed. Consider the impact on our key stakeholders and competitive landscape.
```

##### Agent Model Assignment
To optimize for specific agent strengths and cost-effectiveness, different LLMs can be assigned to various executive roles. This is configurable via environment variables (e.g., `AI_MODEL_CEO`, `AI_MODEL_CFO`).

-   **CEO**: `GPT-4 Turbo` (or equivalent high-capability model) for strategic overview and complex reasoning.
-   **CFO**: `Claude 3 Opus` or `Mistral Large` for strong analytical capabilities and detailed financial scrutiny.
-   **CTO**: `GPT-4` or a specialized open-source model like `DeepSeek Coder` (if technical depth or code understanding is needed) for technology assessment and innovation.
-   **HR**: `Claude 3 Sonnet` (or other models with strong nuanced understanding) for focus on human capital, culture, and empathetic communication.

The platform is designed with extensibility in mind, allowing you to add customized agent roles in the future.

##### Final Decision Summary Mechanism

After gathering perspectives from all executive agents, Boardroom AI Navigator employs a specialized "Decision Synthesis" mechanism:

1. **Opinion Aggregation**: A final summary agent collates weighted opinions, contradictions, and outcomes from the agents into a structured decision output with rationale and optional dissent.

2. **Consensus Detection**: The system identifies areas of agreement and disagreement between agents, highlighting key points of convergence and divergence.

3. **Risk Assessment**: Potential blindspots and risks from the collective decision are identified through a meta-analysis of agent responses.

4. **Action Item Generation**: Concrete, assignable next steps are proposed based on the synthesized decision.

This approach ensures decisions benefit from diverse executive perspectives while providing a unified, actionable outcome that can be presented to stakeholders.

The `agent-service.ts` should be updated to select the appropriate model based on the agent type and environment configuration.

```powershell
# Create agent service
cat > lib/ai/agent-service.ts << EOL
import { OpenAI } from \'openai\'; // Or use Vercel AI SDK for broader provider support
// Potentially import other SDKs like Anthropic, MistralAI if used directly

// Initialize clients based on environment variables and selected providers
const getOpenAIClient = () => new OpenAI({ apiKey: process.env.AI_API_KEY });
// const getAnthropicClient = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Agent roles and personalities
const agentProfiles = {
  ceo: {
    role: \'CEO\',
    personality: \'Visionary, strategic, focused on long-term value\',
    expertise: [\'corporate strategy\', \'leadership\', \'investor relations\'],
    modelEnvVar: \'AI_MODEL_CEO\'
  },
  cfo: {
    role: \'CFO\',
    personality: \'Analytical, cautious, focused on financial stability\',
    expertise: [\'financial analysis\', \'risk management\', \'capital allocation\'],
    modelEnvVar: \'AI_MODEL_CFO\'
  },
  cto: {
    role: \'CTO\',
    personality: \'Innovative, technical, focused on technological advancement\',
    expertise: [\'technology trends\', \'software development\', \'digital transformation\'],
    modelEnvVar: \'AI_MODEL_CTO\'
  },
  hr: {
    role: \'HR\',
    personality: \'Empathetic, people-focused, culture-oriented\',
    expertise: [\'talent management\', \'organizational development\', \'culture building\'],
    modelEnvVar: \'AI_MODEL_HR\'
  }
  // Additional agent profiles can be added here as needed
};

// Create agent prompt (simplified, actual implementation would be more robust)
// This function would dynamically load/build prompts as described in "Prompt Engineering"
const createAgentPrompt = (agentType, scenario, context, companyName = "our company") => {
  const profile = agentProfiles[agentType];
  // In a real app, this prompt would be more sophisticated, potentially loaded from files
  // and use a templating engine.
  return \\\`
    You are the ${profile.role} of ${companyName}.
    Your personality traits: ${profile.personality}.
    Your areas of expertise: ${profile.expertise.join(\', \')}.
    
    Current scenario:
    ${scenario.description}
    
    Discussion context:
    ${context}
      Provide your perspective on this scenario, focusing on your areas of expertise.
    Be concise but insightful in your response.
  \\\`;
};

// Get agent response
export async function getAgentResponse(agentType, scenario, context) {
  try {
    const profile = agentProfiles[agentType];
    const modelName = process.env[profile.modelEnvVar] || process.env.AI_MODEL || \'gpt-4-turbo\';
    const prompt = createAgentPrompt(agentType, scenario, context);
    
    // Example using OpenAI client, adapt for Vercel AI SDK or other providers
    const openai = getOpenAIClient(); // Ensure client is initialized
    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: \'user\', content: prompt }],
      temperature: 0.7,
    });

    return {
      response: completion.choices[0].message.content,
      agent: profile, // Return the full profile for UI use
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(\`Error getting agent response for ${agentType} using model ${process.env[agentProfiles[agentType].modelEnvVar]}:\`, error);
    throw new Error(\'Failed to get agent response\');
  }
}
EOL
```

# Create agents API route
cat > app/api/agents/route.ts << EOL
import { getAgentResponse } from '@/lib/ai/agent-service'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { agentType, scenario, context } = await request.json()
    
    if (!agentType || !scenario || !context) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    const response = await getAgentResponse(agentType, scenario, context)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in agent API route:', error)
    return NextResponse.json(
      { error: 'Failed to get agent response' },
      { status: 500 }
    )
  }
}
EOL

# Create agent component
cat > components/boardroom/agent-message.tsx << EOL
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button' // Assuming Shadcn UI Button
import Image from 'next/image'; // For avatars

interface AgentProfile {
  role: string;
  avatar?: string; // URL to avatar image
  // Add other profile details if needed by the message component
}

interface AgentMessageProps {
  agent: AgentProfile; // Updated to use a more specific type
  message: string;
  timestamp: string;
  onReply?: (message: string) => void;
}

export function AgentMessage({ agent, message, timestamp, onReply }: AgentMessageProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [reply, setReply] = useState('')
  
  const handleReply = () => {
    if (reply.trim() && onReply) {
      onReply(reply)
      setReply('')
      setIsReplying(false)
    }
  }
  
  return (
    <div className="mb-4 p-4 rounded-lg border bg-card text-card-foreground">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground overflow-hidden">
          {agent.avatar ? (
            <Image src={agent.avatar} alt={`${agent.role} avatar`} width={40} height={40} className="object-cover" />
          ) : (
            agent.role.substring(0, 2).toUpperCase() // Fallback to initials
          )}
        </div>
        <div>
          <div className="font-bold text-primary">{agent.role}</div>
          <div className="text-xs text-muted-foreground">{new Date(timestamp).toLocaleString()}</div>
        </div>
      </div>
      <div className="pl-13"> {/* Adjust padding to align with avatar + spacing */}
        <p className="text-sm prose prose-sm dark:prose-invert max-w-none">{message}</p> {/* Using prose for better markdown rendering if messages contain markdown */}
        
        {onReply && !isReplying && ( // Only show reply button if onReply is provided
          <div className="mt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsReplying(true)}
            >
              Reply
            </Button>
          </div>
        )}
        
        {onReply && isReplying && (
          <div className="mt-2">
            <textarea
              className="w-full p-2 text-sm border rounded-md bg-background focus:ring-ring focus:border-ring"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              rows={2}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleReply}
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
EOL

## 🎨 UI Implementation

The UI should be clean, intuitive, and professional, reflecting an enterprise-grade platform. Key aspects:

### Dashboard
- **Overview Panel**: Shows active scenarios, recent decisions, and key metrics
- **Agent Summary Cards**: Display key insights from different agent perspectives
- **Activity Feed**: Recent discussions and decisions from all scenarios
- **Quick Actions**: Create new scenario, join active session, access reports

```powershell
# Create dashboard page
@"
import { Suspense } from 'react'
import { ScenarioList } from '@/components/dashboard/scenario-list'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { MetricsPanel } from '@/components/dashboard/metrics-panel'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { Loading } from '@/components/ui/loading'

export default function Dashboard() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricsPanel />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Active Scenarios</h2>
          <Suspense fallback={<Loading />}>
            <ScenarioList />
          </Suspense>
          
          <div className="mt-6">
            <QuickActions />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Suspense fallback={<Loading />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
"@ > app/dashboard/page.tsx
```

### Boardroom Interface
- **Message Timeline**: Display AI agent messages with clear attribution (including avatars/initials)
- **Real-time Collaboration**: Show participant cursors, typing indicators, and presence
- **Agent Controls**: Toggles for activating specific agents in the discussion
- **Context Panel**: Displays relevant documents, previous decisions, and session parameters
- **Decision Tracking**: Interface to propose, discuss, and formalize decisions

### Scenario Configuration
- **Multi-step Wizard**: Guide users through scenario creation
- **Parameter Configuration**: Customizable fields for scenario parameters (budget, timeline, etc.)
- **Team Management**: Forms to invite and assign roles to participants
- **Document Upload**: Interface for adding context documents to the scenario

### Mobile Responsiveness
- **Adaptive Layout**: Use CSS Grid and Flexbox for responsive components
- **Touch-friendly Controls**: Ensure all interactive elements work well on touch devices
- **Simplified Views**: Streamlined interfaces for smaller screens

### Theme Configuration
```powershell
# Create theme configuration
@"
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0A2463', // Deep blue
      light: '#3E5C76',
      dark: '#081A4A',
    },
    secondary: {
      main: '#1E88E5', // Bright blue
      light: '#6AB7FF',
      dark: '#005CB2',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    error: {
      main: '#D32F2F', 
    },
    warning: {
      main: '#FFA000', 
    },
    info: {
      main: '#1976D2', 
    },
    success: {
      main: '#388E3C', 
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});
"@ > lib/theme.ts
```

## 🧪 Development Best Practices

### Testing
-   **Unit Tests**: Use Vitest for testing individual functions, components, and utilities.
    -   Focus on `lib/` directory (AI logic, utils, hooks) and individual UI components.
-   **Integration Tests**: Test interactions between components or modules (e.g., API route + database call).
-   **End-to-End (E2E) Tests**: Use Playwright or Cypress to simulate user flows through the application.
-   **Mock Data Utilities**: Create functions in `tests/mocks/` to generate consistent mock data for testing.
    -   `mockScenario(overrides?: Partial<Scenario>): Scenario`
    -   `mockUser(overrides?: Partial<User>): User`
    -   `mockDecision(overrides?: Partial<Decision>): Decision`
    -   `mockAgentResponse(agentType: string, responseText: string): AgentResponse`
    *Example `tests/mocks/scenario.ts`:
    ```typescript
    import { Scenario } from '@/lib/types'; // Adjust path as needed

    let idCounter = 0;
    export function mockScenario(overrides?: Partial<Scenario>): Scenario {
      return {
        id: `scenario-${idCounter++}`,
        name: 'Test Scenario',
        description: 'A default scenario for testing purposes.',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        sessions: [],
        parameters: { budget: 1000000, timeline: "6 months" },
        tags: ['test', 'mock'],
        ...overrides,
      };
    }
    ```
    Document how to use these utilities in test files to simulate various states and inputs.

### Storybook Integration
For isolated UI component development and testing:
1.  Install Storybook:
    ```powershell
    npx storybook@latest init
    ```
    Follow the prompts. Ensure it's configured for Next.js and TypeScript.
2.  Create stories for components in `components/ui`, `components/boardroom`, etc.
    *Example `components/ui/button.stories.tsx`*:
    ```typescript
    import type { Meta, StoryObj } from '@storybook/react';
    import { Button } from './button'; // Assuming your Button component

    const meta: Meta<typeof Button> = {
      title: 'UI/Button',
      component: Button,
      tags: ['autodocs'],
      argTypes: {
        variant: {
          control: { type: 'select' },
          options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        },
        size: {
          control: { type: 'select' },
          options: ['default', 'sm', 'lg', 'icon'],
        },
        children: { control: 'text' },
      },
    };
    export default meta;

    type Story = StoryObj<typeof Button>;

    export const Default: Story = {
      args: {
        children: 'Button',
        variant: 'default',
        size: 'default',
      },
    };
    // ... other stories for variants
    ```
3.  Document how to run Storybook (`npm run storybook`) and use it to preview and test components.

### CI/CD (Continuous Integration / Continuous Deployment)
-   **Vercel Integration**: Leverage Vercel's GitHub integration for automatic deployments and preview URLs for each pull request.
-   **Quality Gates**: Configure required checks in your GitHub repository settings for pull requests:
    -   **Linting**: `npm run lint` (ESLint)
    -   **Type Checking**: `npm run typecheck` (TypeScript compiler `tsc --noEmit`)
    -   **Unit Tests**: `npm run test:unit` (Vitest)
    -   (Optional) E2E Tests: `npm run test:e2e`
-   Ensure these scripts are defined in `package.json`.

### Telemetry and Metrics
-   **OpenTelemetry Setup**: Configure OpenTelemetry in `lib/telemetry/` to instrument the application.
    -   Trace API requests (Next.js API routes, Server Actions).
    -   Monitor AI agent performance (e.g., time to generate response, token usage if available).
    -   Track LLM response latency.
-   **Client-Side Error Tracking**: Integrate Sentry or Highlight.io for capturing and reporting frontend errors.
-   **Backend Error Tracking**: Ensure backend errors are also sent to Sentry/Highlight.io or logged effectively through Vercel Logs.

## ☁️ Deployment Options

### Development Environment
```powershell
# Run the development server
npm run dev

# Access the application at http://localhost:3000
```

### Production Deployment

#### Cloud Provider (Vercel)
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

#### Docker Deployment
```powershell
# Build Docker image
docker build -t boardroom-ai-navigator .

# Run Docker container
docker run -p 3000:3000 -e DATABASE_URL=your_production_db_url boardroom-ai-navigator
```

### Scaling Considerations

For enterprise deployments, consider:
- Horizontal scaling with container orchestration (Kubernetes)
- Database scaling with connection pooling
- Redis clustering for distributed caching
- WebSocket server scaling with sticky sessions
- CDN integration for static assets

## 🛡️ Security Architecture
Beyond the enterprise requirements for zero-trust:
-   **Authentication**: Handled by Clerk or NextAuth.js, ensuring secure user login and session management.
-   **Authorization (RBAC)**:
    -   Use CASL or ORY Keto for defining and enforcing permissions (e.g., who can create scenarios, view reports, manage users).
    -   Integrate with user roles and organization data from Clerk or your user management system.
-   **Multi-Tenancy**:
    -   If using Clerk, leverage its organization features for data isolation.
    -   Database-level isolation:
        -   **Row-Level Security (RLS)** in PostgreSQL is a common approach.
        -   Separate schemas per tenant (more complex to manage but stronger isolation).
        -   Application-level filtering based on `organizationId` on all queries.
-   **Data Encryption**: Ensure data at rest (Vercel Postgres) and in transit (HTTPS) is encrypted.
-   **Input Validation**: Use Zod for validating all API inputs and form submissions.
-   **Secrets Management**: Use Vercel environment variables for managing API keys and sensitive credentials. Do not commit secrets to the repository.

## 🔄 Sample Interaction Formats

### Example Input JSON

When interacting with the Boardroom AI Navigator API, queries can be structured as follows:

```json
{
  "query": "We are planning to expand to Southeast Asia. What are the risks and opportunities?",
  "role": "CEO",
  "context": {
    "revenue_growth": "15%",
    "cash_reserves": "₹20Cr",
    "current_markets": ["India", "UAE"],
    "company_size": 120,
    "industry": "Enterprise SaaS",
    "timeline": "Q3-Q4 2025"
  },
  "sessionId": "brd-1234-5678",
  "includeAgents": ["CEO", "CFO", "CTO", "HR"]
}
```

### Example Response JSON

The system returns a structured response with perspectives from each requested agent:

```json
{
  "sessionId": "brd-1234-5678",
  "query": "We are planning to expand to Southeast Asia. What are the risks and opportunities?",
  "timestamp": "2025-05-19T14:30:00Z",
  "responses": {
    "CEO": {
      "summary": "Southeast Asia presents significant growth opportunities with manageable risks.",
      "perspective": "The Southeast Asian market represents a $3.2B opportunity with 22% YoY growth. As our competitors have minimal presence, we have a 12-18 month window for establishing market leadership. Singapore provides an excellent entry point with strong IP protection and business-friendly regulations.",
      "key_points": [
        "First-mover advantage is significant in this region",
        "Singapore as initial hub, then expand to Malaysia, Thailand",
        "Potential for 20%+ revenue growth in 2026"
      ],
      "confidence": 0.85
    },
    "CFO": {
      "summary": "Financially viable with careful phasing and monitoring.",
      "perspective": "Initial analysis suggests a minimum investment of ₹5Cr for market entry, with break-even projected in 18-24 months. Our current cash reserves of ₹20Cr can support this expansion while maintaining a healthy 15-month runway. I recommend a phased approach with clear performance gates before advancing to subsequent countries.",
      "key_points": [
        "₹5Cr initial investment required",
        "18-24 month path to profitability",
        "Currency fluctuation risk, especially in Thailand and Indonesia",
        "Consider local banking partnerships to mitigate transfer costs"
      ],
      "concerns": [
        "Political instability in certain target markets could affect timeline",
        "Need contingency budget of additional ₹1.5Cr"
      ],
      "confidence": 0.75
    },
    "CTO": {
      "summary": "Technical implementation feasible but requires resource allocation.",
      "perspective": "Our platform architecture can support multi-region deployment. We'll need to implement data residency controls for compliance with local regulations. Language localization is required for Thailand, Vietnam, and Indonesia, while Singapore and Malaysia can use our existing English interface. Additional DevOps resources (2 FTEs) would be needed for managing regional infrastructure.",
      "key_points": [
        "Platform architecture supports expansion",
        "Data residency and compliance work needed",
        "Localization required for 3+ languages",
        "Need 2 additional DevOps engineers"
      ],
      "confidence": 0.9
    },
    "HR": {
      "summary": "Talent acquisition strategy needed for successful expansion.",
      "perspective": "We lack regional HR expertise and local compliance knowledge. I recommend establishing partnerships with local recruiting firms in each target country. Cultural differences will require adaptation of our onboarding and management practices. A dedicated Regional Director hire should precede other expansion activities.",
      "key_points": [
        "Require local HR partnerships in each country",
        "Need legal counsel for compliance with local labor laws",
        "Hire Regional Director as first priority",
        "Develop cultural training for existing leadership team"
      ],
      "confidence": 0.7
    }
  },
  "decisionSynthesis": {
    "recommendation": "Proceed with phased expansion to Southeast Asia, beginning with Singapore in Q3 2025.",
    "rationale": "The combination of strong market opportunity, financial viability, technical readiness, and addressable HR challenges supports a carefully managed expansion.",
    "action_items": [
      {"task": "Hire Regional Director", "owner": "HR", "timeline": "60 days"},
      {"task": "Establish banking relationships in Singapore", "owner": "CFO", "timeline": "90 days"},
      {"task": "Develop data residency architecture", "owner": "CTO", "timeline": "45 days"},
      {"task": "Create phased budget with performance gates", "owner": "CFO", "timeline": "30 days"}
    ],
    "risks": [
      "Political instability in certain markets",
      "Currency fluctuations affecting profitability",
      "Longer than expected hiring timelines"
    ],
    "confidence": 0.8,
    "dissenting_views": {
      "HR": "Cautions against aggressive timeline without local partnerships firmly established"
    }
  }
}
```

### Application Screenshot

![Boardroom AI Navigator Interface](https://via.placeholder.com/800x500.png?text=Boardroom+AI+Navigator+Interface)

*The Boardroom AI Navigator interface showing a simulated executive discussion about market expansion strategy, with agent responses and decision synthesis panel.*

## 📜 Project Provenance

**First-Mover Advantage**: Boardroom AI Navigator was conceptualized and development began in late 2023, predating similar approaches like Google's A2A framework. Our initial prototype demonstrating multi-agent consensus formation was published in February 2024.

You can view our [project history and development log](https://github.com/boardroom-ai/development-history) (archived March 2024) showing the evolution of our multi-agent architecture design.

Public development milestones:
- 2023 Q4: Initial multi-agent framework designed
- 2024 Jan: First executive simulation prototype demonstrated
- 2024 Feb: Agent consensus algorithm developed and tested
- 2024 Apr: Decision simulation with vector RAG integration
- 2024 May: Real-time collaborative simulation environment

## Customization Guide: Adding More Agent Types

The platform initially includes four core agent types (CEO, CFO, CTO, HR) but is designed to be extensible. Here's how to add more agent types:

### 1. Add Environment Variables

Add a new environment variable for your agent model in `.env.local`:

```
AI_MODEL_MARKETING=gpt-4-turbo  # For a Marketing agent
```

### 2. Update Agent Profiles

Extend the `agentProfiles` object in `lib/ai/agent-service.ts`:

```typescript
// Add a new agent profile
marketing: {
  role: 'Marketing',
  personality: 'Creative, customer-focused, growth-oriented',
  expertise: ['marketing strategy', 'brand development', 'customer acquisition'],
  modelEnvVar: 'AI_MODEL_MARKETING'
},
```

### 3. Create Agent-Specific Prompt (Optional)

For specialized agents, create a custom prompt file in `lib/ai/prompts/marketing-prompt.md`:

```markdown
You are the Marketing Director of [CompanyName].
Your focus is on brand development, customer acquisition, and growth strategies.
You are known for being creative, data-driven, and customer-oriented.

Current Scenario:
{{scenarioDetails}}

Discussion So Far:
{{discussionHistory}}

Based on this, provide your marketing perspective on how to proceed. Consider target audiences, 
channels, messaging, and how to measure success.
```

### 4. Update Agent Selection UI

Modify the agent selection UI component to include the new agent type:

```tsx
// In components/boardroom/agent-selector.tsx
const agentOptions = [
  { value: 'ceo', label: 'CEO' },
  { value: 'cfo', label: 'CFO' },
  { value: 'cto', label: 'CTO' },
  { value: 'hr', label: 'HR' },
  { value: 'marketing', label: 'Marketing' }, // New option
];
```

### 5. Add Avatar (Optional)

Add an avatar image for the new agent type:

```tsx
// In the agent UI component
const agentAvatars = {
  ceo: '/assets/avatars/ceo.png',
  cfo: '/assets/avatars/cfo.png',
  cto: '/assets/avatars/cto.png',
  hr: '/assets/avatars/hr.png',
  marketing: '/assets/avatars/marketing.png', // New avatar
};
```

This modular approach allows for easy addition of new agent types without significant code changes.

## 💼 Use Case Scenarios

Boardroom AI Navigator excels at facilitating complex business decisions through multi-agent reasoning. Here are real-world examples:

### Strategic Investment Review

**Scenario**: The CEO asks, "Should we reinvest ₹1 Cr in product development or marketing initiatives?"

**Agent Responses**:
- **CFO**: "Based on our current burn rate and runway calculation, we can safely allocate ₹1 Cr. Marketing shows a 3.2x ROI in previous campaigns, while product investment typically yields longer-term returns. I recommend a 60/40 split favoring marketing for Q3-Q4."
- **CTO**: "Our engineering capacity is currently at 85%. Additional product investment would require hiring 2-3 developers. Our technical debt is manageable, and the core platform can support new features without major refactoring."
- **HR**: "The talent market is competitive for senior developers. Onboarding would take 6-8 weeks minimum. The marketing team has capacity, but would benefit from specialized analytics talent."
- **CEO**: "The market opportunity window appears to be 6-9 months before competitors launch similar offerings."

**Decision Summary**: Based on agent consensus, a hybrid approach was recommended with ₹60L allocated to targeted marketing campaigns and ₹40L to critical product enhancements, with emphasis on features that could be completed within one quarter.

### Hiring Freeze Decision

**Scenario**: Revenue is down 10% QoQ. The CEO asks if the company should implement a hiring freeze.

**Agent Responses**:
- **HR**: "Current headcount is 120 FTEs with 8% natural attrition rate. Critical roles are in engineering (3) and sales (2). Implementing a freeze may impact team morale and slow critical initiatives."
- **CFO**: "Financial analysis shows our runway is 18 months at current burn. A selective freeze would extend this to 22 months, while a complete freeze extends to 24 months. Q3 projections suggest revenue stabilization."
- **CTO**: "The product roadmap depends on hiring 2 backend developers this quarter. Delaying would impact our competitive advantage in AI features planned for Q4."
- **CEO**: "Our investors expect us to show fiscal responsibility while maintaining momentum in key markets."

**Decision Summary**: Implement a modified hiring freeze, pausing all non-essential roles but proceeding with critical technical hires (specifically the 2 backend developers) to maintain product roadmap integrity. Revisit in 60 days with revenue checkpoints.

### Market Expansion Strategy

**Scenario**: The leadership team is evaluating whether to expand to Southeast Asia in the next fiscal year.

**Agent Responses**:
- **CEO**: "Southeast Asia represents a $3.2B market opportunity with 22% YoY growth. Our competitors have limited presence, creating a first-mover advantage window."
- **CFO**: "Expansion would require a minimum investment of ₹5Cr for market entry, with projected break-even in 18-24 months. Our cash reserves of ₹20Cr can support this while maintaining a 15-month runway."
- **CTO**: "Our platform requires localization for 4 languages and regional data sovereignty compliance. Infrastructure can scale with current architecture, but we'll need 2 more DevOps engineers."
- **HR**: "We lack regional HR expertise and local compliance knowledge. Recommend establishing a partnership with local recruiting firm and legal counsel."

**Decision Summary**: Proceed with a phased expansion approach, beginning with Singapore and Malaysia in Q3, followed by Thailand and Indonesia in Q4. Allocate ₹6.5Cr budget (adjusted upward based on compliance requirements), hire a Regional Director as top priority, and establish local partnerships before marketing launch.

## 🔮 Future Roadmap Ideas

-   **Voice/Chat Copilot**: Allow business users to interact with the platform and initiate simulations via natural language voice or chat commands.
-   **AI Coaching Mode**: A specialized mode where AI agents guide users (e.g., students, interns, new managers) through decision-making processes, offering explanations and learning resources.
-   **Auto-Generated Executive Summaries**: AI-powered generation of concise summaries from boardroom discussions and scenario outcomes, suitable for reporting to higher-ups or stakeholders.
-   **Federated Knowledge Bases**: Allow organizations to connect multiple, diverse internal and external knowledge sources with vector search capabilities for more comprehensive RAG.
-   **Boardroom Replay Mode**: A feature to visually replay an entire decision-making session, showing the flow of conversation, data presented, and decisions made, for review and learning.
-   **Advanced What-If Analysis Tools**: More sophisticated tools for exploring counterfactuals and the sensitivity of outcomes to different variables.
-   **Integration Marketplace**: Allow third-party developers to build and offer integrations or specialized agent skills.

## System Architecture

The Boardroom AI Navigator follows a modern architecture pattern optimized for real-time collaboration and AI processing:

```
┌─────────────────┐    ┌───────────────────────────────┐    ┌───────────────────┐
│  Client (Next)  │    │        Server (Next.js)       │    │  External Services│
├─────────────────┤    ├───────────────────────────────┤    ├───────────────────┤
│                 │    │                               │    │                   │
│  React UI       │◄──►│  Next.js App Router Pages     │    │  OpenAI API       │
│  Components     │    │  API Routes                   │    │  Claude API       │
│                 │    │                               │    │  Mistral API      │
│  Shadcn/UI      │    │  Server Components            │    │                   │
│  Tailwind       │    │  Server Actions               │◄──►│  Liveblocks       │
│                 │    │                               │    │                   │
│  Zustand/Jotai  │    │  Auth System                  │    │  Vercel KV        │
│  State          │    │  (NextAuth/Clerk)             │    │  (Vector Storage) │
│                 │    │                               │    │                   │
│  TanStack Query │◄──►│  Agent Framework              │◄──►│  Vercel Postgres  │
│                 │    │  (Langchain/AI SDK)           │    │                   │
│  Liveblocks     │◄──┐│                               │    │  Vercel Blob      │
│  Client         │   └│  Prisma ORM                   │    │  (File Storage)   │
│                 │    │                               │    │                   │
└─────────────────┘    └───────────────────────────────┘    └───────────────────┘
```

### Key Components:

#### Hybrid Architecture Note

This project uses a **hybrid Pages API + App Router architecture** by design:

- **App Router**: Primary API routes in `/app/api/` for standard REST endpoints
- **Pages API**: Socket.IO server in `/pages/api/socketio.ts` for real-time features

**Why the hybrid approach:**
- Next.js App Router doesn't natively support Socket.IO servers
- Real-time features (live participants, messaging) require WebSocket connections
- This maintains working real-time functionality while using modern App Router for other APIs

**Real-time features powered by Pages API:**
- Live participant tracking in boardroom sessions
- Real-time message broadcasting
- Agent status updates and typing indicators
- Session progress updates

1. **Frontend Layer**
   - React components using Shadcn/UI and Tailwind
   - Client-side state with Zustand/Jotai
   - Data fetching via TanStack Query
   - Real-time collaboration via Liveblocks client

2. **Application Layer**
   - Next.js App Router for routing
   - Server Components/Actions for seamless data fetching
   - API routes for agent interactions
   - Authentication through NextAuth.js or Clerk

3. **Core Services**
   - Agent Framework using Langchain/Vercel AI SDK
   - Prisma ORM for database operations
   - Real-time presence system

4. **External Services**
   - AI Providers (OpenAI, Claude, Mistral)
   - Liveblocks for collaboration
   - Vercel storage services (Postgres, KV, Blob)

This architecture ensures a responsive UI with real-time capabilities while leveraging serverless functions for AI processing and database operations.

## Troubleshooting and FAQs

### Database Connection Issues

**Problem**: Error connecting to the database.
**Solution**:
- Ensure Docker is running if using local database
- Check if the DATABASE_URL is properly formatted
- Make sure the database exists and appropriate users have access

```powershell
# Create database manually if needed
docker exec -it postgres psql -U postgres -c "CREATE DATABASE boardroom;"
```

### AI Model Errors

**Problem**: Errors when calling AI models.
**Solution**:
- Verify API keys are correctly set in .env.local
- Check if you're hitting rate limits with the provider
- Ensure the models specified in configuration actually exist

```powershell
# Test API key with a simple curl command
curl -s -H "Authorization: Bearer $env:AI_API_KEY" https://api.openai.com/v1/models | ConvertFrom-Json
```

### Next.js Build Issues

**Problem**: Build fails with TypeScript errors.
**Solution**:
- Fix type errors in your code
- If needed, temporarily add `// @ts-ignore` comments for third-party libraries
- Make sure all dependencies are installed

```powershell
# Type check without building
npm run typecheck

# Clean node_modules and reinstall if needed
rm -r -force node_modules
npm install
```

### UI Component Rendering Problems

**Problem**: UI components not rendering properly.
**Solution**:
- Check for missing CSS imports
- Verify that component props are correctly typed and passed
- Look for errors in browser console

### Database Schema Issues

**Problem**: Prisma schema sync errors.
**Solution**:
- Use Prisma Studio to inspect the database
- Reset the database during development if needed
- Apply migrations carefully

```powershell
# Run Prisma Studio to inspect database
npx prisma studio

# Reset development database (caution: deletes data)
npx prisma migrate reset
```

### Common FAQs

#### General Questions

**Q: How do I add another AI provider besides OpenAI?**
A: Add the provider's SDK in package.json, create a new client in agent-service.ts, and update the provider selection logic:

```typescript
// Example for adding Anthropic/Claude support
import { Anthropic } from '@anthropic-ai/sdk';

// Initialize the client
const getAnthropicClient = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In the getAgentResponse function
if (provider === 'anthropic') {
  const anthropic = getAnthropicClient();
  const completion = await anthropic.messages.create({
    model: modelName,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  });
  return {
    response: completion.content[0].text,
    agent: profile,
    timestamp: new Date().toISOString()
  };
}
```

**Q: Can I use this with SQL Server instead of PostgreSQL?**
A: Yes, update the Prisma schema's provider to "sqlserver" and adjust the connection string format:

```prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL") // format: "sqlserver://username:password@localhost:1433/database"
}
```

**Q: How do I deploy this to a non-Vercel environment?**
A: Use the Docker deployment option and adjust environment variables for your platform:

1. Create a `Dockerfile` in your project root:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY . .
   RUN npm install
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```
2. Build and run with environment variables:
   ```powershell
   docker build -t boardroom-ai .
   docker run -p 3000:3000 --env-file .env.production boardroom-ai
   ```

**Q: How can I preload knowledge for the AI agents?**
A: Implement the RAG (Retrieval Augmented Generation) pattern using vector stores:

1. Install necessary packages:
   ```powershell
   npm install @pinecone-database/pinecone langchain
   ```
2. Create embeddings for your documents:
   ```typescript
   import { Document } from 'langchain/document';
   import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
   import { Pinecone } from '@pinecone-database/pinecone';
   
   const pinecone = new Pinecone({
     apiKey: process.env.PINECONE_API_KEY,
     environment: process.env.PINECONE_ENVIRONMENT,
   });
   
   const embeddings = new OpenAIEmbeddings();
   const index = pinecone.Index(process.env.PINECONE_INDEX);
   
   // Add documents to vector store
   async function addDocuments(docs) {
     const vectors = await Promise.all(docs.map(async (doc) => {
       const vector = await embeddings.embedQuery(doc.text);
       return {
         id: doc.id,
         values: vector,
         metadata: { text: doc.text, source: doc.source }
       };
     }));
     await index.upsert(vectors);
   }
   ```

**Q: What are the minimum API requirements for the AI models?**
A: For best results, use models that support at least 4K-8K context windows and have strong reasoning capabilities (GPT-4, Claude 3, or equivalent). Specifically:

- OpenAI: GPT-4 Turbo or later (16K+ context)
- Anthropic: Claude 3 Opus or Sonnet (100K+ context)
- Mistral: Mistral Large or equivalent (32K+ context)
- Open source options: Llama 3 70B (instruct) or similar with sufficient context window

#### Integration Questions

**Q: How do I integrate with Microsoft Teams for meeting summaries?**
A: Use Microsoft Graph API with the Teams API endpoints:

1. Register an application in Azure Active Directory
2. Request necessary permissions for Teams data
3. Implement OAuth 2.0 flow to get access tokens
4. Use the Microsoft Graph SDK to retrieve meeting data

**Q: Can I connect the system to our internal company dashboard?**
A: Yes, create REST API endpoints for the key data points:

```typescript
// app/api/analytics/overview/route.ts
export async function GET() {
  const totalScenarios = await prisma.scenario.count();
  const activeUsers = await prisma.user.count({
    where: { 
      sessions: { some: { 
        startedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }}
    }
  });
  
  return Response.json({
    totalScenarios,
    activeUsers,
    // Add more metrics
  });
}
```

**Q: How do I set up Single Sign-On (SSO) with our identity provider?**
A: Next-Auth supports various SSO providers. For custom OIDC:

1. Install the OIDC provider:
   ```powershell
   npm install next-auth @auth/prisma-adapter
   ```
2. Add the provider to your NextAuth configuration:
   ```typescript
   import OIDCProvider from "next-auth/providers/openid-connect";
   
   // In your NextAuth configuration:
   providers: [
     OIDCProvider({
       id: "custom-sso",
       name: "Corporate SSO",
       wellKnown: process.env.OIDC_WELLKNOWN_URL,
       clientId: process.env.OIDC_CLIENT_ID,
       clientSecret: process.env.OIDC_CLIENT_SECRET,
       profile(profile) {
         return {
           id: profile.sub,
           name: profile.name,
           email: profile.email,
           image: profile.picture,
           // Map any additional fields
         };
       },
     }),
   ]
   ```

## Implementation Sequence for Cursor AI

The project can be implemented in phases with estimated timeframes:

### Phase 1: Foundation (1-2 weeks)
- Setup Next.js application with TypeScript and Tailwind
- Implement authentication system (NextAuth/Clerk)
- Create basic database schema with Prisma
- Build core UI components using Shadcn/UI

### Phase 2: AI Agent Framework (1-2 weeks)
- Implement agent service with OpenAI integration
- Create prompt engineering system
- Build agent message components and UI
- Setup basic scenario management

### Phase 3: Collaboration Features (1-2 weeks)
- Integrate Liveblocks for real-time collaboration
- Implement user presence indicators
- Build commenting and reply system
- Create session management

### Phase 4: Data Integration (1 week)
- Implement document upload and processing
- Create vector storage for RAG capabilities
- Build data visualization components
- Setup export functionality

### Phase 5: Polish and Deploy (1 week)
- Optimize performance and fix bugs
- Enhance UI/UX and responsiveness
- Setup production deployment pipeline
- Complete documentation and help guides

## 📊 Export Options

The Boardroom AI Navigator supports multiple export options to ensure insights can be shared and archived in various formats:

### Document Exports
- **PDF Reports**: Generate professional PDF reports with executive summaries, key decisions, and metrics.
- **Microsoft Office Integration**: Export directly to Word documents or PowerPoint presentations.
- **Markdown**: Simple text-based exports ideal for knowledge bases and wikis.

### Data Exports
- **CSV/Excel**: Export structured data from scenarios for further analysis.
- **JSON API**: Programmatically access simulation results through the platform's API.
- **BI Tool Connectors**: Direct integrations with business intelligence platforms (PowerBI, Tableau).

### Collaboration Exports
- **Session Recordings**: Export interactive replays of boardroom sessions.
- **Decision Logs**: Structured exports of all decisions with timestamps and reasoning.
- **Stakeholder Briefings**: Automatically generated executive briefings tailored to different stakeholder groups.