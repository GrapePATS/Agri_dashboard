import { useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, Minus, ChevronRight, Map } from 'lucide-react';
import type { FarmSummary, Detection } from '../../lib/types';
import { MiniMapSVG } from './MiniMapSVG';

interface Props {
  farm: FarmSummary;
  detections: Detection[];
  lastScanLabel: string;
}

const trendIcon = { improving: TrendingUp, stable: Minus, declining: TrendingDown };
const trendLabel = { improving: 'ดีขึ้น', stable: 'คงที่', declining: 'แย่ลง' };
const trendBg = {
  improving: 'bg-green-100 text-green-700',
  stable: 'bg-stone-100 text-stone-600',
  declining: 'bg-red-100 text-red-700',
};

export function FarmHealthSection({ farm, detections, lastScanLabel }: Props) {
  const navigate = useNavigate();
  const TrendIcon = trendIcon[farm.health_trend];
  const score = Math.round(farm.overall_health_score * 100);

  const activeDetections = detections.filter((d) => d.status === 'active');
  const diseaseCount = activeDetections.filter((d) => d.type === 'disease').length;
  const pestCount = activeDetections.filter((d) => d.type === 'pest').length;
  const weedCount = activeDetections.filter((d) => d.type === 'weed').length;

  const hasCritical = activeDetections.some((d) => d.severity === 'critical');
  const hasHigh = activeDetections.some((d) => d.severity === 'high');

  const scoreColor =
    score >= 75 ? 'text-green-100' : score >= 50 ? 'text-amber-100' : 'text-red-100';
  const scoreBg =
    score >= 75 ? 'from-green-700 to-green-500' : score >= 50 ? 'from-amber-700 to-amber-500' : 'from-red-700 to-red-500';

  return (
    <div className="px-4 space-y-3">
      {/* Health Score Card */}
      <div className={`rounded-2xl p-5 bg-gradient-to-br ${scoreBg} shadow-md`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-green-100 text-xs font-semibold uppercase tracking-wide mb-1">
              สุขภาพฟาร์ม
            </p>
            <h2 className="text-white text-xl font-bold leading-tight">{farm.farm_name}</h2>
            <p className="text-green-100 text-xs mt-1 opacity-80">{lastScanLabel} · {farm.total_area_rai} ไร่</p>
          </div>

          <div className="items-center flex flex-col">
            <div className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/15 flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${scoreColor}`}>{score}</span>
              <span className="text-white/70 text-[10px] font-medium">/ 100</span>
            </div>
            <div className={`mt-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trendBg[farm.health_trend]}`}>
              <TrendIcon size={11} />
              {trendLabel[farm.health_trend]}
            </div>
          </div>
        </div>

        {/* Critical alert inline */}
        {(hasCritical || hasHigh) && (
          <div className="bg-white/20 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <p className="text-white text-xs leading-snug flex-1">
              {farm.top_recommendation}
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/detections')}
          className="w-full bg-white/20 border border-white/30 rounded-xl py-3 flex items-center justify-center gap-2 text-white font-semibold text-sm active:bg-white/30"
        >
          ดูรายละเอียดการตรวจพบ
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Detection Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <DetectionMiniCard
          emoji="🦠"
          count={diseaseCount}
          label="ตรวจพบโรคพืช"
          topBorderColor="bg-red-500"
          hasCritical={activeDetections.filter((d) => d.type === 'disease').some((d) => d.severity === 'critical')}
          hasHigh={activeDetections.filter((d) => d.type === 'disease').some((d) => d.severity === 'high')}
          onClick={() => navigate('/detections')}
        />
        <DetectionMiniCard
          emoji="🪲"
          count={pestCount}
          label="ตรวจพบแมลง"
          topBorderColor="bg-amber-500"
          hasCritical={activeDetections.filter((d) => d.type === 'pest').some((d) => d.severity === 'critical')}
          hasHigh={activeDetections.filter((d) => d.type === 'pest').some((d) => d.severity === 'high')}
          onClick={() => navigate('/detections')}
        />
        <DetectionMiniCard
          emoji="🌿"
          count={weedCount}
          label="ตรวจพบวัชพืช"
          topBorderColor="bg-yellow-500"
          hasCritical={false}
          hasHigh={activeDetections.filter((d) => d.type === 'weed').some((d) => d.severity === 'high')}
          onClick={() => navigate('/detections')}
        />
      </div>

      {/* Mini Map Widget */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <p className="text-sm font-bold text-stone-900">แผนที่ฟาร์ม</p>
            <p className="text-xs text-stone-400 mt-0.5">จุดแดง = พื้นที่ที่มีปัญหา</p>
          </div>
          <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold">
            {farm.active_alerts} จุดแจ้งเตือน
          </span>
        </div>

        <MiniMapSVG mode="health" showHotspots className="h-36" />

        {/* Legend */}
        <div className="flex gap-4 px-4 py-2.5">
          <LegendItem color="bg-green-600" label="สุขภาพดี" />
          <LegendItem color="bg-amber-500" label="เฝ้าระวัง" />
          <LegendItem color="bg-red-600" label="วิกฤติ" />
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={() => navigate('/map')}
            className="w-full bg-green-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-semibold text-sm active:bg-green-800"
          >
            <Map size={16} />
            เปิดแผนที่เต็มจอ
          </button>
        </div>
      </div>
    </div>
  );
}

function DetectionMiniCard({
  emoji, count, label, topBorderColor, hasCritical, hasHigh, onClick,
}: {
  emoji: string;
  count: number;
  label: string;
  topBorderColor: string;
  hasCritical: boolean;
  hasHigh: boolean;
  onClick: () => void;
}) {
  const badgeText = hasCritical ? 'วิกฤติ' : hasHigh ? 'สูง' : count > 0 ? 'ต่ำ' : 'ปกติ';
  const badgeCls = hasCritical
    ? 'bg-red-100 text-red-600'
    : hasHigh
    ? 'bg-amber-100 text-amber-700'
    : count > 0
    ? 'bg-yellow-100 text-yellow-700'
    : 'bg-green-100 text-green-700';

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-stone-100 pt-3 pb-3 px-2.5 flex flex-col items-center active:bg-stone-50 w-full"
    >
      <div className={`w-full h-1 rounded-t-full ${topBorderColor} -mt-3 mb-3 rounded`} />
      <span className="text-2xl mb-1.5">{emoji}</span>
      <span className="text-2xl font-black text-stone-900 leading-none">{count}</span>
      <span className="text-[10px] text-stone-500 mt-1 text-center leading-tight">{label}</span>
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-2 ${badgeCls}`}>
        {badgeText}
      </span>
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
      <span className="text-[10px] text-stone-500">{label}</span>
    </div>
  );
}
