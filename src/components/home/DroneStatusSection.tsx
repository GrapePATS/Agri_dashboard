import type { DroneStatus } from '../../lib/types';

interface Props {
  drone: DroneStatus;
}

const statusConfig = {
  completed: { label: 'สแกนเสร็จสมบูรณ์', bg: 'bg-green-100 text-green-700', emoji: '✅' },
  uploading: { label: 'กำลังอัปโหลดข้อมูล', bg: 'bg-amber-100 text-amber-700', emoji: '☁️' },
  in_progress: { label: 'กำลังบิน', bg: 'bg-blue-100 text-blue-700', emoji: '🚁' },
  scheduled: { label: 'รอการสแกน', bg: 'bg-stone-100 text-stone-600', emoji: '🕐' },
};

const signalConfig = {
  strong: { label: 'แรงมาก', color: 'text-green-600', bars: 3 },
  medium: { label: 'ปานกลาง', color: 'text-amber-600', bars: 2 },
  weak: { label: 'อ่อน', color: 'text-red-600', bars: 1 },
};

function formatCompletedAt(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  return `${h} ชม.ที่แล้ว`;
}

export function DroneStatusSection({ drone }: Props) {
  const cfg = statusConfig[drone.status];
  const sig = signalConfig[drone.signal_strength];

  return (
    <div className="px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
        {/* Drone header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl shrink-0">
            🛸
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-400 font-medium mb-0.5">สถานะโดรนล่าสุด</p>
            <p className="text-base font-bold text-stone-900">Mission #{drone.mission_id.split('-')[1]}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {drone.completed_at ? formatCompletedAt(drone.completed_at) : 'กำลังดำเนินการ'}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cfg.bg} shrink-0`}>
            {cfg.emoji} {cfg.label}
          </span>
        </div>

        {/* Coverage progress */}
        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <p className="text-xs font-semibold text-stone-600">ครอบคลุมพื้นที่</p>
            <p className="text-xs font-bold text-stone-900">{drone.coverage_pct}%</p>
          </div>
          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all"
              style={{ width: `${drone.coverage_pct}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-1">{drone.last_scan_area_rai} ไร่ จาก 24.5 ไร่</p>
        </div>

        {/* Upload progress (only when uploading) */}
        {drone.status === 'uploading' && (
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <p className="text-xs font-semibold text-stone-600">อัปโหลดข้อมูล</p>
              <p className="text-xs font-bold text-amber-700">{drone.upload_pct}%</p>
            </div>
            <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all"
                style={{ width: `${drone.upload_pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Indicators */}
        <div className="grid grid-cols-3 gap-2">
          {/* Battery */}
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <p className="text-xl mb-1">
              {drone.battery_pct >= 60 ? '🔋' : drone.battery_pct >= 30 ? '🪫' : '⚠️'}
            </p>
            <p className="text-sm font-bold text-stone-900">{drone.battery_pct}%</p>
            <p className="text-[10px] text-stone-400 mt-0.5">แบตเตอรี่</p>
          </div>

          {/* Signal */}
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <div className="flex items-end justify-center gap-0.5 h-6 mb-1">
              {[1, 2, 3].map((bar) => (
                <div
                  key={bar}
                  className={`w-2 rounded-sm ${bar <= sig.bars ? sig.color.replace('text-', 'bg-') : 'bg-stone-200'}`}
                  style={{ height: `${bar * 7}px` }}
                />
              ))}
            </div>
            <p className={`text-[10px] font-bold ${sig.color}`}>{sig.label}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">สัญญาณ</p>
          </div>

          {/* Scans done */}
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <p className="text-xl mb-1">📸</p>
            <p className="text-sm font-bold text-stone-900">342</p>
            <p className="text-[10px] text-stone-400 mt-0.5">ภาพที่ถ่าย</p>
          </div>
        </div>
      </div>
    </div>
  );
}
