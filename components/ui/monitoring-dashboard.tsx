'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { 
  Activity, 
  Clock, 
  Database, 
  Wifi, 
  CheckCircle,
  XCircle,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface SystemMetrics {
  performance: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  connectivity: {
    online: boolean;
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  api: {
    responseTime: number;
    errorRate: number;
    successRate: number;
  };
  cache: {
    hitRate: number;
    size: number;
  };
  timestamp: number;
}

interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

interface ExtendedNavigator extends Navigator {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
}

interface StableMonitoringDashboardProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function StableMonitoringDashboard({ isVisible, onToggle }: StableMonitoringDashboardProps) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    performance: { lcp: 1200, fid: 15, cls: 0.1, ttfb: 400 },
    connectivity: { online: true, effectiveType: '4g', downlink: 10, rtt: 50 },
    api: { responseTime: 200, errorRate: 0, successRate: 100 },
    cache: { hitRate: 85, size: 1024 },
    timestamp: Date.now(),
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Stable update function with throttling to prevent infinite re-renders
  const updateMetrics = useCallback(() => {
    // Skip if running on server-side (SSR)
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const now = Date.now();
    // Only update if at least 10 seconds have passed since last update
    if (now - lastUpdateRef.current < 10000) return;
    
    lastUpdateRef.current = now;
    
    // Get network information if available
    const extendedNavigator = navigator as ExtendedNavigator;
    const connection = extendedNavigator.connection || extendedNavigator.mozConnection || extendedNavigator.webkitConnection;
    
    setMetrics(prev => ({
      ...prev,
      connectivity: {
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10,
        rtt: connection?.rtt || 50,
      },
      api: {
        responseTime: Math.floor(Math.random() * 100) + 150, // Simulate API response time
        errorRate: Math.floor(Math.random() * 5),
        successRate: 100 - Math.floor(Math.random() * 5),
      },
      timestamp: now,
    }));
  }, []);

  // Controlled interval with proper cleanup
  useEffect(() => {
    if (!isVisible) return;

    // Update immediately when dashboard becomes visible
    updateMetrics();
    
    // Set up interval for periodic updates (every 30 seconds to avoid performance issues)
    intervalRef.current = setInterval(updateMetrics, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible, updateMetrics]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        onToggle();
      }
      if (event.key === 'Escape' && isVisible) {
        onToggle();
      }
    };

    if (process.env.NODE_ENV === 'development') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isVisible, onToggle]);

  if (!isVisible) return null;

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getPerformanceRating = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return { rating: 'good', color: 'text-green-600' };
    if (value <= thresholds[1]) return { rating: 'needs-improvement', color: 'text-yellow-600' };
    return { rating: 'poor', color: 'text-red-600' };
  };

  const SimpleProgressBar = ({ value, max = 100 }: { value: number; max?: number }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const TabButton = ({ value, children, isActive }: { value: string; children: React.ReactNode; isActive: boolean }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-2xl">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle className="text-lg">Performance Monitor</CardTitle>
              <Badge variant="outline" className="text-xs">
                Development
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()} | Ctrl+Shift+M to toggle | ESC to close
          </CardDescription>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="pt-0">
            <div className="w-full">
              <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
                <TabButton value="performance" isActive={activeTab === 'performance'}>Performance</TabButton>
                <TabButton value="network" isActive={activeTab === 'network'}>Network</TabButton>
                <TabButton value="api" isActive={activeTab === 'api'}>API</TabButton>
                <TabButton value="cache" isActive={activeTab === 'cache'}>Cache</TabButton>
              </div>

              {activeTab === 'performance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">LCP</span>
                        <span className={`text-sm ${getPerformanceRating(metrics.performance.lcp, [2500, 4000]).color}`}>
                          {metrics.performance.lcp}ms
                        </span>
                      </div>
                      <SimpleProgressBar value={metrics.performance.lcp} max={4000} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">FID</span>
                        <span className={`text-sm ${getPerformanceRating(metrics.performance.fid, [100, 300]).color}`}>
                          {metrics.performance.fid}ms
                        </span>
                      </div>
                      <SimpleProgressBar value={metrics.performance.fid} max={300} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">CLS</span>
                        <span className={`text-sm ${getPerformanceRating(metrics.performance.cls, [0.1, 0.25]).color}`}>
                          {metrics.performance.cls.toFixed(3)}
                        </span>
                      </div>
                      <SimpleProgressBar value={metrics.performance.cls} max={0.25} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">TTFB</span>
                        <span className={`text-sm ${getPerformanceRating(metrics.performance.ttfb, [800, 1800]).color}`}>
                          {metrics.performance.ttfb}ms
                        </span>
                      </div>
                      <SimpleProgressBar value={metrics.performance.ttfb} max={1800} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'network' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Wifi className="h-4 w-4" />
                        Status
                      </span>
                      <div className="flex items-center gap-2">
                        {metrics.connectivity.online ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {metrics.connectivity.online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Connection</span>
                      <Badge variant="outline" className="text-xs">
                        {metrics.connectivity.effectiveType.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Downlink</span>
                      <span className="text-sm">{metrics.connectivity.downlink} Mbps</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">RTT</span>
                      <span className="text-sm">{metrics.connectivity.rtt}ms</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Response Time
                      </span>
                      <span className="text-sm">{metrics.api.responseTime}ms</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm text-green-600">{metrics.api.successRate}%</span>
                      </div>
                      <SimpleProgressBar value={metrics.api.successRate} max={100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Error Rate</span>
                        <span className="text-sm text-red-600">{metrics.api.errorRate}%</span>
                      </div>
                      <SimpleProgressBar value={metrics.api.errorRate} max={100} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cache' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Cache Size
                      </span>
                      <span className="text-sm">{formatBytes(metrics.cache.size * 1024)}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Hit Rate</span>
                        <span className="text-sm text-green-600">{metrics.cache.hitRate}%</span>
                      </div>
                      <SimpleProgressBar value={metrics.cache.hitRate} max={100} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
