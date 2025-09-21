import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { PendingPost } from '../types';

interface ScheduleModalProps {
  post: PendingPost | null;
  onConfirm: (scheduleData: { scheduledDate: Date }) => void;
  onCancel: () => void;
}

export default function ScheduleModal({ post, onConfirm, onCancel }: ScheduleModalProps) {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });

  if (!post) return null;

  const handleConfirm = () => {
    const date = new Date(scheduledDate);
    onConfirm({ scheduledDate: date });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#111827',
            margin: '0'
          }}>
            Schedule Post
          </h3>
          <button
            onClick={onCancel}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isDarkMode ? '#94a3b8' : '#6b7280'
            }}
          >
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        {/* Post Preview */}
        <div style={{
          padding: '16px',
          backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#111827',
            marginBottom: '8px'
          }}>
            {post.character_profile}
          </div>
          <div style={{
            fontSize: '13px',
            color: isDarkMode ? '#e2e8f0' : '#374151',
            lineHeight: '1.5'
          }}>
            {post.description}
          </div>
          {post.hashtags.length > 0 && (
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#3b82f6'
            }}>
              {post.hashtags.map(tag => `#${tag}`).join(' ')}
            </div>
          )}
        </div>

        {/* Schedule Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#374151',
            marginBottom: '8px'
          }}>
            Schedule Date & Time
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
            borderRadius: '8px',
            backgroundColor: isDarkMode ? '#374151' : 'white'
          }}>
            <Calendar style={{ height: '16px', width: '16px', color: '#3b82f6' }} />
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: isDarkMode ? '#f8fafc' : '#111827',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: isDarkMode ? '#94a3b8' : '#6b7280'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#3b82f6',
              color: 'white'
            }}
          >
            Schedule Post
          </button>
        </div>
      </div>
    </div>
  );
}
