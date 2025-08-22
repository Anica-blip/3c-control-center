import React, { useState } from 'react';
import { Moon, Sun, LogOut, Globe, ChevronDown } from 'lucide-react';

interface HeaderControlsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onLogout,
  language,
  onLanguageChange
}) => {
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const languages = [
    { code: 'en-GB', flag: '🇬🇧', name: 'English (UK)' },
    { code: 'pt-PT', flag: '🇵🇹', name: 'Português (Portugal)' },
    { code: 'fr-FR', flag: '🇫🇷', name: 'Français' },
    { code: 'de-DE', flag: '🇩🇪', name: 'Deutsch' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange(langCode);
    setIsLanguageDropdownOpen(false);
  };

  return (
    <>
      {/* Main Header Controls */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '8px 12px',
        boxShadow: isDarkMode 
          ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
          : '0 10px 25px rgba(0, 0, 0, 0.15)',
        border: isDarkMode 
          ? '1px solid rgba(75, 85, 99, 0.3)' 
          : '1px solid rgba(229, 231, 235, 0.8)'
      }}>
        {/* Security Badge */}
        <div style={{
          padding: '4px 8px',
          backgroundColor: isDarkMode ? '#dc2626' : '#ef4444',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          borderRadius: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          🔒 INTERNAL
        </div>

        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              backgroundColor: 'transparent',
              border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              color: isDarkMode ? '#f9fafb' : '#374151',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ fontSize: '16px' }}>{currentLanguage.flag}</span>
            <ChevronDown style={{ 
              width: '14px', 
              height: '14px',
              transform: isLanguageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} />
          </button>

          {/* Language Dropdown */}
          {isLanguageDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              backgroundColor: isDarkMode ? '#1f2937' : 'white',
              border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: isDarkMode 
                ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
                : '0 10px 25px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              minWidth: '200px',
              zIndex: 1001
            }}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #f3f4f6',
                    cursor: 'pointer',
                    color: isDarkMode ? '#f9fafb' : '#374151',
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f9fafb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                  <span>{lang.name}</span>
                  {language === lang.code && (
                    <span style={{ 
                      marginLeft: 'auto', 
                      color: isDarkMode ? '#10b981' : '#059669',
                      fontSize: '12px' 
                    }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            color: isDarkMode ? '#fbbf24' : '#374151',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isDarkMode ? (
            <Sun style={{ width: '16px', height: '16px' }} />
          ) : (
            <Moon style={{ width: '16px', height: '16px' }} />
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          style={{
            padding: '8px 12px',
            backgroundColor: isDarkMode ? '#dc2626' : '#ef4444',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Logout"
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#b91c1c' : '#dc2626';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#dc2626' : '#ef4444';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <LogOut style={{ width: '14px', height: '14px' }} />
          EXIT
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {isLanguageDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999
          }}
          onClick={() => setIsLanguageDropdownOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: isDarkMode ? '#1f2937' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px' 
              }}>
                🔒
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: isDarkMode ? '#f9fafb' : '#111827',
                margin: '0 0 8px 0'
              }}>
                Confirm Logout
              </h3>
              <p style={{
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                fontSize: '14px',
                margin: '0'
              }}>
                Are you sure you want to logout from the 3C Internal Dashboard?
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleLogoutCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f9fafb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }}
              >
                <LogOut style={{ width: '16px', height: '16px' }} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderControls;
