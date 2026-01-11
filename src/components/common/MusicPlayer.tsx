import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function MusicPlayer() {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  // 시티팝 곡들 (YouTube Video IDs)
  const cityPopTracks = [
    'yADrtfAmLAw', // Mariya Takeuchi - Plastic Love
    '9Gj47G2e1Jc', // Tatsuro Yamashita - Ride on Time
    '3bNITQR4Uso', // Anri - Last Summer Whisper
    'PvUaqty72Nc', // Yurie Kokubu - HORIZON
    'kvLlIJ-vJzA', // Junko Yagami - Bay City
    '8kVEMbt_yLM', // Toshiki Kadomatsu - Airport Lady
    'uUfJzoOZqgU', // Miki Matsubara - Mayonaka no Door
    'Fe1EbdBoHGI', // Meiko Nakahara - Fantasy
  ];

  useEffect(() => {
    // YouTube IFrame API 로드
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const initPlayer = () => {
    const randomIndex = Math.floor(Math.random() * cityPopTracks.length);
    setCurrentTrack(randomIndex);

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: cityPopTracks[randomIndex],
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            playNext();
          }
        },
      },
    });
  };

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!playerRef.current) return;

    const nextIndex = (currentTrack + 1) % cityPopTracks.length;
    setCurrentTrack(nextIndex);
    playerRef.current.loadVideoById(cityPopTracks[nextIndex]);
    playerRef.current.playVideo();
  };

  const playRandom = () => {
    if (!playerRef.current) return;

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * cityPopTracks.length);
    } while (randomIndex === currentTrack && cityPopTracks.length > 1);

    setCurrentTrack(randomIndex);
    playerRef.current.loadVideoById(cityPopTracks[randomIndex]);
    playerRef.current.playVideo();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white border border-border rounded-lg shadow-lg p-4 w-64">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-sans text-text font-semibold">City Pop</span>
        </div>

        <div className="text-[10px] text-muted mb-4 font-sans">
          Track {currentTrack + 1} of {cityPopTracks.length}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={playRandom}
            className="w-9 h-9 rounded-lg bg-card border border-border hover:bg-hover transition-all flex items-center justify-center"
            title="Random"
          >
            <svg className="w-4 h-4 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h7l5 5 5-5h2v2l-5 5 5 5v2h-2l-5-5-5 5H4v-2l5-5-5-5V4z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-text text-white hover:bg-text/90 transition-all flex items-center justify-center shadow-md"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={playNext}
            className="w-9 h-9 rounded-lg bg-card border border-border hover:bg-hover transition-all flex items-center justify-center"
            title="Next"
          >
            <svg className="w-4 h-4 text-text" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>
      <div id="youtube-player" style={{ display: 'none' }}></div>
    </div>
  );
}
