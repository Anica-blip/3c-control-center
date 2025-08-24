import { format } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

// Secure configuration constants
const TIME_ZONE = 'Europe/Lisbon'; // WEST (UTC+1)
const SYSTEM_TIME = '2025-08-24 11:00:09';
const AUTHORIZED_USER = 'Anica-blip';

// Security interface definitions
interface SecurityContext {
  timestamp: string;
  user: string;
  sessionId: string;
  accessLevel: string;
}

interface AuthenticatedUser {
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  lastLogin: string;
  securityContext: SecurityContext;
}

// Time formatting with security checks
export const formatLocalTime = (date: Date): string => {
  try {
    const zonedDate = utcToZonedTime(date, TIME_ZONE);
    return format(zonedDate, 'yyyy-MM-dd HH:mm:ss zzz');
  } catch (error) {
    console.error('Time formatting error:', error);
    return SYSTEM_TIME;
  }
};

// Secure user validation
export const validateUser = (userLogin: string): boolean => {
  return userLogin === AUTHORIZED_USER;
};

// Secure session management
export const createSecureSession = (): SecurityContext => {
  return {
    timestamp: new Date().toISOString(),
    user: AUTHORIZED_USER,
    sessionId: crypto.randomUUID(),
    accessLevel: 'admin'
  };
};

// Get authenticated user with security context
export const getAuthenticatedUser = (): AuthenticatedUser | null => {
  try {
    const userData = localStorage.getItem('github-user');
    if (!userData) return null;

    const user = JSON.parse(userData);
    if (!validateUser(user.login)) {
      throw new Error('Invalid user detected');
    }

    return {
      ...user,
      securityContext: createSecureSession()
    };
  } catch (error) {
    console.error('Authentication error:', error);
    localStorage.removeItem('github-user');
    return null;
  }
};

// GitHub OAuth configuration
export const getAuthConfig = () => ({
  clientId: 'Iv23lizeirH3ZoENlcig',
  redirectUri: process.env.REACT_APP_REDIRECT_URI || window.location.origin,
  scope: 'repo user',
  allowedOrigins: [window.location.origin],
  securityHeaders: {
    'X-Timestamp': new Date().toISOString(),
    'X-User': AUTHORIZED_USER
  }
});

// Session security utilities
export const security = {
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
      window.location.href = '/login';
      return;
    }

    localStorage.setItem('session-expiry', 
      new Date(Date.now() + 3600000).toISOString()
    );
  },

  clearSession: (): void => {
    localStorage.clear();
    window.location.href = '/login';
  }
};
