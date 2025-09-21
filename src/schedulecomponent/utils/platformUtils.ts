import { Platform } from '../types';

export const platforms: Platform[] = [
  { id: '1', name: 'Telegram', icon: 'TG', color: '#3b82f6' },
  { id: '2', name: 'YouTube', icon: 'YT', color: '#ef4444' },
  { id: '3', name: 'Facebook', icon: 'FB', color: '#2563eb' },
  { id: '4', name: 'Twitter', icon: 'TW', color: '#0ea5e9' },
  { id: '5', name: 'Forum', icon: 'FR', color: '#4b5563' },
];

export const getPlatformIcon = (platformId: string): Platform => {
  const platform = platforms.find(p => p.id === platformId);
  return platform || { id: 'unknown', icon: 'UN', color: '#9ca3af', name: 'Unknown' };
};
