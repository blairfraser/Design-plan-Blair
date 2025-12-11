import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface BackgroundMusicProps {
  videoId: string;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  onPlayerReady?: (player: any) => void;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ videoId, isPlaying, volume, muted, onPlayerReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load YouTube API if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const onPlayerStateChange = (event: any) => {
        // Optional: specific logic when video ends or buffers
    };

    const onReady = (event: any) => {
      const player = event.target;
      playerRef.current = player;
      
      // Set initial volume
      player.setVolume(muted ? 0 : volume * 100);
      
      // Pass instance back to parent for synchronous control (iOS requirement)
      if (onPlayerReady) {
        onPlayerReady(player);
      }

      // If already supposed to be playing (race condition handling)
      if (isPlaying) {
         player.playVideo();
      }
    };

    const initPlayer = () => {
      if (playerRef.current || !containerRef.current) return;
      
      // We must use a non-zero size for the player to ensure the browser allocates resources to it
      // We hide it visually using the container styles instead.
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'loop': 1,
          'playlist': videoId, // Required for loop to work
          'origin': window.location.origin, // Security best practice
          'autoplay': 0 // We control play manually
        },
        events: {
          'onReady': onReady,
          'onStateChange': onPlayerStateChange
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (existingCallback) existingCallback();
        initPlayer();
      };
    }

    return () => {
      // Keeping player instance alive is usually better for SPA performance
    };
  }, [videoId]);

  // Declarative Play/Pause fallback
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      if (isPlaying) {
        // We catch errors in case the player isn't fully ready or blocked
        try { playerRef.current.playVideo(); } catch(e) {}
      } else {
        try { playerRef.current.pauseVideo(); } catch(e) {}
      }
    }
  }, [isPlaying]);

  // Handle Volume/Mute updates
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(muted ? 0 : volume * 100);
      
      // Ensure mute state is strictly enforced
      if (muted) {
          playerRef.current.mute();
      } else {
          playerRef.current.unMute();
      }
    }
  }, [volume, muted]);

  return (
    <div className="absolute top-0 left-0 overflow-hidden opacity-0 pointer-events-none -z-50" style={{ width: '1px', height: '1px' }}>
        <div ref={containerRef}></div>
    </div>
  );
};

export default BackgroundMusic;