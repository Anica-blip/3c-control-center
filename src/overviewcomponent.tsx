import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  Zap, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
  Eye,
  Edit3,
  Send,
  Database,
  Palette,
  Globe
} from 'lucide-react';

// Types for dashboard data
interface DashboardMetrics {
  contentCreated: number;
  postsScheduled: number;
  activeCampaigns: number;
  totalViews: number;
  systemStatus: 'operational' | 'warning' | 'maintenance';
}

interface RecentActivity {
  id: string;
  type: 'content' | 'schedule' | 'marketing' | 'system';
  message: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'error';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

const OverviewComponent: React.FC = () => {
  // Mock data - will be replaced with real Supabase data later
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    contentCreated: 47,
    postsScheduled: 23,
    activeCampaigns: 8,
    totalViews: 12847,
    systemStatus: 'operational'
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'content',
      message: 'New blog post "AI in Content Creation" published',
      timestamp: new Date(Date.now() - 300000),
      status: 'success'
    },
    {
      id: '2', 
      type: 'schedule',
      message: 'Instagram post scheduled for tomorrow 9:00 AM',
      timestamp: new Date(Date.now() - 600000),
      status: 'pending'
    },
    {
      id: '3',
      type: 'marketing',
      message: 'Campaign "Winter Launch" metrics updated',
      timestamp: new Date(Date.now() - 900000),
      status: 'success'
    },
    {
      id: '4',
      type: 'system',
      message: 'Supabase connection established',
      timestamp: new Date(Date.now() - 1200000),
      status: 'success'
    }
  ]);

  const quickActions: QuickAction[] = [
    {
      id: 'create-content',
      title: 'Create Content',
      description: 'Start new social media post',
      icon: <Plus style={{ height: '20px', width: '20px' }} />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      action: () => console.log('Navigate to content creation')
    },
    {
      id: 'schedule-post',
      title: 'Schedule Post',
      description: 'Add to content calendar',
      icon: <Calendar style={{ height: '20px', width: '20px' }} />,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      action: () => console.log('Navigate to scheduler')
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Check campaign performance',
      icon: <BarChart3 style={{ height: '20px', width: '20px' }} />,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      action: () => console.log('Navigate to marketing')
    },
    {
      id: 'manage-settings',
      title: 'Manage Settings',
      description: 'Update platforms & profiles',
      icon: <Settings style={{ height: '20px', width: '20px' }} />,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      action: () => console.log('Navigate to settings')
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'content': return <Edit3 style={{ height: '16px', width: '16px' }} />;
      case 'schedule': return <Calendar style={{ height: '16px', width: '16px' }} />;
      case 'marketing': return <TrendingUp style={{ height: '16px', width: '16px' }} />;
      case 'system': return <Database style={{ height: '16px', width: '16px' }} />;
      default: return <Zap style={{ height: '16px', width: '16px' }} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle style={{ height: '16px', width: '16px', color: '#10b981' }} />;
      case 'pending': return <Clock style={{ height: '16px', width: '16px', color: '#f59e0b' }} />;
      case 'error': return <AlertCircle style={{ height: '16px', width: '16px', color: '#ef4444' }} />;
      default: return <Clock style={{ height: '16px', width: '16px', color: '#6b7280' }} />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 8px 0'
            }}>
              🎯 3C Content Center
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '18px',
              margin: '0'
            }}>
              Welcome back! Here's what's happening with your content operations.
            </p>
          </div>
          
          {/* System Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: metrics.systemStatus === 'operational' ? '#10b981' : 
                             metrics.systemStatus === 'warning' ? '#f59e0b' : '#ef4444'
            }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#111827'
            }}>
              System {metrics.systemStatus === 'operational' ? 'Operational' : 
                      metrics.systemStatus === 'warning' ? 'Warning' : 'Maintenance'}
            </span>
          </div>
        </div>

        {/* Current Time and Language */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe style={{ height: '16px', width: '16px' }} />
            <span>🇬🇧 English (UK) • WEST (UTC+1)</span>
          </div>
          <div>
            {new Date().toLocaleString('en-GB', { 
              timeZone: 'Europe/Lisbon',
              dateStyle: 'full',
              timeStyle: 'short'
            })}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Content Created */}
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #3b82f6',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
            }}>
              <Edit3 style={{ height: '24px', width: '24px', color: '#3b82f6' }} />
            </div>
            <span style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1e40af'
            }}>
              {metrics.contentCreated}
            </span>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e40af',
            margin: '0 0 4px 0'
          }}>
            Content Created
          </h3>
          <p style={{
            color: '#1e40af',
            fontSize: '14px',
            margin: '0'
          }}>
            Total pieces this month
          </p>
        </div>

        {/* Posts Scheduled */}
        <div style={{
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #10b981',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
            }}>
              <Calendar style={{ height: '24px', width: '24px', color: '#10b981' }} />
            </div>
            <span style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#047857'
            }}>
              {metrics.postsScheduled}
            </span>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#047857',
            margin: '0 0 4px 0'
          }}>
            Posts Scheduled
          </h3>
          <p style={{
            color: '#047857',
            fontSize: '14px',
            margin: '0'
          }}>
            Ready for publishing
          </p>
        </div>

        {/* Active Campaigns */}
        <div style={{
          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #8b5cf6',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(139, 92, 246, 0.1)'
            }}>
              <TrendingUp style={{ height: '24px', width: '24px', color: '#8b5cf6' }} />
            </div>
            <span style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#7c3aed'
            }}>
              {metrics.activeCampaigns}
            </span>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#7c3aed',
            margin: '0 0 4px 0'
          }}>
            Active Campaigns
          </h3>
          <p style={{
            color: '#7c3aed',
            fontSize: '14px',
            margin: '0'
          }}>
            Currently running
          </p>
        </div>

        {/* Total Views */}
        <div style={{
          background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #f59e0b',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.1)'
            }}>
              <Eye style={{ height: '24px', width: '24px', color: '#f59e0b' }} />
            </div>
            <span style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#92400e'
            }}>
              {metrics.totalViews.toLocaleString()}
            </span>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#92400e',
            margin: '0 0 4px 0'
          }}>
            Total Views
          </h3>
          <p style={{
            color: '#92400e',
            fontSize: '14px',
            margin: '0'
          }}>
            Across all platforms
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}>
        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 20px 0'
          }}>
            ⚡ Quick Actions
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                className={action.color}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    {action.icon}
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0'
                  }}>
                    {action.title}
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: '0'
                }}>
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 20px 0'
          }}>
            📈 Recent Activity
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #f3f4f6'
                }}
              >
                <div style={{
                  padding: '6px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#111827',
                    margin: '0 0 4px 0',
                    lineHeight: '1.4'
                  }}>
                    {activity.message}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    {getStatusIcon(activity.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            View All Activity
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: '32px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          margin: '0'
        }}>
          🔒 Internal Use Only • Designed by Claude • © 2025 GitHub • 
          <span style={{ marginLeft: '8px' }}>
            <a 
              href="https://anica-blip.github.io/3c-control-center/" 
              style={{ color: '#3b82f6', textDecoration: 'none' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              anica-blip.github.io/3c-control-center
            </a>
          </span>
        </p>
      </div>
    </div>
  );
};

export default OverviewComponent;
