import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Detection } from '../../lib/types';

interface Props {
  detections: Detection[];
  showHeader?: boolean;
  compact?: boolean;
}

const typeEmoji: Record<string, string> = {
  disease: '🦠',
  pest: '🪲',
  weed: '🌿',
};

const typeThai: Record<string, string> = {
  disease: 'โรคพืช',
  pest: 'แมลงศัตรู',
  weed: 'วัชพืช',
};

// REDESIGN: keep red/amber/blue semantic severity; Surf Crest border on cards
const severityConfig: Record<string, { border: string; bg: string; badge: string; badgeText: string; label: string }> = {
  critical: {
    border: 'border-l-red-500',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'แจ้งเตือนด่วน',
    label: 'วิกฤติ',
  },
  high: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    badgeText: 'ระวัง',
    label: 'สูง',
  },
  medium: {
    border: 'border-l-blue-400',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    badgeText: 'ติดตาม',
    label: 'ปานกลาง',
  },
};

export function SmartAlertsSection({ detections, showHeader = true, compact = false }: Props) {
  const navigate = useNavigate();
  const urgent = detections
    .filter((d) => d.status === 'active')
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    })
    .slice(0, compact ? 3 : 4);

  return (
    <div className="px-4">
      {showHeader && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <p className="text-base font-bold text-stone-900">แจ้งเตือนด่วน</p>
            {urgent.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {urgent.length}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/detections')}
            className="text-[#1d6233] text-sm font-semibold flex items-center gap-0.5"
          >
            ดูทั้งหมด <ChevronRight size={14} />
          </button>
        </div>
      )}

      <div className={compact ? 'space-y-2' : 'space-y-2.5'}>
        {urgent.map((d) => {
          const cfg = severityConfig[d.severity] ?? severityConfig.medium;
          return (
            <button
              key={d.detection_id}
              onClick={() => navigate(`/detections/${d.detection_id}`)}
              className={`w-full text-left bg-white rounded-xl border-l-4 ${cfg.border} border border-[#d2e5d3] shadow-sm flex items-center gap-3 active:opacity-80 ${compact ? 'p-3' : 'p-4 rounded-2xl'}`}
            >
              <div className={`rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 ${compact ? 'w-9 h-9 text-lg' : 'w-12 h-12 text-2xl'}`}>
                {typeEmoji[d.type]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className={`font-bold text-stone-900 truncate ${compact ? 'text-xs' : 'text-sm'}`}>{d.label}</p>
                  <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                    {cfg.badgeText}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 truncate">
                  {typeThai[d.type]} · {d.zone_name.split('–')[0].trim()}
                </p>
                {!compact && (
                  <p className="text-xs text-stone-400 mt-1 leading-snug line-clamp-1">
                    คำแนะนำ AI: {d.recommendation}
                  </p>
                )}
              </div>

              <ChevronRight size={14} className="text-stone-300 shrink-0" />
            </button>
          );
        })}

        {urgent.length === 0 && (
          // REDESIGN: Panache bg + Surf Crest border on empty state
          <div className={`bg-[#e9f6eb] border border-[#d2e5d3] rounded-2xl text-center ${compact ? 'p-4' : 'p-5'}`}>
            <span className={compact ? 'text-2xl' : 'text-3xl'}>✅</span>
            <p className="text-[#1d6233] font-bold mt-1.5">ไม่มีการแจ้งเตือนเร่งด่วน</p>
            <p className="text-[#1d6233] text-xs mt-0.5 opacity-70">ฟาร์มอยู่ในสภาวะปกติ</p>
          </div>
        )}

        {/* REDESIGN: Solid Green Pea AI banner — LINE-like flat color */}
        <div className={`bg-[#1d6233] rounded-2xl flex items-center gap-3 ${compact ? 'p-3' : 'p-4 items-start'}`}>
          <span className={`shrink-0 ${compact ? 'text-base' : 'text-xl'}`}>🤖</span>
          <div className="min-w-0">
            {!compact && (
              <p className="text-[#abd8c8] text-[10px] font-semibold uppercase tracking-wide mb-1">
                คำแนะนำจาก AI
              </p>
            )}
            <p className={`text-white leading-snug ${compact ? 'text-xs line-clamp-2' : 'text-sm leading-relaxed'}`}>
              {urgent[0]?.recommendation ?? 'ฟาร์มอยู่ในสภาพดี ควรติดตามผลต่อเนื่อง'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
