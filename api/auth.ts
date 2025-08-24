// API Authentication Handler for GitHub OAuth
// This handles the server-side OAuth token exchange

import { NextApiRequest, NextApiResponse } from 'next';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUserResponse {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Validate state parameter for security
    if (!state) {
      return res.status(400).json({ error: 'State parameter required for security' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.REACT_APP_GITHUB_CLIENT_ID,
        client_secret: process.env.REACT_APP_GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000'
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('No access token received');
    }

    // Get user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user information');
    }

    const userData: GitHubUserResponse = await userResponse.json();

    // Validate authorized user
    const authorizedUser = process.env.REACT_APP_AUTHORIZED_USER || 'Anica-blip';
    if (userData.login !== authorizedUser) {
      return res.status(403).json({ 
        error: 'Unauthorized user',
        message: `Only ${authorizedUser} is authorized to access this application`
      });
    }

    // Return secure user data (don't include access token in response)
    const secureUserData = {
      login: userData.login,
      id: userData.id,
      avatar_url: userData.avatar_url,
      name: userData.name,
      email: userData.email,
      bio: userData.bio,
      public_repos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      lastLogin: new Date().toISOString(),
      accessLevel: 'admin',
      securityContext: {
        timestamp: new Date().toISOString(),
        sessionId: crypto.randomUUID(),
        environment: process.env.NODE_ENV || 'development'
      }
    };

    res.status(200).json({ 
      success: true, 
      user: secureUserData 
    });

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Utility functions for session management
export const validateSession = (sessionData: any): boolean => {
  if (!sessionData || !sessionData.sessionExpiry) {
    return false;
  }

  const expiry = new Date(sessionData.sessionExpiry);
  const now = new Date();
  
  return expiry > now;
};

export const createSessionExpiry = (hours: number = 1): string => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry.toISOString();
};
