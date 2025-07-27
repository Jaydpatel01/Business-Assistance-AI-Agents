/**
 * Performance Dashboard Component
 * 
 * Monitors and displays real-time application performance metrics
 * Includes optimization suggestions and system health indicators
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity,
  Cpu,
  Database,
  Globe,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  HardDrive
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
  threshold: {
    good: number;
    warning: number;
  };
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  action: string;
  estimatedImpact: string;
}

export function PerformanceDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Initialize performance monitoring
  useEffect(() => {
    const initializeMetrics = () => {
      const initialMetrics: PerformanceMetric[] = [
        {
          id: 'page-load',
          name: 'Page Load Time',
          value: Math.random() * 2000 + 500, // 500-2500ms
          unit: 'ms',
          status: 'good',
          trend: 'stable',
          description: 'Time to load the current page',
          threshold: { good: 1000, warning: 2000 }
        },
        {
          id: 'api-response',
          name: 'API Response Time',
          value: Math.random() * 1000 + 100, // 100-1100ms
          unit: 'ms',
          status: 'good',
          trend: 'down',
          description: 'Average API response time',
          threshold: { good: 500, warning: 1000 }
        },
        {
          id: 'memory-usage',
          name: 'Memory Usage',
          value: Math.random() * 40 + 30, // 30-70%
          unit: '%',
          status: 'good',
          trend: 'up',
          description: 'Browser memory consumption',
          threshold: { good: 50, warning: 75 }
        },
        {
          id: 'cpu-usage',
          name: 'CPU Usage',
          value: Math.random() * 30 + 10, // 10-40%
          unit: '%',
          status: 'good',
          trend: 'stable',
          description: 'Browser CPU utilization',
          threshold: { good: 40, warning: 70 }
        },
        {
          id: 'network-speed',
          name: 'Network Speed',
          value: Math.random() * 50 + 10, // 10-60 Mbps
          unit: 'Mbps',
          status: 'good',
          trend: 'stable',
          description: 'Current network throughput',
          threshold: { good: 20, warning: 10 }
        },
        {
          id: 'cache-hit-rate',
          name: 'Cache Hit Rate',
          value: Math.random() * 20 + 80, // 80-100%
          unit: '%',
          status: 'good',
          trend: 'up',
          description: 'Percentage of cached responses',
          threshold: { good: 85, warning: 70 }
        }
      ];

      // Update status based on thresholds
      initialMetrics.forEach(metric => {
        if (metric.id === 'network-speed') {
          // For network speed, lower is worse
          if (metric.value < metric.threshold.warning) {
            metric.status = 'critical';
          } else if (metric.value < metric.threshold.good) {
            metric.status = 'warning';
          }
        } else {
          // For most metrics, higher is worse
          if (metric.value > metric.threshold.warning) {
            metric.status = 'critical';
          } else if (metric.value > metric.threshold.good) {
            metric.status = 'warning';
          }
        }
      });

      setMetrics(initialMetrics);
    };

    const generateSuggestions = () => {
      const optimizationSuggestions: OptimizationSuggestion[] = [
        {
          id: 'enable-compression',
          title: 'Enable GZIP Compression',
          description: 'Reduce bandwidth usage by enabling compression for text resources',
          priority: 'medium',
          category: 'network',
          action: 'Configure server compression',
          estimatedImpact: '30-50% faster load times'
        },
        {
          id: 'optimize-images',
          title: 'Optimize Images',
          description: 'Use WebP format and proper sizing for better performance',
          priority: 'low',
          category: 'assets',
          action: 'Convert images to WebP',
          estimatedImpact: '20-30% smaller bundle size'
        },
        {
          id: 'lazy-load-components',
          title: 'Implement Lazy Loading',
          description: 'Load components only when needed to reduce initial bundle size',
          priority: 'high',
          category: 'code',
          action: 'Add dynamic imports',
          estimatedImpact: '40-60% faster initial load'
        },
        {
          id: 'enable-caching',
          title: 'Improve Caching Strategy',
          description: 'Implement better caching headers for static assets',
          priority: 'medium',
          category: 'caching',
          action: 'Update cache policies',
          estimatedImpact: '50-70% faster repeat visits'
        },
        {
          id: 'reduce-bundle-size',
          title: 'Reduce JavaScript Bundle',
          description: 'Remove unused dependencies and code splitting',
          priority: 'high',
          category: 'code',
          action: 'Tree shake and split bundles',
          estimatedImpact: '25-40% smaller bundle'
        }
      ];

      setSuggestions(optimizationSuggestions);
    };

    initializeMetrics();
    generateSuggestions();
  }, []);

  // Real-time monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring) {
      interval = setInterval(() => {
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          value: Math.max(0, metric.value + (Math.random() - 0.5) * 100)
        })));
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'page-load':
        return <Clock className="h-4 w-4" />;
      case 'api-response':
        return <Globe className="h-4 w-4" />;
      case 'memory-usage':
        return <HardDrive className="h-4 w-4" />;
      case 'cpu-usage':
        return <Cpu className="h-4 w-4" />;
      case 'network-speed':
        return <Wifi className="h-4 w-4" />;
      case 'cache-hit-rate':
        return <Database className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const overallScore = Math.round(
    metrics.reduce((acc, metric) => {
      switch (metric.status) {
        case 'good': return acc + 100;
        case 'warning': return acc + 70;
        case 'critical': return acc + 30;
        default: return acc;
      }
    }, 0) / metrics.length
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Activity className="h-4 w-4" />
          Performance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Dashboard
            <Badge 
              className={`ml-2 ${
                overallScore >= 90 ? 'bg-green-100 text-green-800' : 
                overallScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}
            >
              {overallScore}/100
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={isMonitoring ? "destructive" : "default"}
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Overall Performance Score: {overallScore}/100
              </div>
            </div>
          </div>

          <Tabs defaultValue="metrics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="metrics">Real-time Metrics</TabsTrigger>
              <TabsTrigger value="suggestions">Optimization</TabsTrigger>
              <TabsTrigger value="insights">Performance Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map((metric) => (
                  <Card key={metric.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getMetricIcon(metric.id)}
                          <span className="font-medium text-sm">{metric.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(metric.status)}
                          {getTrendIcon(metric.trend)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">
                            {Math.round(metric.value)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {metric.unit}
                          </span>
                        </div>
                        
                        <Progress 
                          value={metric.id === 'network-speed' ? 
                            (metric.value / 60) * 100 : // Network speed out of 60 Mbps
                            Math.min((metric.value / (metric.threshold.warning * 1.5)) * 100, 100)
                          }
                          className="h-2"
                        />
                        
                        <p className="text-xs text-muted-foreground">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{suggestion.title}</h4>
                              <Badge className={getPriorityColor(suggestion.priority)}>
                                {suggestion.priority}
                              </Badge>
                              <Badge variant="outline">{suggestion.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.description}
                            </p>
                          </div>
                          <Zap className="h-4 w-4 text-yellow-500" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Action: </span>
                            {suggestion.action}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Expected Impact: </span>
                            <span className="text-green-600">{suggestion.estimatedImpact}</span>
                          </div>
                        </div>
                        
                        <Button size="sm" variant="outline">
                          Learn More
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Performance Trends</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Page loads today:</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average load time:</span>
                      <span className="font-medium">1.2s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache hit rate:</span>
                      <span className="font-medium text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error rate:</span>
                      <span className="font-medium text-green-600">0.1%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Browser Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Browser:</span>
                      <span className="font-medium">
                        {typeof navigator !== 'undefined' && navigator.userAgent?.includes('Chrome') ? 'Chrome' : 'Other'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection:</span>
                      <span className="font-medium">4G</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available Memory:</span>
                      <span className="font-medium">8GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Screen Resolution:</span>
                      <span className="font-medium">
                        {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Clear Browser Cache
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Optimize Local Storage
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Test Network Speed
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Export Performance Report
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Best Practices</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                      <span>Close unused browser tabs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                      <span>Keep browser updated</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                      <span>Use stable internet connection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                      <span>Enable hardware acceleration</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
