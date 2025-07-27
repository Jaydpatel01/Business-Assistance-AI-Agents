import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware() {
    // Add custom middleware logic here if needed
    // For now, just let the request pass through
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated for protected routes
        const { pathname } = req.nextUrl
        
        // Public routes that don't require authentication
        const publicRoutes = [
          '/',                         // Root page (handles redirect internally)
          '/login',                    // Login page
          '/auth/signup',              // Signup page
          '/api/auth',                 // NextAuth.js authentication endpoints
          '/api/health',               // System health checks
          '/demo',                     // Demo pages (Phase 2-6 demonstrations)
          '/api/demo'                  // Demo API endpoints (if any)
        ]
        
        // Check if the current path is a public route
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }
        
        // All API routes (except public ones above) require authentication
        // This includes:
        // - /api/rag (RAG operations)
        // - /api/agents (Agent interactions)
        // - /api/boardroom (Boardroom sessions)
        // - /api/collaboration (Multi-agent collaboration)
        // - /api/memory (Memory & learning)
        // - /api/explainable-ai (Decision transparency)
        // - /api/market (Market intelligence)
        // - /api/documents (Document management)
        // - /api/scenarios (Scenario management)
        // - /api/sessions (Session management)
        // - /api/user (User data)
        // - /api/analytics (Analytics data)
        // - /api/dashboard (Dashboard data)
        
        // Protected dashboard and app routes also require authentication:
        // - /dashboard/* (Main dashboard)
        // - /boardroom/* (Boardroom interface)
        // - /agents/* (Agent management)
        // - /documents/* (Document management)
        // - /scenarios/* (Scenario management)
        // - /settings/* (User settings)
        // - All other authenticated pages
        
        // For all protected routes, require authentication token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public static assets (images, etc.)
     * 
     * All other routes will be checked for authentication
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)',
  ],
}
