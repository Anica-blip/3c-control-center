// Repo path: src/mediacleanupcomponent.tsx
// "Clean up unused media" screen for Settings > External Services.
//
// How it works:
//   1. The database function media_cleanup_report() (owner only) decides which files in the
//      content-media bucket are safe to remove. It sees every row, including the worker's.
//   2. This screen only lists what that function returned. Nothing is ticked by default.
//   3. Each list ends with its own red Delete button, which deletes only the files ticked in
//      that list.
//   4. Before deleting, the list is fetched again, and only files still on it are deleted.
//   5. Files are deleted through the storage service (owner rules allow it), 20 at a time.
//   6. media_mark_removed() then stamps media_removed_at on the matching dashboard_posts rows.
// It never touches other buckets and never lists a file that a waiting post or a template uses.

import React, { useRef, useState } from 'react';
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
  const noticeRef = useRef<HTMLDivElement | null>(null);

  const green = isDarkMode ? '#6ee7b7' : '#047857';
  const text = isDarkMode ? '#e5e7eb' : '#111827';
  const muted = isDarkMode ? '#9ca3af' : '#6b7280';
  const panelBg = isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)';
  const border = isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb';

  const showNotice = () => {
    setTimeout(() => noticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

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
      showNotice();
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

  // Deletes only the files ticked inside the given list (one folder, or the sent-posts list)
  const deleteTicked = async (group: MediaItem[]) => {
    const names = group.filter(i => selected.has(i.name)).map(i => i.name);
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
        showNotice();
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
      const stillThere = new Set(after.map(i => i.name));
      setItems(after);
      // Keep ticks in the other lists, drop ticks for files that are gone
      setSelected(prev => new Set(Array.from(prev).filter(n => stillThere.has(n) && !names.includes(n))));
      setMessage(
        `Deleted ${deleted.length} file(s).` +
          (failed.length > 0 ? ` ${failed.length} could not be deleted.` : '') +
          (skipped > 0 ? ` ${skipped} skipped (no longer on the safe list).` : '') +
          (stamped > 0 ? ` Housekeeping date saved on ${stamped} post row(s).` : '') +
          stampNote
      );
      showNotice();
    } catch (e: any) {
      console.error('Media clean-up error:', e);
      setError('Clean-up stopped. ' + (e?.message || ''));
      showNotice();
    } finally {
      setBusy(false);
    }
  };

  const unused = (items || []).filter(i => i.kind === 'unused');
  const sent = (items || []).filter(i => i.kind === 'sent');

  const unusedFolders: Record<string, MediaItem[]> = {};
  unused.forEach(i => {
    const top = i.name.split('/')[0];
    (unusedFolders[top] = unusedFolders[top] || []).push(i);
  });

  const sumMB = (list: MediaItem[]) => toMB(list.reduce((s, i) => s + i.size_bytes, 0));

  const greyButton: React.CSSProperties = {
    padding: '8px 14px',
    backgroundColor: busy ? '#9ca3af' : '#6b7280',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: busy ? 'not-allowed' : 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
  };

  const renderRows = (list: MediaItem[]) => (
    <div style={{ maxHeight: '480px', overflowY: 'auto', border, borderRadius: '8px' }}>
      {list.map(i => (
        <label
          key={i.name}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '16px 18px',
            borderBottom: border,
            color: text,
            cursor: busy ? 'not-allowed' : 'pointer'
          }}
        >
          <input
            type="checkbox"
            checked={selected.has(i.name)}
            disabled={busy}
            onChange={() => toggle(i.name)}
            style={{ marginTop: '3px', width: '18px', height: '18px', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', lineHeight: 1.5, overflowWrap: 'anywhere' }}>{i.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 24px', marginTop: '8px', fontSize: '13px', color: muted }}>
              <span>{toMB(i.size_bytes)} MB</span>
              <span>Uploaded {toDate(i.uploaded_at)}</span>
              {i.used_by && <span style={{ overflowWrap: 'anywhere' }}>Used by: {i.used_by}</span>}
            </div>
          </div>
        </label>
      ))}
    </div>
  );

  // End-of-list bar: tick helpers on the left, red Delete button at the end
  const renderActions = (list: MediaItem[], label: string) => {
    const ticked = list.filter(i => selected.has(i.name));
    const none = ticked.length === 0;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 16px', marginTop: '20px' }}>
        <button style={greyButton} disabled={busy} onClick={() => setMany(list.map(i => i.name), true)}>
          Tick all
        </button>
        <button style={greyButton} disabled={busy} onClick={() => setMany(list.map(i => i.name), false)}>
          Untick all
        </button>
        <span style={{ color: muted, fontSize: '14px' }}>
          {ticked.length} ticked, {sumMB(ticked)} MB
        </span>
        <button
          onClick={() => deleteTicked(list)}
          disabled={busy || none}
          style={{
            marginLeft: 'auto',
            padding: '12px 22px',
            backgroundColor: busy || none ? '#9ca3af' : '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: busy || none ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: 'bold'
          }}
        >
          {busy ? '⏳ Working...' : `🗑️ Delete ticked in ${label}`}
        </button>
      </div>
    );
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 'bold',
    color: green,
    margin: '48px 0 8px 0'
  };

  return (
    <div
      style={{
        padding: '28px',
        backgroundColor: panelBg,
        borderRadius: '8px',
        border,
        marginTop: '40px',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        overflowWrap: 'anywhere'
      }}
    >
      <h3
        style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: green,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '0 0 12px 0'
        }}
      >
        <span>🧹</span>
        Clean up unused media
      </h3>
      <p style={{ color: muted, fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
        Lists files in the {BUCKET} bucket that no post or template needs any more. Nothing is ticked until you tick it, and you
        confirm before anything is deleted. Deleted files cannot be recovered.
      </p>

      <button
        onClick={loadList}
        disabled={busy}
        style={{ ...greyButton, backgroundColor: busy ? '#9ca3af' : '#10b981', padding: '12px 20px', fontSize: '15px' }}
      >
        {busy && items === null ? '⏳ Checking...' : items === null ? '🔍 Check for unused media' : '🔄 Check again'}
      </button>

      <div ref={noticeRef}>
        {error && <p style={{ color: '#ef4444', fontSize: '15px', fontWeight: 'bold', margin: '20px 0 0 0' }}>{error}</p>}
        {message && <p style={{ color: green, fontSize: '15px', fontWeight: 'bold', margin: '20px 0 0 0' }}>{message}</p>}
      </div>

      {items !== null && (
        <div>
          <h4 style={sectionTitle}>
            Unused files ({unused.length} files, {sumMB(unused)} MB)
          </h4>
          <p style={{ color: muted, fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            No post, scheduled post or template points at these files.
          </p>
          {unused.length === 0 ? (
            <p style={{ color: muted, fontSize: '15px', margin: 0 }}>None found.</p>
          ) : (
            Object.keys(unusedFolders).map(folder => (
              <div key={folder} style={{ marginBottom: '48px' }}>
                <div style={{ fontSize: '17px', fontWeight: 'bold', color: text, marginBottom: '14px' }}>
                  {folder}/ ({unusedFolders[folder].length} files, {sumMB(unusedFolders[folder])} MB)
                </div>
                {renderRows(unusedFolders[folder])}
                {renderActions(unusedFolders[folder], `${folder}/`)}
              </div>
            ))
          )}

          <h4 style={sectionTitle}>
            Files of sent posts ({sent.length} files, {sumMB(sent)} MB)
          </h4>
          <p style={{ color: muted, fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Every post using these files is complete and sent, no waiting post needs them, and no template uses them. The post
            rows stay in your tables; only the files are removed.
          </p>
          {sent.length === 0 ? (
            <p style={{ color: muted, fontSize: '15px', margin: 0 }}>None found.</p>
          ) : (
            <div>
              {renderRows(sent)}
              {renderActions(sent, 'sent posts')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
