import { AlertTriangle, AlertCircle, Info, ShieldCheck } from 'lucide-react';

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = {
    LOW: {
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/30',
      glow: '',
      icon: ShieldCheck,
      label: 'Low Risk'
    },
    MEDIUM: {
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      glow: '',
      icon: Info,
      label: 'Moderate'
    },
    HIGH: {
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/50',
      glow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]',
      icon: AlertCircle,
      label: 'High Risk'
    },
    CRITICAL: {
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive',
      glow: 'box-glow-primary animate-pulse',
      icon: AlertTriangle,
      label: 'EMERGENCY'
    }
  };

  const { color, bg, border, glow, icon: Icon, label } = config[severity];

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${bg} ${border} ${glow} transition-all duration-300`}>
      <Icon className={`w-5 h-5 ${color} ${severity === 'CRITICAL' ? 'animate-bounce' : ''}`} />
      <span className={`font-display font-bold tracking-wider ${color}`}>
        {label}
      </span>
    </div>
  );
}
