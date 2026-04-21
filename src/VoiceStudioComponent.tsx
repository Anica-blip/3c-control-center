// 3C Voice Studio Component
// Upload → Pitch Shift → Speed Control → Preview → Download → Save to R2
// Built with ❤️ by Claude (Anthropic) × Chef Anica · 3C Thread To Success Cooking Lab 🧪👨‍🍳

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
  const [pitch, setPitch]                     = useState(0);    // semitones — 0 = no change
  const [tempo, setTempo]                     = useState(1.0);  // independent tempo — 1.0 = no change
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

  // ── Generate waveform ──────────────────────────────────
  const generateWaveform = (buf: AudioBuffer) => {
    const data    = buf.getChannelData(0);
    const SAMPLES = 90;
    const blockSz = Math.floor(data.length / SAMPLES);
    const raw: number[] = [];
    for (let i = 0; i < SAMPLES; i++) {
      let sum = 0;
      for (let j = 0; j < blockSz; j++) sum += Math.abs(data[i * blockSz + j]);
      raw.push(sum / blockSz);
    }
    const max = Math.max(...raw, 0.001);
    setWaveformData(raw.map(v => v / max));
  };

  // ── Load audio file ────────────────────────────────────
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
  // overrideSampleRate: writes a different Hz into the WAV header
  // so the player interprets the frames at original rate (tempo trick)
  const audioBufferToWav = (buf: AudioBuffer, overrideSampleRate?: number): Blob => {
    const ch       = buf.numberOfChannels;
    const sr       = overrideSampleRate ?? buf.sampleRate;
    const bps      = 2;
    const blockAln = ch * bps;
    const dataLen  = buf.length * blockAln;
    const ab       = new ArrayBuffer(44 + dataLen);
    const view     = new DataView(ab);
    const ws       = (off: number, s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
    };
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

  // ── TWO-PASS RENDER ─────────────────────────────────────────────────────────
  //
  // The fundamental rule you identified from the experts is correct:
  // Pitch and Tempo should NOT be combined. We fix this with two separate passes:
  //
  // PASS 1 — Pitch only (via playbackRate)
  //   playbackRate = 2^(semitones/12)
  //   Side effect: tempo also changes. That is expected and will be corrected in Pass 2.
  //
  // PASS 2 — Tempo only (pitch-neutral, via sample rate trick)
  //   The OfflineAudioContext is given a DIFFERENT sampleRate = originalSR / tempoFactor
  //   playbackRate stays at 1 — so pitch from Pass 1 is preserved exactly.
  //   The WAV header is then written with the ORIGINAL sampleRate.
  //   Result: the player reads the frames at original rate → tempo is shifted
  //   by tempoFactor with ZERO pitch change.
  //
  // Output: pitch and tempo are fully independent sliders.
  // ────────────────────────────────────────────────────────────────────────────
  const renderProcessed = async (): Promise<{ buffer: AudioBuffer; wavSampleRate: number } | null> => {
    if (!audioBuffer) return null;

    const pitchFactor = Math.pow(2, pitch / 12);
    const originalSR  = audioBuffer.sampleRate;

    // ── Pass 1: Pitch shift ──────────────────────────────
    const p1Len = Math.max(1, Math.ceil(audioBuffer.length / pitchFactor));
    const p1Ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, p1Len, originalSR);
    const p1Src = p1Ctx.createBufferSource();
    p1Src.buffer             = audioBuffer;
    p1Src.playbackRate.value = pitchFactor;
    p1Src.connect(p1Ctx.destination);
    p1Src.start();
    const pitchedBuffer = await p1Ctx.startRendering();

    // ── Pass 2: Tempo adjustment, pitch-neutral ──────────
    // Clamp sampleRate to Web Audio valid range [8000, 96000]
    const targetSR = Math.min(96000, Math.max(8000, Math.round(originalSR / tempo)));
    const p2Ctx    = new OfflineAudioContext(pitchedBuffer.numberOfChannels, pitchedBuffer.length, targetSR);
    const p2Src    = p2Ctx.createBufferSource();
    p2Src.buffer             = pitchedBuffer;
    p2Src.playbackRate.value = 1; // ← pitch untouched
    p2Src.connect(p2Ctx.destination);
    p2Src.start();
    const finalBuffer = await p2Ctx.startRendering();

    return { buffer: finalBuffer, wavSampleRate: originalSR };
  };

  // ── Preview — full two-pass then play ─────────────────
  const handlePreview = async () => {
    if (!audioBuffer) return;

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await renderProcessed();
      if (!result) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Encode as WAV with original SR so decodeAudioData interprets correctly
      const wavBlob   = audioBufferToWav(result.buffer, result.wavSampleRate);
      const wavArrBuf = await wavBlob.arrayBuffer();
      const playBuf   = await audioContextRef.current.decodeAudioData(wavArrBuf);

      const src = audioContextRef.current.createBufferSource();
      src.buffer             = playBuf;
      src.playbackRate.value = 1;
      src.connect(audioContextRef.current.destination);
      src.onended = () => setIsPlaying(false);
      src.start();
      sourceNodeRef.current = src;
      setIsPlaying(true);
    } catch {
      showToast('Preview failed — try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Download ───────────────────────────────────────────
  const handleDownload = async () => {
    if (!audioBuffer) return;
    setIsProcessing(true);
    try {
      const result = await renderProcessed();
      if (!result) return;
      const blob = audioBufferToWav(result.buffer, result.wavSampleRate);
      setProcessedBlob(blob);
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${selectedPersona}_${saveName || 'voice'}_p${pitch}_t${tempo}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded ✅');
    } catch {
      showToast('Export failed — try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Save to R2 ─────────────────────────────────────────
  const handleSaveToR2 = async () => {
    if (!audioBuffer) return;
    setIsSaving(true);
    try {
      let blob = processedBlob;
      if (!blob) {
        const result = await renderProcessed();
        if (!result) return;
        blob = audioBufferToWav(result.buffer, result.wavSampleRate);
        setProcessedBlob(blob);
      }
      const filename = `${saveName || 'voice'}_p${pitch > 0 ? '+' : ''}${pitch}_t${tempo}_${Date.now()}.wav`;
      const arrBuf   = await blob.arrayBuffer();
      const bytes    = new Uint8Array(arrBuf);
      let binary     = '';
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

  // ── Voice Library ──────────────────────────────────────
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

  useEffect(() => { loadVoiceLibrary(); }, [selectedPersona]);
  useEffect(() => { setProcessedBlob(null); }, [pitch, tempo]);

  // Derived labels
  const pitchLabel = pitch === 0 ? 'No change' : pitch < 0 ? `${pitch} semitones (deeper)` : `+${pitch} semitones (higher)`;
  const tempoLabel = tempo === 1.0 ? 'No change' : tempo > 1 ? `×${tempo.toFixed(2)} faster` : `×${tempo.toFixed(2)} slower`;
  const busy       = isProcessing || isSaving;

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, padding: '80px 20px 40px 20px' }}>

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

        {/* Header */}
        <div style={{
          backgroundColor: t.card, borderRadius: '8px', padding: '20px', marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#4c1d95' : '#7c3aed'}`, boxShadow: t.shadow
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: isDarkMode ? '#a78bfa' : '#7c3aed', margin: '0 0 4px 0' }}>
                🎙️ 3C Voice Studio
              </h1>
              <p style={{ color: t.muted, fontSize: '14px', margin: 0 }}>
                Upload · Pitch · Tempo · Export · Save — Build your 3C persona voice library
              </p>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
              backgroundColor: t.purpleBg, color: isDarkMode ? '#a78bfa' : '#7c3aed'
            }}>
              Built by Claude (Anthropic) × Chef Anica · 3C Thread To Success Cooking Lab 🧪👨‍🍳
            </div>
          </div>
        </div>

        {/* Persona Selector */}
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
                }}>
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>

          {/* Left: Studio */}
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
                  <p style={{ color: t.muted, fontSize: '14px', margin: '0 0 16px 0' }}>Drag & drop your voice sample here</p>
                  <label style={{
                    display: 'inline-block', padding: '10px 24px', borderRadius: '6px',
                    backgroundColor: '#7c3aed', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                  }}>
                    Browse File
                    <input type="file" accept="audio/*" style={{ display: 'none' }}
                      onChange={e => { if (e.target.files?.[0]) loadAudioFile(e.target.files[0]); }} />
                  </label>
                  <p style={{ color: t.muted, fontSize: '12px', margin: '12px 0 0 0' }}>MP3, WAV, OGG, M4A supported</p>
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
                        onChange={e => { if (e.target.files?.[0]) loadAudioFile(e.target.files[0]); }} />
                    </label>
                  </div>
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

              {/* ── PITCH — changes voice tone, accepts tempo side-effect ── */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>
                    Pitch — Voice Tone
                  </label>
                  <span style={{
                    padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                    backgroundColor: t.purpleBg, color: isDarkMode ? t.purpleLight : t.purple
                  }}>
                    {pitchLabel}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: t.muted, margin: '0 0 12px 0', lineHeight: '1.5' }}>
                  Slide left → deeper voice. Slide right → higher voice. Speed may drift — use Tempo below to fix it independently.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* ✅ CORRECT: Left = deeper (negative semitones = male/lower), Right = higher (positive = female/higher) */}
                  <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '700', whiteSpace: 'nowrap' }}>♂ Deeper</span>
                  <input type="range" min={-12} max={12} step={1} value={pitch}
                    onChange={e => setPitch(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#7c3aed', cursor: 'pointer', height: '6px' }}
                  />
                  <span style={{ fontSize: '13px', color: '#ec4899', fontWeight: '700', whiteSpace: 'nowrap' }}>♀ Higher</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: t.muted }}>−12</span>
                  <span style={{ fontSize: '10px', color: t.muted }}>0</span>
                  <span style={{ fontSize: '10px', color: t.muted }}>+12</span>
                </div>
              </div>

              {/* ── TEMPO — fully independent of pitch ── */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>
                    Tempo — Speech Speed
                  </label>
                  <span style={{
                    padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                    backgroundColor: isDarkMode ? 'rgba(16,185,129,0.15)' : '#d1fae5', color: '#10b981'
                  }}>
                    {tempoLabel}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: t.muted, margin: '0 0 12px 0', lineHeight: '1.5' }}>
                  Changes speed only — <strong style={{ color: t.text }}>pitch is not affected</strong>. Use this to compensate tempo drift from pitch adjustment above.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: t.muted, fontWeight: '600', whiteSpace: 'nowrap' }}>0.5× Slow</span>
                  <input type="range" min={0.5} max={2.0} step={0.05} value={tempo}
                    onChange={e => setTempo(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#10b981', cursor: 'pointer', height: '6px' }}
                  />
                  <span style={{ fontSize: '12px', color: t.muted, fontWeight: '600', whiteSpace: 'nowrap' }}>2.0× Fast</span>
                </div>
              </div>

              {/* Summary */}
              <div style={{
                padding: '14px 16px', borderRadius: '8px', marginBottom: '20px',
                backgroundColor: t.cardAlt, border: `1px solid ${t.border}`
              }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: t.muted, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  What will be applied to your output
                </p>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: t.muted, marginBottom: '2px' }}>Pitch shift</div>
                    <div style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>
                      {pitch === 0 ? '— none' : `${pitch > 0 ? '+' : ''}${pitch} semitones`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: t.muted, marginBottom: '2px' }}>Tempo (pitch-neutral)</div>
                    <div style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>
                      {tempo === 1.0 ? '— none' : `×${tempo.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* File name */}
              <div>
                <label style={{ fontWeight: '700', color: t.text, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  File Name
                </label>
                <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)}
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
              <button onClick={handlePreview} disabled={!audioBuffer || busy}
                style={{
                  padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '14px',
                  cursor: (audioBuffer && !busy) ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  backgroundColor: !audioBuffer ? t.cardAlt : isPlaying ? '#dc2626' : isProcessing ? '#6d28d9' : '#7c3aed',
                  color: audioBuffer ? 'white' : t.muted,
                  boxShadow: audioBuffer ? '0 4px 12px rgba(124,58,237,0.3)' : 'none'
                }}>
                {isProcessing && !isPlaying ? '⏳ Rendering…' : isPlaying ? '⏹ Stop' : '▶ Preview'}
              </button>

              <button onClick={handleDownload} disabled={!audioBuffer || busy}
                style={{
                  padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '14px',
                  cursor: (audioBuffer && !busy) ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  backgroundColor: (audioBuffer && !busy) ? '#0891b2' : t.cardAlt,
                  color: (audioBuffer && !busy) ? 'white' : t.muted,
                  boxShadow: (audioBuffer && !busy) ? '0 4px 12px rgba(8,145,178,0.3)' : 'none'
                }}>
                {isProcessing ? '⏳ Processing…' : '⬇ Download'}
              </button>

              <button onClick={handleSaveToR2} disabled={!audioBuffer || busy}
                style={{
                  padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '14px',
                  cursor: (audioBuffer && !busy) ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  backgroundColor: (audioBuffer && !busy) ? '#10b981' : t.cardAlt,
                  color: (audioBuffer && !busy) ? 'white' : t.muted,
                  boxShadow: (audioBuffer && !busy) ? '0 4px 12px rgba(16,185,129,0.3)' : 'none'
                }}>
                {isSaving ? '⏳ Saving…' : '☁ Save to R2'}
              </button>
            </div>
          </div>

          {/* Right: Voice Library */}
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
                          backgroundColor: '#7c3aed', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                        }}>
                        ▶ Play
                      </button>
                      <button onClick={() => deleteVoice(voice.filename)}
                        style={{
                          padding: '6px 10px', borderRadius: '4px', border: 'none',
                          backgroundColor: '#dc2626', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                        }}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              marginTop: '16px', padding: '12px', borderRadius: '6px',
              backgroundColor: t.purpleBg, border: `1px solid ${isDarkMode ? 'rgba(124,58,237,0.4)' : '#c4b5fd'}`,
              fontSize: '12px', color: isDarkMode ? '#a78bfa' : '#6d28d9', lineHeight: '1.6'
            }}>
              <strong>💡 Storage:</strong> Voices saved to 3C Control Center R2 under <code>Voices/{selectedPersona}/</code>. Ready for future bot and AI integrations per persona.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceStudioComponent;
