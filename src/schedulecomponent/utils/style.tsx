// /src/schedulecomponent/utils/styles.tsx
import React from 'react';

/**
 * Style utility functions for the Schedule Manager
 * Provides consistent styling that matches EnhancedContentCreationForm patterns
 */

/**
 * Get theme configuration
 * @returns Theme object with dark mode state and colors
 */
export const getTheme = () => {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  return {
    isDarkMode,
    colors: {
      // Background colors
      background: {
        primary: isDarkMode ? '#1e293b' : 'white',
        secondary: isDarkMode ? '#334155' : '#f8fafc',
        tertiary: isDarkMode ? '#475569' : '#f9fafb',
        accent: isDarkMode ? '#1e3a8a30' : '#dbeafe',
      },
      
      // Text colors
      text: {
        primary: isDarkMode ? '#f8fafc' : '#111827',
        secondary: isDarkMode ? '#e2e8f0' : '#4b5563',
        tertiary: isDarkMode ? '#94a3b8' : '#6b7280',
        accent: isDarkMode ? '#60a5fa' : '#3b82f6',
      },
      
      // Border colors
      border: {
        primary: isDarkMode ? '#334155' : '#e5e7eb',
        secondary: isDarkMode ? '#475569' : '#d1d5db',
        accent: isDarkMode ? '#60a5fa' : '#3b82f6',
      },
      
      // Status colors
      status: {
        success: isDarkMode ? '#10b981' : '#059669',
        warning: isDarkMode ? '#f59e0b' : '#d97706',
        error: isDarkMode ? '#ef4444' : '#dc2626',
        info: isDarkMode ? '#60a5fa' : '#2563eb',
      }
    }
  };
};

/**
 * Base container style for Schedule Manager components
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for main containers
 */
