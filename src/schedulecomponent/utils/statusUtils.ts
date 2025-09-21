import React from 'react';
import { Clock, Play, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const getStatusColor = (status: string, isDarkMode: boolean) => {
  if (isDarkMode) {
    switch (status) {
      case 'pending': return { borderLeft: '4px solid #f59e0b', backgroundColor: '#451a03' };
      case 'processing': return { borderLeft: '4px solid #3b82f6', backgroundColor: '#1e3a8a' };
      case 'complete': return { borderLeft: '4px solid #10b981', backgroundColor: '#14532d' };
      case 'failed': return { borderLeft: '4px solid #ef4444', backgroundColor: '#451a1a' };
      case 'resending': return { borderLeft: '4px solid #f97316', backgroundColor: '#7c2d12' };
      default: return { borderLeft: '4px solid #9ca3af', backgroundColor: '#334155' };
    }
  } else {
    switch (status) {
      case 'pending': return { borderLeft: '4px solid #f59e0b', backgroundColor: '#fefce8' };
      case 'processing': return { borderLeft: '4px solid #3b82f6', backgroundColor: '#dbeafe' };
      case 'complete': return { borderLeft: '4px solid #10b981', backgroundColor: '#d1fae5' };
      case 'failed': return { borderLeft: '4px solid #ef4444', backgroundColor: '#fee2e2' };
      case 'resending': return { borderLeft: '4px solid #f97316', backgroundColor: '#fed7aa' };
      default: return { borderLeft: '4px solid #9ca3af', backgroundColor: '#f9fafb' };
    }
  }
};

export const getStatusIcon = (status: string) => {
  const iconStyle = { height: '12px', width: '12px' };
  switch (status) {
    case 'pending': return React.createElement(Clock, { style: { ...iconStyle, color: '#d97706' } });
    case 'processing': return React.createElement(Play, { style: { ...iconStyle, color: '#2563eb' } });
    case 'complete': return React.createElement(CheckCircle, { style: { ...iconStyle, color: '#059669' } });
    case 'failed': return React.createElement(AlertCircle, { style: { ...iconStyle, color: '#dc2626' } });
    case 'resending': return React.createElement(RefreshCw, { style: { ...iconStyle, color: '#ea580c' } });
    default: return null;
  }
};

export const getStatusCounts = (posts: any[]) => {
  return {
    all: posts.length,
    pending: posts.filter(p => p.status === 'pending').length,
    processing: posts.filter(p => p.status === 'processing').length,
    complete: posts.filter(p => p.status === 'complete').length,
    failed: posts.filter(p => p.status === 'failed').length,
    resending: posts.filter(p => p.status === 'resending').length,
  };
};

export const truncateDescription = (description: string, maxLength: number = 120): string => {
  if (description.length <= maxLength) return description;
  
  const truncated = description.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};
