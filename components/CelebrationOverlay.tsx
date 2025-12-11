import React, { useEffect, useRef } from 'react';
import { playExplosion, playFireworkLaunch } from '../services/audioService';

interface CelebrationOverlayProps {
  active: boolean;
  intensity: number; // 0.0 to 2.0 (or higher)
}

// Helper classes for the visual effects
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;

  constructor(x: number, y: number, color: string, isFirework: boolean) {
    this.x = x;
    this.y = y;
    this.color = color;
    if (isFirework) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = Math.random() * 3 + 1;
      this.decay = 0.015 + Math.random() * 0.01;
    } else {
        // Confetti
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = Math.random() * -10 - 5; // Upward initial burst
        this.size = Math.random() * 8 + 4;
        this.decay = 0.005;
    }
    this.alpha = 1;
  }

  update(gravity: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += gravity;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Rocket {
  x: number;
  y: number;
  vy: number;
  color: string;
  exploded: boolean;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = canvasHeight;
    this.vy = Math.random() * -5 - 10; // Launch speed
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.exploded = false;
  }

  update() {
    this.y += this.vy;
    this.vy += 0.15; // Gravity
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Trail
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(this.x - 1, this.y, 2, 10);
  }
}

class FloatingHead {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  image: HTMLImageElement;

  constructor(width: number, height: number, image: HTMLImageElement) {
    this.image = image;
    // Random size between 50px and 120px
    this.size = Math.random() * 70 + 50; 
    
    this.x = Math.random() * (width - this.size);
    this.y = Math.random() * (height - this.size);
    
    // Random velocity
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3;
    
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
  }

  update(width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    // Bounce off walls
    if (this.x <= 0) {
      this.x = 0;
      this.vx *= -1;
    } else if (this.x + this.size >= width) {
      this.x = width - this.size;
      this.vx *= -1;
    }

    if (this.y <= 0) {
      this.y = 0;
      this.vy *= -1;
    } else if (this.y + this.size >= height) {
      this.y = height - this.size;
      this.vy *= -1;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Only draw if loaded
    if (!this.image.complete || this.image.naturalWidth === 0) return;

    ctx.save();
    ctx.globalAlpha = 1; // Ensure heads are fully opaque
    
    // Move to center of image
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(this.rotation);
    
    // Create circular clip for the head
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    ctx.closePath();
    
    // Add a nice white border
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();
    
    ctx.clip();

    // Draw the image centered
    ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
    
    ctx.restore();
  }
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ active, intensity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);

  // Keep ref updated without re-triggering effect
  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let rockets: Rocket[] = [];
    let heads: FloatingHead[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Load the image
    const mateoImage = new Image();
    mateoImage.src = './mateo.png';

    const initHeads = () => {
        heads = [];
        // Spawn 15 floating heads
        for (let i = 0; i < 15; i++) {
            heads.push(new FloatingHead(width, height, mateoImage));
        }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // Re-init heads on resize to keep them in bounds
      initHeads();
    };
    window.addEventListener('resize', resize);
    resize();

    // Initial Confetti Burst
    const createConfettiBurst = () => {
        for(let i=0; i<150; i++) {
            const x = width / 2;
            const y = height / 2 + 100; 
            const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            particles.push(new Particle(x, y, color, false));
        }
    };
    createConfettiBurst();

    let ticker = 0;

    const loop = () => {
      // Trail effect background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; 
      ctx.fillRect(0, 0, width, height);
      
      ticker++;

      // 1. Update and Draw Floating Heads (Draw first so they are slightly "behind" bright explosions)
      heads.forEach(head => {
          head.update(width, height);
          head.draw(ctx);
      });

      // 2. Launch rockets based on intensity
      const chance = 0.05 * intensityRef.current;
      
      if (Math.random() < chance) {
        rockets.push(new Rocket(width, height));
        if (Math.random() > 0.5) playFireworkLaunch();
      }

      // 3. Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw(ctx);

        if (r.vy >= -1 && !r.exploded) {
           r.exploded = true;
           playExplosion();
           rockets.splice(i, 1);
           
           const particleCount = 50 + (intensityRef.current * 20);
           for(let j=0; j<particleCount; j++) {
             particles.push(new Particle(r.x, r.y, r.color, true));
           }
        } else if (r.y > height) {
           rockets.splice(i, 1);
        }
      }

      // 4. Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(0.1); 
        p.draw(ctx);
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]); 

  if (!active) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
    />
  );
};

export default CelebrationOverlay;