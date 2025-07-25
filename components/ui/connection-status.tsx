import React from 'react';

interface ConnectionStatusProps {
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  latency: number;
}

export function ConnectionStatus({ 
  connectionState, 
  latency 
}: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected': return `Connected (${latency}ms)`;
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span>{getStatusText()}</span>
    </div>
  );
}
