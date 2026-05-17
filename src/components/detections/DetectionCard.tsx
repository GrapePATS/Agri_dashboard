import { useNavigate } from 'react-router-dom';
import { ChevronRight, Bug, Leaf, Microscope } from 'lucide-react';
import type { Detection } from '../../lib/types';
import { SeverityBadge } from './SeverityBadge';

interface DetectionCardProps {
  detection: Detection;
}

const typeConfig = {
  disease: { Icon: Microscope, label: 'โรคพืช', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  weed: { Icon: Leaf, label: 'วัชพืช', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  pest: { Icon: Bug, label: 'แมลงศัตรู', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'เมื่อกี้';
  if (hours < 24) return `${hours} ชม. ที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

export function DetectionCard({ detection }: DetectionCardProps) {
  const navigate = useNavigate();
  const { Icon, label, iconBg, iconColor } = typeConfig[detection.type];

  return (
    <div
      className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-3 cursor-pointer active:bg-stone-50 transition-colors"
      onClick={() => navigate(`/detections/${detection.detection_id}`)}
    >
      <div className={`shrink-0 rounded-xl p-2.5 ${iconBg}`}>
        <Icon size={20} className={iconColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-stone-800 leading-tight">{detection.label}</p>
          <SeverityBadge severity={detection.severity} />
        </div>
        <p className="text-xs text-stone-500 mt-0.5 truncate">{detection.zone_name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-stone-400">{label}</span>
          <span className="text-stone-200">•</span>
          <span className="text-xs text-stone-400">
            {Math.round(detection.confidence * 100)}% ความเชื่อมั่น
          </span>
          <span className="text-stone-200">•</span>
          <span className="text-xs text-stone-400">{formatRelativeTime(detection.detected_at)}</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-stone-300 shrink-0" />
    </div>
  );
}
