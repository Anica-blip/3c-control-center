// Shared platform display utilities for Schedule Manager Component
import { getTheme } from './config';

// Basic platform descriptor used for icons
interface SimplePlatform {
  id?: string | number | null;
  name?: string | null;
  display_name?: string | null;
  platform_icon?: string | null;
  type?: string | null;
}

// Input type can be id, name, or a full platform object
export type PlatformInput = string | number | SimplePlatform;

const PLATFORM_META: Record<string, { icon: string; label: string }> = {
  telegram: { icon: 'TG', label: 'Telegram' },
  tg: { icon: 'TG', label: 'Telegram' },
  youtube: { icon: 'YT', label: 'YouTube' },
  yt: { icon: 'YT', label: 'YouTube' },
  facebook: { icon: 'FB', label: 'Facebook' },
  fb: { icon: 'FB', label: 'Facebook' },
  twitter: { icon: 'TW', label: 'Twitter' },
  tw: { icon: 'TW', label: 'Twitter' },
  x: { icon: 'TW', label: 'Twitter' },
  forum: { icon: 'FR', label: 'Forum' },
  fr: { icon: 'FR', label: 'Forum' }
};

const TELEGRAM_TYPES = new Set(['telegram_group', 'telegram_channel']);

function normalizePlatform(input: PlatformInput): SimplePlatform {
  if (typeof input === 'object') return input || {};
  const str = String(input || '').trim();
  return { id: str, name: str, platform_icon: str.slice(0, 2).toUpperCase() };
}

export function getPlatformIcon(platformInput: PlatformInput, size: number = 14) {
  const themeLike = (getTheme as any)?.() ?? { theme: { textSecondary: '#9ca3af', cardBg: '#020617' } };
  const theme = (themeLike as any).theme || themeLike;

  const platform = normalizePlatform(platformInput);
  const rawIcon = (platform.platform_icon || '').toString();
  const baseName = (platform.name || platform.display_name || rawIcon).toString();

  const key = baseName.toLowerCase();
  const meta = PLATFORM_META[key] || PLATFORM_META[rawIcon.toLowerCase()];

  const iconText = meta?.icon || (rawIcon ? rawIcon.toUpperCase() : baseName.slice(0, 2).toUpperCase() || '??');

  let bgColor = theme.textSecondary;
  if (TELEGRAM_TYPES.has(platform.type || '')) bgColor = '#3b82f6';
  else if (iconText === 'TG') bgColor = '#3b82f6';
  else if (iconText === 'YT') bgColor = '#ef4444';
  else if (iconText === 'FB') bgColor = '#2563eb';
  else if (iconText === 'TW') bgColor = '#0ea5e9';
  else if (iconText === 'FR') bgColor = '#4b5563';

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size + 8,
    height: size + 4,
    borderRadius: 4,
    padding: '0 4px',
    backgroundColor: bgColor,
    color: 'white',
    fontSize: Math.max(9, size - 4),
    fontWeight: 700,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    lineHeight: 1
  };

  return (
    <span style={style} title={baseName}>
      {iconText}
    </span>
  );
}

export function formatPlatformList(platforms: PlatformInput[], max: number = 3): string {
  if (!platforms || platforms.length === 0) return 'No platforms';

  const names = platforms.map(p => {
    const n = normalizePlatform(p);
    const key = (n.name || n.display_name || n.platform_icon || '').toString();
    if (!key) return 'Unknown';
    const meta = PLATFORM_META[key.toLowerCase()];
    return meta?.label || key.toString();
  });

  const visible = names.slice(0, max);
  const remaining = names.length - visible.length;

  return remaining > 0
    ? `${visible.join(', ')} +${remaining} more`
    : visible.join(', ');
}

