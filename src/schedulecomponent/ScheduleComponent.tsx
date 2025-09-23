// /src/schedulecomponent/ScheduleComponent.tsx - Working with Dashboard Theme
import React, { useState } from 'react';
import { getTabStyle, getTheme, getContainerStyle, getCSSAnimations } from './utils/styleUtils';
import { Clock, Calendar, CheckCircle, Save } from 'lucide-react';

export default function ScheduleComponent() {
  const [activeTab, setActiveTab] = useState('pending');
  const { isDarkMode } = getTheme();

  const tabs = [
    { 
      id: 'pending', 
      label: 'Pending Schedules', 
      icon: Clock,
      count: 5,
      description: 'Posts from Content Manager awaiting schedule assignment'
    },
    { 
      id: 'calendar', 
      label: 'Calendar View', 
      icon: Calendar,
      count: 12,
      description: 'Visual calendar showing all scheduled posts'
    },
    { 
      id: 'status', 
      label: 'Status Manager', 
      icon: CheckCircle,
      count: 8,
      description: 'Monitor and manage post publishing status'
    },
    { 
      id: 'saved', 
      label: 'Saved Templates', 
      icon: Save,
      count: 3,
      description: 'Reusable templates from successful posts'
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div style={getContainerStyle(isDarkMode)}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          color: isDarkMode ? '#60a5fa' : '#2563eb',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Calendar size={28} />
          Schedule Manager
        </h1>
        <p style={{
          fontSize: '14px',
          color: isDarkMode ? '#94a3b8' : '#6b7280',
          margin: '0'
        }}>
          Schedule posts and track their delivery status
        </p>
      </div>

      {/* Status Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: isDarkMode ? '#60a5fa' : '#2563eb'
          }}>
            5
          </div>
          <div style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            Pending Schedule
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: isDarkMode ? '#10b981' : '#059669'
          }}>
            12
          </div>
          <div style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            Scheduled
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: isDarkMode ? '#22c55e' : '#16a34a'
          }}>
            15
          </div>
          <div style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            Published
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: isDarkMode ? '#ef4444' : '#dc2626'
          }}>
            2
          </div>
          <div style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#6b7280'
          }}>
            Failed
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        marginBottom: '24px'
      }}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...getTabStyle(tab.id, activeTab, isDarkMode),
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <IconComponent size={16} />
              {tab.label}
              <span style={{
                backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                color: isDarkMode ? '#60a5fa' : '#1e40af',
                padding: '2px 6px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : '#f9fafb',
        borderRadius: '8px',
        padding: '32px',
        minHeight: '400px',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
      }}>
        {currentTab && (
          <div className="animate-fade-in">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <currentTab.icon size={32} style={{
                marginRight: '16px',
                color: activeTab === 'pending' ? '#60a5fa' :
                       activeTab === 'calendar' ? '#10b981' :
                       activeTab === 'status' ? '#f59e0b' : '#a855f7'
              }} />
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: isDarkMode ? '#f8fafc' : '#111827'
                }}>
                  {currentTab.label}
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  margin: '0'
                }}>
                  {currentTab.description}
                </p>
              </div>
            </div>

            {/* Tab-specific content */}
            <div style={{
              backgroundColor: isDarkMode ? '#334155' : 'white',
              borderRadius: '8px',
              padding: '24px',
              border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
            }}>
              {activeTab === 'pending' && (
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: isDarkMode ? '#f8fafc' : '#111827',
                    margin: '0 0 16px 0'
                  }}>
                    📝 Pending Schedules Features:
                  </h3>
                  <ul style={{
                    color: isDarkMode ? '#e2e8f0' : '#4b5563',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    paddingLeft: '20px'
                  }}>
                    <li>Receive posts from Content Manager with pending_schedule status</li>
                    <li>Edit post content, hashtags, platforms, and metadata</li>
                    <li>Set date/time for publishing (UK timezone UTC+1)</li>
                    <li>Quick schedule options: 1 hour, 2 hours, tomorrow 9 AM, next Monday 9 AM</li>
                    <li>Delete unwanted posts</li>
                    <li><strong>Schedule Now</strong> button changes status to scheduled</li>
                  </ul>
                </div>
              )}

              {activeTab === 'calendar' && (
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: isDarkMode ? '#f8fafc' : '#111827',
                    margin: '0 0 16px 0'
                  }}>
                    📅 Calendar View Features:
                  </h3>
                  <ul style={{
                    color: isDarkMode ? '#e2e8f0' : '#4b5563',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    paddingLeft: '20px'
                  }}>
                    <li>Visual calendar with UK date format (DD/MM/YYYY)</li>
                    <li>24-hour time format for UK standards</li>
                    <li>Posts display with title & platform abbreviations (IG, FB, TW)</li>
                    <li>Month/week navigation</li>
                    <li>Click posts for details and editing</li>
                    <li>Color-coded by status</li>
                  </ul>
                </div>
              )}

              {activeTab === 'status' && (
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: isDarkMode ? '#f8fafc' : '#111827',
                    margin: '0 0 16px 0'
                  }}>
                    ⚡ Status Manager Features:
                  </h3>
                  <ul style={{
                    color: isDarkMode ? '#e2e8f0' : '#4b5563',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    paddingLeft: '20px'
                  }}>
                    <li>Monitor posts: scheduled → processing → published/failed</li>
                    <li>Filter by status: scheduled, processing, published, failed</li>
                    <li>Retry failed posts with error tracking</li>
                    <li><strong>Save as Template</strong> button (ONLY for published posts)</li>
                    <li><strong>Delete</strong> button for cleanup and management</li>
                    <li>Real-time status updates</li>
                  </ul>
                </div>
              )}

              {activeTab === 'saved' && (
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: isDarkMode ? '#f8fafc' : '#111827',
                    margin: '0 0 16px 0'
                  }}>
                    💾 Saved Templates Features:
                  </h3>
                  <ul style={{
                    color: isDarkMode ? '#e2e8f0' : '#4b5563',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    paddingLeft: '20px'
                  }}>
                    <li>Templates saved from Status Manager (Section 3)</li>
                    <li><strong>Use Template</strong> button → copies to Pending Schedules</li>
                    <li><strong>Delete Template</strong> button with confirmation</li>
                    <li>Search and filter templates</li>
                    <li>Usage tracking and popularity indicators</li>
                    <li>Complete cycle: Templates → Pending → Schedule → Publish</li>
                  </ul>
                </div>
              )}

              {/* Coming Soon Notice */}
              <div style={{
                marginTop: '32px',
                padding: '20px',
                backgroundColor: isDarkMode ? '#1e293b' : '#f0f9ff',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#475569' : '#bae6fd'}`,
                textAlign: 'center'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: isDarkMode ? '#60a5fa' : '#0ea5e9',
                  margin: '0 0 8px 0'
                }}>
                  🚧 Full Functionality Coming Next
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: isDarkMode ? '#94a3b8' : '#0369a1',
                  margin: '0'
                }}>
                  This section will be populated with real data and functionality once the basic structure is confirmed working.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{getCSSAnimations()}</style>
    </div>
  );
}
