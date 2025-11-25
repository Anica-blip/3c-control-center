// /src/marketingcomponent/utils/styleUtils.ts - Theme & Styling Utilities

import { ThemeConfig } from '../types';

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

/**
 * Get current theme based on dark mode preference
 * Dark mode preference is stored in localStorage
 */
export const getTheme = (): { theme: ThemeConfig; isDarkMode: boolean } => {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  const theme: ThemeConfig = isDarkMode
    ? {
        // Dark Mode Theme
        background: '#0f172a',
        cardBg: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        border: '#334155',
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        inputBg: '#334155',
        inputBorder: '#475569'
      }
    : {
        // Light Mode Theme
        background: '#f8fafc',
        cardBg: '#ffffff',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        inputBg: '#ffffff',
        inputBorder: '#cbd5e1'
      };

  return { theme, isDarkMode };
};

/**
 * Toggle dark mode and save to localStorage
 */
export const toggleDarkMode = (): boolean => {
  const currentMode = localStorage.getItem('darkMode') === 'true';
  const newMode = !currentMode;
  localStorage.setItem('darkMode', newMode.toString());
  return newMode;
};

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

export const fontStyle = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

// ============================================================================
// CONTAINER STYLES
// ============================================================================

/**
 * Main container style for the marketing component
 */
export const getContainerStyle = (isDarkMode: boolean): React.CSSProperties => ({
  minHeight: '100vh',
  backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
  padding: '24px',
  ...fontStyle
});

/**
 * Card/Section container style
 */
export const getCardStyle = (isDarkMode: boolean): React.CSSProperties => ({
  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: isDarkMode
    ? '0 4px 6px rgba(0, 0, 0, 0.3)'
    : '0 1px 3px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
});

/**
 * Header section style
 */
export const getHeaderStyle = (isDarkMode: boolean): React.CSSProperties => ({
  borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
  paddingBottom: '16px',
  marginBottom: '20px'
});

/**
 * Section title style
 */
export const getSectionTitleStyle = (isDarkMode: boolean): React.CSSProperties => ({
  fontSize: '24px',
  fontWeight: '700',
  color: isDarkMode ? '#f1f5f9' : '#0f172a',
  margin: '0 0 8px 0'
});

/**
 * Section description style
 */
export const getSectionDescriptionStyle = (isDarkMode: boolean): React.CSSProperties => ({
  fontSize: '14px',
  color: isDarkMode ? '#cbd5e1' : '#64748b',
  margin: '0'
});

// ============================================================================
// FORM STYLES
// ============================================================================

/**
 * Form grid layout style
 */
export const getFormGridStyle = (): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '16px'
});

/**
 * Input field style
 */
export const getInputStyle = (isDarkMode: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px 16px',
  border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
  color: isDarkMode ? '#f1f5f9' : '#0f172a',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  fontFamily: 'inherit'
});

/**
 * Textarea style
 */
export const getTextareaStyle = (isDarkMode: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px 16px',
  border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
  color: isDarkMode ? '#f1f5f9' : '#0f172a',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  fontFamily: 'inherit',
  resize: 'vertical' as const,
  minHeight: '100px'
});

/**
 * Select dropdown style
 */
export const getSelectStyle = (isDarkMode: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px 16px',
  border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
  color: isDarkMode ? '#f1f5f9' : '#0f172a',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  fontFamily: 'inherit',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${isDarkMode ? '%23ffffff' : '%23000000'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 12px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '16px',
  paddingRight: '48px'
});

/**
 * File input style
 */
export const getFileInputStyle = (isDarkMode: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px 16px',
  border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
  color: isDarkMode ? '#f1f5f9' : '#0f172a',
  cursor: 'pointer',
  fontFamily: 'inherit'
});

// ============================================================================
// BUTTON STYLES
// ============================================================================

/**
 * Primary button style
 */
export const getPrimaryButtonStyle = (isDarkMode: boolean, disabled: boolean = false): React.CSSProperties => ({
  padding: '12px 24px',
  backgroundColor: disabled ? (isDarkMode ? '#475569' : '#cbd5e1') : '#3b82f6',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  border: 'none',
  borderRadius: '8px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
  opacity: disabled ? 0.5 : 1
});

/**
 * Secondary button style
 */
