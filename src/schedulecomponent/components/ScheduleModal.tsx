import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CheckCircle, Video, FileText, ExternalLink, User, Loader } from 'lucide-react';
import { ScheduledPost } from '../types';
import { supabase } from '../config';

interface ScheduleModalProps {
  post: ScheduledPost;
  onConfirm: (scheduleData: { 
    scheduledDate: string; 
    timezone: string; 
    repeatOption?: string;
    serviceType: string;
  }) => Promise<void>;
  onCancel: () => void;
}

interface ExternalService {
  id: string;
  service_type: string;
  url: string;
  is_active: boolean;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ post, onConfirm, onCancel }) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [repeatOption, setRepeatOption] = useState('none');
  const [selectedService, setSelectedService] = useState('');
  const [services, setServices] = useState<ExternalService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [characterProfile, setCharacterProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isDarkMode = true;
  const theme = {
    background: '#0f172a',
    cardBg: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    primary: '#3b82f6',
    primaryBg: '#1e3a8a',
    success: '#22c55e',
    successBg: '#14532d'
  };

  useEffect(() => {
    fetchExternalServices();
    if (post.character_profile) {
      fetchCharacterProfile(post.character_profile as string);
    }
  }, [post.character_profile]);

  const fetchExternalServices = async () => {
    try {
      const { data, error } = await supabase
        .from('external_services')
        .select('id, service_type, url, is_active')
        .eq('is_active', true)
        .order('service_type');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchCharacterProfile = async (profileId: string) => {
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('character_profiles')
        .select('avatar_id, name, username, role')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      setCharacterProfile(data);
    } catch (error) {
      console.error('Error fetching character profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleString('en-GB', { 
      day: '2-digit',
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleConfirm = async () => {
    if (!scheduledDate || !scheduledTime || !selectedService) {
      alert('Please fill in all required fields including service selection');
      return;
    }

    try {
      setIsSubmitting(true);
      const dateTimeString = `${scheduledDate}T${scheduledTime}:00`;
      
      await onConfirm({
        scheduledDate: dateTimeString,
        timezone,
        repeatOption: repeatOption !== 'none' ? repeatOption : undefined,
        serviceType: selectedService
      });

      // Show success message
      const formattedDateTime = formatDateTime(scheduledDate, scheduledTime);
      setSuccessMessage(`Post scheduled successfully for ${formattedDateTime}`);
      setShowSuccess(true);

      // Auto-close after 2.5 seconds
      setTimeout(() => {
        onCancel();
      }, 2500);

    } catch (error) {
      console.error('Failed to schedule post:', error);
      alert('Failed to schedule post. Please try again.');
      setIsSubmitting(false);
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const selectedServiceName = services.find(s => s.service_type === selectedService)?.service_type || selectedService;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      {/* SUCCESS TOAST */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: theme.success,
          color: 'white',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '300px',
          maxWidth: '500px',
          zIndex: 2000,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <CheckCircle size={24} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '14px',
              marginBottom: '4px'
            }}>
              Success!
            </div>
            <div style={{ fontSize: '13px', opacity: 0.95 }}>
              {successMessage}
            </div>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: theme.cardBg,
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: `1px solid ${theme.border}`,
        opacity: showSuccess ? 0.95 : 1,
        pointerEvents: isSubmitting || showSuccess ? 'none' : 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar style={{ height: '20px', width: '20px', color: theme.primary }} />
            <h2 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 'bold',
              color: theme.text
            }}>
              Schedule Post
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: theme.textSecondary,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              borderRadius: '6px',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* POST PREVIEW SECTION */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: theme.background,
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              fontWeight: 'bold',
              color: theme.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Post Preview
            </h3>

            {/* MEDIA FILES */}
            {post.media_files && post.media_files.length > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: theme.cardBg,
                borderRadius: '6px',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: theme.textSecondary,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <FileText size={12} />
                  Media Files ({post.media_files.length})
                </div>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {post.media_files.slice(0, 3).map((file, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      backgroundColor: theme.background,
                      borderRadius: '4px'
                    }}>
                      {file.type === 'image' && file.url ? (
                        <img 
                          src={file.url}
                          alt={file.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '4px',
                            objectFit: 'cover',
                            border: `1px solid ${theme.border}`
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          backgroundColor: theme.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          {file.type === 'video' ? <Video size={16} /> : 
                           file.type === 'url_link' ? <ExternalLink size={16} /> : 
                           <FileText size={16} />}
                        </div>
                      )}
                      <span style={{
                        fontSize: '12px',
                        color: theme.text,
                        fontWeight: '500',
                        flex: 1,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}>
                        {file.name}
                      </span>
                    </div>
                  ))}
                  {post.media_files.length > 3 && (
                    <div style={{
                      fontSize: '11px',
                      color: theme.textSecondary,
                      textAlign: 'center',
                      padding: '6px',
                      fontWeight: '500'
                    }}>
                      +{post.media_files.length - 3} more files
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CHARACTER PROFILE */}
            {post.character_profile && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: theme.cardBg,
                borderRadius: '6px',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: theme.textSecondary,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <User size={12} />
                  Post Sender
                </div>
                {profileLoading ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    color: theme.textSecondary,
                    fontSize: '12px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: `2px solid ${theme.border}`,
                      borderTop: `2px solid ${theme.primary}`,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Loading profile...
                  </div>
                ) : characterProfile ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    backgroundColor: theme.background,
                    borderRadius: '4px'
                  }}>
                    {characterProfile.avatar_id && (
                      <img 
                        src={characterProfile.avatar_id} 
                        alt={characterProfile.name || 'Profile'}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `2px solid ${theme.primary}`
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      {characterProfile.name && (
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: theme.text,
                          marginBottom: '2px'
                        }}>
                          {characterProfile.name}
                        </div>
                      )}
                      {characterProfile.username && (
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: theme.primary,
                          marginBottom: '2px'
                        }}>
                          {characterProfile.username}
                        </div>
                      )}
                      {characterProfile.role && (
                        <div style={{
                          fontSize: '11px',
                          color: theme.textSecondary
                        }}>
                          {characterProfile.role}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '8px',
                    color: theme.textSecondary,
                    fontSize: '12px'
                  }}>
                    Profile not found
                  </div>
                )}
              </div>
            )}

            {/* DESCRIPTION SNIPPET */}
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: theme.cardBg,
              borderRadius: '6px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                color: theme.textSecondary,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Content Preview
              </div>
              <div style={{
                fontSize: '13px',
                color: theme.text,
                lineHeight: '1.5',
                padding: '8px',
                backgroundColor: theme.background,
                borderRadius: '4px'
              }}>
                {truncateText(post.description || 'No description')}
              </div>
            </div>

            {/* POST METADATA */}
            <div style={{
              padding: '12px',
              backgroundColor: theme.cardBg,
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              fontSize: '11px',
              color: theme.textSecondary
            }}>
              <div style={{ marginBottom: '6px' }}>
                <strong>Post ID:</strong> {post.content_id}
              </div>
              {post.platformDetails && post.platformDetails.length > 0 && (
                <div>
                  <strong>Platforms:</strong> {post.platformDetails.map(p => p.name || p.display_name).join(', ')}
                </div>
              )}
            </div>

            {/* CONFIRMATION MESSAGE */}
            {selectedService && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: theme.successBg,
                border: `1px solid ${theme.success}`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle style={{ 
                  height: '16px', 
                  width: '16px', 
                  color: theme.success,
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: theme.success,
                    marginBottom: '2px'
                  }}>
                    Complete post will be forwarded by: {selectedServiceName}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: theme.success,
                    opacity: 0.9
                  }}>
                    Includes: Media, Sender Profile, Title, Description, Hashtags, Keywords, CTA
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SCHEDULING FORM */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Date Input */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: theme.text
              }}>
                Schedule Date *
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                disabled={isSubmitting}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  color: theme.text,
                  fontSize: '14px',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              />
            </div>

            {/* Time Input */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: theme.text
              }}>
                Schedule Time *
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                disabled={isSubmitting}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  color: theme.text,
                  fontSize: '14px',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              />
            </div>

            {/* Timezone */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: theme.text
              }}>
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  color: theme.text,
                  fontSize: '14px',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            {/* Service Selection */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: theme.text
              }}>
                Forwarding Service *
              </label>
              {servicesLoading ? (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  color: theme.textSecondary,
                  fontSize: '14px'
                }}>
                  Loading services...
                </div>
              ) : (
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  disabled={isSubmitting}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: theme.background,
                    border: `1px solid ${selectedService ? theme.border : theme.primary}`,
                    borderRadius: '6px',
                    color: theme.text,
                    fontSize: '14px',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  <option value="">-- Select a service to forward post --</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.service_type}>
                      {service.service_type}
                    </option>
                  ))}
                </select>
              )}
              {!selectedService && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '11px',
                  color: theme.primary,
                  fontWeight: '500'
                }}>
                  Service selection is required to schedule post
                </div>
              )}
            </div>

            {/* Repeat Option */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: theme.text
              }}>
                Repeat (Optional)
              </label>
              <select
                value={repeatOption}
                onChange={(e) => setRepeatOption(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  color: theme.text,
                  fontSize: '14px',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                <option value="none">No Repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              color: theme.text,
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!scheduledDate || !scheduledTime || !selectedService || isSubmitting}
            style={{
              padding: '10px 24px',
              backgroundColor: (!scheduledDate || !scheduledTime || !selectedService || isSubmitting) 
                ? theme.textSecondary 
                : theme.primary,
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: (!scheduledDate || !scheduledTime || !selectedService || isSubmitting) 
                ? 'not-allowed' 
                : 'pointer',
              opacity: (!scheduledDate || !scheduledTime || !selectedService || isSubmitting) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Scheduling...
              </>
            ) : (
              'Confirm Schedule'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ScheduleModal;
