// 3C Voice Studio Component — Enhanced v2
// Upload · Record · Trim · Merge · Pitch · Tempo · Download (WAV/MP3) · Save
// Built with ❤️ by Claude (Anthropic) × Chef Anica · 3C Thread To Success Cooking Lab 🧪👨‍🍳
//
// REQUIRES: npm install soundtouchjs lamejs

import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore — soundtouchjs has no bundled types
import { SoundTouch, SimpleFilter, WebAudioBufferSource } from 'soundtouchjs';
// @ts-ignore — lamejs has no bundled types
import lamejs from 'lamejs';

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

interface MergeClip {
  id: string;
  file: File;
  buffer: AudioBuffer;
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

// ── NEW: Slice AudioBuffer to a trim region ────────────
const sliceBuffer = (buf: AudioBuffer, startSec: number, endSec: number): AudioBuffer => {
  const sr          = buf.sampleRate;
  const startSample = Math.floor(startSec * sr);
  const endSample   = Math.min(Math.ceil(endSec * sr), buf.length);
  const length      = Math.max(1, endSample - startSample);
  const channels    = buf.numberOfChannels;
  const ctx         = new OfflineAudioContext(channels, length, sr);
  const out         = ctx.createBuffer(channels, length, sr);
  for (let c = 0; c < channels; c++) {
    out.copyToChannel(buf.getChannelData(c).slice(startSample, endSample), c);
  }
  return out;
};

// ── NEW: Concatenate multiple AudioBuffers in sequence ─
const concatenateBuffers = (buffers: AudioBuffer[]): AudioBuffer => {
  if (buffers.length === 0) throw new Error('No buffers to merge');
  const sr       = buffers[0].sampleRate;
  const channels = buffers.reduce((m, b) => Math.max(m, b.numberOfChannels), 1);
  const totalLen = buffers.reduce((s, b) => s + b.length, 0);
  const ctx      = new OfflineAudioContext(channels, totalLen, sr);
  const out      = ctx.createBuffer(channels, totalLen, sr);
  let offset     = 0;
  for (const buf of buffers) {
    for (let c = 0; c < channels; c++) {
      // If source has fewer channels, mirror ch0 into all channels
      const src = c < buf.numberOfChannels ? buf.getChannelData(c) : buf.getChannelData(0);
      out.copyToChannel(src, c, offset);
    }
    offset += buf.length;
  }
  return out;
};

// ── SoundTouch processing (UNCHANGED) ─────────────────
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
  st.pitch = Math.pow(2, pitchSemitones / 12);
  const source = new WebAudioBufferSource(srcBuffer);
  const filter = new SimpleFilter(source, st);
  const BLOCK  = 4096;
  const chunk  = new Float32Array(BLOCK * 2);
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
  const outCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, outLen, audioBuffer.sampleRate);
  const outBuf = outCtx.createBuffer(audioBuffer.numberOfChannels, outLen, audioBuffer.sampleRate);
  outBuf.copyToChannel(new Float32Array(left), 0);
  if (audioBuffer.numberOfChannels > 1)
    outBuf.copyToChannel(new Float32Array(right), 1);
  return outBuf;
};

// ── WAV encoder (UNCHANGED) ───────────────────────────
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

// ── NEW: MP3 encoder via lamejs (128kbps) ─────────────
const audioBufferToMp3 = (buf: AudioBuffer, kbps = 128): Blob => {
  const channels   = buf.numberOfChannels > 1 ? 2 : 1;
  const sampleRate = buf.sampleRate;
  const encoder    = new lamejs.Mp3Encoder(channels, sampleRate, kbps);

  const toInt16 = (f32: Float32Array): Int16Array => {
    const i16 = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) {
      const s = Math.max(-1, Math.min(1, f32[i]));
      i16[i]  = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return i16;
  };

  const BLOCK  = 1152; // lamejs frame size
  const leftI  = toInt16(buf.getChannelData(0));
  const rightI = toInt16(channels > 1 ? buf.getChannelData(1) : buf.getChannelData(0));
  const chunks: Uint8Array[] = [];

  for (let i = 0; i < leftI.length; i += BLOCK) {
    const lChunk   = leftI.subarray(i, i + BLOCK);
    const rChunk   = rightI.subarray(i, i + BLOCK);
    const encoded  = channels > 1 ? encoder.encodeBuffer(lChunk, rChunk) : encoder.encodeBuffer(lChunk);
    if (encoded.length > 0) chunks.push(new Uint8Array(encoded));
  }
  const end = encoder.flush();
  if (end.length > 0) chunks.push(new Uint8Array(end));

  return new Blob(chunks, { type: 'audio/mpeg' });
};

