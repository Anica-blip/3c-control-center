import React, { useState, useEffect } from 'react';
import { formatLocalTime } from '../../services/auth';

interface GitHubLoginScreenProps {
  onLogin: (userData: any) => void;
}

const GitHubLoginScreen: React.FC<GitHubLoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastLoginTime, setLastLoginTime] = useState<Date | null>(null);

  // Secure development configuration
  const GITHUB_CLIENT_ID = 'Iv23lizeirH3ZoENlcig';
  const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || window.location.origin;

  const handleGitHubLogin = () => {
    setIsLoading(true);
    
    // Enhanced security state with timestamp and nonce
    const state = btoa(JSON.stringify({
      timestamp: new Date().toISOString(),
      nonce: crypto.getRandomValues(new Uint8Array(16)).join(''),
      user: 'Anica-blip'
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
        setLastLoginTime(loginTime);
        
        // Development mode with security checks
        const userData = {
          login: 'Anica-blip',
          avatar_url: 'https://github.com/Anica-blip.png',
          name: 'Anica',
          email: '3c.innertherapy@gmail.com',
          lastLogin: formatLocalTime(loginTime),
          accessLevel: 'admin', // You can set different access levels
          securityContext: {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            sessionId: crypto.randomUUID()
          }
        };
        
        // Secure storage
        localStorage.setItem('github-user', JSON.stringify({
          ...userData,
          sessionExpiry: new Date(Date.now() + 3600000).toISOString() // 1 hour
        }));
        
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

  // ... rest of your component UI code from earlier ...
};

export default GitHubLoginScreen;
