import React, { useEffect, useRef } from 'react';

interface LocalAudioPlayerProps {
  src: string;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  loop?: boolean;
  onAudioReady?: (audio: HTMLAudioElement) => void;
}

const LocalAudioPlayer: React.FC<LocalAudioPlayerProps> = ({ 
  src, 
  isPlaying, 
  volume, 
  muted, 
  loop = false,
  onAudioReady 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
        // Direct volume assignment to keep it synced
        audioRef.current.volume = muted ? 0 : volume;
        
        // Pass ref back for imperative control if needed
        if (onAudioReady) {
            onAudioReady(audioRef.current);
        }
    }
  }, [volume, muted, onAudioReady]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // Attempt to play
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
            // This warning usually happens if the user didn't interact with the document first.
            // Our warmUpAudio() strategy in App.tsx prevents this, but we log it just in case.
            if (error.name !== 'AbortError') {
                 console.warn("Audio playback issue:", error);
            }
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <audio 
      ref={audioRef} 
      src={src} 
      loop={loop}
      playsInline
      style={{ display: 'none' }}
    />
  );
};

export default LocalAudioPlayer;