export const getSecondaryButtonStyle = (isDarkMode: boolean, disabled: boolean = false): React.CSSProperties => ({
  padding: '12px 24px',
  backgroundColor: 'transparent',
  color: isDarkMode ? '#94a3b8' : '#475569',
  fontSize: '14px',
  fontWeight: '600',
  border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
  borderRadius: '8px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
  opacity: disabled ? 0.5 : 1
});

/**
 * Danger button style
 */
export const getDangerButtonStyle = (isDarkMode: boolean, disabled: boolean = false): React.CSSProperties => ({
  padding: '12px 24px',
  backgroundColor: disabled ? (isDarkMode ? '#475569' : '#cbd5e1') : '#ef4444',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  border: 'none',
  borderRadius: '8px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
  opacity: disabled ? 0.5 : 1
});

/**
 * Success button style
 */
export const getSuccessButtonStyle = (isDarkMode: boolean, disabled: boolean = false): React.CSSProperties => ({
  padding: '12px 24px',
  backgroundColor: disabled ? (isDarkMode ? '#475569' : '#cbd5e1') : '#10b981',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  border: 'none',
  borderRadius: '8px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
  opacity: disabled ? 0.5 : 1
});

/**
 * Icon button style
 */
export const getIconButtonStyle = (isDarkMode: boolean): React.CSSProperties => ({
  padding: '8px',
  backgroundColor: 'transparent',
  border: 'none',
  color: isDarkMode ? '#94a3b8' : '#64748b',
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
});

// ============================================================================
// TAB STYLES
// ============================================================================

/**
 * Tab navigation container style
 */
