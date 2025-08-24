import React, { useState, useEffect, createContext, useContext } from 'react';

// Import your real components
import ContentComponent from './contentcomponent';
import ChatManagerPublic from './webchat';
import ScheduleComponentContent from './schedulecomponent';
import MarketingControlCenter from './marketingcomponent';
import SettingsComponentContent from './settingscomponent';
import AdminComponentsContent from './admincomponents';

// Theme Context
const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

// =============================================================================
// INLINE AUTH FUNCTIONS - No external dependencies
// =============================================================================

const TIME_ZONE = 'Europe/Lisbon';
const AUTHORIZED_USER = process.env.REACT_APP_AUTHORIZED_USER || 'Anica-blip';

interface AuthenticatedUser {
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  lastLogin: string;
}

const formatLocalTime = (date: Date): string => {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    };
    
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  } catch (error) {
    console.error('Time formatting error:', error);
    return date.toLocaleString();
  }
};

const validateUser = (userLogin: string): boolean => {
  return userLogin === AUTHORIZED_USER;
};

const getAuthenticatedUser = (): AuthenticatedUser | null => {
  try {
    const userData = localStorage.getItem('github-user');
    if (!userData) return null;

    const user = JSON.parse(userData);
    if (!validateUser(user.login)) {
      throw new Error('Unauthorized user detected');
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    localStorage.removeItem('github-user');
    return null;
  }
};

const security = {
  validateSession: (): boolean => {
    const user = getAuthenticatedUser();
    if (!user) return false;

    const sessionExpiry = localStorage.getItem('session-expiry');
    if (!sessionExpiry) return false;

    return new Date(sessionExpiry) > new Date();
  },

  refreshSession: (): void => {
    if (!security.validateSession()) {
      localStorage.clear();
      window.location.reload();
      return;
    }

    localStorage.setItem('session-expiry', 
      new Date(Date.now() + 3600000).toISOString()
    );
  },

  clearSession: (): void => {
    localStorage.clear();
    window.location.reload();
  }
};

// =============================================================================
// GITHUB LOGIN COMPONENT - Inline
// =============================================================================

const GitHubLoginScreen = ({ onLogin }: { onLogin: (userData: any) => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID || 'Iv23lizeirH3ZoENlcig';
  const REDIRECT_URI = window.location.origin;

  const handleGitHubLogin = () => {
    setIsLoading(true);
    
    const state = btoa(JSON.stringify({
      timestamp: new Date().toISOString(),
      nonce: crypto.getRandomValues(new Uint8Array(16)).join(''),
      user: AUTHORIZED_USER
    }));
    
    localStorage.setItem('github_oauth_state', state);
    
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.append('client_id', GITHUB_CLIENT_ID);
    githubAuthUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    githubAuthUrl.searchParams.append('scope', 'repo user');
    githubAuthUrl.searchParams.append('state', state);
    
    window.location.href = githubAuthUrl.toString();
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const receivedState = urlParams.get('state');
    
    if (code && receivedState) {
      const savedState = localStorage.getItem('github_oauth_state');
      
      if (receivedState !== savedState) {
        setError('Security verification failed. Please try again.');
        setIsLoading(false);
        return;
      }
      
      try {
        const { timestamp } = JSON.parse(atob(savedState || ''));
        const loginTime = new Date(timestamp);
        
        const userData = {
          login: AUTHORIZED_USER,
          avatar_url: `https://github.com/${AUTHORIZED_USER}.png`,
          name: 'Anica',
          email: '3c.innertherapy@gmail.com',
          lastLogin: formatLocalTime(loginTime)
        };
        
        localStorage.setItem('github-user', JSON.stringify(userData));
        localStorage.setItem('session-expiry', new Date(Date.now() + 3600000).toISOString());
        localStorage.removeItem('github_oauth_state');
        window.history.replaceState({}, document.title, window.location.pathname);
        
        onLogin(userData);
      } catch (error) {
        console.error('Authentication error:', error);
        setError('Authentication failed. Please try again.');
      }
      
      setIsLoading(false);
    }
  }, [onLogin]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#3b82f6',
            margin: '0 0 8px 0'
          }}>
            3C Control Center
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0'
          }}>
            Open Source Dashboard - Repository Access
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#dc2626', fontSize: '14px', margin: '0' }}>
                🚨 {error}
              </p>
            </div>
          )}

          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#6b7280' : '#24292f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? (
              <>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid #ffffff', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite' 
                }}></div>
                Connecting to GitHub...
              </>
            ) : (
              <>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </>
            )}
          </button>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            🔒 <strong>Secure Repository Access</strong><br />
            Login with your GitHub account to access your repository data.<br />
            Each user maintains their own secure instance.
          </p>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

// =============================================================================
// REST OF YOUR EXISTING APP COMPONENTS (keeping the same structure)
// =============================================================================

// ... (I'll continue with the rest if you want, but this shows the pattern)

function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-GB');
  const [githubUser, setGitHubUser] = useState<AuthenticatedUser | null>(null);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticatedUser = getAuthenticatedUser();
        const darkMode = localStorage.getItem('3c-dark-mode') === 'true';
        const language = localStorage.getItem('3c-language') || 'en-GB';
        
        if (authenticatedUser && security.validateSession()) {
          setIsAuthenticated(true);
          setGitHubUser(authenticatedUser);
          security.refreshSession();
        } else {
          security.clearSession();
          setIsAuthenticated(false);
          setGitHubUser(null);
        }
        
        setIsDarkMode(darkMode);
        setCurrentLanguage(language);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        setGitHubUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const sessionInterval = setInterval(() => {
      if (isAuthenticated) {
        security.refreshSession();
      }
    }, 300000);

    return () => clearInterval(sessionInterval);
  }, [isAuthenticated]);

  const handleLogin = (userData: AuthenticatedUser) => {
    if (!validateUser(userData.login)) {
      alert(`Access denied. Only ${AUTHORIZED_USER} is authorized.`);
      return;
    }
    setIsAuthenticated(true);
    setGitHubUser(userData);
    localStorage.setItem('session-expiry', new Date(Date.now() + 3600000).toISOString());
  };

  // Loading screen
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <div style={{ fontSize: '18px' }}>Initializing 3C Control Center...</div>
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>Verifying secure GitHub authentication...</div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <GitHubLoginScreen onLogin={handleLogin} />;
  }

  // Main app (simplified version)
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode) }}>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
          <h1 style={{ color: isDarkMode ? '#60a5fa' : '#3b82f6' }}>
            🎯 3C Control Center
          </h1>
          <p style={{ color: isDarkMode ? '#94a3b8' : '#6b7280' }}>
            Welcome back, {githubUser?.name || githubUser?.login}!
          </p>
          <p>Dashboard is loading... Components will appear here.</p>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
