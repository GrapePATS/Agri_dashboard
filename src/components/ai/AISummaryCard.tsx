import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { AISummary } from '../../lib/types';
import { Badge } from '../ui/Badge';

interface AISummaryCardProps {
  summary: AISummary;
}

const priorityConfig = {
  high: { variant: 'danger' as const, label: 'เร่งด่วน', dot: 'bg-red-500' },
  medium: { variant: 'warning' as const, label: 'ปานกลาง', dot: 'bg-amber-500' },
  low: { variant: 'success' as const, label: 'ต่ำ', dot: 'bg-[#1d6233]' },
};

export function AISummaryCard({ summary }: AISummaryCardProps) {
  const conf = Math.round(summary.confidence * 100);
  return (
    <div className="space-y-4">
      {/* REDESIGN: Surf Crest border on all cards */}
      <div className="bg-white rounded-2xl border border-[#d2e5d3] shadow-sm p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-stone-700">การประเมินโดยรวม</h3>
          <Badge variant={conf >= 80 ? 'success' : conf >= 60 ? 'warning' : 'danger'}>
            ความเชื่อมั่น {conf}%
          </Badge>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">{summary.overall_assessment}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#d2e5d3] shadow-sm p-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">สิ่งที่พบ</h3>
        <ul className="space-y-2.5">
          {summary.key_findings.map((f, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              {/* REDESIGN: Green Pea checkmark */}
              <CheckCircle2 size={16} className="text-[#1d6233] shrink-0 mt-0.5" strokeWidth={2} />
              <span className="text-sm text-stone-700 leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-[#d2e5d3] shadow-sm p-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">แผนดำเนินการ</h3>
        <div className="space-y-3">
          {summary.action_items.map((item, i) => {
            const { variant, dot } = priorityConfig[item.priority];
            return (
              // REDESIGN: Surf Crest border on action items
              <div key={i} className="border border-[#d2e5d3] rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                  <Badge variant={variant} size="sm">
                    {priorityConfig[item.priority].label}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-stone-800 leading-snug">{item.action}</p>
                <div className="flex items-start gap-1.5 mt-2">
                  <ArrowRight size={13} className="text-stone-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-500 leading-relaxed">{item.expected_outcome}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