export const getContainerStyle = (isDarkMode: boolean = false) => ({
  backgroundColor: isDarkMode ? '#1e293b' : 'white',
  boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`,
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
});

/**
 * Card style for individual items (posts, templates, etc.)
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for cards
 */
export const getCardStyle = (isDarkMode: boolean = false) => ({
  backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '16px',
  transition: 'all 0.2s ease'
});

/**
 * Header style for section headers
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for headers
 */
export const getHeaderStyle = (isDarkMode: boolean = false) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
});

/**
 * Button style generator
 * @param variant - Button variant type
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for buttons
 */
export const getButtonStyle = (
  variant: 'primary' | 'secondary' | 'danger' | 'success' = 'primary',
  isDarkMode: boolean = false
) => {
  const baseStyle = {
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    fontFamily: 'inherit'
  };

  const variants = {
    primary: {
      backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
      color: 'white',
      ':hover': {
        backgroundColor: isDarkMode ? '#2563eb' : '#1d4ed8'
      }
    },
    secondary: {
      backgroundColor: 'transparent',
      color: isDarkMode ? '#94a3b8' : '#6b7280',
      border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
      ':hover': {
        backgroundColor: isDarkMode ? '#475569' : '#f3f4f6'
      }
    },
    danger: {
      backgroundColor: 'transparent',
      color: '#ef4444',
      border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
      ':hover': {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444'
      }
    },
    success: {
      backgroundColor: isDarkMode ? '#10b981' : '#059669',
      color: 'white',
      ':hover': {
        backgroundColor: isDarkMode ? '#059669' : '#047857'
      }
    }
  };

  return {
    ...baseStyle,
    ...variants[variant]
  };
};

/**
 * Input field style generator
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for input fields
 */
export const getInputStyle = (isDarkMode: boolean = false) => ({
  width: '100%',
  padding: '12px',
  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: isDarkMode ? '#334155' : 'white',
  color: isDarkMode ? '#f8fafc' : '#111827',
  fontFamily: 'inherit'
});

/**
 * Select dropdown style generator
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for select elements
 */
export const getSelectStyle = (isDarkMode: boolean = false) => ({
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
  borderRadius: '6px',
  fontSize: '14px',
  backgroundColor: '#334155',
  color: '#ffffff',
  fontFamily: 'inherit',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '16px',
  paddingRight: '40px'
});

/**
 * Tab style generator
 * @param tabId - ID of the tab
 * @param activeTab - Currently active tab ID
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for tabs
 */
export const getTabStyle = (
  tabId: string,
  activeTab: string,
  isDarkMode: boolean = false
) => {
  const isActive = tabId === activeTab;
  
  return {
    padding: '12px 24px',
    borderRadius: '8px 8px 0 0',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    backgroundColor: isActive 
      ? (isDarkMode ? '#3b82f6' : '#2563eb')
      : 'transparent',
    color: isActive 
      ? 'white'
      : (isDarkMode ? '#94a3b8' : '#6b7280'),
    borderBottom: isActive 
      ? `2px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`
      : 'none',
    fontFamily: 'inherit'
  };
};

/**
 * Status badge style generator
 * @param status - Status value
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for status badges
 */
export const getStatusBadgeStyle = (
  status: string,
  isDarkMode: boolean = false
) => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    'pending_schedule': {
      bg: isDarkMode ? '#1e3a8a30' : '#dbeafe',
      text: isDarkMode ? '#60a5fa' : '#1e40af'
    },
    'scheduled': {
      bg: isDarkMode ? '#064e3b' : '#d1fae5',
      text: isDarkMode ? '#10b981' : '#059669'
    },
    'published': {
      bg: isDarkMode ? '#14532d' : '#dcfce7',
      text: isDarkMode ? '#22c55e' : '#16a34a'
    },
    'failed': {
      bg: isDarkMode ? '#7f1d1d' : '#fee2e2',
      text: isDarkMode ? '#ef4444' : '#dc2626'
    },
    'draft': {
      bg: isDarkMode ? '#374151' : '#f9fafb',
      text: isDarkMode ? '#9ca3af' : '#6b7280'
    }
  };

  const colors = statusColors[status] || statusColors.draft;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  };
};

/**
 * Loading spinner style
 * @param size - Spinner size in pixels
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for loading spinner
 */
export const getLoadingSpinnerStyle = (
  size: number = 32,
  isDarkMode: boolean = false
) => ({
  width: `${size}px`,
  height: `${size}px`,
  border: `3px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
  borderTop: `3px solid ${isDarkMode ? '#3b82f6' : '#2563eb'}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto'
});

/**
 * Modal overlay style
 * @returns Style object for modal overlays
 */
export const getModalOverlayStyle = () => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px'
});

/**
 * Modal content style
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for modal content
 */
export const getModalStyle = (isDarkMode: boolean = false) => ({
  backgroundColor: isDarkMode ? '#1e293b' : 'white',
  borderRadius: '12px',
  padding: '24px',
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto' as const,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
});

/**
 * Platform icon style generator
 * @param platformName - Name of the platform
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for platform icons
 */
export const getPlatformIconStyle = (
  platformName: string,
  isDarkMode: boolean = false
) => {
  const platformColors: Record<string, string> = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    twitter: isDarkMode ? '#ffffff' : '#000000',
    linkedin: '#0A66C2',
    youtube: '#FF0000',
    tiktok: isDarkMode ? '#ffffff' : '#000000',
    telegram: '#0088CC',
    pinterest: '#BD081C',
    whatsapp: '#25D366'
  };

  return {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
    color: platformColors[platformName.toLowerCase()] || (isDarkMode ? '#94a3b8' : '#6b7280'),
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  };
};

/**
 * Form section style
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for form sections
 */
export const getFormSectionStyle = (isDarkMode: boolean = false) => ({
  backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
});

/**
 * Grid layout style
 * @param columns - Number of columns or CSS grid template
 * @param gap - Gap between grid items
 * @returns Style object for grid layouts
 */
export const getGridStyle = (
  columns: number | string = 2,
  gap: string = '16px'
) => ({
  display: 'grid',
  gridTemplateColumns: typeof columns === 'number' 
    ? `repeat(${columns}, 1fr)` 
    : columns,
  gap: gap
});

/**
 * Flex layout style
 * @param direction - Flex direction
 * @param justify - Justify content
 * @param align - Align items
 * @param gap - Gap between flex items
 * @returns Style object for flex layouts
 */
export const getFlexStyle = (
  direction: 'row' | 'column' = 'row',
  justify: string = 'flex-start',
  align: string = 'center',
  gap: string = '8px'
) => ({
  display: 'flex',
  flexDirection: direction,
  justifyContent: justify,
  alignItems: align,
  gap: gap
});

/**
 * Text style generator
 * @param variant - Text variant type
 * @param isDarkMode - Whether dark mode is enabled
 * @returns Style object for text elements
 */
export const getTextStyle = (
  variant: 'heading' | 'subheading' | 'body' | 'caption' | 'accent' = 'body',
  isDarkMode: boolean = false
) => {
  const variants = {
    heading: {
      fontSize: '20px',
      fontWeight: '600',
      color: isDarkMode ? '#60a5fa' : '#2563eb',
      margin: '0 0 8px 0'
    },
    subheading: {
      fontSize: '16px',
      fontWeight: '600',
      color: isDarkMode ? '#f8fafc' : '#111827',
      margin: '0 0 12px 0'
    },
    body: {
      fontSize: '14px',
      color: isDarkMode ? '#e2e8f0' : '#4b5563',
      lineHeight: '1.5'
    },
    caption: {
      fontSize: '12px',
      color: isDarkMode ? '#94a3b8' : '#6b7280'
    },
    accent: {
      fontSize: '14px',
      fontWeight: '600',
      color: isDarkMode ? '#60a5fa' : '#2563eb'
    }
  };

  return variants[variant];
};

/**
 * CSS animations as string (to be injected into style tag)
 */
export const getCSSAnimations = () => `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInFromTop {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
