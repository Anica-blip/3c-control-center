// 3C Voice Studio Component — Enhanced
// Upload/Record → Pitch Shift → Tempo (SoundTouchJS) → Preview → Download → Save Local
// Built with ❤️ by Claude (Anthropic) × Chef Anica · 3C Thread To Success Cooking Lab 🧪👨‍🍳
//
// REQUIRES: npm install soundtouchjs
//

import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore — soundtouchjs has no bundled types
import { SoundTouch, SimpleFilter, WebAudioBufferSource } from 'soundtouchjs';

// ── Constants ──────────────────────────────────────────
const PERSONAS = [
  { id: 'Aurion', label: 'Aurion', emoji: '⚡', color: '#f59e0b' },
  { id: 'Jan',    label: 'Jan',    emoji: '🐬', color: '#3b82f6' },
  { id: 'Caelum', label: 'Caelum', emoji: '🦅', color: '#8b5cf6' },
  { id: 'Anica',  label: 'Anica',  emoji: '🐱', color: '#10b981' },
];

const DB_NAME    = '3c-voice-studio';
const DB_VERSION = 1;
const DB_STORE   = 'voices';

// ── Types ──────────────────────────────────────────────
interface LocalVoice {
  id?: number;
  persona: string;
  filename: string;
  blob: Blob;
  size: number;
  saved: string;
}

interface VoiceStudioComponentProps {
  isDarkMode?: boolean;
}

// ── IndexedDB helpers ──────────────────────────────────
const openVoiceDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE))
        db.createObjectStore(DB_STORE, { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror  = () => reject(req.error);
  });

const dbSaveVoice = async (record: LocalVoice): Promise<void> => {
  const db = await openVoiceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).add(record);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror    = () => { db.close(); reject(tx.error); };
  });
};

const dbLoadVoices = async (persona: string): Promise<LocalVoice[]> => {
  const db = await openVoiceDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).getAll();
    req.onsuccess = () => {
      db.close();
      resolve((req.result as LocalVoice[]).filter(v => v.persona === persona).reverse());
    };
    req.onerror = () => { db.close(); reject(req.error); };
  });
};

const dbDeleteVoice = async (id: number): Promise<void> => {
  const db = await openVoiceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror    = () => { db.close(); reject(tx.error); };
  });
};

// ── SoundTouch processing ──────────────────────────────
// Uses WSOLA algorithm — same quality as audioalter.com
const applySoundTouch = async (
  audioBuffer: AudioBuffer,
  tempoFactor: number,
  pitchSemitones: number
): Promise<AudioBuffer> => {
  // Ensure stereo — SoundTouch requires 2 channels
  let srcBuffer = audioBuffer;
  if (audioBuffer.numberOfChannels === 1) {
    const tmpCtx = new OfflineAudioContext(2, audioBuffer.length, audioBuffer.sampleRate);
    const tmpBuf = tmpCtx.createBuffer(2, audioBuffer.length, audioBuffer.sampleRate);
    tmpBuf.copyToChannel(audioBuffer.getChannelData(0), 0);
    tmpBuf.copyToChannel(audioBuffer.getChannelData(0), 1);
    srcBuffer = tmpBuf;
  }

  const st = new SoundTouch(srcBuffer.sampleRate);
  st.tempo = tempoFactor;
  st.pitch = Math.pow(2, pitchSemitones / 12); // semitones → ratio

  const source = new WebAudioBufferSource(srcBuffer);
  const filter = new SimpleFilter(source, st);

  const BLOCK  = 4096;
  const chunk  = new Float32Array(BLOCK * 2); // interleaved stereo
  const left:  number[] = [];
  const right: number[] = [];

  let extracted: number;
  do {
    extracted = filter.extract(chunk, BLOCK);
    for (let i = 0; i < extracted; i++) {
      left.push(chunk[i * 2]);
      right.push(chunk[i * 2 + 1]);
    }
  } while (extracted > 0);

  const outLen = left.length;
  const outCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    outLen,
    audioBuffer.sampleRate
  );
  const outBuf = outCtx.createBuffer(audioBuffer.numberOfChannels, outLen, audioBuffer.sampleRate);
  outBuf.copyToChannel(new Float32Array(left), 0);
  if (audioBuffer.numberOfChannels > 1)
    outBuf.copyToChannel(new Float32Array(right), 1);

  return outBuf;
};

