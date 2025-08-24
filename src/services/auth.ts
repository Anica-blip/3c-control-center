// Secure authentication service without external dependencies
// Uses native JavaScript Date methods for timezone handling

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
    // Format for WEST (UTC+1) / Europe/Lisbon timezone
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
    
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(date);
    
    // Build the formatted string: YYYY-MM-DD HH:mm:ss TZ
    const year = parts.find(p => p.type === 'year')?.value || '';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const day = parts.find(p => p.type === 'day')?.value || '';
    const hour = parts.find(p => p.type === 'hour')?.value || '';
    const minute = parts.find(p => p.type === 'minute')?.value || '';
    const second = parts.find(p => p.type === 'second')?.value || '';
    const timeZoneName = parts.find(p => p.type === 'timeZoneName')?.value || 'WEST';
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second} ${timeZoneName}`;
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
