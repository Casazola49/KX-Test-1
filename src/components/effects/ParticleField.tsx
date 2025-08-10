'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Detectar dispositivos móviles y rendimiento
    const isMobile = window.innerWidth < 768;
    const isLowPerformance = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Desactivar en dispositivos de bajo rendimiento o si el usuario prefiere menos animaciones
    if (isLowPerformance || prefersReducedMotion) {
      return;
    }

    // Configurar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Crear partículas (menos en móviles)
    const createParticles = () => {
      const particles: Particle[] = [];
      const baseCount = isMobile ? 15 : 35; // Reducir significativamente en móviles
      const particleCount = Math.min(baseCount, Math.floor((canvas.width * canvas.height) / (isMobile ? 25000 : 15000)));

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5), // Movimiento más lento en móviles
          vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
          size: Math.random() * (isMobile ? 1.5 : 2) + 1, // Partículas más pequeñas en móviles
          opacity: Math.random() * 0.4 + 0.2, // Menos opacidad para mejor rendimiento
          color: `hsl(85, 100%, ${50 + Math.random() * 20}%)` // Verde lima con variaciones
        });
      }

      particlesRef.current = particles;
    };

    createParticles();

    // Animar partículas con optimización de rendimiento
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60; // FPS más bajo en móviles
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Actualizar posición
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Rebotar en los bordes
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Mantener dentro de los límites
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Dibujar partícula
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Conectar partículas cercanas (solo en desktop para mejor rendimiento)
        if (!isMobile) {
          const maxConnections = 3; // Limitar conexiones
          let connections = 0;

          for (let j = index + 1; j < particlesRef.current.length && connections < maxConnections; j++) {
            const other = particlesRef.current[j];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 80) { // Distancia más corta para menos líneas
              ctx.save();
              ctx.globalAlpha = (1 - distance / 80) * 0.15;
              ctx.strokeStyle = particle.color;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
              ctx.restore();
              connections++;
            }
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{ zIndex: 1 }}
    />
  );
}