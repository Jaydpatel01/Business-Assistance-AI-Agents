/**
 * Advanced Toast Notification System
 * 
 * Enhanced notification system with rich content, actions, and positioning
 * Supports different types, persistence, and user interactions
 */

'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  X, 
  RefreshCw,
  Star
} from 'lucide-react';

interface ToastAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}

interface AdvancedToast {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration?: number; // 0 for persistent
  actions?: ToastAction[];
  progress?: number; // For progress notifications
  persistent?: boolean;
  dismissible?: boolean;
  priority?: 'low' | 'normal' | 'high';
  category?: string;
  metadata?: Record<string, string | number | boolean>;
}

interface ToastContextType {
  toasts: AdvancedToast[];
  addToast: (toast: Omit<AdvancedToast, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<AdvancedToast>) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useAdvancedToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useAdvancedToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastProvider({ 
  children, 
  maxToasts = 5, 
  position = 'top-right' 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<AdvancedToast[]>([]);

  const addToast = (toast: Omit<AdvancedToast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: AdvancedToast = {
      id,
      dismissible: true,
      priority: 'normal',
      ...toast
    };

    setToasts(prev => {
      // Sort by priority (high -> normal -> low)
      const sortedToasts = [...prev, newToast].sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority || 'normal'] - priorityOrder[a.priority || 'normal'];
      });

      // Limit number of toasts
      return sortedToasts.slice(0, maxToasts);
    });

    // Auto-dismiss if duration is set
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const updateToast = (id: string, updates: Partial<AdvancedToast>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  };

  const clearAll = () => {
    setToasts([]);
  };

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 flex flex-col gap-2 p-4 pointer-events-none';
    
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-0 right-0`;
      case 'top-left':
        return `${baseClasses} top-0 left-0`;
      case 'bottom-right':
        return `${baseClasses} bottom-0 right-0`;
      case 'bottom-left':
        return `${baseClasses} bottom-0 left-0`;
      case 'top-center':
        return `${baseClasses} top-0 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseClasses} bottom-0 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-0 right-0`;
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast, clearAll }}>
      {children}
      
      {/* Toast Container */}
      <div className={getPositionClasses()}>
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
            onUpdate={(updates) => updateToast(toast.id, updates)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface ToastComponentProps {
  toast: AdvancedToast;
  onRemove: () => void;
  onUpdate: (updates: Partial<AdvancedToast>) => void;
}

function ToastComponent({ toast, onRemove }: ToastComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(toast.duration || 0);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0 && !toast.persistent) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            onRemove();
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [toast.duration, toast.persistent, onRemove]);

  const getTypeIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'loading':
        return <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getTypeColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20';
      case 'error':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20';
      case 'info':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
      case 'loading':
        return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-950/20';
      default:
        return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-950/20';
    }
  };

  const getPriorityBorder = () => {
    switch (toast.priority) {
      case 'high':
        return 'ring-2 ring-red-200 dark:ring-red-800';
      case 'normal':
        return '';
      case 'low':
        return 'opacity-80';
      default:
        return '';
    }
  };

  const progressPercentage = toast.duration && timeLeft > 0 
    ? ((toast.duration - timeLeft) / toast.duration) * 100 
    : toast.progress || 0;

  return (
    <Card 
      className={`
        pointer-events-auto w-96 border-l-4 transition-all duration-300 ease-in-out
        ${getTypeColor()}
        ${getPriorityBorder()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getTypeIcon()}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{toast.title}</h4>
                {toast.priority === 'high' && (
                  <Badge variant="destructive" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    High Priority
                  </Badge>
                )}
                {toast.category && (
                  <Badge variant="outline" className="text-xs">
                    {toast.category}
                  </Badge>
                )}
              </div>
              
              {toast.message && (
                <p className="text-sm text-muted-foreground">
                  {toast.message}
                </p>
              )}
              
              {/* Progress indicator */}
              {(toast.progress !== undefined || (toast.duration && timeLeft > 0)) && (
                <div className="space-y-1">
                  <Progress value={progressPercentage} className="h-1" />
                  {toast.progress !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      {Math.round(progressPercentage)}% complete
                    </div>
                  )}
                </div>
              )}
              
              {/* Actions */}
              {toast.actions && toast.actions.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {toast.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={action.action}
                      className="text-xs"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {toast.dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Time remaining indicator */}
        {toast.duration && timeLeft > 0 && !toast.persistent && (
          <div className="mt-2 text-xs text-muted-foreground">
            Auto-dismiss in {Math.ceil(timeLeft / 1000)}s
          </div>
        )}
      </div>
    </Card>
  );
}

// Convenient hook for common toast types
export function useToastActions() {
  const { addToast } = useAdvancedToast();

  const success = (title: string, message?: string, actions?: ToastAction[]) => {
    return addToast({
      type: 'success',
      title,
      message,
      actions,
      duration: 5000
    });
  };

  const error = (title: string, message?: string, actions?: ToastAction[]) => {
    return addToast({
      type: 'error',
      title,
      message,
      actions,
      duration: 0, // Persistent for errors
      priority: 'high'
    });
  };

  const warning = (title: string, message?: string, actions?: ToastAction[]) => {
    return addToast({
      type: 'warning',
      title,
      message,
      actions,
      duration: 7000
    });
  };

  const info = (title: string, message?: string, actions?: ToastAction[]) => {
    return addToast({
      type: 'info',
      title,
      message,
      actions,
      duration: 5000
    });
  };

  const loading = (title: string, message?: string) => {
    return addToast({
      type: 'loading',
      title,
      message,
      duration: 0,
      dismissible: false
    });
  };

  const progress = (title: string, progressValue: number, message?: string) => {
    return addToast({
      type: 'info',
      title,
      message,
      progress: progressValue,
      duration: 0,
      dismissible: false
    });
  };

  // Pre-built common notifications
  const sessionSaved = () => success(
    "Session Saved",
    "Your boardroom session has been saved successfully.",
    [
      {
        label: "View Details",
        action: () => window.location.href = "/boardroom/sessions"
      }
    ]
  );

  const documentUploaded = (filename: string) => success(
    "Document Uploaded",
    `${filename} has been processed and added to your library.`,
    [
      {
        label: "Open Document",
        action: () => window.location.href = "/documents"
      }
    ]
  );

  const exportReady = (exportType: string) => success(
    "Export Ready",
    `Your ${exportType} export is ready for download.`,
    [
      {
        label: "Download",
        action: () => {}, // Would trigger download
        variant: "default" as const
      }
    ]
  );

  const connectionLost = () => error(
    "Connection Lost",
    "Unable to connect to the server. Please check your internet connection.",
    [
      {
        label: "Retry",
        action: () => window.location.reload()
      }
    ]
  );

  const featureUpdate = (feature: string) => info(
    "New Feature Available",
    `${feature} has been updated with new capabilities.`,
    [
      {
        label: "Learn More",
        action: () => window.location.href = "/help"
      }
    ]
  );

  return {
    success,
    error,
    warning,
    info,
    loading,
    progress,
    // Pre-built notifications
    sessionSaved,
    documentUploaded,
    exportReady,
    connectionLost,
    featureUpdate
  };
}
