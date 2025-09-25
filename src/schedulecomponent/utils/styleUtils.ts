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
  const { colors } = getTheme();
  
  return {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: '8px',
    padding: '24px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    minHeight: '600px',
    border: `1px solid ${colors.border}`
  };
};

export const getTabStyle = (tabId: string, activeTab: string, isDarkMode: boolean) => {
  const { colors } = getTheme();
  const isActive = tabId === activeTab;
  
  // Get tab-specific color
  const getTabColor = (tab: string) => {
    switch (tab) {
      case 'pending': return colors.pending;
      case 'calendar': return colors.calendar;
      case 'status': return colors.status;
      case 'saved': return colors.templates;
      default: return colors.primary;
    }
  };
  
  const tabColor = getTabColor(tabId);
  
  return {
    padding: '12px 20px',
    backgroundColor: isActive ? `${tabColor}20` : 'transparent',
    color: isActive ? tabColor : colors.secondary,
    border: 'none',
    borderBottom: isActive ? `2px solid ${tabColor}` : `2px solid transparent`,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    borderRadius: '4px 4px 0 0',
    ':hover': {
      backgroundColor: isActive ? `${tabColor}30` : `${colors.border}50`,
      color: isActive ? tabColor : colors.text
    }
  };
};

export const getCardStyle = (isDarkMode: boolean) => {
  const { colors } = getTheme();
  
  return {
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: colors.primary,
      transform: 'translateY(-1px)',
      boxShadow: isDarkMode 
        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
        : '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  };
};

export const getButtonStyle = (variant: 'primary' | 'secondary' | 'danger', isDarkMode: boolean) => {
  const { colors } = getTheme();
  
  const variants = {
    primary: {
      backgroundColor: colors.primary,
      color: 'white',
      border: 'none',
      ':hover': {
        backgroundColor: colors.primaryHover
      }
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.secondary,
      border: `1px solid ${colors.border}`,
      ':hover': {
        backgroundColor: colors.cardBg,
        color: colors.text
      }
    },
    danger: {
      backgroundColor: 'transparent',
      color: colors.danger,
      border: `1px solid ${colors.danger}`,
      ':hover': {
        backgroundColor: colors.danger,
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
  const { colors } = getTheme();
  
  return {
    width: '100%',
    padding: '12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: colors.cardBg,
    color: colors.text,
    fontFamily: 'inherit',
    ':focus': {
      outline: 'none',
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px ${colors.primary}20`
    }
  };
};

export const getModalStyle = (isDarkMode: boolean) => {
  const { colors } = getTheme();
  
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
      backgroundColor: colors.background,
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
      border: `1px solid ${colors.border}`
    }
  };
};

export const getStatusColors = (status: string, isDarkMode: boolean) => {
  const { colors } = getTheme();
  
  const statusColors = {
    pending_schedule: {
      bg: `${colors.pending}20`,
      text: colors.pending,
      border: colors.pending
    },
    scheduled: {
      bg: `${colors.calendar}20`,
      text: colors.calendar,
      border: colors.calendar
    },
    processing: {
      bg: `${colors.warning}20`,
      text: colors.warning,
      border: colors.warning
    },
    published: {
      bg: `${colors.success}20`,
      text: colors.success,
      border: colors.success
    },
    failed: {
      bg: `${colors.danger}20`,
      text: colors.danger,
      border: colors.danger
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