// ── WAV encoder ────────────────────────────────────────
const audioBufferToWav = (buf: AudioBuffer): Blob => {
  const ch      = buf.numberOfChannels;
  const sr      = buf.sampleRate;
  const bps     = 2;
  const blkAln  = ch * bps;
  const dataLen = buf.length * blkAln;
  const ab      = new ArrayBuffer(44 + dataLen);
  const view    = new DataView(ab);
  const ws      = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  ws(0, 'RIFF'); view.setUint32(4, 36 + dataLen, true);
  ws(8, 'WAVE'); ws(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1,  true);
  view.setUint16(22, ch, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * blkAln, true);
  view.setUint16(32, blkAln, true);
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

// ── Component ──────────────────────────────────────────
const VoiceStudioComponent: React.FC<VoiceStudioComponentProps> = ({ isDarkMode = false }) => {
  const [selectedPersona, setSelectedPersona] = useState('Aurion');
  const [audioFile, setAudioFile]             = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer]         = useState<AudioBuffer | null>(null);
  const [pitch, setPitch]                     = useState(0);
  const [tempo, setTempo]                     = useState(1.0);
  const [isPlaying, setIsPlaying]             = useState(false);
  const [isProcessing, setIsProcessing]       = useState(false);
  const [isSaving, setIsSaving]               = useState(false);
  const [isDragging, setIsDragging]           = useState(false);
  const [saveName, setSaveName]               = useState('');
  const [waveformData, setWaveformData]       = useState<number[]>([]);
  const [toast, setToast]                     = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Recorder state
  const [isRecording, setIsRecording]         = useState(false);
  const [recordingTime, setRecordingTime]     = useState(0);

  // Local library
  const [localVoices, setLocalVoices]         = useState<LocalVoice[]>([]);
  const [isLoadingLib, setIsLoadingLib]       = useState(false);

  const audioContextRef    = useRef<AudioContext | null>(null);
  const sourceNodeRef      = useRef<AudioBufferSourceNode | null>(null);
  const canvasRef          = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef   = useRef<MediaRecorder | null>(null);
  const recordingTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Theme ──────────────────────────────────────────
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

  // ── Toast ──────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Waveform ───────────────────────────────────────
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

  // ── Load audio file ────────────────────────────────
  const loadAudioFile = async (file: File) => {
    setAudioFile(file);
    setSaveName(file.name.replace(/\.[^/.]+$/, ''));
    try {
      const ab  = await file.arrayBuffer();
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const buf = await ctx.decodeAudioData(ab);
      setAudioBuffer(buf);
      generateWaveform(buf);
    } catch {
      showToast('Could not decode audio — try WAV, MP3, or WebM.', 'error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('audio/')) loadAudioFile(file);
    else showToast('Please drop an audio file (MP3, WAV, OGG, M4A)', 'error');
  };

  // ── Voice Recorder ─────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mr     = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
      const chunks: Blob[] = [];

      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: mimeType });
        await loadAudioFile(file);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current = mr;
      mr.start(100);
      setIsRecording(true);

      let secs = 0;
      recordingTimerRef.current = setInterval(() => {
        secs++;
        setRecordingTime(secs);
      }, 1000);
    } catch {
      showToast('Microphone access denied — check browser permissions.', 'error');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatRecTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── SoundTouch render ──────────────────────────────
  const renderProcessed = async (): Promise<AudioBuffer | null> => {
    if (!audioBuffer) return null;
    return applySoundTouch(audioBuffer, tempo, pitch);
  };

  // ── Preview ────────────────────────────────────────
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
      if (!audioContextRef.current || audioContextRef.current.state === 'closed')
        audioContextRef.current = new AudioContext();
      if (audioContextRef.current.state === 'suspended')
        await audioContextRef.current.resume();
      const src = audioContextRef.current.createBufferSource();
      src.buffer             = result;
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

  // ── Download ───────────────────────────────────────
  const handleDownload = async () => {
    if (!audioBuffer) return;
    setIsProcessing(true);
    try {
      const result = await renderProcessed();
      if (!result) return;
      const blob = audioBufferToWav(result);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${selectedPersona}_${saveName || 'voice'}_p${pitch}_t${tempo.toFixed(2)}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded ✅');
    } catch {
      showToast('Export failed — try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Save to Local Library (IndexedDB) ─────────────
  const handleSaveLocal = async () => {
    if (!audioBuffer) return;
    setIsSaving(true);
    try {
      const result = await renderProcessed();
      if (!result) return;
      const blob     = audioBufferToWav(result);
      const filename = `${saveName || 'voice'}_p${pitch > 0 ? '+' : ''}${pitch}_t${tempo.toFixed(2)}_${Date.now()}.wav`;
      await dbSaveVoice({ persona: selectedPersona, filename, blob, size: blob.size, saved: new Date().toISOString() });
      showToast(`Saved: ${filename} ✅`);
      loadLocalLibrary();
    } catch {
      showToast('Save failed — try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Local Library ──────────────────────────────────
  const loadLocalLibrary = async () => {
    setIsLoadingLib(true);
    try {
      const voices = await dbLoadVoices(selectedPersona);
      setLocalVoices(voices);
    } catch {
      console.error('Failed to load local library');
    } finally {
      setIsLoadingLib(false);
    }
  };

  const playLocalVoice = async (voice: LocalVoice) => {
    try {
      const url   = URL.createObjectURL(voice.blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch {
      showToast('Playback failed', 'error');
    }
  };

  const downloadLocalVoice = (voice: LocalVoice) => {
    const url = URL.createObjectURL(voice.blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = voice.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteLocalVoice = async (voice: LocalVoice) => {
    if (!voice.id) return;
    if (!window.confirm(`Delete "${voice.filename}"?`)) return;
    try {
      await dbDeleteVoice(voice.id);
      showToast('Deleted ✅');
      loadLocalLibrary();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  useEffect(() => { loadLocalLibrary(); }, [selectedPersona]);
  useEffect(() => { /* reset on slider change — no blob cache needed with SoundTouch */ }, [pitch, tempo]);

  const pitchLabel = pitch === 0 ? 'No change' : pitch < 0 ? `${pitch} st (deeper)` : `+${pitch} st (higher)`;
  const tempoLabel = tempo === 1.0 ? 'No change' : tempo > 1 ? `×${tempo.toFixed(2)} faster` : `×${tempo.toFixed(2)} slower`;
  const busy       = isProcessing || isSaving;

  // ── Render ─────────────────────────────────────────
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
                Upload · Record · Pitch · Tempo · Download · Save — Build your 3C persona voice library
              </p>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
              backgroundColor: t.purpleBg, color: isDarkMode ? '#a78bfa' : '#7c3aed'
            }}>
              Designed and Built with ❤️ by Claude (Anthropic) × Chef Anica · 3C Thread To Success™
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

            {/* Upload + Record zone */}
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
                    Drag & drop your voice sample, browse a file, or record directly
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <label style={{
                      display: 'inline-block', padding: '10px 24px', borderRadius: '6px',
                      backgroundColor: '#7c3aed', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                    }}>
                      Browse File
                      <input type="file" accept="audio/*" style={{ display: 'none' }}
                        onChange={e => { if (e.target.files?.[0]) loadAudioFile(e.target.files[0]); }} />
                    </label>
                    {!isRecording ? (
                      <button onClick={startRecording} style={{
                        padding: '10px 24px', borderRadius: '6px', border: 'none',
                        backgroundColor: '#dc2626', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                      }}>
                        🔴 Record
                      </button>
                    ) : (
                      <button onClick={stopRecording} style={{
                        padding: '10px 24px', borderRadius: '6px', border: 'none',
                        backgroundColor: '#991b1b', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                        animation: 'pulse 1s infinite'
                      }}>
                        ⏹ Stop — {formatRecTime(recordingTime)}
                      </button>
                    )}
                  </div>
                  <p style={{ color: t.muted, fontSize: '12px', margin: '12px 0 0 0' }}>
                    MP3, WAV, OGG, M4A · High-quality 48kHz recording
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isRecording ? (
                        <button onClick={startRecording} style={{
                          padding: '6px 12px', borderRadius: '6px', border: 'none',
                          backgroundColor: '#dc2626', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                        }}>
                          🔴 Record
                        </button>
                      ) : (
                        <button onClick={stopRecording} style={{
                          padding: '6px 12px', borderRadius: '6px', border: 'none',
                          backgroundColor: '#991b1b', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                        }}>
                          ⏹ {formatRecTime(recordingTime)}
                        </button>
                      )}
                      <label style={{
                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                        color: t.muted, fontWeight: '600', border: `1px solid ${t.border}`, backgroundColor: t.card
                      }}>
                        Change
                        <input type="file" accept="audio/*" style={{ display: 'none' }}
                          onChange={e => { if (e.target.files?.[0]) loadAudioFile(e.target.files[0]); }} />
                      </label>
                    </div>
                  </div>
                  <canvas ref={canvasRef} width={1200} height={80}
                    style={{ width: '100%', height: '80px', borderRadius: '6px', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', display: 'block' }}
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ backgroundColor: t.card, borderRadius: '8px', padding: '24px', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: t.muted, margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Voice Controls — SoundTouch Engine
              </p>

              {/* Pitch */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>Pitch — Voice Tone</label>
                  <span style={{
                    padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                    backgroundColor: t.purpleBg, color: isDarkMode ? t.purpleLight : t.purple
                  }}>
                    {pitchLabel}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: t.muted, margin: '0 0 12px 0', lineHeight: '1.5' }}>
                  Slide left → deeper voice. Slide right → higher voice. Tempo is not affected.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

              {/* Tempo */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>Tempo — Speech Speed</label>
                  <span style={{
                    padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                    backgroundColor: isDarkMode ? 'rgba(16,185,129,0.15)' : '#d1fae5', color: '#10b981'
                  }}>
                    {tempoLabel}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: t.muted, margin: '0 0 12px 0', lineHeight: '1.5' }}>
                  Changes speed only — <strong style={{ color: t.text }}>pitch is not affected</strong>. WSOLA algorithm — audioalter quality.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: t.muted, fontWeight: '600', whiteSpace: 'nowrap' }}>0.5× Slow</span>
                  <input type="range" min={0.5} max={2.0} step={0.01} value={tempo}
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
                  Applied to output
                </p>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: t.muted, marginBottom: '2px' }}>Pitch shift</div>
                    <div style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>
                      {pitch === 0 ? '— none' : `${pitch > 0 ? '+' : ''}${pitch} semitones`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: t.muted, marginBottom: '2px' }}>Tempo</div>
                    <div style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>
                      {tempo === 1.0 ? '— none' : `×${tempo.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* File name */}
              <div style={{ marginBottom: '20px' }}>
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

                <button onClick={handleSaveLocal} disabled={!audioBuffer || busy}
                  style={{
                    padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '14px',
                    cursor: (audioBuffer && !busy) ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                    backgroundColor: (audioBuffer && !busy) ? '#10b981' : t.cardAlt,
                    color: (audioBuffer && !busy) ? 'white' : t.muted,
                    boxShadow: (audioBuffer && !busy) ? '0 4px 12px rgba(16,185,129,0.3)' : 'none'
                  }}>
                  {isSaving ? '⏳ Saving…' : '💾 Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Local Voice Library */}
          <div style={{ backgroundColor: t.card, borderRadius: '8px', padding: '20px', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: t.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {selectedPersona} · Voice Library
              </p>
              <button onClick={loadLocalLibrary} title="Refresh"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, fontSize: '16px', padding: '4px' }}>
                🔄
              </button>
            </div>

            {isLoadingLib ? (
              <p style={{ color: t.muted, fontSize: '14px', textAlign: 'center', padding: '24px' }}>Loading…</p>
            ) : localVoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎙️</div>
                <p style={{ color: t.muted, fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                  No voices saved for {selectedPersona} yet.<br />
                  Process a sample and hit <strong>Save</strong>.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
                {localVoices.map(voice => (
                  <div key={voice.id} style={{
                    padding: '12px', borderRadius: '6px',
                    backgroundColor: t.cardAlt, border: `1px solid ${t.border}`
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '12px', color: t.text, marginBottom: '4px', wordBreak: 'break-all' }}>
                      🎵 {voice.filename}
                    </div>
                    <div style={{ fontSize: '11px', color: t.muted, marginBottom: '10px' }}>
                      {(voice.size / 1024).toFixed(0)} KB · {new Date(voice.saved).toLocaleDateString('en-GB')}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => playLocalVoice(voice)}
                        style={{
                          flex: 1, padding: '6px', borderRadius: '4px', border: 'none',
                          backgroundColor: '#7c3aed', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                        }}>
                        ▶ Play
                      </button>
                      <button onClick={() => downloadLocalVoice(voice)}
                        style={{
                          flex: 1, padding: '6px', borderRadius: '4px', border: 'none',
                          backgroundColor: '#0891b2', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                        }}>
                        ⬇
                      </button>
                      <button onClick={() => deleteLocalVoice(voice)}
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
              <strong>💡 Storage:</strong> Voices saved locally in this browser per persona. Hit ⬇ on any saved voice to download it to your device.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VoiceStudioComponent;
