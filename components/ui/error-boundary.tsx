'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableSentry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Optional Sentry integration
    if (this.props.enableSentry && process.env.NODE_ENV === 'production') {
      try {
        // Dynamic import to avoid bundling Sentry if not needed
        import('@sentry/nextjs').then(Sentry => {
          Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
            },
            tags: {
              component: 'ErrorBoundary',
            },
            extra: {
              errorInfo,
            },
          });
        });
      } catch (sentryError) {
        console.warn('Failed to report error to Sentry:', sentryError);
      }
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl text-destructive">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We're sorry, but something unexpected happened. You can try refreshing the page or going back to the dashboard.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-muted rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 text-xs font-mono text-muted-foreground">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div className="mt-2">
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  onClick={this.handleRetry} 
                  variant="default" 
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleReload} 
                  variant="outline" 
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/dashboard">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lightweight error boundary for specific components
export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: ReactNode; 
  componentName: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Component Error</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The {componentName} component encountered an error. Please try refreshing the page.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for async error handling
export function useErrorHandler() {
  return (error: Error, additionalInfo?: string) => {
    console.error('Async error:', error);
    
    // In production, log to monitoring service
    if (process.env.NODE_ENV === 'production') {
      try {
        // Dynamic import to avoid bundling Sentry if not needed
        import('@sentry/nextjs').then(Sentry => {
          Sentry.captureException(error, { 
            extra: { additionalInfo } 
          });
        });
      } catch (sentryError) {
        console.warn('Failed to report async error to Sentry:', sentryError);
      }
    }
  };
}

// Sentry-enabled error boundary for backward compatibility
export function SentryErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary 
      enableSentry={true} 
      fallback={fallback}
    >
      {children}
    </ErrorBoundary>
  );
}
