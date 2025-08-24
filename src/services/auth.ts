import { format } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

// Secure configuration constants
const TIME_ZONE = process.env.REACT_APP_TIMEZONE || 'Europe/Lisbon';
const AUTHORIZED_USER = process.env.REACT_APP_AUTHORIZED_USER || 'Anica-blip';
const CURRENT_TIME = '2025-08-24 11:38:50';

interface SecurityContext {
  timestamp: string;
  user: string;
  sessionId: string;
  accessLevel: string;
}

export interface AuthenticatedUser {
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  lastLogin: string;
  securityContext: SecurityContext;
}

export const formatLocalTime = (date: Date): string => {
  try {
    const zonedDate = utcToZonedTime(date, TIME_ZONE);
    return format(zonedDate, 'yyyy-MM-dd HH:mm:ss zzz');
  } catch (error) {
    console.error('Time formatting error:', error);
    return CURRENT_TIME;
  }
};

export const validateUser = (userLogin: string): boolean => {
  return userLogin === AUTHORIZED_USER;
};

export const createSecureSession = (): SecurityContext => {
  return {
    timestamp: new Date().toISOString(),
    user: AUTHORIZED_USER,
    sessionId: crypto.randomUUID(),
    accessLevel: 'admin'
  };
};

export const getAuthenticatedUser = (): AuthenticatedUser | null => {
  try {
    const userData = localStorage.getItem('github-user');
    if (!userData) return null;

    const user = JSON.parse(userData);
    if (!validateUser(user.login)) {
      throw new Error('Unauthorized user detected');
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
