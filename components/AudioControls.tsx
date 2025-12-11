import React from 'react';

interface AudioControlsProps {
  volume: number;
  setVolume: (val: number) => void;
  muted: boolean;
  setMuted: (val: boolean) => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({ volume, setVolume, muted, setMuted }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-slate-900/50 backdrop-blur-md p-3 rounded-full border border-slate-700 shadow-xl transition-opacity hover:bg-slate-900/80 group">
      <button 
        onClick={() => setMuted(!muted)}
        className="text-white hover:text-yellow-400 transition-colors focus:outline-none"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="1" y1="1" x2="23" y2="23"></line><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        )}
      </button>

      <div className="w-0 overflow-hidden group-hover:w-24 transition-all duration-300 ease-out flex items-center">
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-24 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-yellow-400"
          aria-label="Volume"
        />
      </div>
    </div>
  );
};

export default AudioControls;