// /src/schedulecomponent/utils/styleUtils.ts - Dashboard Theme System

export const getTheme = () => {
  // Check for dark mode (your dashboard appears to be dark)
  const isDarkMode = true; // Matching your dashboard theme

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
    backgroundColor: theme.background,
    color: theme.text,
    borderRadius: '8px',
    padding: '24px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    minHeight: '600px',
    border: `1px solid ${theme.border}`
  };
};

export const getTabStyle = (tabId: string, activeTab: string, isDarkMode: boolean) => {
  const { theme } = getTheme();
  const isActive = tabId === activeTab;
  
  // Get tab-specific color
  const getTabColor = (tab: string) => {
    switch (tab) {
      case 'pending': return theme.pending;
      case 'calendar': return theme.calendar;
      case 'status': return theme.status;
      case 'saved': return theme.templates;
      default: return theme.primary;
    }
  };
  
  const tabColor = getTabColor(tabId);
  
  return {
    padding: '12px 20px',
    backgroundColor: isActive ? `${tabColor}20` : 'transparent',
    color: isActive ? tabColor : theme.secondary,
    border: 'none',
    borderBottom: isActive ? `2px solid ${tabColor}` : `2px solid transparent`,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    borderRadius: '4px 4px 0 0',
    ':hover': {
      backgroundColor: isActive ? `${tabColor}30` : `${theme.border}50`,
      color: isActive ? tabColor : theme.text
    }
  };
};

export const getCardStyle = (isDarkMode: boolean) => {
  const { theme } = getTheme();
  
  return {
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: theme.primary,
      transform: 'translateY(-1px)',
      boxShadow: isDarkMode 
        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
        : '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  };
};

export const getButtonStyle = (variant: 'primary' | 'secondary' | 'danger', isDarkMode: boolean) => {
  const { theme } = getTheme();
  
  const variants = {
    primary: {
      backgroundColor: theme.primary,
      color: 'white',
      border: 'none',
      ':hover': {
        backgroundColor: theme.primaryHover
      }
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.secondary,
      border: `1px solid ${theme.border}`,
      ':hover': {
        backgroundColor: theme.cardBg,
        color: theme.text
      }
    },
    danger: {
      backgroundColor: 'transparent',
      color: theme.danger,
      border: `1px solid ${theme.danger}`,
      ':hover': {
        backgroundColor: theme.danger,
        color: 'white'
      }
    }
  };
  
  return {
    ...variants[variant],
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  };
};

export const getInputStyle = (isDarkMode: boolean) => {
  const { theme } = getTheme();
  
  return {
    width: '100%',
    padding: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: theme.cardBg,
    color: theme.text,
    fontFamily: 'inherit',
    ':focus': {
      outline: 'none',
      borderColor: theme.primary,
      boxShadow: `0 0 0 3px ${theme.primary}20`
    }
  };
};

export const getModalStyle = (isDarkMode: boolean) => {
  const { theme } = getTheme();
  
  return {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    content: {
      backgroundColor: theme.background,
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto' as const,
      boxShadow: isDarkMode 
        ? '0 20px 25px -5px rgba(0, 0, 0, 0.4)' 
        : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      fontFamily: 'inherit',
      border: `1px solid ${theme.border}`
    }
  };
};

export const getStatusColors = (status: string, isDarkMode: boolean) => {
  const { theme } = getTheme();
  
  const statusColors = {
    pending_schedule: {
      bg: `${theme.pending}20`,
      text: theme.pending,
      border: theme.pending
    },
    scheduled: {
      bg: `${theme.calendar}20`,
      text: theme.calendar,
      border: theme.calendar
    },
    processing: {
      bg: `${theme.warning}20`,
      text: theme.warning,
      border: theme.warning
    },
    published: {
      bg: `${theme.success}20`,
      text: theme.success,
      border: theme.success
    },
    failed: {
      bg: `${theme.danger}20`,
      text: theme.danger,
      border: theme.danger
    }
  };
  
  return statusColors[status as keyof typeof statusColors] || statusColors.pending_schedule;
};

export const getCSSAnimations = () => {
  return `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideIn {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(0); }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    
    /* Hover effects */
    .hover-lift:hover {
      transform: translateY(-2px);
      transition: transform 0.2s ease;
    }
    
    .hover-glow:hover {
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
      transition: box-shadow 0.2s ease;
    }
  `;
};
