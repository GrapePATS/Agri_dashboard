import type { SeverityLevel } from '../../lib/types';

interface SeverityBadgeProps {
  severity: SeverityLevel;
}

// REDESIGN: low severity uses Surf Crest + Green Pea from palette; others keep semantic red/amber/yellow
const config: Record<SeverityLevel, { label: string; classes: string }> = {
  critical: { label: 'วิกฤติ', classes: 'bg-red-100 text-red-800 border border-red-200' },
  high: { label: 'สูง', classes: 'bg-amber-100 text-amber-800 border border-amber-200' },
  medium: { label: 'ปานกลาง', classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  low: { label: 'ต่ำ', classes: 'bg-[#d2e5d3] text-[#1d6233] border border-[#abd8c8]' },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { label, classes } = config[severity];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
