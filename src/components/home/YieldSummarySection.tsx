import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, TrendingUp, TrendingDown, BrainCircuit, Map } from 'lucide-react';
import type { YieldSummary } from '../../lib/types';
import { MiniMapSVG } from './MiniMapSVG';

interface Props {
  yield_: YieldSummary;
}

const GROWTH_STAGES = [
  { key: 'early', label: 'เริ่มปลูก', emoji: '🌱' },
  { key: 'vegetative', label: 'เติบโต', emoji: '🌿' },
  { key: 'flowering', label: 'ออกดอก', emoji: '🌸' },
  { key: 'near_harvest', label: 'ใกล้เก็บ', emoji: '🌾' },
  { key: 'ready', label: 'พร้อมเก็บ', emoji: '✅' },
] as const;

const GRADE_ITEMS = (bd: YieldSummary['grade_breakdown']) => [
  { label: 'เกรด A', pct: bd.A, bar: 'bg-[#1d6233]', text: 'text-[#1d6233]' },
  { label: 'เกรด B', pct: bd.B, bar: 'bg-amber-400', text: 'text-amber-700' },
  { label: 'เกรด C', pct: bd.C, bar: 'bg-orange-500', text: 'text-orange-700' },
  { label: 'เสียหาย', pct: bd.damaged, bar: 'bg-red-500', text: 'text-red-600' },
];

const INSIGHT_META = [
  { icon: '⚠️', bg: 'bg-amber-400/20' },
  { icon: '💧', bg: 'bg-blue-400/20' },
  { icon: '📅', bg: 'bg-[#abd8c8]/25' },
  { icon: '🌱', bg: 'bg-white/15' },
];

// REDESIGN: Green Pea sparkline color
function Sparkline({
  data,
  color = '#1d6233',
  gradId,
}: {
  data: number[];
  color?: string;
  gradId: string;
}) {
  if (data.length < 2) return null;
  const W = 200;
  const H = 44;
  const min = Math.min(...data) * 0.97;
  const max = Math.max(...data) * 1.02;
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 6),
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: `${H}px` }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="4" fill={color} stroke="white" strokeWidth="2" />
    </svg>
  );
}

