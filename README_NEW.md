# Business Assistance AI Agents

**A Decision Intelligence Platform powered by multi-agent AI systems for strategic business decision-making.**

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Application Pages](#application-pages)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [AI Agent System](#ai-agent-system)
- [Real-time Communication](#real-time-communication)
- [Workflow System](#workflow-system)
- [API Routes](#api-routes)
- [Core Libraries](#core-libraries-lib)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Development](#development)
- [Example Flows](#example-flows)
- [Current Limitations](#current-limitations)
- [Future Work](#future-work)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Business Assistance AI Agents is a sophisticated web application that leverages multiple AI agents to assist executives and business leaders with strategic decision-making. The platform provides an "Executive Boardroom" experience where AI agents representing different business perspectives (CEO, CFO, CMO, etc.) collaborate to analyze scenarios, provide insights, and generate actionable recommendations.

### Problem It Solves

Business leaders face complex decisions requiring expertise across multiple domains—finance, marketing, operations, risk management, and more. This platform simulates a virtual boardroom where specialized AI agents contribute domain-specific analysis, enabling faster and more comprehensive decision support.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15.2.4 (App Router) |
| **Language** | TypeScript 5 |
| **Frontend** | React 18, Tailwind CSS, Shadcn/UI (Radix primitives) |
| **Authentication** | NextAuth.js with Prisma adapter |
| **Database** | PostgreSQL with Prisma ORM |
| **AI Providers** | OpenAI, Anthropic Claude, Google Generative AI |
| **Multi-Agent** | KaibanJS, OpenAI Agents SDK |
| **Vector Database** | Pinecone (for RAG) |
| **Embeddings** | @xenova/transformers (local embeddings) |
| **Real-time** | Socket.io, Liveblocks |
| **Caching** | Redis (ioredis) |
| **Data Visualization** | Recharts |
| **Market Data** | Yahoo Finance API, NewsAPI |
| **Document Export** | React-PDF, ExcelJS |
| **Monitoring** | Sentry |

---

## Features

### Backend
- Multi-agent AI collaboration system
- RAG (Retrieval-Augmented Generation) for document-aware responses
- Real-time WebSocket communication
- Authentication with role-based access control
- Rate limiting and security headers
- Market data integration

### Frontend
- Executive Boardroom interface
- Dashboard with analytics
- Scenario planning tools
- Document management
- Dark/light theme support

---

## Application Pages

### Dashboard Layout (`app/(dashboard)/`)

All dashboard pages share a common layout with sidebar navigation and header.

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/dashboard` | Home page with stats, quick actions, and onboarding |
| **Boardroom** | `/boardroom/[sessionId]` | Executive AI boardroom session interface |
| **Scenarios** | `/scenarios` | Browse templates and manage custom scenarios |
| **Scenarios (New)** | `/scenarios/new` | Create new business scenario |
| **Documents** | `/documents` | Upload and manage documents for RAG |
| **Analytics** | `/analytics` | Session analytics, decision metrics, usage stats |
| **Decisions** | `/decisions` | Track and review strategic decisions |
| **Explainability** | `/explainability` | AI transparency, bias detection, audit trails |
| **Settings** | `/settings` | User profile, preferences, notifications |
| **Board Sessions** | `/board-sessions` | List of all boardroom sessions |
| **Summaries** | `/summaries` | Decision summaries and reports |
| **User Experience** | `/user-experience` | UX feedback and improvements |

---

## Project Structure

```
├── app/                    # Next.js App Router pages and API routes
├── components/             # React components (UI + feature components)
├── hooks/                  # Custom React hooks
├── lib/                    # Core utilities, AI integrations, database
├── prisma/                 # Database schema and migrations
├── types/                  # TypeScript type definitions
├── scripts/                # Utility scripts
├── docs/                   # Documentation
└── public/                 # Static assets
```

### Custom Hooks (`hooks/`)

| Hook | Purpose |
|------|---------|
| `useStreamingBoardroom` | Manages streaming AI responses with real-time updates, document citations, and explainability metadata |
| `useBoardroomSession` | Session state management, agent selection, message handling, and export functionality |
| `useScenarios` | CRUD operations for business scenarios |
| `useSocket` | Socket.io connection management with reconnection, latency tracking, and event handling |
| `useOnboarding` | User onboarding flow tracking (welcome → create scenario → start discussion → upload docs) |
| `useTheme` | Enhanced theme management with auto-switching, high contrast, and reduced motion support |
| `useToast` | Toast notification system |
| `useMobile` | Mobile device detection |

### Key Components (`components/`)

#### Boardroom Components (`components/boardroom/`)
| Component | Purpose |
|-----------|---------|
| `BoardroomHeader` | Session header with scenario info |
| `AgentSelector` | Select which AI executives to include |
| `MessageInput` | User message input with send button |
| `StreamingMessageList` | Real-time streaming message display |
| `StreamingMessage` | Individual streaming message with typing animation |
| `DocumentSelector` | Select documents for RAG context |
| `DocumentContext` | Display cited documents and excerpts |
| `BoardroomProgress` | Session progress indicator |

#### Core Components
| Component | Purpose |
|-----------|---------|
| `ExecutiveBoardroom` | Main boardroom interface orchestrating all sub-components |
| `AppSidebar` | Navigation sidebar with all main routes |
| `Header` | Top header with search, notifications, user menu |
| `DocumentUpload` | Drag-and-drop document upload with progress |
| `ScenarioCard` | Scenario display card with status and actions |
| `ScenarioEditor` | Create/edit business scenarios |
| `DecisionSummary` | AI-generated decision summary display |
| `LiveParticipants` | Show active users in a session |

#### Explainability Components (`components/explainability/`)
| Component | Purpose |
|-----------|---------|
| `ExplainabilityDashboard` | AI transparency and audit interface |
| `DecisionExplainer` | Step-by-step decision reasoning display |

#### Export Components (`components/export/`)
- `ExportDialog` - Export sessions as PDF or Excel reports

### Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and npm scripts |
| `next.config.mjs` | Next.js configuration (images, rewrites) |
| `tsconfig.json` | TypeScript compiler configuration |
| `tailwind.config.ts` | Tailwind CSS theme with CSS variables |
| `middleware.ts` | Auth middleware with rate limiting |
| `components.json` | Shadcn/UI component library config |
| `instrumentation.ts` | Server-side error tracking setup |

---

## Database Schema

The application uses **SQLite** (via Prisma ORM) with the following data models:

### Authentication Models
| Model | Purpose |
|-------|---------|
| `User` | User accounts with email, password, role, company, and organization support |
| `Account` | OAuth provider accounts (for social login) |
| `Session` | Active user sessions |
| `VerificationToken` | Email verification tokens |

### Core Business Models
| Model | Purpose |
|-------|---------|
| `Scenario` | Business scenarios with parameters, tags, and status (draft/active/archived) |
| `BoardroomSession` | Virtual boardroom sessions linked to scenarios with selected AI agents |
| `Participant` | Users participating in sessions (observer/facilitator/participant roles) |
| `Message` | Messages in sessions with support for threaded replies and agent attribution |
| `Decision` | Decisions made during sessions with confidence and risk scores |
| `Document` | Uploaded documents linked to sessions and users |
| `VectorEmbedding` | RAG vector store for document embeddings |

### Key Relationships
- Users create **Scenarios** → Scenarios have **BoardroomSessions** → Sessions contain **Messages**, **Decisions**, and **Participants**
- Multi-tenancy supported via `organizationId` field

---

## AI Agent System

### Executive Roles

The platform simulates a virtual C-suite with specialized AI agents:

| Agent | Role | Expertise |
|-------|------|-----------|
| **CEO** | Chief Executive Officer | Strategic vision, leadership, overall direction |
| **CFO** | Chief Financial Officer | Financial analysis, budgeting, ROI calculations |
| **CTO** | Chief Technology Officer | Technology strategy, implementation feasibility |
| **CHRO** | Chief Human Resources Officer | People impact, organizational change, culture |

### Agent Features
- **Confidence Levels**: High, Medium, Low confidence indicators on responses
- **Consensus Building**: Full, Majority, Split, or No Consensus detection
- **Decision Tracking**: Approve/Reject/Abstain votes with reasoning
- **Analytics**: Response times, participation rates, collaboration scores

---

## Real-time Communication

The platform uses **Socket.io** for real-time features:

### Socket Events
- **Connection**: connect, disconnect, reconnect handling
- **Sessions**: join/leave session, session updates
- **Messages**: send, receive, update, delete messages
- **User Activity**: typing indicators, user presence
- **Agent Status**: online/offline, thinking/processing states

---

## Workflow System

Supports complex multi-step business workflows:

### Workflow Step Types
- `ai_analysis` - AI-powered analysis
- `decision_point` - Decision gates
- `approval` - Approval workflows (any/all/majority)
- `action` - Automated actions (email, calendar, tasks)
- `condition` - Conditional branching
- `escalation` - Timeout-based escalation

### Workflow Categories
- Financial, HR, Strategic, Operational, Compliance, General

---

## API Routes (`app/api/`)

All API routes require authentication (via NextAuth.js) except public routes. Rate limiting is applied.

### AI & Agent APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | POST | Get individual agent response (supports streaming via SSE) |
| `/api/boardroom` | POST | Multi-agent discussion with all selected executives |
| `/api/boardroom/stream` | POST | Streaming multi-agent responses |
| `/api/collaboration` | POST | Start multi-agent collaboration sessions |
| `/api/memory` | POST | Agent memory operations (store, retrieve, learn) |
| `/api/explainable-ai` | POST | Decision tracking, audit trails, reasoning analysis |
| `/api/workflows` | GET/POST | Workflow template management and execution |

### Document & RAG APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/documents` | POST | Upload documents (PDF, Word, Excel, CSV - max 10MB) |
| `/api/documents` | GET | List user's documents |
| `/api/rag` | GET | RAG system status and Pinecone stats |
| `/api/rag` | POST | Add documents to RAG, semantic search |

### Data APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scenarios` | GET/POST/PUT/DELETE | CRUD for business scenarios |
| `/api/sessions` | GET/POST | Boardroom session management |
| `/api/decisions` | GET/POST | Decision tracking and voting |
| `/api/market` | GET | Real-time market data (stocks, indices, news) |
| `/api/analytics` | GET | User analytics and metrics |
| `/api/dashboard` | GET | Dashboard summary data |

### Auth & System APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | - | NextAuth.js authentication endpoints |
| `/api/user` | GET/PUT | User profile management |
| `/api/health` | GET | System health check |
| `/api/security` | - | Security audit endpoints |

---

## Core Libraries (`lib/`)

### AI Services (`lib/ai/`)

| Service | Description |
|---------|-------------|
| `agent-service.ts` | Core agent service supporting Google Gemini, Anthropic Claude, with per-agent API keys and model assignments |
| `collaboration-service.ts` | Multi-agent collaboration with proposals, challenges, voting, and consensus building |
| `memory-service.ts` | Persistent memory for agents to learn from past decisions and outcomes |
| `explainable-ai-service.ts` | Decision transparency with reasoning chains, evidence tracking, and audit trails |
| `decision-engine.ts` | Business decision processing engine |
| `workflow-engine.ts` | Complex multi-step workflow orchestration |

### RAG System (Retrieval-Augmented Generation)

| File | Purpose |
|------|---------|
| `rag.ts` | Document ingestion and semantic search interface |
| `embeddings.ts` | Embedding generation with OpenAI (`text-embedding-3-large`) and local fallback (`all-MiniLM-L6-v2`) |
| `local-embeddings.ts` | Local embeddings using @xenova/transformers |
| `pinecone.ts` | Pinecone vector database operations with multi-index support |

### Market Intelligence (`lib/market/`)

- **Yahoo Finance** integration for real-time stock data
- **NewsAPI** for financial news
- Market indices (S&P 500, NASDAQ, DOW, VIX)
- Sector performance analysis
- Demo mode with mock data

### Caching (`lib/cache/`)

- **Redis** for distributed caching (optional)
- **In-memory fallback** when Redis unavailable
- Agent response caching
- Session state caching

### Security (`lib/security/`)

| File | Purpose |
|------|---------|
| `rate-limiting.ts` | Request rate limiting with different tiers (general, auth, AI) |
| `input-sanitizer.ts` | Prompt injection prevention, XSS protection, SQL injection blocking |
| `enterprise-security.ts` | Enterprise security features |

**Rate Limits:**
- General API: 1000 requests / 15 minutes
- Authentication: 5 attempts / 15 minutes
- AI endpoints: 60 requests / minute

**Input Sanitization:**
- Blocks prompt injection patterns ("ignore previous instructions", "jailbreak", etc.)
- Removes HTML/script tags
- Flags suspicious content for review

### Authentication (`lib/auth/config.ts`)

Supported providers:
- **Credentials** - Email/password with bcrypt hashing
- **Google OAuth** - Google sign-in
- **GitHub OAuth** - GitHub sign-in

Demo accounts available:
- `demo@businessai.com` / `demo123`
- `test@example.com` / `test123`
- `guest@demo.com` / `guest123`

### Configuration (`lib/config/env.ts`)

Environment variable validation using **Zod** schema with:
- AI provider selection (gemini/openai/anthropic/mistral)
- Per-agent model assignments
- Database and auth configuration
- Optional service keys

---

## Setup & Installation

### Prerequisites

- **Node.js** 18+ 
- **pnpm** (recommended) or npm
- **AI Provider API Key** (at least one of: Google Gemini, OpenAI, Anthropic)
- **Pinecone Account** (for RAG/vector search)

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/Jaydpatel01/Business-Assistance-AI-Agents.git
cd Business-Assistance-AI-Agents

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Initialize the database
npx prisma generate
npx prisma db push

# Start development server
pnpm dev
```

### Database Setup

The project uses SQLite by default (file-based, no setup required):

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### Utility Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Reset Database | `npx ts-node scripts/reset-database.ts` | Clears all user data for fresh testing |

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm build:prod` | Full production build with checks |
| `pnpm analyze` | Analyze bundle size |
| `pnpm clean` | Remove `.next` build folder |

---

## Development

### Running in Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Full production build with type checking and linting
pnpm build:prod

# Or just build
pnpm build

# Start production server
pnpm start
```

### Bundle Analysis

```bash
pnpm analyze
```

This generates a bundle analysis report to identify large dependencies.

---

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Core Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
APP_NAME="Business AI Agents"

# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# AI Provider (gemini | openai | anthropic | mistral)
AI_PROVIDER=gemini

# AI API Keys (based on provider)
GEMINI_API_KEY=your-gemini-key
# AI_API_KEY=your-openai-key
# ANTHROPIC_API_KEY=your-anthropic-key

# Per-Agent API Keys (optional, for load distribution)
# GEMINI_API_KEY_CEO=your-key
# GEMINI_API_KEY_CFO=your-key
# GEMINI_API_KEY_CTO=your-key
# GEMINI_API_KEY_HR=your-key

# Per-Agent Model Assignments
AI_MODEL_CEO=gemini-1.5-pro
AI_MODEL_CFO=gemini-1.5-pro
AI_MODEL_CTO=gemini-1.5-pro
AI_MODEL_HR=gemini-1.5-pro
AI_MODEL=gemini-1.5-pro

# Vector Database (RAG)
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX=your-index-name
PINECONE_INDEX_LOCAL=your-local-embeddings-index

# OpenAI (for embeddings, optional)
OPENAI_API_KEY=your-openai-key

# Market Data
NEWS_API_KEY=your-newsapi-key

# Real-time Collaboration (optional)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your-liveblocks-key

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Caching (optional)
REDIS_URL=redis://localhost:6379
```

---

## Example Flows

### Flow 1: Creating a New Business Scenario and Getting AI Insights

```
1. User logs in → Dashboard
2. Click "New Scenario" → /scenarios/new
3. Fill in scenario details:
   - Name: "Q4 Market Expansion Strategy"
   - Description: "Evaluate expansion into European markets"
   - Industry: Technology
   - Tags: expansion, international, growth
4. Save scenario → Redirected to scenario detail page
5. Click "Start Discussion" → /boardroom/new?scenario={id}
6. Select AI agents: CEO, CFO, CTO
7. (Optional) Select uploaded documents for context
8. Enter initial query: "What are the key risks and opportunities?"
9. AI agents respond in real-time via streaming
10. Each agent provides perspective based on their expertise
11. View decision recommendations → Export PDF summary
```

### Flow 2: Document-Augmented AI Discussion (RAG)

```
1. Navigate to Documents → /documents
2. Upload company documents (PDF, Word, Excel)
3. Documents are processed:
   - Text extracted
   - Chunked into segments
   - Embeddings generated (OpenAI or local)
   - Stored in Pinecone vector database
4. Start boardroom session
5. Select relevant documents in DocumentSelector
6. Ask question: "Based on our Q3 financials, what's the ROI projection?"
7. RAG system finds relevant document chunks
8. AI agents cite specific documents in responses
9. Document citations shown with excerpts
```

### Flow 3: Multi-Agent Collaboration

```
1. Start collaboration via /api/collaboration
2. Define collaboration plan:
   - Topic: "Should we acquire CompanyX?"
   - Required agents: [CEO, CFO, CTO, CHRO]
   - Max rounds: 3
   - Consensus threshold: 75%
3. CEO opens with strategic perspective
4. CFO challenges with financial concerns
5. CTO adds technical due diligence insights
6. CHRO raises cultural integration risks
7. Agents respond to each other's points
8. System detects consensus or disagreement
9. Final synthesis generated with confidence score
```

---

## Current Limitations

- **Database**: Currently uses SQLite for simplicity; production deployments should migrate to PostgreSQL
- **Vector Store**: Requires Pinecone account; no local vector store fallback
- **AI Providers**: Requires at least one AI provider API key (Gemini, OpenAI, or Anthropic)
- **Real-time**: Socket.io server must be separately configured for production scaling
- **Embeddings**: Local embeddings (384D) have lower quality than OpenAI embeddings (3072D)
- **Sentry**: Error monitoring is currently disabled for build stability
- **Multi-tenancy**: Organization-based isolation is partially implemented
- **Authentication**: Currently supports credentials and Google OAuth; other providers need configuration

---

## Future Work

- [ ] **PostgreSQL Migration**: Add production database support with connection pooling
- [ ] **Local Vector Store**: Add ChromaDB or Qdrant as Pinecone alternative
- [ ] **Agent Memory Persistence**: Store agent memories in database (currently in-memory)
- [ ] **Workflow Automation**: Complete workflow engine with scheduled triggers
- [ ] **Advanced Analytics**: Historical trend analysis and predictive insights
- [ ] **Team Collaboration**: Multi-user real-time collaboration via Liveblocks
- [ ] **Mobile App**: React Native companion app
- [ ] **API Rate Limiting**: Per-user API quotas and usage tracking
- [ ] **Audit Logging**: Complete audit trail for compliance requirements
- [ ] **Custom Agent Training**: Fine-tune agents on company-specific data
- [ ] **Integration APIs**: Connect to external tools (Slack, Teams, Salesforce)

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is private. All rights reserved.
