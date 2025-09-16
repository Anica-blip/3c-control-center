import React, { useState, useEffect } from 'react';
import { fetchUrlPreview, getPlatformScreenshotDimensions } from './utils';

interface UrlPreviewProps {
  url: string;
  platform: string;
  onPreviewLoad?: (preview: any) => void;
  enableScreenshots?: boolean;
  className?: string;
}

export const UrlPreviewComponent: React.FC<UrlPreviewProps> = ({
  url,
  platform,
  onPreviewLoad,
  enableScreenshots = true,
  className = ''
}) => {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Platform-specific preview styling
  const getPlatformPreviewStyle = (platform: string) => {
    const styles = {
      instagram: {
        aspectRatio: '1 / 1', // Square posts
        maxWidth: '400px',
        label: 'Instagram Square Post (1:1)'
      },
      facebook: {
        aspectRatio: '1.91 / 1', // Facebook recommended
        maxWidth: '500px',
        label: 'Facebook Post (1.91:1)'
      },
      twitter: {
        aspectRatio: '16 / 9', // Twitter recommended
        maxWidth: '500px',
        label: 'Twitter/X Post (16:9)'
      },
      linkedin: {
        aspectRatio: '1.91 / 1', // LinkedIn recommended
        maxWidth: '500px',
        label: 'LinkedIn Post (1.91:1)'
      },
      youtube: {
        aspectRatio: '16 / 9', // YouTube thumbnail
        maxWidth: '480px',
        label: 'YouTube Thumbnail (16:9)'
      },
      tiktok: {
        aspectRatio: '9 / 16', // TikTok vertical
        maxWidth: '300px',
        label: 'TikTok Video (9:16)'
      },
      telegram: {
        aspectRatio: 'auto', // Original size as requested
        maxWidth: '100%',
        label: 'Telegram (Original Size)'
      },
      pinterest: {
        aspectRatio: '2 / 3', // Pinterest vertical
        maxWidth: '400px',
        label: 'Pinterest Pin (2:3)'
      },
      whatsapp: {
        aspectRatio: '16 / 9', // WhatsApp recommended
        maxWidth: '500px',
        label: 'WhatsApp Post (16:9)'
      }
    };
    
    return styles[platform as keyof typeof styles] || {
      aspectRatio: 'auto',
      maxWidth: '100%',
      label: 'Original Size (No Platform Selected)'
    };
  };

  useEffect(() => {
    const loadPreview = async () => {
      if (!url) {
        setError('No URL provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`Loading preview for ${url} with platform: ${platform}`);
        
        const previewData = await fetchUrlPreview(url, platform, enableScreenshots);
        
        setPreview(previewData);
        onPreviewLoad?.(previewData);
        
      } catch (err) {
        console.error('Preview loading failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [url, platform, enableScreenshots, onPreviewLoad]);

  const platformStyle = getPlatformPreviewStyle(platform);
  const dimensions = getPlatformScreenshotDimensions(platform);

  if (loading) {
    return (
      <div className={`url-preview-loading ${className}`}>
        <div 
          className="loading-placeholder"
          style={{
            aspectRatio: platformStyle.aspectRatio,
            maxWidth: platformStyle.maxWidth,
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px'
          }}
        >
          <div className="loading-spinner">
            <div style={{
              border: '3px solid #f3f3f6',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '10px', color: '#6b7280' }}>
              {enableScreenshots ? 'Generating screenshot...' : 'Loading preview...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className={`url-preview-error ${className}`}>
        <div 
          className="error-placeholder"
          style={{
            aspectRatio: platformStyle.aspectRatio,
            maxWidth: platformStyle.maxWidth,
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            color: '#dc2626'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
          <p style={{ textAlign: 'center', margin: 0 }}>
            {error || 'Failed to load URL preview'}
          </p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              marginTop: '10px',
              color: '#3b82f6',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            Open link directly
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`url-preview-container ${className}`}>
      {/* Platform indicator */}
      <div className="platform-indicator" style={{
        fontSize: '12px',
        color: '#6b7280',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>📱 Showing preview optimized for: <strong>{platformStyle.label}</strong></span>
        {enableScreenshots && (
          <span style={{ 
            backgroundColor: '#dbeafe', 
            color: '#1e40af', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontSize: '10px'
          }}>
            SCREENSHOT
          </span>
        )}
      </div>

      {/* Main preview card */}
      <div 
        className="url-preview-card"
        style={{
          aspectRatio: platform === 'telegram' ? 'auto' : platformStyle.aspectRatio,
          maxWidth: platformStyle.maxWidth,
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out'
        }}
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }}
      >
        {/* Preview Image */}
        {preview.image && (
          <div className="preview-image-container" style={{
            width: '100%',
            height: platform === 'telegram' ? 'auto' : '70%',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img
              src={preview.image}
              alt={preview.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: platform === 'telegram' ? 'contain' : 'cover',
                objectPosition: 'center'
              }}
              onError={(e) => {
                console.warn('Preview image failed to load:', preview.image);
                // Hide the image container if image fails to load
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.style.display = 'none';
                }
              }}
            />
            
            {/* Overlay for better text readability on hover */}
            <div 
              className="preview-overlay"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)',
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out'
              }}
            />
          </div>
        )}

        {/* Preview Content */}
        <div className="preview-content" style={{
          padding: '16px',
          height: platform === 'telegram' ? 'auto' : '30%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Site name */}
          {preview.siteName && (
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              {preview.siteName}
            </div>
          )}

          {/* Title */}
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            lineHeight: '1.3',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {preview.title}
          </h3>

          {/* Description */}
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.4',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {preview.description}
          </p>

          {/* URL indicator */}
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>🔗</span>
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {new URL(url).hostname}
            </span>
          </div>
        </div>
      </div>

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
          <summary style={{ cursor: 'pointer' }}>Debug Info</summary>
          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
            <pre style={{ margin: 0, fontSize: '11px' }}>
              {JSON.stringify({
                url,
                platform,
                enableScreenshots,
                dimensions,
                platformStyle: {
                  aspectRatio: platformStyle.aspectRatio,
                  maxWidth: platformStyle.maxWidth
                },
                preview: {
                  title: preview.title,
                  siteName: preview.siteName,
                  hasImage: !!preview.image,
                  imageType: preview.image?.startsWith('data:') ? 'base64' : 'url'
                }
              }, null, 2)}
            </pre>
          </div>
        </details>
      )}

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .url-preview-card:hover .preview-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

// Usage example component
export const UrlPreviewExample: React.FC = () => {
  const [url, setUrl] = useState('https://github.com');
  const [platform, setPlatform] = useState('telegram');
  const [enableScreenshots, setEnableScreenshots] = useState(true);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>URL Preview Component Demo</h2>
      
      {/* Controls */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            URL to Preview:
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Platform:
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="telegram">Telegram (Original Size)</option>
            <option value="instagram">Instagram (1:1)</option>
            <option value="facebook">Facebook (1.91:1)</option>
            <option value="twitter">Twitter/X (16:9)</option>
            <option value="linkedin">LinkedIn (1.91:1)</option>
            <option value="youtube">YouTube (16:9)</option>
            <option value="tiktok">TikTok (9:16)</option>
            <option value="pinterest">Pinterest (2:3)</option>
            <option value="whatsapp">WhatsApp (16:9)</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={enableScreenshots}
              onChange={(e) => setEnableScreenshots(e.target.checked)}
            />
            <span>Enable Screenshots (requires screenshot service)</span>
          </label>
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3>Preview Result:</h3>
        <UrlPreviewComponent
          url={url}
          platform={platform}
          enableScreenshots={enableScreenshots}
          onPreviewLoad={(preview) => {
            console.log('Preview loaded:', preview);
          }}
        />
      </div>
    </div>
  );
};