// ── Utility helpers ───────────────────────────────────
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const formatTime = (secs: number): string => {
  if (!isFinite(secs) || secs < 0) return '0:00.0';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
};

// ── Component ──────────────────────────────────────────
const VoiceStudioComponent: React.FC<VoiceStudioComponentProps> = ({ isDarkMode = false }) => {

  // ── Existing state ─────────────────────────────────
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
  const [isRecording, setIsRecording]         = useState(false);
  const [recordingTime, setRecordingTime]     = useState(0);
  const [localVoices, setLocalVoices]         = useState<LocalVoice[]>([]);
  const [isLoadingLib, setIsLoadingLib]       = useState(false);

  // ── NEW state ──────────────────────────────────────
  const [trimStart, setTrimStart]       = useState(0);
  const [trimEnd, setTrimEnd]           = useState<number | null>(null);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [mergeClips, setMergeClips]     = useState<MergeClip[]>([]);
  const [saveFormat, setSaveFormat]     = useState<'wav' | 'mp3'>('mp3'); // default MP3 for Canva
  const [isRegionPlaying, setIsRegionPlaying] = useState(false); // mini transport — raw playback only

  // ── Existing refs ──────────────────────────────────
  const audioContextRef   = useRef<AudioContext | null>(null);
  const sourceNodeRef     = useRef<AudioBufferSourceNode | null>(null);
  const canvasRef         = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── NEW refs ───────────────────────────────────────
  const canvasWrapRef      = useRef<HTMLDivElement>(null);
  const animFrameRef       = useRef<number>(0);
  const playStartAcTimeRef = useRef<number>(0);
  const playStartOffsetRef = useRef<number>(0);
  const regionSourceRef    = useRef<AudioBufferSourceNode | null>(null);
  const cutModeRef         = useRef<'positioning' | 'replay'>('positioning');

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
    setTimeout(() => setToast(null), 3500);
  };

  // ── ENHANCED: Waveform drawing with trim + playhead ─
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;
    const canvas   = canvasRef.current;
    const ctx      = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    const duration = audioBuffer?.duration ?? 1;
    const tS       = trimStart;
    const tE       = trimEnd ?? duration;
    const toPx     = (sec: number) => Math.round((sec / duration) * width);

    ctx.clearRect(0, 0, width, height);

    // Full waveform bars with gradient
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

    // Dim inactive (trimmed-out) regions
    const dimColor = isDarkMode ? 'rgba(15,23,42,0.72)' : 'rgba(248,250,252,0.72)';
    ctx.fillStyle  = dimColor;
    if (tS > 0)          ctx.fillRect(0,        0, toPx(tS),         height);
    if (tE < duration)   ctx.fillRect(toPx(tE), 0, width - toPx(tE), height);

    // Trim markers
    ctx.fillStyle = '#10b981'; // green = start handle
    ctx.fillRect(toPx(tS), 0, 3, height);
    ctx.fillStyle = '#f59e0b'; // amber = end handle
    ctx.fillRect(Math.max(0, toPx(tE) - 3), 0, 3, height);

    // Playhead line — always visible, bright white, thicker
    const phPx = toPx(playheadTime);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(Math.max(0, phPx - 1), 0, 3, height);
    // Downward triangle marker at top
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(phPx - 6, 0);
    ctx.lineTo(phPx + 6, 0);
    ctx.lineTo(phPx, 12);
    ctx.closePath();
    ctx.fill();
  }, [waveformData, isDarkMode, trimStart, trimEnd, playheadTime, audioBuffer]);

  // ── NEW: Responsive canvas via ResizeObserver ──────
  useEffect(() => {
    const wrapper = canvasWrapRef.current;
    const canvas  = canvasRef.current;
    if (!wrapper || !canvas) return;
    const setSize = () => {
      const w = wrapper.clientWidth;
      if (w > 0 && canvas.width !== w) {
        canvas.width = w;
        // Trigger waveform redraw with same data
        setWaveformData(prev => (prev.length ? [...prev] : prev));
      }
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  // ── Animated playhead during playback (full preview OR region play) ──
  useEffect(() => {
    if (!isPlaying && !isRegionPlaying) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }
    let raf: number;
    const animate = () => {
      if (audioContextRef.current) {
        const elapsed = audioContextRef.current.currentTime - playStartAcTimeRef.current;
        const current = playStartOffsetRef.current + elapsed;
        const maxT    = trimEnd ?? audioBuffer?.duration ?? 999;
        setPlayheadTime(Math.min(current, maxT));
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    animFrameRef.current = raf;
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, isRegionPlaying, audioBuffer, trimEnd]);

  // ── Waveform generator ─────────────────────────────
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

  // ── MODIFIED: Load file — reset trim on new file ───
  const loadAudioFile = async (file: File) => {
    setAudioFile(file);
    setSaveName(file.name.replace(/\.[^/.]+$/, ''));
    setTrimStart(0);
    setTrimEnd(null);
    setPlayheadTime(0);
    setPitch(0);
    setTempo(1.0);
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

  // ── Voice Recorder (UNCHANGED) ────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 48000, channelCount: 2, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const mr       = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
      const chunks: Blob[] = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: mimeType });
        await loadAudioFile(file);
        stream.getTracks().forEach(tr => tr.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start(100);
      setIsRecording(true);
      let secs = 0;
      recordingTimerRef.current = setInterval(() => { secs++; setRecordingTime(secs); }, 1000);
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

  // ── Click on waveform to seek ─────────────────────
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioBuffer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const t    = ((e.clientX - rect.left) / rect.width) * audioBuffer.duration;
    setPlayheadTime(clamp(t, 0, audioBuffer.duration));
  };

  // ── Mini transport: raw playback — zero SoundTouch ─
  // stopRegion: safely stop any active region playback
  const stopRegion = () => {
    try { regionSourceRef.current?.stop(); } catch {}
    regionSourceRef.current = null;
    setIsRegionPlaying(false);
  };

  // playRegion: plays startSec→endSec on the raw AudioBuffer (no pitch/tempo)
  const playRegion = async (startSec: number, endSec: number) => {
    if (!audioBuffer) return;
    stopRegion(); // always clean up before starting
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed')
        audioContextRef.current = new AudioContext();
      if (audioContextRef.current.state === 'suspended')
        await audioContextRef.current.resume();

      const src = audioContextRef.current.createBufferSource();
      src.buffer = audioBuffer; // raw — exactly what was loaded/merged
      src.connect(audioContextRef.current.destination);

      playStartAcTimeRef.current = audioContextRef.current.currentTime;
      playStartOffsetRef.current = startSec;

      const regionDuration = endSec - startSec;
      src.start(0, startSec, regionDuration);
      src.onended = () => {
        setIsRegionPlaying(false);
        setPlayheadTime(startSec); // snap playhead back to region start
        regionSourceRef.current = null;
      };
      regionSourceRef.current = src;
      setIsRegionPlaying(true);
    } catch {
      showToast('Playback failed — try again.', 'error');
      setIsRegionPlaying(false);
    }
  };

  // ── MODIFIED: renderProcessed — skip SoundTouch if no changes ──
  // When pitch=0 and tempo=1.0 this returns immediately — no processing cost
  const renderProcessed = async (): Promise<AudioBuffer | null> => {
    if (!audioBuffer) return null;
    const duration   = audioBuffer.duration;
    const tStart     = trimStart;
    const tEnd       = trimEnd ?? duration;
    const needsSlice = tStart > 0 || tEnd < duration;
    const sliced     = needsSlice ? sliceBuffer(audioBuffer, tStart, tEnd) : audioBuffer;
    // Bypass SoundTouch entirely when no pitch/tempo adjustment is needed
    if (pitch === 0 && tempo === 1.0) return sliced;
    return applySoundTouch(sliced, tempo, pitch);
  };

  // ── NEW: Encode to the selected format ────────────
  const encodeBuffer = (buf: AudioBuffer, format: 'wav' | 'mp3'): Blob =>
    format === 'mp3' ? audioBufferToMp3(buf) : audioBufferToWav(buf);

  // ── MODIFIED: Preview — tracks playhead ───────────
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

      playStartAcTimeRef.current  = audioContextRef.current.currentTime;
      playStartOffsetRef.current  = trimStart;

      const src = audioContextRef.current.createBufferSource();
      src.buffer = result;
      src.connect(audioContextRef.current.destination);
      src.onended = () => { setIsPlaying(false); setPlayheadTime(0); };
      src.start();
      sourceNodeRef.current = src;
      setIsPlaying(true);
    } catch {
      showToast('Preview failed — try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── MODIFIED: Download — format-aware ─────────────
  const handleDownload = async () => {
    if (!audioBuffer) return;
    setIsProcessing(true);
    try {
      const result = await renderProcessed();
      if (!result) return;
      const blob = encodeBuffer(result, saveFormat);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${selectedPersona}_${saveName || 'voice'}_p${pitch}_t${tempo.toFixed(2)}.${saveFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded as .${saveFormat.toUpperCase()} ✅`);
    } catch {
      showToast('Export failed — try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── MODIFIED: Save — format-aware ─────────────────
  const handleSaveLocal = async () => {
    if (!audioBuffer) return;
    setIsSaving(true);
    try {
      const result   = await renderProcessed();
      if (!result) return;
      const blob     = encodeBuffer(result, saveFormat);
      const filename = `${saveName || 'voice'}_p${pitch > 0 ? '+' : ''}${pitch}_t${tempo.toFixed(2)}_${Date.now()}.${saveFormat}`;
      await dbSaveVoice({ persona: selectedPersona, filename, blob, size: blob.size, saved: new Date().toISOString() });
      showToast(`Saved: ${filename} ✅`);
      loadLocalLibrary();
    } catch {
      showToast('Save failed — try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Local Library (UNCHANGED) ─────────────────────
  const loadLocalLibrary = async () => {
    setIsLoadingLib(true);
    try {
      setLocalVoices(await dbLoadVoices(selectedPersona));
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
    } catch { showToast('Playback failed', 'error'); }
  };

  const downloadLocalVoice = (voice: LocalVoice) => {
    const url  = URL.createObjectURL(voice.blob);
    const a    = document.createElement('a');
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
    } catch { showToast('Delete failed', 'error'); }
  };

  // ── NEW: Merge clip handlers ───────────────────────
  const addMergeClip = async (file: File) => {
    try {
      const ab  = await file.arrayBuffer();
      const ctx = new AudioContext();
      const buf = await ctx.decodeAudioData(ab);
      await ctx.close();
      const id  = `clip_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      setMergeClips(prev => [...prev, { id, file, buffer: buf }]);
      const short = file.name.length > 34 ? file.name.slice(0, 31) + '…' : file.name;
      showToast(`Added: ${short} ✅`);
    } catch {
      showToast('Could not decode clip — try WAV or MP3.', 'error');
    }
  };

  const removeMergeClip = (id: string) =>
    setMergeClips(prev => prev.filter(c => c.id !== id));

  const playMergeClip = async (clip: MergeClip) => {
    try {
      const url   = URL.createObjectURL(clip.file);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch { showToast('Playback failed', 'error'); }
  };

  const handleMergeAll = () => {
    const all: AudioBuffer[] = [];
    if (audioBuffer) {
      // Always use the cut/trimmed version as slot 0 — not the full original
      const tS = trimStart;
      const tE = trimEnd ?? audioBuffer.duration;
      const needsSlice = tS > 0 || tE < audioBuffer.duration;
      all.push(needsSlice ? sliceBuffer(audioBuffer, tS, tE) : audioBuffer);
    }
    mergeClips.forEach(c => all.push(c.buffer));
    if (all.length < 2) {
      showToast('Need at least 2 clips to merge.', 'error');
      return;
    }
    try {
      const merged     = concatenateBuffers(all);
      const wav        = audioBufferToWav(merged);
      const mergedFile = new File([wav], `merged_${Date.now()}.wav`, { type: 'audio/wav' });
      setAudioBuffer(merged);
      setAudioFile(mergedFile);
      setSaveName(`${selectedPersona}_merged`);
      setTrimStart(0);
      setTrimEnd(null);
      setPlayheadTime(0);
      generateWaveform(merged);
      setMergeClips([]);
      showToast(`✅ Merged ${all.length} clips — ${merged.duration.toFixed(1)}s total`);
    } catch {
      showToast('Merge failed — try again.', 'error');
    }
  };

  useEffect(() => { loadLocalLibrary(); }, [selectedPersona]);

  // ── Computed labels ────────────────────────────────
  const pitchLabel   = pitch === 0   ? 'No change' : pitch < 0   ? `${pitch} st (deeper)` : `+${pitch} st (higher)`;
  const tempoLabel   = tempo === 1.0 ? 'No change' : tempo > 1   ? `×${tempo.toFixed(2)} faster` : `×${tempo.toFixed(2)} slower`;
  const busy         = isProcessing || isSaving;
  const duration     = audioBuffer?.duration ?? 0;
  const mergeTotal   = (audioBuffer?.duration ?? 0) + mergeClips.reduce((s, c) => s + c.buffer.duration, 0);

  // ── Render ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, padding: '80px 20px 40px 20px' }}>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
          padding: '14px 22px', borderRadius: '8px', fontWeight: '600', fontSize: '14px',
          backgroundColor: toast.type === 'success' ? '#10b981' : '#dc2626',
          color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', maxWidth: '360px'
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{
          backgroundColor: t.card, borderRadius: '8px', padding: '20px', marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#4c1d95' : '#7c3aed'}`, boxShadow: t.shadow
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: isDarkMode ? '#a78bfa' : '#7c3aed', margin: '0 0 4px 0' }}>
                🎙️ 3C Voice Studio
              </h1>
              <p style={{ color: t.muted, fontSize: '13px', margin: 0 }}>
                Upload · Record · Trim · Merge · Pitch · Tempo · Download · Save — Build your 3C persona voice library
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

              {/* ── Clock Carousel shortcut ── */}
              <a
                href="https://anica-blip.github.io/3c-clock-carousel/"
                target="_blank"
                rel="noopener noreferrer"
                title="Open 3C Clock Carousel — animate cards + mix audio"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px',
                  fontSize: '13px', fontWeight: '700',
                  backgroundColor: '#1d4ed8', color: 'white',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(29,78,216,0.35)',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                🎬 Clock Carousel
              </a>

              <div style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                backgroundColor: t.purpleBg, color: isDarkMode ? '#a78bfa' : '#7c3aed'
              }}>
                Designed and Built with ❤️ by Claude (Anthropic) × Chef Anica · 3C Thread To Success™
              </div>

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
                }}>
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Grid ── */}
        {/* minWidth: 0 on left cell prevents canvas from pushing out of 1fr */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '20px', alignItems: 'start' }}>

          {/* ═══ Left: Studio ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>

            {/* ── Voice Sample Card ── */}
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
                /* Empty state — upload / record */
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
                        backgroundColor: '#991b1b', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
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
                /* File loaded state */
                <div>
                  {/* File info row — filename truncated to prevent overflow */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>🎵</span>
                      <div style={{ minWidth: 0 }}>
                        {/* title attribute shows full name on hover */}
                        <div title={audioFile.name} style={{
                          fontWeight: '700', color: t.text, fontSize: '13px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {audioFile.name}
                        </div>
                        <div style={{ color: t.muted, fontSize: '11px' }}>
                          {audioBuffer
                            ? `${audioBuffer.duration.toFixed(1)}s · ${audioBuffer.sampleRate}Hz · ${audioBuffer.numberOfChannels === 1 ? 'Mono' : 'Stereo'}`
                            : 'Decoding…'}
                        </div>
                      </div>
                    </div>
                    {/* Record / Change buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
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

                  {/* Canvas wrapper — overflow: hidden keeps it in its lane */}
                  <div ref={canvasWrapRef} style={{ width: '100%', overflow: 'hidden', borderRadius: '6px' }}>
                    <canvas
                      ref={canvasRef}
                      height={80}
                      onClick={handleCanvasClick}
                      style={{
                        width: '100%', height: '80px', display: 'block',
                        backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                        cursor: 'crosshair', borderRadius: '6px'
                      }}
                    />
                  </div>

                  {/* Playhead time row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '700', fontFamily: 'monospace' }}>
                      ▶ {formatTime(playheadTime)}
                    </span>
                    <span style={{ fontSize: '10px', color: t.muted }}>click waveform to seek</span>
                    <span style={{ fontSize: '12px', color: t.muted, fontWeight: '700', fontFamily: 'monospace' }}>
                      / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Playhead time row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '700', fontFamily: 'monospace' }}>
                      {formatTime(playheadTime)}
                    </span>
                    <span style={{ fontSize: '10px', color: t.muted }}>
                      {trimEnd !== null && trimEnd < duration
                        ? `✂ Cut at ${formatTime(trimEnd)} — keeping ${formatTime(trimEnd)}`
                        : 'play → line moves → press CUT when right'}
                    </span>
                    <span style={{ fontSize: '12px', color: t.muted, fontWeight: '700', fontFamily: 'monospace' }}>
                      / {formatTime(duration)}
                    </span>
                  </div>

                  {/* ── Cut Workflow Transport ── */}
                  <div style={{
                    padding: '12px', borderRadius: '8px', marginBottom: '8px',
                    backgroundColor: t.cardAlt, border: `1px solid ${t.border}`
                  }}>

                    {/* State A — ready to position cut (no cut made yet, or after redo) */}
                    {!isRegionPlaying && (trimEnd === null || trimEnd >= duration) && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={async () => {
                            stopRegion();
                            cutModeRef.current = 'positioning';
                            await playRegion(trimStart, duration);
                          }}
                          disabled={!audioBuffer}
                          style={{
                            flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                            fontWeight: '800', fontSize: '14px', cursor: audioBuffer ? 'pointer' : 'not-allowed',
                            backgroundColor: audioBuffer ? '#10b981' : t.cardAlt,
                            color: audioBuffer ? 'white' : t.muted,
                            boxShadow: audioBuffer ? '0 4px 12px rgba(16,185,129,0.35)' : 'none',
                          }}>
                          ▶ PLAY
                        </button>
                      </div>
                    )}

                    {/* State B — playing for cut positioning → show CUT button */}
                    {isRegionPlaying && cutModeRef.current === 'positioning' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            const cutAt = parseFloat(playheadTime.toFixed(1));
                            stopRegion();
                            setTrimEnd(clamp(cutAt, trimStart + 0.1, duration));
                          }}
                          style={{
                            flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                            fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                            backgroundColor: '#dc2626', color: 'white',
                            boxShadow: '0 4px 12px rgba(220,38,38,0.4)',
                            animation: 'pulse 1s infinite',
                          }}>
                          ✂ CUT — stamp at {formatTime(playheadTime)}
                        </button>
                      </div>
                    )}

                    {/* State C — cut is set → show REPLAY and REDO */}
                    {!isRegionPlaying && trimEnd !== null && trimEnd < duration && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={async () => {
                            cutModeRef.current = 'replay';
                            await playRegion(trimStart, trimEnd!);
                          }}
                          disabled={!audioBuffer}
                          style={{
                            flex: 2, padding: '12px', borderRadius: '8px', border: 'none',
                            fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                            backgroundColor: '#7c3aed', color: 'white',
                            boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
                          }}>
                          ▶ REPLAY — hear {formatTime(trimStart)} → {formatTime(trimEnd!)}
                        </button>
                        <button
                          onClick={() => {
                            stopRegion();
                            setTrimEnd(null);
                            setPlayheadTime(0);
                          }}
                          style={{
                            flex: 1, padding: '12px', borderRadius: '8px',
                            border: `1px solid ${t.border}`, fontWeight: '700', fontSize: '13px',
                            cursor: 'pointer', backgroundColor: t.card, color: t.muted,
                          }}>
                          ↺ REDO
                        </button>
                      </div>
                    )}

                    {/* State D — replaying cut → show STOP */}
                    {isRegionPlaying && cutModeRef.current === 'replay' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={stopRegion}
                          style={{
                            flex: 2, padding: '12px', borderRadius: '8px', border: 'none',
                            fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                            backgroundColor: '#f59e0b', color: 'white',
                            boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
                          }}>
                          ⏹ STOP
                        </button>
                        <button
                          onClick={() => {
                            stopRegion();
                            setTrimEnd(null);
                            setPlayheadTime(0);
                          }}
                          style={{
                            flex: 1, padding: '12px', borderRadius: '8px',
                            border: `1px solid ${t.border}`, fontWeight: '700', fontSize: '13px',
                            cursor: 'pointer', backgroundColor: t.card, color: t.muted,
                          }}>
                          ↺ REDO
                        </button>
                      </div>
                    )}

                    {/* Hint */}
                    <p style={{ margin: '10px 0 0 0', fontSize: '10px', color: t.muted, lineHeight: '1.6' }}>
                      {trimEnd !== null && trimEnd < duration
                        ? `✅ Keeping first ${formatTime(trimEnd)} · discarding ${formatTime(trimEnd)} → ${formatTime(duration)} · happy? go to Clip Merger below`
                        : '▶ PLAY → line moves as audio plays → press ✂ CUT exactly when you want it to stop → ▶ REPLAY to verify → ↺ REDO if wrong'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Clip Merger Card ── */}
            <div style={{ backgroundColor: t.card, borderRadius: '8px', padding: '20px', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: t.muted, margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    🔀 Clip Merger
                  </p>
                  <p style={{ fontSize: '11px', color: t.muted, margin: 0 }}>
                    Main file is slot 0 · extras append in order
                  </p>
                </div>
                <label style={{
                  padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                  fontWeight: '700', backgroundColor: '#7c3aed', color: 'white', flexShrink: 0
                }}>
                  + Add Clip
                  <input type="file" accept="audio/*" multiple style={{ display: 'none' }}
                    onChange={e => {
                      Array.from(e.target.files ?? []).forEach(f => addMergeClip(f));
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {/* Clip list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>

                {/* Slot 0 — main file (fixed) */}
                {audioBuffer ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                    borderRadius: '6px', border: `1px solid ${isDarkMode ? 'rgba(124,58,237,0.4)' : '#c4b5fd'}`,
                    backgroundColor: isDarkMode ? 'rgba(124,58,237,0.12)' : '#ede9fe'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#a78bfa', minWidth: '18px' }}>0</span>
                    <span style={{ fontSize: '12px', color: t.text, fontWeight: '600', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={audioFile?.name}>
                      📌 {audioFile?.name ?? 'Recorded audio'}
                    </span>
                    <span style={{ fontSize: '11px', color: t.muted, flexShrink: 0 }}>{audioBuffer.duration.toFixed(1)}s</span>
                  </div>
                ) : null}

                {/* Additional clips */}
                {mergeClips.map((clip, idx) => (
                  <div key={clip.id} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                    borderRadius: '6px', backgroundColor: t.cardAlt, border: `1px solid ${t.border}`
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: t.muted, minWidth: '18px' }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: '12px', color: t.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={clip.file.name}>
                      {clip.file.name}
                    </span>
                    <span style={{ fontSize: '11px', color: t.muted, flexShrink: 0 }}>{clip.buffer.duration.toFixed(1)}s</span>
                    <button onClick={() => playMergeClip(clip)} title="Preview clip"
                      style={{
                        padding: '3px 8px', borderRadius: '4px', border: 'none', fontSize: '11px',
                        backgroundColor: '#7c3aed', color: 'white', cursor: 'pointer', flexShrink: 0
                      }}>▶</button>
                    <button onClick={() => removeMergeClip(clip.id)} title="Remove clip"
                      style={{
                        padding: '3px 8px', borderRadius: '4px', border: 'none', fontSize: '11px',
                        backgroundColor: '#dc2626', color: 'white', cursor: 'pointer', flexShrink: 0
                      }}>🗑</button>
                  </div>
                ))}

                {!audioBuffer && mergeClips.length === 0 && (
                  <p style={{ color: t.muted, fontSize: '12px', textAlign: 'center', padding: '16px 0', margin: 0 }}>
                    Load a main file above, then add extra clips here to stitch them in sequence.
                  </p>
                )}
              </div>

              {/* Merge button — only show when there's something to merge */}
              {mergeClips.length > 0 && (
                <button
                  onClick={handleMergeAll}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                    fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: '#0891b2', color: 'white',
                    boxShadow: '0 4px 12px rgba(8,145,178,0.3)', marginBottom: '10px'
                  }}
                >
                  🔀 Merge All into Main
                  {mergeTotal > 0 && (
                    <span style={{ fontWeight: '400', fontSize: '12px', marginLeft: '8px', opacity: 0.85 }}>
                      ({mergeTotal.toFixed(1)}s combined)
                    </span>
                  )}
                </button>
              )}

              <p style={{ fontSize: '11px', color: t.muted, margin: 0, lineHeight: '1.6' }}>
                💡 <strong>ElevenLabs fix:</strong> If it mispronounces a name, generate two separate clips — cut around the error, record the correct pronunciation, then merge them here. No re-generation needed.
              </p>
            </div>

            {/* ── Voice Controls Card ── */}
            <div style={{ backgroundColor: t.card, borderRadius: '8px', padding: '24px', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: t.muted, margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Voice Controls — SoundTouch Engine
              </p>
              <p style={{ fontSize: '11px', color: t.muted, margin: '0 0 20px 0' }}>
                Optional — leave both at default to save instantly without any processing.
              </p>

              {/* Pitch slider */}
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

              {/* Tempo slider */}
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

              {/* Applied summary */}
              <div style={{
                padding: '14px 16px', borderRadius: '8px', marginBottom: '20px',
                backgroundColor: t.cardAlt, border: `1px solid ${t.border}`
              }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: t.muted, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Applied to output
                </p>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: t.muted, marginBottom: '2px' }}>Pitch shift</div>
                    <div style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>
                      {pitch === 0 ? '— none' : `${pitch > 0 ? '+' : ''}${pitch} st`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: t.muted, marginBottom: '2px' }}>Tempo</div>
                    <div style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>
                      {tempo === 1.0 ? '— none' : `×${tempo.toFixed(2)}`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: t.muted, marginBottom: '2px' }}>Trim region</div>
                    <div style={{ fontWeight: '700', color: t.text, fontSize: '14px' }}>
                      {trimStart === 0 && trimEnd === null
                        ? '— full file'
                        : `${trimStart.toFixed(1)}s → ${(trimEnd ?? duration).toFixed(1)}s`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: t.muted, marginBottom: '2px' }}>Processing</div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: pitch === 0 && tempo === 1.0 ? '#10b981' : '#f59e0b' }}>
                      {pitch === 0 && tempo === 1.0 ? '⚡ Instant (bypass)' : '⚙️ SoundTouch'}
                    </div>
                  </div>
                </div>
              </div>

              {/* File name */}
              <div style={{ marginBottom: '16px' }}>
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

              {/* ── Save Format Selector ── */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '700', color: t.text, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Save Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(['mp3', 'wav'] as const).map(fmt => (
                    <button key={fmt} onClick={() => setSaveFormat(fmt)}
                      style={{
                        padding: '12px 10px', borderRadius: '8px', fontWeight: '700', fontSize: '13px',
                        cursor: 'pointer', transition: 'all 0.2s',
                        border: `2px solid ${saveFormat === fmt
                          ? (fmt === 'mp3' ? '#f59e0b' : '#3b82f6')
                          : t.border}`,
                        backgroundColor: saveFormat === fmt
                          ? (fmt === 'mp3' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)')
                          : t.cardAlt,
                        color: saveFormat === fmt
                          ? (fmt === 'mp3' ? '#f59e0b' : '#3b82f6')
                          : t.muted,
                      }}>
                      <div>{fmt === 'mp3' ? '🎵 .MP3' : '🔊 .WAV'}</div>
                      <div style={{ fontSize: '10px', fontWeight: '400', marginTop: '3px', opacity: 0.8 }}>
                        {fmt === 'mp3' ? 'Canva · web-ready · 128kbps' : 'Lossless · max quality'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <button onClick={handlePreview} disabled={!audioBuffer || busy}
                  style={{
                    padding: '14px 8px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px',
                    cursor: (audioBuffer && !busy) ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                    backgroundColor: !audioBuffer ? t.cardAlt : isPlaying ? '#dc2626' : isProcessing ? '#6d28d9' : '#7c3aed',
                    color: audioBuffer ? 'white' : t.muted,
                    boxShadow: audioBuffer ? '0 4px 12px rgba(124,58,237,0.3)' : 'none'
                  }}>
                  {isProcessing && !isPlaying ? '⏳ Rendering…' : isPlaying ? '⏹ Stop' : '▶ Preview'}
                </button>

                <button onClick={handleDownload} disabled={!audioBuffer || busy}
                  style={{
                    padding: '14px 8px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px',
                    cursor: (audioBuffer && !busy) ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                    backgroundColor: (audioBuffer && !busy) ? '#0891b2' : t.cardAlt,
                    color: (audioBuffer && !busy) ? 'white' : t.muted,
                    boxShadow: (audioBuffer && !busy) ? '0 4px 12px rgba(8,145,178,0.3)' : 'none'
                  }}>
                  {isProcessing ? '⏳…' : `⬇ .${saveFormat.toUpperCase()}`}
                </button>

                <button onClick={handleSaveLocal} disabled={!audioBuffer || busy}
                  style={{
                    padding: '14px 8px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px',
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

          {/* ═══ Right: Local Voice Library (UNCHANGED) ═══ */}
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
