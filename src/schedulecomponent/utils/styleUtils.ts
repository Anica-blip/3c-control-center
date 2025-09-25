// /src/schedulecomponent/utils/styleUtils.ts - FIXED VERSION

import { useEffect } from 'react';

export const getTheme = () => {
  // Check for dark mode from localStorage or default to true
  const isDarkMode = localStorage.getItem('3c-dark-mode') === 'true' || 
                     document.body.classList.contains('dark') ||
                     true; // Default to dark to match dashboard

  return {
    isDarkMode,
    theme: isDarkMode ? {
      // Dark theme matching your dashboard
      primary: '#60a5fa',
      primaryHover: '#3b82f6',
      secondary: '#94a3b8',
      background: '#0f172a', // Main dashboard background
      cardBg: '#1e293b',     // Card/component background  
      border: '#334155',     // Borders
      text: '#f8fafc',       // Main text
      textSecondary: '#94a3b8', // Secondary text
      success: '#10b981',
      warning: '#f59e0b', 
      danger: '#ef4444',
      // Tab specific colors
      pending: '#60a5fa',
      calendar: '#10b981',
      status: '#f59e0b',
      templates: '#a855f7'
    } : {
      // Light theme (fallback)
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      secondary: '#6b7280',
      background: 'white',
      cardBg: '#f9fafb',
      border: '#e5e7eb',
      text: '#111827',
      textSecondary: '#6b7280',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      pending: '#2563eb',
      calendar: '#059669',
      status: '#d97706', 
      templates: '#9333ea'
    }
  };
};

export const getContainerStyle = (isDarkMode: boolean) => {
  const { theme } = getTheme();
  
  return {
    minHeight: '100vh',
    backgroundColor: theme.background,
    padding: '24px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };
};

export const getTabStyle = (isActive: boolean, isDarkMode: boolean) => {
  const { theme } = getTheme();
  
  return {
    padding: '12px 24px',
    backgroundColor: isActive ? theme.primary : 'transparent',
    color: isActive ? 'white' : theme.textSecondary,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };
};

export const getCardStyle = (isDarkMode: boolean) => {
  const { theme } = getTheme();
  
  return {
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: isDarkMode 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };
};

export const getButtonStyle = (variant: 'primary' | 'secondary' | 'danger' = 'primary', isDarkMode: boolean) => {
  const { theme } = getTheme();
  
  const variants = {
    primary: {
      backgroundColor: theme.primary,
      color: 'white',
      border: `1px solid ${theme.primary}`
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.textSecondary,
      border: `1px solid ${theme.border}`
    },
    danger: {
      backgroundColor: theme.danger,
      color: 'white',
      border: `1px solid ${theme.danger}`
    }
  };
  
  return {
    ...variants[variant],
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  };
};

export const getInputStyle = (isDarkMode: boolean) => {
  const { theme } = getTheme();
  
  return {
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    padding: '8px 12px',
    color: theme.text,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    ':focus': {
      borderColor: theme.primary
    }
  };
};

export const getCSSAnimations = () => {
  return `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    .loading-spinner {
      animation: spin 1s linear infinite;
    }
  `;
};
