import type { Zone } from '../../lib/types';

interface ZoneRowProps {
  zone: Zone;
}

const statusConfig = {
  healthy: { bar: 'bg-green-500', text: 'สุขภาพดี', bg: 'bg-green-50', textColor: 'text-green-700' },
  warning: { bar: 'bg-amber-500', text: 'เฝ้าระวัง', bg: 'bg-amber-50', textColor: 'text-amber-700' },
  critical: { bar: 'bg-red-500', text: 'วิกฤติ', bg: 'bg-red-50', textColor: 'text-red-700' },
};

export function ZoneRow({ zone }: ZoneRowProps) {
  const config = statusConfig[zone.status];
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-stone-800 truncate">{zone.zone_name}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.textColor}`}>
            {config.text}
          </span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${config.bar} transition-all duration-700`}
            style={{ width: `${zone.health_score * 100}%` }}
          />
        </div>
      </div>
      <span className="text-sm font-bold text-stone-700 w-10 text-right shrink-0">
        {Math.round(zone.health_score * 100)}
      </span>
    </div>
  );
}
