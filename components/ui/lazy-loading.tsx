import { lazy, Suspense } from 'react';
import { Skeleton } from './skeleton';

// Lazy load heavy components
export const LazyAnalyticsDashboard = lazy(() => 
  import('../analytics-dashboard').then(module => ({ 
    default: module.AnalyticsDashboard 
  }))
);

export const LazyDocumentUpload = lazy(() => 
  import('../document-upload').then(module => ({ 
    default: module.DocumentUpload 
  }))
);

export const LazyExecutiveBoardroom = lazy(() => 
  import('../executive-boardroom').then(module => ({ 
    default: module.ExecutiveBoardroom 
  }))
);

export const LazyAgentConfiguration = lazy(() => 
  import('../agent-configuration').then(module => ({ 
    default: module.AgentConfiguration 
  }))
);

// Loading skeletons for different component types
export const AnalyticsLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

export const DocumentUploadLoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-64" />
    <div className="border-2 border-dashed rounded-lg p-12">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  </div>
);

export const BoardroomLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const GenericLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-32 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

// Higher-order component for lazy loading with fallback
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  LoadingSkeleton: React.ComponentType = GenericLoadingSkeleton
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
