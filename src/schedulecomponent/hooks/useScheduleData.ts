// EditModal component with avatar in header
import React, { useState } from 'react';
import { getTheme } from '../utils/styleUtils';
import { ScheduledPost } from '../types';
import { X, Save } from 'lucide-react';

interface EditModalProps {
  post: ScheduledPost;
  onSave: (postId: string, updates: Partial<ScheduledPost>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ post, onSave, onCancel, isLoading }) => {
  const { theme } = getTheme();
  
  const [title, setTitle] = useState(post.title || '');
  const [description, setDescription] = useState(post.description || '');
  const [hashtags, setHashtags] = useState(post.hashtags?.join(', ') || '');
  const [keywords, setKeywords] = useState(post.keywords || '');
  const [cta, setCta] = useState(post.cta || '');

  const handleSave = () => {
    const updates = {
      title,
      description,
      hashtags: hashtags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      keywords,
      cta
    };
    onSave(post.id, updates);
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
        backgroundColor: theme.cardBg,
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* Header with Avatar */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: theme.text,
              margin: 0
            }}>
              Edit Post
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {post.character_avatar && (
                <img 
                  src={post.character_avatar} 
                  alt={post.character_profile}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              )}
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: theme.primary
              }}>
                {post.character_profile}
              </span>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: theme.textSecondary,
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        {/* Form Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '8px'
            }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.background,
                color: theme.text,
                fontSize: '14px'
              }}
              placeholder="Post title..."
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '8px'
            }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.background,
                color: theme.text,
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder="Post description..."
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '8px'
            }}>
              Hashtags
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.background,
                color: theme.text,
                fontSize: '14px'
              }}
              placeholder="hashtag1, hashtag2, hashtag3..."
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '8px'
            }}>
              Keywords
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.background,
                color: theme.text,
                fontSize: '14px'
              }}
              placeholder="Keywords for SEO..."
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '8px'
            }}>
              Call to Action
            </label>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.background,
                color: theme.text,
                fontSize: '14px'
              }}
              placeholder="Call to action..."
            />
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onCancel}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.textSecondary,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: isLoading ? theme.textSecondary : theme.primary,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save style={{ height: '16px', width: '16px' }} />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