export function YieldSummarySection({ yield_ }: Props) {
  const navigate = useNavigate();
  const totalTons = (yield_.estimated_kg / 1000).toFixed(1);
  const confidencePct = Math.round(yield_.confidence * 100);
  const trendUp = yield_.trend_pct >= 0;
  const daysToHarvest = Math.ceil(
    (new Date(yield_.estimated_harvest_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const stageIdx = GROWTH_STAGES.findIndex((s) => s.key === yield_.growth_stage);
  const gradeItems = GRADE_ITEMS(yield_.grade_breakdown);
  const sparkKg = yield_.trend_data.map((d) => d.kg);

  return (
    <div className="px-4 space-y-3">

      {/* ── 1. Hero overview card — REDESIGN: Green Pea solid header */}
      <div className="rounded-2xl bg-[#1d6233] p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          {/* REDESIGN: Sinbad secondary label */}
          <p className="text-[#abd8c8] text-xs font-semibold uppercase tracking-wider">ภาพรวมผลผลิต</p>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            trendUp ? 'bg-[#abd8c8]/25 text-[#abd8c8]' : 'bg-red-400/20 text-red-300'
          }`}>
            {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{trendUp ? '+' : ''}{yield_.trend_pct}% จากสัปดาห์ที่แล้ว</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-0 mb-5">
          <div>
            <p className="text-[#abd8c8] text-[10px] mb-1">จำนวนต้น</p>
            <p className="text-white text-2xl font-black leading-none">
              {yield_.plant_count.toLocaleString()}
            </p>
            <p className="text-[#abd8c8] text-[10px] mt-0.5">ต้น</p>
          </div>
          <div className="border-l border-white/15 pl-4">
            <p className="text-[#abd8c8] text-[10px] mb-1">ผลผลิตรวม</p>
            <div className="flex items-end gap-1">
              <p className="text-white text-2xl font-black leading-none">{totalTons}</p>
              <p className="text-[#abd8c8] text-[10px] mb-0.5">ตัน</p>
            </div>
          </div>
          {yield_.market_value_thb != null && (
            <div className="border-l border-white/15 pl-4">
              <p className="text-[#abd8c8] text-[10px] mb-1">มูลค่าตลาด</p>
              <p className="text-white text-2xl font-black leading-none">
                {Math.round(yield_.market_value_thb / 1000)}K
              </p>
              <p className="text-[#abd8c8] text-[10px] mt-0.5">บาท</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[#abd8c8] text-[10px]">ความเชื่อมั่น AI</p>
            <p className="text-[#abd8c8] text-[10px] font-bold">{confidencePct}%</p>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            {/* REDESIGN: Sinbad confidence bar */}
            <div className="h-full bg-[#abd8c8] rounded-full" style={{ width: `${confidencePct}%` }} />
          </div>
        </div>
      </div>

      {/* ── 2. Crop quality grade — REDESIGN: Surf Crest border */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#d2e5d3] p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-black text-stone-900">คุณภาพผลผลิต</p>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            yield_.quality_grade === 'A' ? 'bg-[#d2e5d3] text-[#1d6233]' :
            yield_.quality_grade === 'B' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            ระดับ {yield_.quality_grade} โดยรวม
          </span>
        </div>
        <div className="space-y-2.5">
          {gradeItems.map(({ label, pct, bar, text }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${text}`}>{label}</span>
                <span className="text-xs font-bold text-stone-500">{pct}%</span>
              </div>
              <div className="h-2.5 bg-[#e9f6eb] rounded-full overflow-hidden">
                <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Crop growth status — REDESIGN: Surf Crest border, Panache stat bg */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#d2e5d3] p-4">
        <p className="text-sm font-black text-stone-900 mb-4">สถานะการเติบโต</p>

        <div className="flex items-start">
          {GROWTH_STAGES.map((stage, i) => {
            const isActive = i === stageIdx;
            const isPast = i < stageIdx;
            return (
              <div key={stage.key} className="flex-1 flex flex-col items-center relative">
                {i < GROWTH_STAGES.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    isPast || isActive ? 'bg-[#1d6233]' : 'bg-[#d2e5d3]'
                  }`} />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isActive
                    ? 'bg-[#1d6233] ring-4 ring-[#d2e5d3]'
                    : isPast
                    ? 'bg-[#1d6233]'
                    : 'bg-[#e9f6eb]'
                }`}>
                  {stage.emoji}
                </div>
                <p className={`text-[9px] mt-2 text-center leading-tight font-medium ${
                  isActive ? 'text-[#1d6233] font-bold' : isPast ? 'text-[#1d6233]' : 'text-stone-400'
                }`}>
                  {stage.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-[#e9f6eb] rounded-xl p-3">
            <p className="text-stone-400 text-[10px]">ปลูกมาแล้ว</p>
            <p className="text-stone-900 text-xl font-black mt-0.5">
              {yield_.days_since_planting}{' '}
              <span className="text-sm font-normal text-stone-400">วัน</span>
            </p>
          </div>
          <div className={`rounded-xl p-3 ${daysToHarvest <= 14 ? 'bg-amber-50' : 'bg-[#e9f6eb]'}`}>
            <p className={`text-[10px] ${daysToHarvest <= 14 ? 'text-amber-500' : 'text-[#1d6233]'}`}>
              เก็บเกี่ยวในอีก
            </p>
            <p className={`text-xl font-black mt-0.5 ${daysToHarvest <= 14 ? 'text-amber-700' : 'text-[#1d6233]'}`}>
              {daysToHarvest}{' '}
              <span className="text-sm font-normal text-stone-400">วัน</span>
            </p>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-stone-500 font-medium">ความพร้อมในการเก็บเกี่ยว</p>
            <p className="text-xs font-black text-[#1d6233]">{yield_.harvest_readiness_pct}%</p>
          </div>
          <div className="h-3 bg-[#e9f6eb] rounded-full overflow-hidden">
            {/* REDESIGN: Sinbad → Green Pea harvest readiness gradient */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#abd8c8] to-[#1d6233]"
              style={{ width: `${yield_.harvest_readiness_pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-[9px] text-stone-300">0%</p>
            <p className="text-[9px] text-stone-300">100% พร้อมเก็บ</p>
          </div>
        </div>
      </div>

      {/* ── 4. Yield trend chart — REDESIGN: Surf Crest border */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#d2e5d3] p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-black text-stone-900">แนวโน้มผลผลิต</p>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            trendUp ? 'bg-[#d2e5d3] text-[#1d6233]' : 'bg-red-100 text-red-700'
          }`}>
            {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            <span>{trendUp ? '+' : ''}{yield_.trend_pct}%</span>
          </div>
        </div>
        <p className="text-stone-400 text-[10px] mb-3">7 วันที่ผ่านมา</p>

        <Sparkline data={sparkKg} gradId="yield-full" />

        <div className="flex justify-between mt-1">
          {yield_.trend_data.map((d) => (
            <span key={d.label} className="text-[9px] text-stone-300 text-center flex-1">{d.label}</span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#d2e5d3]">
          <div>
            <p className="text-[10px] text-stone-400">ต่ำสุด (7 วัน)</p>
            <p className="text-xs font-bold text-stone-700">
              {(Math.min(...sparkKg) / 1000).toFixed(1)} ตัน
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-stone-400">สูงสุด (7 วัน)</p>
            <p className="text-xs font-bold text-[#1d6233]">
              {(Math.max(...sparkKg) / 1000).toFixed(1)} ตัน
            </p>
          </div>
        </div>
      </div>

      {/* ── 5. Zone yield mini map — REDESIGN: Surf Crest border */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#d2e5d3] overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <p className="text-sm font-bold text-stone-900">แผนที่ผลผลิตรายแปลง</p>
            <p className="text-xs text-stone-400 mt-0.5">สีแสดงระดับผลผลิตในแต่ละแปลง</p>
          </div>
          <div className="flex items-center gap-2">
            <LegendDot color="bg-[#1d6233]" label="สูง" />
            <LegendDot color="bg-amber-500" label="กลาง" />
            <LegendDot color="bg-red-600" label="ต่ำ" />
          </div>
        </div>
        <MiniMapSVG mode="yield" showHotspots={false} className="h-36" />
        <div className="px-4 py-3">
          {/* REDESIGN: Green Pea map button */}
          <button
            onClick={() => navigate('/map')}
            className="w-full bg-[#1d6233] text-white rounded-xl py-3 flex items-center justify-center gap-2 font-semibold text-sm active:bg-[#16502a]"
          >
            <Map size={16} />
            เปิดแผนที่เต็มจอ
          </button>
        </div>
      </div>

      {/* ── 6. AI insight recommendations — REDESIGN: Green Pea replaces indigo */}
      <div className="rounded-2xl bg-[#1d6233] p-5 shadow-md">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <BrainCircuit size={18} className="text-[#abd8c8]" />
          </div>
          <div>
            <p className="text-white text-sm font-black">AI แนะนำการจัดการผลผลิต</p>
            <p className="text-[#abd8c8] text-[10px]">วิเคราะห์โดย AgriVision AI</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {yield_.ai_insights.map((insight, i) => {
            const { icon, bg } = INSIGHT_META[i % INSIGHT_META.length];
            return (
              <div key={i} className={`flex items-start gap-2.5 ${bg} rounded-xl px-3 py-2.5`}>
                <span className="text-sm shrink-0 mt-0.5">{icon}</span>
                <p className="text-[#e9f6eb] text-xs leading-relaxed">{insight}</p>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/ai-summary')}
          className="w-full bg-white/15 border border-white/25 rounded-xl py-3 flex items-center justify-center gap-2 text-white font-semibold text-sm active:bg-white/25"
        >
          วิเคราะห์เชิงลึกด้วย AI Advisor
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}

// ── Compact homepage card ────────────────────────────────────
type Period = 'daily' | 'weekly' | 'monthly';

interface CompactYieldCardProps {
  yield_: YieldSummary;
  weeklyYield?: YieldSummary;
  monthlyYield?: YieldSummary;
}

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'รายวัน',
  weekly: 'รายสัปดาห์',
  monthly: 'รายเดือน',
};

const TREND_SUFFIX: Record<Period, string> = {
  daily: 'จากเมื่อวาน',
  weekly: 'จากสัปดาห์ที่แล้ว',
  monthly: 'จากเดือนที่แล้ว',
};

export function CompactYieldCard({ yield_, weeklyYield, monthlyYield }: CompactYieldCardProps) {
  const [period, setPeriod] = useState<Period>('daily');
  const [hoveredGrade, setHoveredGrade] = useState<string | null>(null);

  const activeYield =
    period === 'monthly' && monthlyYield ? monthlyYield :
    period === 'weekly' && weeklyYield ? weeklyYield :
    yield_;

  const totalTons = (activeYield.estimated_kg / 1000).toFixed(1);
  const trendUp = activeYield.trend_pct >= 0;
  const confidencePct = Math.round(activeYield.confidence * 100);
  const gradeItems = GRADE_ITEMS(activeYield.grade_breakdown);
  const hasPeriodChoice = !!(weeklyYield || monthlyYield);

  return (
    <div className="px-4">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

        {/* ── Period tabs ── */}
        {hasPeriodChoice && (
          <div className="flex">
            {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 text-[11px] font-semibold py-2.5 border-b-2 transition-colors duration-150 ${
                  period === p
                    ? 'text-[#1d6233] border-[#1d6233]'
                    : 'text-stone-400 border-stone-100 active:bg-stone-50'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        )}

        {/* ── Hero: yield number + grade badge ── */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3">
          <div>
            <p className="text-[9px] text-stone-400 font-medium uppercase tracking-[0.15em] mb-0.5">ผลผลิตรวม</p>
            <div className="flex items-end gap-1.5 leading-none">
              <span className="text-[52px] font-black leading-none tracking-tight text-stone-900">
                {totalTons}
              </span>
              <span className="text-stone-400 text-base font-semibold mb-2">ตัน</span>
            </div>
            <div className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold ${trendUp ? 'text-[#1d6233]' : 'text-red-500'}`}>
              {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              <span>{trendUp ? '+' : ''}{activeYield.trend_pct}% {TREND_SUFFIX[period]}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 mt-0.5">
            <div className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center text-2xl font-black border ${
              activeYield.quality_grade === 'A'
                ? 'text-[#1d6233] bg-[#e9f6eb] border-[#c8dfc9]'
                : activeYield.quality_grade === 'B'
                ? 'text-amber-600 bg-amber-50 border-amber-200'
                : 'text-red-600 bg-red-50 border-red-200'
            }`}>
              {activeYield.quality_grade}
            </div>
            <span className="text-[9px] text-stone-400 font-medium">คุณภาพ</span>
          </div>
        </div>

        {/* ── Harvest readiness ── */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-t border-stone-100">
          <span className="text-[10px] text-stone-500 font-medium shrink-0 w-24">ความพร้อมเก็บ</span>
          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1d6233]"
              style={{ width: `${activeYield.harvest_readiness_pct}%` }}
            />
          </div>
          <span className="text-[11px] font-black text-[#1d6233] shrink-0">{activeYield.harvest_readiness_pct}%</span>
        </div>

        {/* ── Stats 2×2 grid ── */}
        <div className="grid grid-cols-2 border-t border-stone-100">
          <div className="px-4 py-3 border-r border-stone-100">
            <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-0.5">จำนวนต้น</p>
            <p className="text-[13px] font-black text-stone-900 leading-none">
              {activeYield.plant_count.toLocaleString()}
              <span className="text-[10px] font-normal text-stone-400 ml-0.5">ต้น</span>
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-0.5">AI เชื่อมั่น</p>
            <p className="text-[13px] font-black text-stone-900 leading-none">{confidencePct}%</p>
          </div>
          <div className="px-4 py-3 border-t border-r border-stone-100">
            <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-0.5">ปลูกมาแล้ว</p>
            <p className="text-[13px] font-black text-stone-900 leading-none">
              {activeYield.days_since_planting}
              <span className="text-[10px] font-normal text-stone-400 ml-0.5">วัน</span>
            </p>
          </div>
          <div className="px-4 py-3 border-t border-stone-100">
            <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-0.5">มูลค่าตลาด</p>
            <p className="text-[13px] font-black text-stone-900 leading-none">
              {activeYield.market_value_thb != null
                ? `฿${(activeYield.market_value_thb / 1000).toFixed(0)}K`
                : '—'}
              {activeYield.market_value_thb != null && (
                <span className="text-[10px] font-normal text-stone-400 ml-0.5">บาท</span>
              )}
            </p>
          </div>
        </div>

        {/* ── Grade breakdown ── */}
        <div className="px-4 pt-3 pb-4 border-t border-stone-100">
          <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-2.5">คุณภาพผลผลิต</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {gradeItems.map(({ label, pct, bar }) => {
              const cropCount = Math.round(activeYield.plant_count * pct / 100);
              const isHovered = hoveredGrade === label;
              const barColor = bar.includes('1d6233') ? '#1d6233'
                : bar.includes('amber') ? '#f59e0b'
                : bar.includes('orange') ? '#f97316'
                : '#ef4444';
              return (
                <div
                  key={label}
                  onMouseEnter={() => setHoveredGrade(label)}
                  onMouseLeave={() => setHoveredGrade(null)}
                  className="cursor-default"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-stone-600">{label}</span>
                    <span className={`text-[10px] font-bold transition-colors duration-150 ${isHovered ? 'text-stone-900' : 'text-stone-400'}`}>
                      {isHovered ? `${cropCount} ต้น` : `${pct}%`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[10px] text-stone-400">{label}</span>
    </div>
  );
}
