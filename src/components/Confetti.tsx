import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ active, duration = 3000 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti pieces
    const pieces: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speed: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Create confetti pieces
    const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD'];
    for (let i = 0; i < 100; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -10,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 2 - 1
      });
    }

    // Animation
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        // Clear the canvas and hide it
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        return;
      }

      // Show canvas if it was hidden
      canvas.style.display = 'block';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach(piece => {
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
        ctx.restore();

        piece.y += piece.speed;
        piece.rotation += piece.rotationSpeed;

        if (piece.y > canvas.height) {
          piece.y = -10;
          piece.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      // Clear and hide canvas on cleanup
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    };
  }, [active, duration]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'none' // Start hidden
      }}
    />
  );
};

export default Confetti; 