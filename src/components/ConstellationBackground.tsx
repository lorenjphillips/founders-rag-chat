
import { useEffect, useRef } from 'react';

const ConstellationBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars representing famous founders with enhanced properties
    const stars = Array.from({ length: 60 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.08 + 0.02,
      angle: Math.random() * Math.PI * 2,
      flickerSpeed: Math.random() * 0.05 + 0.02,
      flickerPhase: Math.random() * Math.PI * 2,
      baseOpacity: Math.random() * 0.6 + 0.3,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Check if flickering is enabled via CSS custom property
      const flickerEnabled = getComputedStyle(document.documentElement)
        .getPropertyValue('--constellation-flicker').trim() !== '0';
      
      // Draw connections between nearby stars
      stars.forEach((star, i) => {
        stars.slice(i + 1).forEach((otherStar) => {
          const distance = Math.sqrt(
            Math.pow(star.x - otherStar.x, 2) + Math.pow(star.y - otherStar.y, 2)
          );
          
          if (distance < 180) {
            const connectionOpacity = 0.15 * (1 - distance / 180);
            ctx.strokeStyle = `rgba(251, 191, 36, ${connectionOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(otherStar.x, otherStar.y);
            ctx.stroke();
          }
        });
      });

      // Draw and animate stars with optional flickering
      stars.forEach((star) => {
        let currentOpacity = star.baseOpacity;
        
        if (flickerEnabled) {
          // Calculate flickering opacity
          const flickerOffset = Math.sin(Date.now() * star.flickerSpeed + star.flickerPhase) * 0.3;
          currentOpacity = Math.max(0.1, Math.min(1, star.baseOpacity + flickerOffset));
        }
        
        ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity})`;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        ctx.shadowBlur = flickerEnabled ? 6 + Math.sin(Date.now() * star.flickerSpeed) * 2 : 6;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Enhanced floating motion with more dynamic movement
        star.y += Math.sin(star.angle) * star.speed;
        star.x += Math.cos(star.angle * 0.7) * star.speed * 0.8;
        star.angle += star.speed * 0.8;

        // Wrap around edges
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;

        // Gentle opacity variation for additional flickering
        if (flickerEnabled) {
          star.baseOpacity += (Math.random() - 0.5) * 0.01;
          star.baseOpacity = Math.max(0.2, Math.min(0.8, star.baseOpacity));
        }
      });

      requestAnimationFrame(animate);
    };

    // Initialize CSS custom property
    document.documentElement.style.setProperty('--constellation-flicker', '1');
    
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="constellation-bg"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: -1 
      }}
    />
  );
};

export default ConstellationBackground;
