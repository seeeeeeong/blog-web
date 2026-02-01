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
  const [playerReady, setPlayerReady] = useState(false);
  const errorCountRef = useRef(0);

  // Lo-fi Hip Hop 곡들 (YouTube Video IDs - 임베드 허용 확인됨)
  const lofiTracks = [
    'jfKfPfyJRdk', // Lofi Girl - lofi hip hop radio
    '5qap5aO4i9A', // Chillhop Music - lofi hip hop radio
    'lTRiuFIWV54', // Chillhop - lofi hip hop mix
    'DWcJFNfaw9c', // Lofi Girl - beats to study/relax
    '7NOSDKb0HlU', // Chill Study Beats
    'rUxyKA_-grg', // Lofi Hip Hop Mix
    'f02mOEt11OQ', // Chillhop Essentials
    'bebuiaSKtU4', // Lofi Fruits Music
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
    const randomIndex = Math.floor(Math.random() * lofiTracks.length);
    setCurrentTrack(randomIndex);

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: lofiTracks[randomIndex],
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event: any) => {
          setPlayerReady(true);
          event.target.setVolume(50); // 볼륨을 50%로 설정
          errorCountRef.current = 0; // 에러 카운터 초기화
          console.log('YouTube Player is ready');
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            errorCountRef.current = 0; // 재생 성공 시 에러 카운터 초기화
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            playNext();
          }
        },
        onError: (event: any) => {
          console.error('YouTube Player Error:', event.data, '(Error 150: Video cannot be embedded)');
          errorCountRef.current += 1;

          // 연속 3번 이상 에러 발생 시 멈춤
          if (errorCountRef.current >= 3) {
            console.error('Too many consecutive errors. Stopping playback.');
            setIsPlaying(false);
            return;
          }

          // 에러 발생 시 다음 곡으로
          playNext();
        },
      },
    });
  };

  const togglePlay = () => {
    if (!playerRef.current || !playerReady) {
      console.log('Player not ready yet');
      return;
    }

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!playerRef.current || !playerReady) return;

    const nextIndex = (currentTrack + 1) % lofiTracks.length;
    setCurrentTrack(nextIndex);
    playerRef.current.loadVideoById(lofiTracks[nextIndex]);
    playerRef.current.playVideo();
  };

  const playRandom = () => {
    if (!playerRef.current || !playerReady) return;

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * lofiTracks.length);
    } while (randomIndex === currentTrack && lofiTracks.length > 1);

    setCurrentTrack(randomIndex);
    playerRef.current.loadVideoById(lofiTracks[randomIndex]);
    playerRef.current.playVideo();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white border border-border rounded-lg shadow-lg p-4 w-64">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${playerReady ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
          <span className="text-xs font-sans text-text font-semibold">
            Lo-fi Beats {!playerReady && '(Loading...)'}
          </span>
        </div>

        <div className="text-[10px] text-muted mb-4 font-sans">
          Track {currentTrack + 1} of {lofiTracks.length}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={playRandom}
            disabled={!playerReady}
            className="w-9 h-9 rounded-lg bg-card border border-border hover:bg-hover transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Random"
          >
            <svg className="w-4 h-4 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h7l5 5 5-5h2v2l-5 5 5 5v2h-2l-5-5-5 5H4v-2l5-5-5-5V4z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            disabled={!playerReady}
            className="w-12 h-12 rounded-full bg-text text-white hover:bg-text/90 transition-all flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={!playerReady}
            className="w-9 h-9 rounded-lg bg-card border border-border hover:bg-hover transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
