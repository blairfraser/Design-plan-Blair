/**
 * Audio service to generate sounds procedurally using Web Audio API.
 * Includes ambient loops, interaction sounds, and celebration music.
 * Now supports Master Volume control.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientNodes: AudioNode[] = [];
let isAmbientPlaying = false;
let currentVolume = 0.5; // Default volume
let isMuted = false;

// Initialize or get context with Master Gain
export const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = isMuted ? 0 : currentVolume;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
};

// Helper to get the destination node (Master Gain)
const getOutputNode = (): AudioNode | null => {
    getAudioContext();
    return masterGain;
};

export const setMasterVolume = (val: number) => {
    currentVolume = val;
    if (masterGain && !isMuted) {
        masterGain.gain.setTargetAtTime(val, audioCtx!.currentTime, 0.1);
    }
};

export const toggleMute = (muted: boolean) => {
    isMuted = muted;
    if (masterGain) {
        const target = muted ? 0 : currentVolume;
        masterGain.gain.setTargetAtTime(target, audioCtx!.currentTime, 0.1);
    }
};

// Must be called on user interaction to unlock audio
export const resumeAudio = async () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
};

export const startAmbient = () => {
  const ctx = getAudioContext();
  const output = getOutputNode();
  if (!ctx || !output || isAmbientPlaying) return;
  isAmbientPlaying = true;
  
  const now = ctx.currentTime;
  
  // Calm, serene drone (C Major 9, lower octave for warmth)
  // C3, G3, B3, E4, G4
  const freqs = [130.81, 196.00, 246.94, 329.63, 392.00]; 
  
  freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Pure sine waves for calmness
      osc.type = 'sine';
      osc.frequency.value = f;
      // Slight detune for richness/chorus effect, very subtle
      osc.detune.value = Math.random() * 4 - 2;
      
      gain.gain.setValueAtTime(0, now);
      // Very slow fade in
      gain.gain.linearRampToValueAtTime(0.03, now + 3 + i * 0.5);
      
      // Add subtle LFO for gentle movement (breathing effect)
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.1 + Math.random() * 0.2; // Very slow LFO
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.01; // Subtle modulation
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      osc.connect(gain);
      gain.connect(output);
      osc.start();
      
      ambientNodes.push(osc, gain, lfo, lfoGain);
  });
};

export const stopAmbient = () => {
  if (!isAmbientPlaying) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  
  ambientNodes.forEach(n => {
      if (n instanceof GainNode) {
          try {
            n.gain.cancelScheduledValues(now);
            n.gain.linearRampToValueAtTime(0, now + 2); // Slow fade out
          } catch(e) {}
      } else if (n instanceof OscillatorNode) {
          try {
             n.stop(now + 2.1);
          } catch(e) {}
      }
  });
  
  // Clear array after fade out
  setTimeout(() => {
      ambientNodes = [];
      isAmbientPlaying = false;
  }, 2200);
};

export const playUnwrapSound = () => {
  const ctx = getAudioContext();
  const output = getOutputNode();
  if (!ctx || !output) return;
  const t = ctx.currentTime;

  // 1. Friction/Slide (Filtered Noise)
  const bufferSize = ctx.sampleRate * 0.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 800;
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, t);
  noiseGain.gain.linearRampToValueAtTime(0.8, t + 0.1);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
  
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(output);
  noise.start();

  // 2. The Pop (Pitch drop sine)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(300, t + 0.1);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
  
  gain.gain.setValueAtTime(0, t + 0.1);
  gain.gain.linearRampToValueAtTime(0.8, t + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
  
  osc.connect(gain);
  gain.connect(output);
  osc.start(t + 0.1);
  osc.stop(t + 0.4);
};

export const playCelebrationSequence = () => {
  const ctx = getAudioContext();
  const output = getOutputNode();
  if (!ctx || !output) return;
  const t = ctx.currentTime;

  // REMOVED: Melody (conflicted with YouTube music)
  
  // --- Crowd Cheer (Pink Noise Swell) ---
  const bSize = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, bSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  // Pink noise approximation
  let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
  for(let i=0; i<bSize; i++) {
     const white = Math.random() * 2 - 1;
     b0 = 0.99886 * b0 + white * 0.0555179;
     b1 = 0.99332 * b1 + white * 0.0750759;
     b2 = 0.96900 * b2 + white * 0.1538520;
     b3 = 0.86650 * b3 + white * 0.3104856;
     b4 = 0.55000 * b4 + white * 0.5329522;
     b5 = -0.7616 * b5 - white * 0.0168980;
     d[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
     d[i] *= 0.11; 
     b6 = white * 0.115926;
  }
  
  const n = ctx.createBufferSource();
  n.buffer = buf;
  const nf = ctx.createBiquadFilter();
  nf.type = 'lowpass';
  nf.frequency.setValueAtTime(500, t);
  nf.frequency.linearRampToValueAtTime(3000, t + 2); // Filter opens up with excitement
  
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(0.5, t + 0.5);
  ng.gain.exponentialRampToValueAtTime(0.01, t + 4);
  
  n.connect(nf);
  nf.connect(ng);
  ng.connect(output);
  n.start();
};

export const playFireworkLaunch = () => {
    const ctx = getAudioContext();
    const output = getOutputNode();
    if(!ctx || !output) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t+0.4);
    g.gain.setValueAtTime(0.05, t);
    g.gain.linearRampToValueAtTime(0, t+0.4);
    osc.connect(g); g.connect(output);
    osc.start(); osc.stop(t+0.4);
};

export const playExplosion = () => {
    const ctx = getAudioContext();
    const output = getOutputNode();
    if(!ctx || !output) return;
    const t = ctx.currentTime;
    const bSize = ctx.sampleRate * 1;
    const buf = ctx.createBuffer(1, bSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0; i<bSize; i++) d[i] = Math.random()*2-1;
    
    const n = ctx.createBufferSource(); n.buffer=buf;
    const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(400, t);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.01, t+1);
    n.connect(f); f.connect(g); g.connect(output);
    n.start();
};