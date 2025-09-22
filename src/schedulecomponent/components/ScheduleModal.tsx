// /src/schedulecomponent/components/ScheduleModal.tsx - FIXED to work with corrected types
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, Check, AlertCircle } from 'lucide-react';
import { formatDate, formatTime, addMinutes, isValidDate } from '../utils/dateUtils';
import { getTheme, getModalOverlayStyle, getModalStyle, getInputStyle, getButtonStyle } from '../utils/styles';
import { DashboardPost } from '../types';

interface ScheduleModalProps {
  post: DashboardPost | null;
  onConfirm: (scheduleData: {
    scheduledDate: Date;
    timezone: string;
    priorityLevel?: 'low' | 'medium' | 'high' | 'urgent';
    campaignId?: string;
  }) => void;
  onCancel: () => void;
}

export default function ScheduleModal({ post, onConfirm, onCancel }: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [priorityLevel, setPriorityLevel] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [campaignId, setCampaignId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { isDarkMode, colors } = getTheme();

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
        scheduledDate: scheduledDateTime,
        timezone: timezone,
        priorityLevel: priorityLevel,
        campaignId: campaignId || undefined
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

  if (!post) return null;

  return (
    <div style={getModalOverlayStyle()} onClick={onCancel}>
      <div style={getModalStyle(isDarkMode)} onClick={(e) => e.stopPropagation()}>
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
            color: colors.text.accent,
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
              color: colors.text.tertiary,
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Post Preview */}
        <div style={{
          backgroundColor: colors.background.secondary,
          border: `1px solid ${colors.border.primary}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.text.primary,
            margin: '0 0 8px 0'
          }}>
            {post.title || 'Untitled Post'}
          </h3>
          <p style={{
            fontSize: '14px',
            color: colors.text.secondary,
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
            alignItems: 'center',
            gap: '12px',
            fontSize: '12px',
            color: colors.text.tertiary
          }}>
            <span>ID: {post.content_id}</span>
            <span>Platforms: {post.selected_platforms.length}</span>
            <span>Character: {post.character_profile || 'Not set'}</span>
            {post.media_files && post.media_files.length > 0 && (
              <span>Media: {post.media_files.length} files</span>
            )}
          </div>
        </div>

        {/* Quick Schedule Options */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.text.primary,
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
                  backgroundColor: colors.background.secondary,
                  border: `1px solid ${colors.border.secondary}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: colors.text.primary,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background.accent;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background.secondary;
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
            color: colors.text.primary,
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
                color: colors.text.tertiary,
                marginBottom: '4px'
              }}>
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={getInputStyle(isDarkMode)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: colors.text.tertiary,
                marginBottom: '4px'
              }}>
                Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                style={getInputStyle(isDarkMode)}
              />
            </div>
          </div>

          {/* Timezone */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: colors.text.tertiary,
              marginBottom: '4px'
            }}>
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={getInputStyle(isDarkMode)}
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="America/New_York">Eastern Time (EST/EDT)</option>
              <option value="America/Chicago">Central Time (CST/CDT)</option>
              <option value="America/Denver">Mountain Time (MST/MDT)</option>
              <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
              <option value="Europe/Paris">Paris (CET/CEST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
            </select>
          </div>

          {/* Priority Level */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: colors.text.tertiary,
              marginBottom: '4px'
            }}>
              Priority Level
            </label>
            <select
              value={priorityLevel}
              onChange={(e) => setPriorityLevel(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
              style={getInputStyle(isDarkMode)}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Campaign ID (Optional) */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: colors.text.tertiary,
              marginBottom: '4px'
            }}>
              Campaign ID (Optional)
            </label>
            <input
              type="text"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              placeholder="Enter campaign ID..."
              style={getInputStyle(isDarkMode)}
            />
          </div>
        </div>

        {/* Preview Scheduled Time */}
        {selectedDate && selectedTime && (
          <div style={{
            backgroundColor: colors.background.accent,
            border: `1px solid ${colors.text.accent}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.text.accent,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <Clock size={16} />
              Scheduled for: {formatDate(new Date(`${selectedDate}T${selectedTime}`))} at {formatTime(new Date(`${selectedDate}T${selectedTime}`))}
            </div>
            <div style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              marginTop: '4px'
            }}>
              Timezone: {timezone} • Priority: {priorityLevel}
              {campaignId && ` • Campaign: ${campaignId}`}
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
          borderTop: `1px solid ${colors.border.primary}`
        }}>
          <button
            onClick={onCancel}
            style={getButtonStyle('secondary', isDarkMode)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            style={{
              ...getButtonStyle('primary', isDarkMode),
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
