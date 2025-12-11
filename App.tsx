import React, { useState, useEffect, useRef } from 'react';
import CelebrationOverlay from './components/CelebrationOverlay';
import AudioControls from './components/AudioControls';
import LocalAudioPlayer from './components/LocalAudioPlayer';
import SaaSForm from './components/SaaSForm';
import { 
  playCelebrationSequence, 
  resumeAudio, 
  setMasterVolume, 
  toggleMute, 
  startAmbient, 
  stopAmbient 
} from './services/audioService';

type AppState = 'form' | 'celebration';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('form');
  const [fireworkIntensity, setFireworkIntensity] = useState(0.5);
  
  // Lifted state for audio control
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  
  // Reference to the Audio player for synchronous playback
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  // Sync state with procedural audio service
  useEffect(() => {
    setMasterVolume(volume);
  }, [volume]);

  useEffect(() => {
    toggleMute(muted);
  }, [muted]);

  // Handle auto-starting ambient music on first interaction (since browsers block autoplay)
  useEffect(() => {
    const initAudio = async () => {
      // Only start ambient if we are still in the form state
      if (appState === 'form') {
        await resumeAudio();
        startAmbient();
      }
    };

    const handleInteraction = () => {
      initAudio();
      // Remove listeners so it doesn't trigger repeatedly
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    // Listen for any user interaction
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [appState]);

  // Critical: Unlocks audio on iOS/Android/Chrome by playing a silent snippet during the user's click event.
  const warmUpAudio = () => {
    // 1. Resume WebAudio Context
    resumeAudio();

    // 2. Unlock HTML5 Audio Element
    if (audioPlayerRef.current) {
        // We attempt to play and immediately pause. This "blesses" the element for future playback.
        const originalVolume = audioPlayerRef.current.volume;
        // Mute temporarily just in case
        audioPlayerRef.current.volume = 0;
        
        audioPlayerRef.current.play().then(() => {
            // Once play starts, immediately pause and reset
            audioPlayerRef.current?.pause();
            if (audioPlayerRef.current) {
               audioPlayerRef.current.currentTime = 0;
               audioPlayerRef.current.volume = originalVolume; // Restore volume preference
            }
        }).catch((e) => {
            console.warn("Audio warmup failed (likely no interaction yet):", e);
        });
    }
  };

  const handleFormSubmit = () => {
    // 1. Stop the calm background music
    stopAmbient();

    // 2. Play Audio Effects
    // Note: The main song playback is handled declaratively by LocalAudioPlayer via the `isPlaying` prop,
    // which works because we called `warmUpAudio` during the button click.
    playCelebrationSequence();
    
    // 3. Transition State
    setAppState('celebration');
  };

  // Dynamic Background Color
  const bgClass = appState === 'form' 
    ? 'bg-slate-50' 
    : 'bg-slate-900';

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center overflow-hidden relative select-none transition-colors duration-1000 ${bgClass}`}>
      
      {/* --- CELEBRATION MODE ELEMENTS --- */}
      
      {/* Background radial gradient only visible in celebration mode */}
      <div 
        className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 z-0 transition-opacity duration-1000 ${appState === 'celebration' ? 'opacity-100' : 'opacity-0'}`}
      ></div>

      {/* Audio Controls - Always available */}
      <AudioControls 
        volume={volume} 
        setVolume={setVolume} 
        muted={muted} 
        setMuted={setMuted} 
      />

      {/* Local Music Player - Replaces YouTube */}
      <LocalAudioPlayer 
        src="./birthday_song.mp3"
        isPlaying={appState === 'celebration'} 
        volume={volume} 
        muted={muted} 
        loop={true}
        onAudioReady={(player) => { audioPlayerRef.current = player; }}
      />

      {/* Celebration Effects (Canvas) */}
      <CelebrationOverlay 
        active={appState === 'celebration'} 
        intensity={fireworkIntensity}
      />

      {/* Floating Birthday Message */}
      {appState === 'celebration' && (
        <>
          <div className="absolute top-1/4 z-30 pointer-events-none w-full text-center px-4">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-cyan-400 animate-float-up drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
              Happy Birthday<br/>
              <span className="text-7xl md:text-9xl mt-4 block text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                Mateo!
              </span>
            </h1>
          </div>

          {/* Intensity Slider Control */}
          <div className="absolute bottom-12 z-40 flex flex-col items-center gap-2 bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-slate-700 animate-[floatUp_2s_ease-out_forwards]">
            <label htmlFor="intensity" className="text-white text-sm font-medium uppercase tracking-wider">
              Party Intensity
            </label>
            <div className="flex items-center gap-3">
               <span className="text-xs text-slate-400">Mild</span>
               <input 
                  id="intensity"
                  type="range" 
                  min="0.1" 
                  max="3.0" 
                  step="0.1" 
                  value={fireworkIntensity}
                  onChange={(e) => setFireworkIntensity(parseFloat(e.target.value))}
                  className="w-48 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-pink-500"
               />
               <span className="text-xs text-slate-400">Wild</span>
            </div>
          </div>
        </>
      )}

      {/* --- FORM MODE ELEMENTS --- */}
      {appState === 'form' && (
        <div className="relative z-10 w-full px-4 flex justify-center animate-[fadeIn_0.5s_ease-out]">
           <SaaSForm 
             onSubmit={handleFormSubmit} 
             onInteraction={warmUpAudio}
           />
        </div>
      )}

    </div>
  );
};

export default App;