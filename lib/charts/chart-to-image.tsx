import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Color palette for charts
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  pink: '#ec4899',
  teal: '#14b8a6',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.purple,
  COLORS.pink,
  COLORS.teal,
];

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  time: string;
  value: number;
  label?: string;
}

/**
 * Generate confidence trend line chart
 */
export function ConfidenceTrendChart({ 
  data, 
  width = 600, 
  height = 300 
}: { 
  data: TimeSeriesData[]; 
  width?: number; 
  height?: number;
}) {
  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={COLORS.primary} 
            strokeWidth={2}
            dot={{ fill: COLORS.primary, r: 4 }}
            name="Confidence %"
          />
        </LineChart>
      </ResponsiveContainer>
    </svg>
  );
}

/**
 * Generate agent contribution bar chart
 */
export function AgentContributionChart({ 
  data, 
  width = 600, 
  height = 300 
}: { 
  data: ChartData[]; 
  width?: number; 
  height?: number;
}) {
  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar 
            dataKey="value" 
            fill={COLORS.primary}
            name="Messages"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </svg>
  );
}

/**
 * Generate confidence distribution pie chart
 */
export function ConfidenceDistributionChart({ 
  data, 
  width = 400, 
  height = 300 
}: { 
  data: ChartData[]; 
  width?: number; 
  height?: number;
}) {
  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill={COLORS.primary}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '11px' }}
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>
    </svg>
  );
}

/**
 * Render chart to SVG string
 */
export function renderChartToSVG(
  chartComponent: React.ReactElement
): string {
  try {
    return renderToString(chartComponent);
  } catch (error) {
    console.error('Error rendering chart to SVG:', error);
    return '';
  }
}

/**
 * Helper to prepare confidence trend data
 */
export function prepareConfidenceTrendData(
  messages: Array<{ confidence?: number; timestamp: Date }>
): TimeSeriesData[] {
  return messages
    .filter(m => m.confidence !== undefined)
    .map((m, index) => ({
      time: `R${index + 1}`,
      value: Math.round(m.confidence! * 100),
      label: new Date(m.timestamp).toLocaleTimeString(),
    }));
}

/**
 * Helper to prepare agent contribution data
 */
export function prepareAgentContributionData(
  messages: Array<{ agentType: string }>
): ChartData[] {
  const counts: Record<string, number> = {};
  
  messages.forEach(m => {
    counts[m.agentType] = (counts[m.agentType] || 0) + 1;
  });

  const agentColors: Record<string, string> = {
    ceo: COLORS.primary,
    cfo: COLORS.success,
    cto: COLORS.warning,
    coo: COLORS.purple,
  };

  return Object.entries(counts)
    .map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
      color: agentColors[name] || COLORS.primary,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Helper to prepare confidence distribution data
 */
export function prepareConfidenceDistributionData(
  messages: Array<{ confidence?: number }>
): ChartData[] {
  const distribution = {
    high: 0,
    medium: 0,
    low: 0,
  };

  messages.forEach(m => {
    if (!m.confidence) return;
    
    if (m.confidence >= 0.7) {
      distribution.high++;
    } else if (m.confidence >= 0.4) {
      distribution.medium++;
    } else {
      distribution.low++;
    }
  });

  return [
    { name: 'High (≥70%)', value: distribution.high, color: COLORS.success },
    { name: 'Medium (40-69%)', value: distribution.medium, color: COLORS.warning },
    { name: 'Low (<40%)', value: distribution.low, color: COLORS.danger },
  ].filter(d => d.value > 0);
}
