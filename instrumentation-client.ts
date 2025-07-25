import { init, captureRouterTransitionStart } from '@sentry/nextjs';

// Client-side Sentry initialization
init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Error Filtering
  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      // Skip HMR and development-specific errors
      if (event.exception?.values?.[0]?.value?.includes('ChunkLoadError')) {
        return null;
      }
      if (event.exception?.values?.[0]?.value?.includes('Loading chunk')) {
        return null;
      }
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver loop limit exceeded')) {
        return null;
      }
    }
    
    // Filter out common browser extensions errors
    if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
      frame => frame.filename?.includes('extension://')
    )) {
      return null;
    }
    
    return event;
  },
  
  // User Privacy
  beforeSendTransaction(event) {
    // Remove sensitive data from transaction names
    if (event.transaction) {
      event.transaction = event.transaction.replace(/\/\d+/g, '/[id]');
    }
    return event;
  },
  
  // Environment Configuration
  environment: process.env.NODE_ENV,
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
  
  // Integrations
  integrations: [
    // Client-specific integrations will be added automatically
  ],
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
});

// Export router transition start hook for navigation instrumentation
export const onRouterTransitionStart = captureRouterTransitionStart;
