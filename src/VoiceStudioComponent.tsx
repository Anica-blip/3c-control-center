// 3C Voice Studio Component
// Upload → Pitch Shift → Speed Control → Preview → Download → Save to R2
// Built by Claude (Anthropic) × Chef Anica · 3C Thread To Success Cooking Lab 🧪👨‍🍳

import React, { useState, useEffect, useRef } from 'react';

const WORKER_URL = 'https://jan-assistant.3c-innertherapy.workers.dev/';

const PERSONAS = [
  { id: 'Aurion', label: 'Aurion', emoji: '⚡', color: '#f59e0b' },
  { id: 'Jan',    label: 'Jan',    emoji: '🐬', color: '#3b82f6' },
  { id: 'Caelum', label: 'Caelum', emoji: '🦅', color: '#8b5cf6' },
  { id: 'Anica',  label: 'Anica',  emoji: '🐱', color: '#10b981' },
];

interface VoiceRecord {
  key: string;
  filename: string;
  persona: string;
  size: number;
  uploaded: string;
}

interface VoiceStudioComponentProps {
  isDarkMode?: boolean;
}

const VoiceStudioComponent: React.FC<VoiceStudioComponentProps> = ({ isDarkMode = false }) => {
  const [selectedPersona, setSelectedPersona] = useState('Aurion');
  const [audioFile, setAudioFile]             = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer]         = useState<AudioBuffer | null>(null);
  const [pitch, setPitch]                     = useState(-4);   // semitones — default female→male
  const [speed, setSpeed]                     = useState(1.0);  // tempo multiplier
  const [isPlaying, setIsPlaying]             = useState(false);
  const [isProcessing, setIsProcessing]       = useState(false);
  const [isSaving, setIsSaving]               = useState(false);
  const [savedVoices, setSavedVoices]         = useState<VoiceRecord[]>([]);
  const [isLoadingLib, setIsLoadingLib]       = useState(false);
  const [isDragging, setIsDragging]           = useState(false);
  const [saveName, setSaveName]               = useState('');
  const [processedBlob, setProcessedBlob]     = useState<Blob | null>(null);
  const [waveformData, setWaveformData]       = useState<number[]>([]);
  const [toast, setToast]                     = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef   = useRef<AudioBufferSourceNode | null>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);

  // ── Theme ──────────────────────────────────────────────
  const t = {
    bg:          isDarkMode ? '#0f172a'  : '#f8fafc',
    card:        isDarkMode ? '#1e293b'  : '#ffffff',
    cardAlt:     isDarkMode ? '#334155'  : '#f1f5f9',
    border:      isDarkMode ? '#475569'  : '#e2e8f0',
    text:        isDarkMode ? '#f1f5f9'  : '#1e293b',
    muted:       isDarkMode ? '#94a3b8'  : '#64748b',
    purple:      '#7c3aed',
    purpleLight: '#a78bfa',
    purpleBg:    isDarkMode ? 'rgba(124,58,237,0.15)' : '#ede9fe',
    shadow:      isDarkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.08)',
  };

  // ── Toast ──────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Waveform canvas ────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0,   '#7c3aed');
    grad.addColorStop(0.5, '#a78bfa');
    grad.addColorStop(1,   '#7c3aed');
    ctx.fillStyle = grad;

    const barW = width / waveformData.length;
    waveformData.forEach((v, i) => {
      const bh = Math.max(2, v * height * 0.85);
      ctx.fillRect(i * barW, (height - bh) / 2, Math.max(1, barW - 1), bh);
    });
  }, [waveformData, isDarkMode]);

  // ── Generate waveform from AudioBuffer ─────────────────
  const generateWaveform = (buf: AudioBuffer) => {
    const data     = buf.getChannelData(0);
    const SAMPLES  = 90;
    const blockSz  = Math.floor(data.length / SAMPLES);
    const raw: number[] = [];

    for (let i = 0; i < SAMPLES; i++) {
      let sum = 0;
      for (let j = 0; j < blockSz; j++) sum += Math.abs(data[i * blockSz + j]);
      raw.push(sum / blockSz);
    }
    const max = Math.max(...raw, 0.001);
    setWaveformData(raw.map(v => v / max));
  };

  // ── Load audio file into AudioBuffer ───────────────────
  const loadAudioFile = async (file: File) => {
    setAudioFile(file);
    setProcessedBlob(null);
    setSaveName(file.name.replace(/\.[^/.]+$/, ''));

    try {
      const ab  = await file.arrayBuffer();
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const buf = await ctx.decodeAudioData(ab);
      setAudioBuffer(buf);
      generateWaveform(buf);
    } catch {
      showToast('Could not decode audio — try WAV or MP3.', 'error');
    }
  };

  // ── Drag and drop ──────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('audio/')) {
      loadAudioFile(file);
    } else {
      showToast('Please drop an audio file (MP3, WAV, OGG, M4A)', 'error');
    }
  };

  // ── WAV encoder ────────────────────────────────────────
  const audioBufferToWav = (buf: AudioBuffer): Blob => {
    const ch        = buf.numberOfChannels;
    const sr        = buf.sampleRate;
    const bps       = 2; // 16-bit
    const blockAln  = ch * bps;
    const dataLen   = buf.length * blockAln;
    const ab        = new ArrayBuffer(44 + dataLen);
    const view      = new DataView(ab);

    const ws = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); view.setUint32(4, 36 + dataLen, true);
    ws(8, 'WAVE'); ws(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1,  true);
    view.setUint16(22, ch, true);
    view.setUint32(24, sr, true);
    view.setUint32(28, sr * blockAln, true);
    view.setUint16(32, blockAln, true);
    view.setUint16(34, 16, true);
    ws(36, 'data'); view.setUint32(40, dataLen, true);

    let off = 44;
    for (let i = 0; i < buf.length; i++) {
      for (let c = 0; c < ch; c++) {
        const s = Math.max(-1, Math.min(1, buf.getChannelData(c)[i]));
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        off += 2;
      }
    }
    return new Blob([ab], { type: 'audio/wav' });
  };

  // ── Render processed audio via OfflineAudioContext ─────
  const renderProcessed = async (): Promise<AudioBuffer | null> => {
    if (!audioBuffer) return null;
    const pitchFactor = Math.pow(2, pitch / 12);
    const finalRate   = pitchFactor * speed;
    const outLen      = Math.ceil(audioBuffer.length / finalRate);

    const offCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, outLen, audioBuffer.sampleRate);
    const src    = offCtx.createBufferSource();
    src.buffer              = audioBuffer;
    src.playbackRate.value  = finalRate;
    src.connect(offCtx.destination);
    src.start();
    return await offCtx.startRendering();
  };

  // ── Preview (live playback) ────────────────────────────
  const handlePreview = async () => {
    if (!audioBuffer) return;

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const pitchFactor = Math.pow(2, pitch / 12);
    const finalRate   = pitchFactor * speed;

    const src = audioContextRef.current.createBufferSource();
    src.buffer             = audioBuffer;
    src.playbackRate.value = finalRate;
    src.connect(audioContextRef.current.destination);
    src.onended = () => setIsPlaying(false);
    src.start();
    sourceNodeRef.current = src;
    setIsPlaying(true);
  };

  // ── Download processed WAV ─────────────────────────────
  const handleDownload = async () => {
    if (!audioBuffer) return;
    setIsProcessing(true);
    try {
      const rendered = await renderProcessed();
      if (!rendered) return;
      const blob = audioBufferToWav(rendered);
      setProcessedBlob(blob);
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${selectedPersona}_${saveName || 'voice'}_p${pitch}_s${speed}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded ✅');
    } catch {
      showToast('Export failed — try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Save to R2 via Jan's worker ────────────────────────
  const handleSaveToR2 = async () => {
    if (!audioBuffer) return;
    setIsSaving(true);
    try {
      let blob = processedBlob;
      if (!blob) {
        const rendered = await renderProcessed();
        if (!rendered) return;
        blob = audioBufferToWav(rendered);
        setProcessedBlob(blob);
      }

      const filename = `${saveName || 'voice'}_p${pitch > 0 ? '+' : ''}${pitch}_s${speed}_${Date.now()}.wav`;

      // Blob → base64
      const arrBuf = await blob.arrayBuffer();
      const bytes  = new Uint8Array(arrBuf);
      let binary   = '';
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const audioBase64 = btoa(binary);

      const res  = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save-voice', persona: selectedPersona, filename, audioBase64, mimeType: 'audio/wav' })
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Saved: ${selectedPersona}/${filename} ✅`);
        loadVoiceLibrary();
      } else {
        showToast('Save failed — check Worker is deployed.', 'error');
      }
    } catch {
      showToast('Save failed — check Worker.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Load voice library from R2 ─────────────────────────
  const loadVoiceLibrary = async () => {
    setIsLoadingLib(true);
    try {
      const res  = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-voices', persona: selectedPersona })
      });
      const data = await res.json();
      if (data.success) setSavedVoices(data.voices || []);
    } catch {
      console.error('Failed to load voice library');
    } finally {
      setIsLoadingLib(false);
    }
  };

  // ── Play saved voice from R2 ───────────────────────────
  const playVoiceFromR2 = async (filename: string) => {
    try {
      const res  = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-voice', persona: selectedPersona, filename })
      });
      const data = await res.json();
      if (!data.success) return;

      const binStr = atob(data.audioBase64);
      const bytes  = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      const blob   = new Blob([bytes], { type: data.mimeType });
      const url    = URL.createObjectURL(blob);
      const audio  = new Audio(url);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch {
      showToast('Playback failed', 'error');
    }
  };

  // ── Delete voice from R2 ──────────────────────────────
  const deleteVoice = async (filename: string) => {
    if (!window.confirm(`Delete "${filename}"?`)) return;
    try {
      await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-voice', persona: selectedPersona, filename })
      });
      showToast('Deleted ✅');
      loadVoiceLibrary();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  // Reload library when persona changes
  useEffect(() => { loadVoiceLibrary(); }, [selectedPersona]);

  // Reset processed blob when sliders change
  useEffect(() => { setProcessedBlob(null); }, [pitch, speed]);

  const pitchFactor = Math.pow(2, pitch / 12);
  const finalRate   = parseFloat((pitchFactor * speed).toFixed(3));

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, padding: '80px 20px 40px 20px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
          padding: '14px 22px', borderRadius: '8px', fontWeight: '600', fontSize: '14px',
          backgroundColor: toast.type === 'success' ? '#10b981' : '#dc2626',
          color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{
          backgroundColor: t.card, borderRadius: '8px', padding: '20px', marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#4c1d95' : '#7c3aed'}`,
          boxShadow: t.shadow
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: isDarkMode ? '#a78bfa' : '#7c3aed', margin: '0 0 4px 0' }}>
                🎙️ 3C Voice Studio
              </h1>
              <p style={{ color: t.muted, fontSize: '14px', margin: 0 }}>
                Upload · Pitch · Speed · Export · Save — Build your 3C persona voice library
              </p>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              backgroundColor: t.purpleBg, color: isDarkMode ? '#a78bfa' : '#7c3aed'
            }}>
              Built by Claude × Chef Anica 🧪
            </div>
          </div>
        </div>

        {/* ── Persona Selector ── */}
        <div style={{
          backgroundColor: t.card, borderRadius: '8px', padding: '16px 20px', marginBottom: '20px',
          border: `1px solid ${t.border}`, boxShadow: t.shadow
        }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: t.muted, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Select Persona
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {PERSONAS.map(p => (
              <button key={p.id} onClick={() => setSelectedPersona(p.id)}
                style={{
                  padding: '10px 22px', borderRadius: '8px', fontWeight: '700', fontSize: '14px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  border: `2px solid ${selectedPersona === p.id ? p.color : t.border}`,
                  backgroundColor: selectedPersona === p.id ? p.color + '20' : t.card,
                  color: selectedPersona === p.id ? p.color : t.muted,
                }}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>

          {/* ── Left: Studio ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Upload zone */}
            <div
              style={{
                backgroundColor: t.card, borderRadius: '8px', padding: '20px',
                border: `2px dashed ${isDragging ? '#7c3aed' : t.border}`,
                transition: 'border-color 0.2s', boxShadow: t.shadow
              }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <p style={{ fontSize: '12px', fontWeight: '600', color: t.muted, margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Voice Sample
              </p>

              {!audioFile ? (
                <div style={{ textAlign: 'center', padding: '28px 20px' }}>
                  <div style={{ fontSize: '42px', marginBottom: '12px' }}>🎤</div>
                  <p style={{ color: t.muted, fontSize: '14px', margin: '0 0 16px 0' }}>
                    Drag & drop your voice sample here
                  </p>
                  <label style={{
                    display: 'inline-block', padding: '10px 24px', borderRadius: '6px',
                    backgroundColor: '#7c3aed', color: 'white', fontWeight: '700',
                    fontSize: '14px', cursor: 'pointer'
                  }}>
                    Browse File
                    <input type="file" accept="audio/*" style={{ display: 'none' }}
                      onChange={e => { if (e.target.files?.[0]) loadAudioFile(e.target.files[0]); }}
                    />
                  </label>
                  <p style={{ color: t.muted, fontSize: '12px', margin: '12px 0 0 0' }}>
                    MP3, WAV, OGG, M4A supported
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🎵</span>
                      <div>
                        <div style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>{audioFile.name}</div>
                        <div style={{ color: t.muted, fontSize: '12px' }}>
                          {audioBuffer
                            ? `${audioBuffer.duration.toFixed(1)}s · ${audioBuffer.sampleRate}Hz · ${audioBuffer.numberOfChannels === 1 ? 'Mono' : 'Stereo'}`
                            : 'Decoding…'}
                        </div>
                      </div>
                    </div>
                    <label style={{
                      padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                      color: t.muted, fontWeight: '600', border: `1px solid ${t.border}`, backgroundColor: t.card
                    }}>
                      Change
                      <input type="file" accept="audio/*" style={{ display: 'none' }}
                        onChange={e => { if (e.target.files?.[0]) loadAudioFile(e.target.files[0]); }}
                      />
                    </label>
                  </div>
                  {/* Waveform */}
                  <canvas ref={canvasRef} width={700} height={80}
                    style={{ width: '100%', height: '80px', borderRadius: '6px', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', display: 'block' }}
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ backgroundColor: t.card, borderRadius: '8px', padding: '24px', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: t.muted, margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Voice Controls
              </p>

              {/* Pitch */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>Pitch</label>
                  <span style={{
                    padding: '3px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
                    backgroundColor: t.purpleBg, color: isDarkMode ? t.purpleLight : t.purple
                  }}>
                    {pitch > 0 ? `+${pitch}` : pitch} semitones
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#ec4899', fontWeight: '700', whiteSpace: 'nowrap' }}>♀ Female</span>
                  <input type="range" min={-12} max={12} step={1} value={pitch}
                    onChange={e => setPitch(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#7c3aed', cursor: 'pointer', height: '6px' }}
                  />
                  <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '700', whiteSpace: 'nowrap' }}>♂ Male</span>
                </div>
                <p style={{ fontSize: '11px', color: t.muted, margin: '6px 0 0 0', textAlign: 'center' }}>
                  Pitch shift via playbackRate — adjust Speed below to compensate any tempo drift
                </p>
              </div>

              {/* Speed */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>Speed / Tempo</label>
                  <span style={{
                    padding: '3px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
                    backgroundColor: isDarkMode ? 'rgba(16,185,129,0.15)' : '#d1fae5', color: '#10b981'
                  }}>
                    ×{speed.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: t.muted, fontWeight: '600' }}>0.5×</span>
                  <input type="range" min={0.5} max={2.0} step={0.05} value={speed}
                    onChange={e => setSpeed(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#10b981', cursor: 'pointer', height: '6px' }}
                  />
                  <span style={{ fontSize: '12px', color: t.muted, fontWeight: '600' }}>2.0×</span>
                </div>
              </div>

              {/* Final rate display */}
              <div style={{
                padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
                backgroundColor: t.cardAlt, border: `1px solid ${t.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', color: t.muted }}>Final playback rate</span>
                <strong style={{ color: t.text, fontSize: '14px' }}>×{finalRate}</strong>
              </div>

              {/* Save name */}
              <div>
                <label style={{ fontWeight: '700', color: t.text, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  File Name
                </label>
                <input
                  type="text" value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="e.g. aurion-voice-v1"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px',
                    border: `1px solid ${t.border}`, backgroundColor: t.cardAlt, color: t.text,
                    boxSizing: 'border-box' as const, outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {/* Preview */}
              <button onClick={handlePreview} disabled={!audioBuffer}
                style={{
                  padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '14px',
                  cursor: audioBuffer ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  backgroundColor: !audioBuffer ? t.cardAlt : isPlaying ? '#dc2626' : '#7c3aed',
                  color: audioBuffer ? 'white' : t.muted,
                  boxShadow: audioBuffer ? '0 4px 12px rgba(124,58,237,0.3)' : 'none'
                }}
              >
                {isPlaying ? '⏹ Stop' : '▶ Preview'}
              </button>

              {/* Download */}
              <button onClick={handleDownload} disabled={!audioBuffer || isProcessing}
                style={{
                  padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '14px',
                  cursor: (audioBuffer && !isProcessing) ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  backgroundColor: (audioBuffer && !isProcessing) ? '#0891b2' : t.cardAlt,
                  color: (audioBuffer && !isProcessing) ? 'white' : t.muted,
                  boxShadow: (audioBuffer && !isProcessing) ? '0 4px 12px rgba(8,145,178,0.3)' : 'none'
                }}
              >
                {isProcessing ? '⏳ Processing…' : '⬇ Download'}
              </button>

              {/* Save to R2 */}
              <button onClick={handleSaveToR2} disabled={!audioBuffer || isSaving}
                style={{
                  padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '14px',
                  cursor: (audioBuffer && !isSaving) ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  backgroundColor: (audioBuffer && !isSaving) ? '#10b981' : t.cardAlt,
                  color: (audioBuffer && !isSaving) ? 'white' : t.muted,
                  boxShadow: (audioBuffer && !isSaving) ? '0 4px 12px rgba(16,185,129,0.3)' : 'none'
                }}
              >
                {isSaving ? '⏳ Saving…' : '☁ Save to R2'}
              </button>
            </div>
          </div>

          {/* ── Right: Voice Library ── */}
          <div style={{ backgroundColor: t.card, borderRadius: '8px', padding: '20px', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: t.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {selectedPersona} · Voice Library
              </p>
              <button onClick={loadVoiceLibrary} title="Refresh"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, fontSize: '16px', padding: '4px' }}>
                🔄
              </button>
            </div>

            {isLoadingLib ? (
              <p style={{ color: t.muted, fontSize: '14px', textAlign: 'center', padding: '24px' }}>Loading…</p>
            ) : savedVoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎙️</div>
                <p style={{ color: t.muted, fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                  No voices saved for {selectedPersona} yet.<br />
                  Process a sample and hit <strong>Save to R2</strong>.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
                {savedVoices.map(voice => (
                  <div key={voice.key} style={{
                    padding: '12px', borderRadius: '6px',
                    backgroundColor: t.cardAlt, border: `1px solid ${t.border}`
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '12px', color: t.text, marginBottom: '4px', wordBreak: 'break-all' }}>
                      🎵 {voice.filename}
                    </div>
                    <div style={{ fontSize: '11px', color: t.muted, marginBottom: '10px' }}>
                      {(voice.size / 1024).toFixed(0)} KB · {new Date(voice.uploaded).toLocaleDateString('en-GB')}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => playVoiceFromR2(voice.filename)}
                        style={{
                          flex: 1, padding: '6px', borderRadius: '4px', border: 'none',
                          backgroundColor: '#7c3aed', color: 'white', fontSize: '12px',
                          fontWeight: '700', cursor: 'pointer'
                        }}>
                        ▶ Play
                      </button>
                      <button onClick={() => deleteVoice(voice.filename)}
                        style={{
                          padding: '6px 10px', borderRadius: '4px', border: 'none',
                          backgroundColor: '#dc2626', color: 'white', fontSize: '12px',
                          fontWeight: '700', cursor: 'pointer'
                        }}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div style={{
              marginTop: '16px', padding: '12px', borderRadius: '6px',
              backgroundColor: t.purpleBg, border: `1px solid ${isDarkMode ? 'rgba(124,58,237,0.4)' : '#c4b5fd'}`,
              fontSize: '12px', color: isDarkMode ? '#a78bfa' : '#6d28d9', lineHeight: '1.6'
            }}>
              <strong>💡 Storage:</strong> Voices are saved to your 3C Control Center R2 bucket under <code>Voices/{selectedPersona}/</code>.
              Ready for future bot and AI integrations per persona.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceStudioComponent;
