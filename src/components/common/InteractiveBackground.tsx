import { useEffect, useRef, useState } from 'react';

interface FloatingBlob {
  id: number;
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  hue: number;
}

export default function InteractiveBackground() {
  const [blobs, setBlobs] = useState<FloatingBlob[]>([]);

  useEffect(() => {
    // 떠다니는 블롭들 초기화
    const initialBlobs: FloatingBlob[] = [];
    const colors = [0, 30, 60, 90]; // 다양한 hue 값

    for (let i = 0; i < 5; i++) {
      initialBlobs.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 300 + 200,
        dx: (Math.random() - 0.5) * 0.2,
        dy: (Math.random() - 0.5) * 0.2,
        hue: colors[i % colors.length],
      });
    }
    setBlobs(initialBlobs);
  }, []);

  useEffect(() => {
    // 블롭 애니메이션
    let animationId: number;

    const animateBlobs = () => {
      setBlobs((prev) =>
        prev.map((blob) => {
          let newX = blob.x + blob.dx;
          let newY = blob.y + blob.dy;

          // 경계 체크
          if (newX < -blob.size / 2) newX = window.innerWidth + blob.size / 2;
          if (newX > window.innerWidth + blob.size / 2) newX = -blob.size / 2;
          if (newY < -blob.size / 2) newY = window.innerHeight + blob.size / 2;
          if (newY > window.innerHeight + blob.size / 2) newY = -blob.size / 2;

          return {
            ...blob,
            x: newX,
            y: newY,
          };
        })
      );

      animationId = requestAnimationFrame(animateBlobs);
    };

    animateBlobs();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <>
      {/* 정적 배경 이미지 */}
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
          filter: 'grayscale(100%)',
        }}
      />

      {/* 오버레이 패턴 */}
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(45, 45, 45, 0.02) 2px,
            rgba(45, 45, 45, 0.02) 4px
          )`,
        }}
      />

      {/* 떠다니는 블롭들 (더 subtle하게) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {blobs.map((blob) => (
          <div
            key={blob.id}
            className="absolute"
            style={{
              left: `${blob.x}px`,
              top: `${blob.y}px`,
              width: `${blob.size}px`,
              height: `${blob.size}px`,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle at 30% 30%,
                hsla(${blob.hue}, 0%, 25%, 0.03) 0%,
                hsla(${blob.hue}, 0%, 20%, 0.015) 40%,
                transparent 70%)`,
              filter: 'blur(60px)',
              transition: 'none',
            }}
          />
        ))}
      </div>
    </>
  );
}
