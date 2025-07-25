'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { Activity } from 'lucide-react';
import { StableMonitoringDashboard } from './monitoring-dashboard';

interface SimpleMonitoringControlsProps {
  variant?: 'header' | 'floating';
}

// Global state to ensure only one dashboard instance
const globalMonitoringState: {
  isVisible: boolean;
  setters: Set<(visible: boolean) => void>;
} = {
  isVisible: false,
  setters: new Set(),
};

export function SimpleMonitoringControls({ variant = 'floating' }: SimpleMonitoringControlsProps) {
  const [isMonitoringVisible, setIsMonitoringVisible] = useState(globalMonitoringState.isVisible);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    setIsDevelopment(process.env.NODE_ENV === 'development');
    
    // Register this setter with global state
    globalMonitoringState.setters.add(setIsMonitoringVisible);
    
    return () => {
      globalMonitoringState.setters.delete(setIsMonitoringVisible);
    };
  }, []);

  const toggleMonitoring = () => {
    const newState = !globalMonitoringState.isVisible;
    globalMonitoringState.isVisible = newState;
    
    // Update all instances
    globalMonitoringState.setters.forEach(setter => setter(newState));
  };

  // Don't render in production
  if (!isDevelopment) return null;

  if (variant === 'header') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMonitoring}
        className="h-8 px-2 text-xs hidden md:flex items-center gap-1"
        title="Toggle Performance Monitor (Ctrl+Shift+M)"
      >
        <Activity className="h-3 w-3" />
        Monitor
      </Button>
    );
  }

  return (
    <>
      {/* Floating Action Button - only render for floating variant */}
      <div className="fixed bottom-4 left-4 z-40">
        <Button
          onClick={toggleMonitoring}
          variant="outline"
          size="sm"
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border-2 hover:bg-accent"
          title={isMonitoringVisible ? 'Hide Performance Monitor' : 'Show Performance Monitor'}
        >
          <Activity className="h-4 w-4" />
        </Button>
      </div>

      {/* Only render the dashboard once - in the floating variant */}
      <StableMonitoringDashboard 
        isVisible={isMonitoringVisible}
        onToggle={toggleMonitoring}
      />
    </>
  );
}
