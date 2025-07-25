// Type definitions for better type safety
interface RequestContext {
  method: string;
  url: string;
  headers: Headers;
}

export async function register(): Promise<void> {
  // Skip ALL Sentry initialization to avoid build issues
  console.log('Sentry initialization skipped (disabled for build stability)');
  return;
}

// Utility function for capturing errors with Sentry (can be used throughout the app)
export async function captureServerError(
  error: unknown, 
  context?: Partial<RequestContext>
): Promise<void> {
  // Skip Sentry error capture - just log to console
  console.error('Server error:', error);
  if (context) {
    console.error('Error context:', context);
  }
}