export const getTabContainerStyle = (isDarkMode: boolean): React.CSSProperties => ({
  display: 'flex',
  gap: '8px',
  marginBottom: '24px',
  borderBottom: `2px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
  overflowX: 'auto' as const,
  WebkitOverflowScrolling: 'touch'
});

/**
 * Individual tab button style
 */
export const getTabButtonStyle = (
  isDarkMode: boolean,
  isActive: boolean,
  groupColor?: string
): React.CSSProperties => ({
  padding: '12px 20px',
  fontSize: '14px',
  fontWeight: '600',
  backgroundColor: isActive
    ? isDarkMode
      ? '#334155'
      : '#f1f5f9'
    : 'transparent',
  color: isActive
    ? groupColor || '#3b82f6'
    : isDarkMode
    ? '#94a3b8'
    : '#64748b',
  border: 'none',
  borderBottom: isActive ? `3px solid ${groupColor || '#3b82f6'}` : 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap' as const,
  borderRadius: '8px 8px 0 0',
  fontFamily: 'inherit'
});

/**
 * Tab group header style
 */
export const getTabGroupHeaderStyle = (color: string): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: '600',
  color: color,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '8px',
  marginTop: '16px'
});

// ============================================================================
// TABLE STYLES
// ============================================================================

/**
 * Table container style
 */
export const getTableContainerStyle = (): React.CSSProperties => ({
  overflowX: 'auto' as const,
  borderRadius: '8px'
});

/**
 * Table style
 */
export const getTableStyle = (): React.CSSProperties => ({
  width: '100%',
  borderCollapse: 'collapse' as const
});

/**
 * Table header style
 */
export const getTableHeaderStyle = (isDarkMode: boolean): React.CSSProperties => ({
  backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
  padding: '12px 16px',
  textAlign: 'left' as const,
  fontSize: '12px',
  fontWeight: '600',
  color: isDarkMode ? '#9ca3af' : '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
});

/**
 * Table cell style
 */
export const getTableCellStyle = (isDarkMode: boolean): React.CSSProperties => ({
  padding: '12px 16px',
  fontSize: '14px',
  color: isDarkMode ? '#f1f5f9' : '#0f172a',
  borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
});

/**
 * Table row hover style (for inline styles)
 */
export const getTableRowStyle = (isDarkMode: boolean): React.CSSProperties => ({
  transition: 'background-color 0.2s ease',
  cursor: 'default'
});

// ============================================================================
// BADGE STYLES
// ============================================================================

/**
 * Status badge style
 */
export const getStatusBadgeStyle = (
  status: 'Active' | 'Inactive' | 'Paused' | 'draft' | 'review' | 'approved' | 'archived' | 'new' | 'reviewed',
  isDarkMode: boolean
): React.CSSProperties => {
  let backgroundColor = '';
  let color = '';

  switch (status) {
    case 'Active':
    case 'approved':
      backgroundColor = '#d1fae5';
      color = '#065f46';
      break;
    case 'Inactive':
    case 'archived':
      backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
      color = isDarkMode ? '#9ca3af' : '#374151';
      break;
    case 'Paused':
    case 'draft':
      backgroundColor = '#fef3c7';
      color = '#92400e';
      break;
    case 'review':
    case 'new':
      backgroundColor = '#dbeafe';
      color = '#1e40af';
      break;
    case 'reviewed':
      backgroundColor = '#d1fae5';
      color = '#065f46';
      break;
    default:
      backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
      color = isDarkMode ? '#9ca3af' : '#374151';
  }

  return {
    display: 'inline-flex',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '12px',
    backgroundColor,
    color
  };
};

/**
 * Priority badge style
 */
export const getPriorityBadgeStyle = (
  priority: 'critical' | 'high' | 'medium' | 'low',
  isDarkMode: boolean
): React.CSSProperties => {
  let backgroundColor = '';
  let color = '';

  switch (priority) {
    case 'critical':
      backgroundColor = '#fee2e2';
      color = '#991b1b';
      break;
    case 'high':
      backgroundColor = '#fed7aa';
      color = '#9a3412';
      break;
    case 'medium':
      backgroundColor = '#fef3c7';
      color = '#92400e';
      break;
    case 'low':
      backgroundColor = '#d1fae5';
      color = '#065f46';
      break;
    default:
      backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
      color = isDarkMode ? '#9ca3af' : '#374151';
  }

  return {
    display: 'inline-flex',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '12px',
    backgroundColor,
    color
  };
};

// ============================================================================
// EMPTY STATE STYLES
// ============================================================================

/**
 * Empty state container style
 */
export const getEmptyStateStyle = (isDarkMode: boolean): React.CSSProperties => ({
  padding: '48px 24px',
  textAlign: 'center' as const,
  color: isDarkMode ? '#94a3b8' : '#64748b',
  backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
  borderRadius: '8px',
  border: `2px dashed ${isDarkMode ? '#334155' : '#cbd5e1'}`
});

// ============================================================================
// MODAL STYLES
// ============================================================================

/**
 * Modal overlay style
 */
export const getModalOverlayStyle = (): React.CSSProperties => ({
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
  padding: '16px'
});

/**
 * Modal content style
 */
export const getModalContentStyle = (isDarkMode: boolean): React.CSSProperties => ({
  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto' as const,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
});

// ============================================================================
// LOADING SPINNER STYLES
// ============================================================================

/**
 * Loading spinner style
 */
export const getLoadingSpinnerStyle = (): React.CSSProperties => ({
  display: 'inline-block',
  width: '16px',
  height: '16px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTop: '2px solid white',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite'
});

/**
 * CSS keyframes for animations
 */
export const getAnimationStyles = (): string => `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideDown {
    from { 
      opacity: 0;
      transform: translateY(-10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get responsive grid columns
 */
export const getResponsiveColumns = (itemCount: number): string => {
  if (itemCount === 1) return '1fr';
  if (itemCount === 2) return 'repeat(2, 1fr)';
  return 'repeat(auto-fit, minmax(250px, 1fr))';
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getTheme,
  toggleDarkMode,
  fontStyle,
  getContainerStyle,
  getCardStyle,
  getHeaderStyle,
  getSectionTitleStyle,
  getSectionDescriptionStyle,
  getFormGridStyle,
  getInputStyle,
  getTextareaStyle,
  getSelectStyle,
  getFileInputStyle,
  getPrimaryButtonStyle,
  getSecondaryButtonStyle,
  getDangerButtonStyle,
  getSuccessButtonStyle,
  getIconButtonStyle,
  getTabContainerStyle,
  getTabButtonStyle,
  getTabGroupHeaderStyle,
  getTableContainerStyle,
  getTableStyle,
  getTableHeaderStyle,
  getTableCellStyle,
  getTableRowStyle,
  getStatusBadgeStyle,
  getPriorityBadgeStyle,
  getEmptyStateStyle,
  getModalOverlayStyle,
  getModalContentStyle,
  getLoadingSpinnerStyle,
  getAnimationStyles,
  getResponsiveColumns,
  truncateText
};
