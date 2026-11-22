// Repo path: src/mediacleanupcomponent.tsx
// "Clean up unused media" screen for Settings > External Services.
//
// How it works:
//   1. The database function media_cleanup_report() (owner only) decides which files in the
//      content-media bucket are safe to remove. It sees every row, including the worker's.
//   2. This screen only lists what that function returned. Nothing is ticked by default.
//   3. Before deleting, the list is fetched again, and only files still on it are deleted.
//   4. Files are deleted through the storage service (owner rules allow it), 20 at a time.
//   5. media_mark_removed() then stamps media_removed_at on the matching dashboard_posts rows.
// It never touches other buckets and never lists a file that a waiting post or a template uses.

import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';

type MediaItem = {
  kind: 'unused' | 'sent';
  name: string;
  size_bytes: number;
  uploaded_at: string;
  used_by: string;
};

const BUCKET = 'content-media';
const CHUNK = 20;

const toMB = (bytes: number) => (bytes / 1048576).toFixed(1);
const toDate = (iso: string) => (iso ? iso.slice(0, 10) : '');

export default function MediaCleanup({ isDarkMode }: { isDarkMode: boolean }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const green = isDarkMode ? '#6ee7b7' : '#047857';
  const muted = isDarkMode ? '#9ca3af' : '#6b7280';
  const panelBg = isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)';
  const border = isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb';

  const fetchReport = async (): Promise<MediaItem[]> => {
    const { data, error: rpcError } = await supabase.rpc('media_cleanup_report');
    if (rpcError) throw rpcError;
    return (data || []) as MediaItem[];
  };

  const loadList = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const list = await fetchReport();
      setItems(list);
      setSelected(new Set());
    } catch (e: any) {
      console.error('Media clean-up list error:', e);
      setError('Could not load the list. ' + (e?.message || ''));
    } finally {
      setBusy(false);
    }
  };

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const setMany = (names: string[], on: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      names.forEach(n => (on ? next.add(n) : next.delete(n)));
      return next;
    });
  };

  const deleteSelected = async () => {
    const names = Array.from(selected);
    if (names.length === 0) return;

    setBusy(true);
    setError('');
    setMessage('');
    try {
      // Fetch the list again so only files that are still safe get deleted
      const fresh = await fetchReport();
      const bySafeName = new Map(fresh.map(i => [i.name, i]));
      const toDelete = names.filter(n => bySafeName.has(n));
      const skipped = names.length - toDelete.length;

      if (toDelete.length === 0) {
        setItems(fresh);
        setSelected(new Set());
        setMessage('Nothing deleted: none of the ticked files are on the safe list any more.');
        return;
      }

      const totalBytes = toDelete.reduce((sum, n) => sum + (bySafeName.get(n)?.size_bytes || 0), 0);
      const ok = window.confirm(
        `Delete ${toDelete.length} file(s), ${toMB(totalBytes)} MB, from the ${BUCKET} bucket?\n\nThis cannot be undone.` +
          (skipped > 0 ? `\n\n(${skipped} ticked file(s) are no longer on the safe list and will be skipped.)` : '')
      );
      if (!ok) {
        setItems(fresh);
        return;
      }

      const deleted: string[] = [];
      const failed: string[] = [];
      for (let i = 0; i < toDelete.length; i += CHUNK) {
        const chunk = toDelete.slice(i, i + CHUNK);
        const { data, error: removeError } = await supabase.storage.from(BUCKET).remove(chunk);
        if (removeError) {
          console.error('Storage remove error:', removeError);
          failed.push(...chunk);
          continue;
        }
        const gone = new Set((data || []).map((d: any) => d.name));
        chunk.forEach(n => (gone.has(n) ? deleted : failed).push(n));
      }

      let stamped = 0;
      let stampNote = '';
      if (deleted.length > 0) {
        const { data: n, error: markError } = await supabase.rpc('media_mark_removed', { p_names: deleted });
        if (markError) {
          console.error('Housekeeping date error:', markError);
          stampNote = ' The files are gone, but the housekeeping date could not be saved.';
        } else {
          stamped = Number(n) || 0;
        }
      }

      const after = await fetchReport();
      setItems(after);
      setSelected(new Set());
      setMessage(
        `Deleted ${deleted.length} file(s).` +
          (failed.length > 0 ? ` ${failed.length} could not be deleted.` : '') +
          (skipped > 0 ? ` ${skipped} skipped (no longer on the safe list).` : '') +
          (stamped > 0 ? ` Housekeeping date saved on ${stamped} post row(s).` : '') +
          stampNote
      );
    } catch (e: any) {
      console.error('Media clean-up error:', e);
      setError('Clean-up stopped. ' + (e?.message || ''));
    } finally {
      setBusy(false);
    }
  };

  const unused = (items || []).filter(i => i.kind === 'unused');
  const sent = (items || []).filter(i => i.kind === 'sent');
  const selectedBytes = (items || []).filter(i => selected.has(i.name)).reduce((s, i) => s + i.size_bytes, 0);

  const unusedFolders: Record<string, MediaItem[]> = {};
  unused.forEach(i => {
    const top = i.name.split('/')[0];
    (unusedFolders[top] = unusedFolders[top] || []).push(i);
  });

  const smallButton = (bg: string): React.CSSProperties => ({
    padding: '6px 10px',
    backgroundColor: busy ? '#9ca3af' : bg,
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: busy ? 'not-allowed' : 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  });

  const renderRows = (list: MediaItem[], showUsedBy: boolean) => (
    <div style={{ maxHeight: '320px', overflowY: 'auto', border, borderRadius: '6px' }}>
      {list.map(i => (
        <label
          key={i.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderBottom: border,
            fontSize: '12px',
            color: isDarkMode ? '#e5e7eb' : '#111827',
            cursor: busy ? 'not-allowed' : 'pointer'
          }}
        >
          <input type="checkbox" checked={selected.has(i.name)} disabled={busy} onChange={() => toggle(i.name)} />
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={i.name}>
            {i.name}
          </span>
          {showUsedBy && i.used_by && (
            <span style={{ color: muted, whiteSpace: 'nowrap' }} title={i.used_by}>
              {i.used_by.length > 40 ? i.used_by.slice(0, 40) + '…' : i.used_by}
            </span>
          )}
          <span style={{ color: muted, whiteSpace: 'nowrap' }}>{toMB(i.size_bytes)} MB</span>
          <span style={{ color: muted, whiteSpace: 'nowrap' }}>{toDate(i.uploaded_at)}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '24px', backgroundColor: panelBg, borderRadius: '8px', border, marginTop: '32px' }}>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: green,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 0 8px 0'
        }}
      >
        <span>🧹</span>
        Clean up unused media
      </h3>
      <p style={{ color: muted, fontSize: '14px', margin: '0 0 16px 0' }}>
        Lists files in the {BUCKET} bucket that no post or template needs any more. Nothing is ticked until you tick it, and you
        confirm before anything is deleted. Deleted files cannot be recovered.
      </p>

      <button onClick={loadList} disabled={busy} style={{ ...smallButton('#10b981'), padding: '10px 16px', fontSize: '14px' }}>
        {busy && items === null ? '⏳ Checking...' : items === null ? '🔍 Check for unused media' : '🔄 Check again'}
      </button>

      {error && <p style={{ color: '#ef4444', fontSize: '14px', margin: '16px 0 0 0' }}>{error}</p>}
      {message && <p style={{ color: green, fontSize: '14px', margin: '16px 0 0 0' }}>{message}</p>}

      {items !== null && (
        <div style={{ marginTop: '24px', display: 'grid', gap: '24px' }}>
          <div>
            <div style={{ fontWeight: 'bold', color: green, marginBottom: '4px' }}>
              Unused files ({unused.length}, {toMB(unused.reduce((s, i) => s + i.size_bytes, 0))} MB)
            </div>
            <p style={{ color: muted, fontSize: '12px', margin: '0 0 12px 0' }}>
              No post, scheduled post or template points at these files.
            </p>
            {unused.length === 0 ? (
              <p style={{ color: muted, fontSize: '14px', margin: 0 }}>None found.</p>
            ) : (
              Object.keys(unusedFolders).map(folder => (
                <div key={folder} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', color: isDarkMode ? '#e5e7eb' : '#111827', fontSize: '13px' }}>
                      {folder}/ ({unusedFolders[folder].length} files, {toMB(unusedFolders[folder].reduce((s, i) => s + i.size_bytes, 0))} MB)
                    </span>
                    <button style={smallButton('#6b7280')} disabled={busy} onClick={() => setMany(unusedFolders[folder].map(i => i.name), true)}>
                      Tick all
                    </button>
                    <button style={smallButton('#6b7280')} disabled={busy} onClick={() => setMany(unusedFolders[folder].map(i => i.name), false)}>
                      Untick all
                    </button>
                  </div>
                  {renderRows(unusedFolders[folder], false)}
                </div>
              ))
            )}
          </div>

          <div>
            <div style={{ fontWeight: 'bold', color: green, marginBottom: '4px' }}>
              Files of sent posts ({sent.length}, {toMB(sent.reduce((s, i) => s + i.size_bytes, 0))} MB)
            </div>
            <p style={{ color: muted, fontSize: '12px', margin: '0 0 12px 0' }}>
              Every post using these files is complete and sent, no waiting post needs them, and no template uses them. The
              post rows stay in your tables; only the files are removed.
            </p>
            {sent.length === 0 ? (
              <p style={{ color: muted, fontSize: '14px', margin: 0 }}>None found.</p>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button style={smallButton('#6b7280')} disabled={busy} onClick={() => setMany(sent.map(i => i.name), true)}>
                    Tick all
                  </button>
                  <button style={smallButton('#6b7280')} disabled={busy} onClick={() => setMany(sent.map(i => i.name), false)}>
                    Untick all
                  </button>
                </div>
                {renderRows(sent, true)}
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={deleteSelected}
              disabled={busy || selected.size === 0}
              style={{
                ...smallButton('#ef4444'),
                padding: '10px 16px',
                fontSize: '14px',
                backgroundColor: busy || selected.size === 0 ? '#9ca3af' : '#ef4444',
                cursor: busy || selected.size === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {busy ? '⏳ Working...' : '🗑️ Delete ticked files'}
            </button>
            <span style={{ color: muted, fontSize: '14px' }}>
              {selected.size} ticked, {toMB(selectedBytes)} MB
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
