// /src/schedulecomponent/components/ScheduleModal.tsx - FIXED: Display platform names
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, Check, AlertCircle } from 'lucide-react';
import { getTheme } from '../utils/styleUtils';
import { ScheduledPost } from '../types';

// Local utility functions to avoid import issues
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const addMinutes = (date: Date, minutes: number): Date => {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutes);
  return newDate;
};

const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

interface ScheduleModalProps {
  post: ScheduledPost | null;
  onConfirm: (scheduleData: {
    scheduledDate: string;
    timezone: string;
    repeatOption?: string;
  }) => void;
  onCancel: () => void;
}

export default function ScheduleModal({ post, onConfirm, onCancel }: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [repeatOption, setRepeatOption] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { isDarkMode, theme } = getTheme();

  // Initialize with current date/time + 1 hour
  useEffect(() => {
    const now = new Date();
    const oneHourLater = addMinutes(now, 60);
    
    setSelectedDate(oneHourLater.toISOString().split('T')[0]);
    setSelectedTime(oneHourLater.toTimeString().split(' ')[0].slice(0, 5));
    
    // Detect user timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone);
  }, []);

  const modalOverlayStyle = {
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
  };

  const modalStyle = {
    backgroundColor: theme.background,
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto' as const,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: theme.cardBg,
    color: theme.text,
    fontFamily: 'inherit'
  };

  const buttonStyle = (variant: 'primary' | 'secondary') => ({
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    border: variant === 'primary' ? 'none' : `1px solid ${theme.border}`,
    backgroundColor: variant === 'primary' 
      ? theme.primary
      : 'transparent',
    color: variant === 'primary' 
      ? 'white' 
      : theme.textSecondary,
    fontFamily: 'inherit'
  });

  const validateDateTime = () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return false;
    }

    const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();

    if (!isValidDate(scheduledDateTime)) {
      setError('Invalid date or time selected');
      return false;
    }

    if (scheduledDateTime <= now) {
      setError('Scheduled time must be in the future');
      return false;
    }

    // Check if scheduling too far in advance (1 year limit)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (scheduledDateTime > oneYearFromNow) {
      setError('Cannot schedule more than 1 year in advance');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateDateTime()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      await onConfirm({
        scheduledDate: scheduledDateTime.toISOString(),
        timezone: timezone,
        repeatOption: repeatOption !== 'none' ? repeatOption : undefined
      });
    } catch (err) {
      setError('Failed to schedule post. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getQuickScheduleOptions = () => {
    const now = new Date();
    return [
      { label: 'In 1 hour', value: addMinutes(now, 60) },
      { label: 'In 2 hours', value: addMinutes(now, 120) },
      { label: 'Tomorrow 9 AM', value: (() => {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
      })() },
      { label: 'Next Monday 9 AM', value: (() => {
        const nextMonday = new Date(now);
        const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7;
        nextMonday.setDate(now.getDate() + daysUntilMonday);
        nextMonday.setHours(9, 0, 0, 0);
        return nextMonday;
      })() }
    ];
  };

  const handleQuickSchedule = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setSelectedTime(date.toTimeString().split(' ')[0].slice(0, 5));
  };

  // FIXED: Get platform names from platformDetails
  const getPlatformDisplay = () => {
    if (post?.platformDetails && post.platformDetails.length > 0) {
      return post.platformDetails.map(p => p.name || p.display_name).join(', ');
    }
    if (post?.selected_platforms && post.selected_platforms.length > 0) {
      return `${post.selected_platforms.length} platform(s) selected`;
    }
    return 'No platforms selected';
  };

  if (!post) return null;

  return (
    <div style={modalOverlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: theme.primary,
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Calendar size={24} />
            Schedule Post
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.textSecondary,
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Post Preview */}
        <div style={{
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: theme.text,
            margin: '0 0 8px 0'
          }}>
            {post.title || 'Untitled Post'}
          </h3>
          <p style={{
            fontSize: '14px',
            color: theme.textSecondary,
            margin: '0 0 12px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {post.description}
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
            color: theme.textSecondary
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600' }}>ID:</span>
              <span>{post.content_id}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600' }}>Platforms:</span>
              <span>{getPlatformDisplay()}</span>
            </div>
            {post.character_profile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600' }}>Character:</span>
                <span>{post.character_profile}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Schedule Options */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: theme.text,
            marginBottom: '12px'
          }}>
            Quick Schedule Options
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {getQuickScheduleOptions().map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuickSchedule(option.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: theme.text,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.cardBg;
                  e.currentTarget.style.color = theme.text;
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date & Time */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: theme.text,
            marginBottom: '12px'
          }}>
            Custom Schedule
          </label>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: theme.textSecondary,
                marginBottom: '4px'
              }}>
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={inputStyle}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: theme.textSecondary,
                marginBottom: '4px'
              }}>
                Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Timezone */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: theme.textSecondary,
              marginBottom: '4px'
            }}>
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={inputStyle}
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Paris (CET/CEST)</option>
              <option value="America/New_York">Eastern Time (EST/EDT)</option>
              <option value="America/Chicago">Central Time (CST/CDT)</option>
              <option value="America/Denver">Mountain Time (MST/MDT)</option>
              <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
            </select>
          </div>

          {/* Repeat Options */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: theme.textSecondary,
              marginBottom: '4px'
            }}>
              Repeat (Optional)
            </label>
            <select
              value={repeatOption}
              onChange={(e) => setRepeatOption(e.target.value)}
              style={inputStyle}
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Preview Scheduled Time */}
        {selectedDate && selectedTime && (
          <div style={{
            backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
            border: `1px solid ${theme.primary}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: theme.primary,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <Clock size={16} />
              Scheduled for: {formatDate(new Date(`${selectedDate}T${selectedTime}`))} at {formatTime(new Date(`${selectedDate}T${selectedTime}`))}
            </div>
            <div style={{
              fontSize: '12px',
              color: theme.textSecondary,
              marginTop: '4px'
            }}>
              Timezone: {timezone}
              {repeatOption !== 'none' && ` • Repeats: ${repeatOption}`}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#dc2626'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <button
            onClick={onCancel}
            style={buttonStyle('secondary')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            style={{
              ...buttonStyle('primary'),
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
            disabled={isSubmitting || !selectedDate || !selectedTime}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Scheduling...
              </>
            ) : (
              <>
                <Check size={16} />
                Schedule Post
              </>
            )}
          </button>
        </div>

        {/* CSS for loading animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
