import { motion } from 'framer-motion';

export function ECGAnimation({ severity = 'LOW' }: { severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }) {
  const colors = {
    LOW: '#22c55e',
    MEDIUM: '#eab308',
    HIGH: '#f97316',
    CRITICAL: '#ef4444'
  };

  const durations = {
    LOW: 2.5,
    MEDIUM: 1.8,
    HIGH: 1.0,
    CRITICAL: 0.5
  };

  const color = colors[severity];
  const duration = durations[severity];

  return (
    <div className="w-full h-16 overflow-hidden relative flex items-center justify-center opacity-80">
      <svg 
        viewBox="0 0 500 100" 
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 0,50 L 100,50 L 115,20 L 130,80 L 145,10 L 160,90 L 175,50 L 325,50 L 340,20 L 355,80 L 370,10 L 385,90 L 400,50 L 500,50"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1],
            opacity: [0, 1, 1, 0] 
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`
          }}
        />
      </svg>
    </div>
  );
}
