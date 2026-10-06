const C = {
  navy: '#F4F7F7',
  navyLight: '#EDF3F3',
  navyCard: '#FFFFFF',
  navyBorder: '#E2EAEB',
  red: '#B42318',
  redDim: '#FCEBE8',
  cyan: '#167D7B',
  cyanDim: '#E9F4F2',
  green: '#36836D',
  yellow: '#8A5B10',
  orange: '#A94E21',
  white: '#FFFFFF',
  ink: '#18313B',
  gray: '#526870',
  grayDark: '#788B91',
  whatsapp: '#25D366',
};

export const SEVERITY_COLORS: Record<string, string> = {
  LOW: C.green,
  MEDIUM: C.yellow,
  HIGH: C.orange,
  CRITICAL: C.red,
};

export default C;
