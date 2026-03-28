const C = {
  navy: '#0a0f1e',
  navyLight: '#121829',
  navyCard: '#1a2035',
  navyBorder: '#232e4a',
  red: '#ef4444',
  redDim: '#7f1d1d',
  cyan: '#06b6d4',
  cyanDim: '#0e4a57',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  white: '#f8fafc',
  gray: '#94a3b8',
  grayDark: '#334155',
  whatsapp: '#25D366',
};

export const SEVERITY_COLORS: Record<string, string> = {
  LOW: C.green,
  MEDIUM: C.yellow,
  HIGH: C.orange,
  CRITICAL: C.red,
};

export default C;
