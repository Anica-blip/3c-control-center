// /src/schedulecomponent/ScheduleComponent.tsx - BASIC 4 TABS FIRST
import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle, Save } from 'lucide-react';

export default function ScheduleComponent() {
  const [activeTab, setActiveTab] = useState('pending');

  // Basic styling
  const isDarkMode = true; // Your dashboard appears to be dark mode

  const containerStyle = {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderRadius: '8px',
    padding: '24px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '600px'
  };

  const tabStyle = (tabId: string) => ({
    padding: '12px 20px',
    backgroundColor: activeTab === tabId ? '#3b82f6' : 'transparent',
    color: activeTab === tabId ? 'white' : '#94a3b8',
    border: 'none',
    borderBottom: activeTab === tabId ? '2px solid #3b82f6' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'inherit'
  });

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #475569'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          color: '#60a5fa'
        }}>
          Schedule Manager
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          margin: '0'
        }}>
          Schedule posts and track their delivery status
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #475569',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={tabStyle('pending')}
        >
          <Clock size={16} />
          Pending Schedules
          <span style={{
            backgroundColor: '#1e3a8a',
            color: '#60a5fa',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            5
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          style={tabStyle('calendar')}
        >
          <Calendar size={16} />
          Calendar View
          <span style={{
            backgroundColor: '#065f46',
            color: '#10b981',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            12
          </span>
        </button>

        <button
          onClick={() => setActiveTab('status')}
          style={tabStyle('status')}
        >
          <CheckCircle size={16} />
          Status Manager
          <span style={{
            backgroundColor: '#7c2d12',
            color: '#f97316',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            8
          </span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          style={tabStyle('saved')}
        >
          <Save size={16} />
          Saved Templates
          <span style={{
            backgroundColor: '#581c87',
            color: '#a855f7',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            3
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div style={{
        backgroundColor: '#334155',
        borderRadius: '8px',
        padding: '32px',
        minHeight: '400px'
      }}>
        {activeTab === 'pending' && (
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Clock size={24} />
              Pending Schedules
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#e2e8f0',
              margin: '0'
            }}>
              Posts from Content Manager will appear here for final editing and scheduling.
            </p>
            <div style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid #475569'
            }}>
              <h3 style={{ fontSize: '16px', color: '#f8fafc', margin: '0 0 12px 0' }}>Features:</h3>
              <ul style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                <li>Edit post content, hashtags, platforms</li>
                <li>Set date/time for publishing (UK timezone UTC+1)</li>
                <li>Quick schedule options (1 hour, tomorrow 9 AM, etc.)</li>
                <li>Delete unwanted posts</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Calendar size={24} />
              Calendar View
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#e2e8f0',
              margin: '0'
            }}>
              Visual calendar showing all scheduled posts with UK date/time formatting.
            </p>
            <div style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid #475569'
            }}>
              <h3 style={{ fontSize: '16px', color: '#f8fafc', margin: '0 0 12px 0' }}>Features:</h3>
              <ul style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                <li>Month/week calendar view</li>
                <li>Posts show title & platform abbreviations (IG, FB, TW)</li>
                <li>UK date format (DD/MM/YYYY) & 24-hour time</li>
                <li>Click posts for details</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={24} />
              Status Manager
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#e2e8f0',
              margin: '0'
            }}>
              Monitor published posts and manage their status with key action buttons.
            </p>
            <div style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid #475569'
            }}>
              <h3 style={{ fontSize: '16px', color: '#f8fafc', margin: '0 0 12px 0' }}>Features:</h3>
              <ul style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                <li>Filter by status: scheduled, processing, published, failed</li>
                <li><strong>Save as Template</strong> button (for published posts)</li>
                <li><strong>Delete</strong> button for cleanup</li>
                <li>Retry failed posts</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Save size={24} />
              Saved Templates
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#e2e8f0',
              margin: '0'
            }}>
              Manage reusable templates created from successful posts.
            </p>
            <div style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid #475569'
            }}>
              <h3 style={{ fontSize: '16px', color: '#f8fafc', margin: '0 0 12px 0' }}>Features:</h3>
              <ul style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                <li>Templates saved from Status Manager</li>
                <li><strong>Use Template</strong> button → sends to Pending Schedules</li>
                <li><strong>Delete Template</strong> button</li>
                <li>Search and usage tracking</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
