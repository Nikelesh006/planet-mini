import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
}

export function Confetti({ trigger, duration = 3000, particleCount = 50 }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5
      }));
      
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, duration, particleCount]);

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            opacity: 0, 
            scale: 0,
            x: "50%", 
            y: "50%",
            rotate: 0
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
            x: ["50%", `${50 + particle.x}%`, `${50 + particle.x * 1.5}%`],
            y: ["50%", `${50 + particle.y}%`, `${50 + particle.y * 2}%`],
            rotate: [0, 360, 720]
          }}
          transition={{ 
            duration: 2.5,
            delay: particle.delay,
            ease: "easeOut"
          }}
          className="fixed w-3 h-3 rounded-full z-50 pointer-events-none"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </AnimatePresence>
  );
}

export function useConfetti() {
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 100);
  };

  return {
    showConfetti,
    triggerConfetti
  };
}
