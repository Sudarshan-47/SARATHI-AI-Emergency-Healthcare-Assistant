import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

interface AnimatedMicProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function AnimatedMic({ isListening, onClick, disabled }: AnimatedMicProps) {
  return (
    <div className="relative flex h-10 items-center justify-center">
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-accent/15 animate-pulse-ring" />
          <div className="absolute inset-0 rounded-full bg-accent/15 animate-pulse-ring-delayed" />
        </>
      )}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={disabled}
        type="button"
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        aria-pressed={isListening}
        className={`
          relative z-10 flex h-10 w-10 items-center justify-center rounded-xl
          transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2
          ${isListening 
            ? 'bg-accent text-white shadow-sm' 
            : 'border border-accent/15 bg-accent/[.07] text-accent hover:bg-accent/15'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Mic className={`h-[18px] w-[18px] ${isListening ? 'animate-pulse' : ''}`} />
      </motion.button>
    </div>
  );
}
