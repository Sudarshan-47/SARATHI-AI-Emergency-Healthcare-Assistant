import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

interface AnimatedMicProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function AnimatedMic({ isListening, onClick, disabled }: AnimatedMicProps) {
  return (
    <div className="relative flex items-center justify-center w-32 h-32 my-8">
      {/* Outer pulsing rings when active */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring-delayed" />
        </>
      )}
      
      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10 w-20 h-20 rounded-full flex items-center justify-center
          shadow-xl transition-colors duration-300
          ${isListening 
            ? 'bg-primary text-white box-glow-primary' 
            : 'bg-card border border-white/10 text-accent hover:bg-card/80 hover:text-white'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Mic className={`w-8 h-8 ${isListening ? 'animate-pulse' : ''}`} />
      </motion.button>
    </div>
  );
}
