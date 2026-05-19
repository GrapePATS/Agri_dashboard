import { useState, useMemo } from 'react';
import {
  ArrowLeft, X, Eye, EyeOff, ChevronRight,
  ChevronUp, ChevronDown, Layers, Satellite, Map,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMapData } from '../hooks/useMapData';
import { useDetections } from '../hooks/useDetections';
import { FarmMap } from '../components/map/FarmMap';
import { FarmSvgMap } from '../components/map/FarmSvgMap';
import { Skeleton } from '../components/ui/Skeleton';
import { SVG_ZONES } from '../lib/mockData';
import type { ZonePolygon, SvgZoneMeta, SvgTree } from '../lib/types';

// ── Light palette (matches Home page) ────────────────────────────
const C = {
  bg: '#e9f6eb',        // page background (mint — same as Home)
  card: '#ffffff',      // card background
  border: '#d2e5d3',    // subtle green border
  header: '#1d6233',    // Green Pea header (same as Home)
  headerSub: '#abd8c8', // Sinbad — soft teal subtitle text
  green: '#1d6233',     // primary action green
  greenLight: '#e9f6eb',
  amber: '#b45309',     // darker amber (readable on white)
  amberBg: '#fef3c7',
  red: '#b91c1c',       // red (problem)
  redBg: '#fee2e2',
  teal: '#0d9488',      // teal accent
  tealBg: '#ccfbf1',
  plantGreen: '#16a34a',
  plantBg: '#dcfce7',
  dim: '#6b7280',       // muted label
  text: '#1a2e1a',      // dark body text
  mid: '#374151',       // medium body text
};

// ── Zone metadata ─────────────────────────────────────────────────
type GrowthStage = 'mature' | 'growing' | 'near_harvest' | 'seedling';
interface ZoneMeta {
  stage: GrowthStage;
  stageTH: string;
  stageColor: string;
  stageBg: string;
  density: number;
  grades: { A: number; B: number; C: number; U: number };
  rows: { label: string; count: number }[];
}
const ZONE_META: Record<string, ZoneMeta> = {
  'zone-a': {
    stage: 'mature', stageTH: 'พร้อมเก็บ', stageColor: '#1d6233', stageBg: '#dcfce7', density: 56,
    grades: { A: 55, B: 25, C: 12, U: 8 },
    rows: [{ label: 'แถว ก', count: 320 }, { label: 'แถว ข', count: 298 }, { label: 'แถว ค', count: 312 }, { label: 'แถว ง', count: 305 }, { label: 'แถว จ', count: 315 }],
  },
  'zone-b': {
    stage: 'growing', stageTH: 'กำลังเติบโต', stageColor: '#0d9488', stageBg: '#ccfbf1', density: 48,
    grades: { A: 30, B: 40, C: 20, U: 10 },
    rows: [{ label: 'แถว ก', count: 280 }, { label: 'แถว ข', count: 265 }, { label: 'แถว ค', count: 270 }, { label: 'แถว ง', count: 258 }, { label: 'แถว จ', count: 275 }],
  },
  'zone-c': {
    stage: 'near_harvest', stageTH: 'ใกล้เก็บเกี่ยว', stageColor: '#b45309', stageBg: '#fef3c7', density: 38,
    grades: { A: 10, B: 20, C: 35, U: 35 },
    rows: [{ label: 'แถว ก', count: 215 }, { label: 'แถว ข', count: 198 }, { label: 'แถว ค', count: 206 }, { label: 'แถว ง', count: 192 }, { label: 'แถว จ', count: 210 }],
  },
  'zone-d': {
    stage: 'mature', stageTH: 'พร้อมเก็บเกี่ยว', stageColor: '#1d6233', stageBg: '#dcfce7', density: 65,
    grades: { A: 60, B: 28, C: 8, U: 4 },
    rows: [{ label: 'แถว ก', count: 360 }, { label: 'แถว ข', count: 345 }, { label: 'แถว ค', count: 356 }, { label: 'แถว ง', count: 338 }, { label: 'แถว จ', count: 342 }],
  },
};

type LayerKey = 'health' | 'density' | 'disease' | 'pest' | 'weed';
const LAYERS: { key: LayerKey; label: string; emoji: string }[] = [
  { key: 'health', label: 'สุขภาพ', emoji: '💚' },
  { key: 'density', label: 'ความหนาแน่น', emoji: '🌿' },
  { key: 'disease', label: 'โรคพืช', emoji: '🦠' },
  { key: 'pest', label: 'แมลง', emoji: '🪲' },
  { key: 'weed', label: 'วัชพืช', emoji: '🌾' },
];

interface ProblemCounts { disease: number; pest: number; weed: number; total: number }

// ── MiniBar for panel stats ───────────────────────────────────────
function MiniBar({ label, val, max, color, bg }: {
  label: string; val: number; max: number; color: string; bg: string;
}) {
  const pct = max > 0 ? Math.round((val / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 my-2">
      <span className="text-sm font-semibold min-w-[80px]" style={{ color: C.mid }}>{label}</span>
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-sm font-bold min-w-[24px] text-right" style={{ color }}>{val}</span>
    </div>
  );
}

function GradeBar({ grades }: { grades: { A: number; B: number; C: number; U: number } }) {
  return (
    <div>
      <div className="flex h-4 rounded-lg overflow-hidden gap-0.5 mb-3">
        <div style={{ width: `${grades.A}%`, background: '#16a34a' }} />
        <div style={{ width: `${grades.B}%`, background: '#65a30d' }} />
        <div style={{ width: `${grades.C}%`, background: '#d97706' }} />
        <div style={{ width: `${grades.U}%`, background: '#d1d5db' }} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {[
          { bg: '#16a34a', label: `เกรด A — ${grades.A}%` },
          { bg: '#65a30d', label: `เกรด B — ${grades.B}%` },
          { bg: '#d97706', label: `เกรด C — ${grades.C}%` },
          { bg: '#d1d5db', label: `ยังไม่ได้เกรด — ${grades.U}%` },
        ].map(({ bg, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: bg }} />
            <span className="text-xs" style={{ color: C.dim }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────
function StatChip({ val, label, color, bg }: { val: string | number; label: string; color: string; bg: string }) {
  return (
    <div className="rounded-2xl p-3 text-center" style={{ background: bg }}>
      <div className="text-lg font-black leading-none" style={{ color }}>{val}</div>
      <div className="text-xs mt-1 font-medium" style={{ color: C.dim }}>{label}</div>
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${C.border}`, background: '#f9fafb' }}>
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.dim }}>{title}</p>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ── Summary Panel ─────────────────────────────────────────────────
function SummaryPanel({ zones, problemsByZone }: {
  zones: ZonePolygon[];
  problemsByZone: Record<string, ProblemCounts>;
}) {
  return (
    <div className="pb-4 space-y-4">
      <p className="text-xs font-bold" style={{ color: C.dim }}>แตะแปลงบนแผนที่เพื่อดูรายละเอียด</p>

      <InfoCard title="สรุปปัญหาทุกแปลง">
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: C.greenLight }}>
                {['แปลง', '🦠 โรค', '🪲 แมลง', '🌿 วัชพืช', 'รวม'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-bold text-xs" style={{ color: C.green }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => {
                const p = problemsByZone[z.zone_id] ?? { disease: 0, pest: 0, weed: 0, total: 0 };
                const meta = ZONE_META[z.zone_id];
                return (
                  <tr key={z.zone_id} style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                    <td className="px-3 py-2.5 font-bold text-sm" style={{ color: meta?.stageColor ?? C.mid }}>
                      {z.zone_name.split('–')[0].trim()}
                    </td>
                    <td className="px-3 py-2.5 text-sm font-semibold" style={{ color: p.disease > 0 ? C.amber : C.dim }}>{p.disease}</td>
                    <td className="px-3 py-2.5 text-sm font-semibold" style={{ color: p.pest > 0 ? C.red : C.dim }}>{p.pest}</td>
                    <td className="px-3 py-2.5 text-sm font-semibold" style={{ color: p.weed > 0 ? C.plantGreen : C.dim }}>{p.weed}</td>
                    <td className="px-3 py-2.5 text-sm font-black" style={{ color: p.total > 5 ? C.red : p.total > 2 ? C.amber : C.teal }}>
                      {p.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </InfoCard>

      <InfoCard title="สถานะแปลง">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {[
            { color: C.green, bg: '#dcfce7', label: 'พร้อมเก็บ' },
            { color: C.teal, bg: C.tealBg, label: 'กำลังเติบโต' },
            { color: C.amber, bg: C.amberBg, label: 'ใกล้เก็บ' },
          ].map(({ color, bg, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded" style={{ background: color }} />
              <span className="text-sm font-medium" style={{ color: C.mid }}>{label}</span>
            </div>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}

// ── Zone Tree Summary ─────────────────────────────────────────────
function ZoneTreeSummary({ zone, onBack }: { zone: SvgZoneMeta; onBack: () => void }) {
  const probTotal = zone.problems.insect + zone.problems.disease + zone.problems.weed;
  const harvestBadge =
    zone.harvest === 'ready'
      ? { text: 'พร้อมเก็บเกี่ยว 🎉', style: { background: '#dcfce7', color: C.green, border: `1px solid #bbf7d0` } }
      : zone.harvest === 'soon'
        ? { text: 'ใกล้พร้อมเร็วๆ นี้', style: { background: C.amberBg, color: C.amber, border: `1px solid #fde68a` } }
        : { text: 'ยังไม่พร้อม', style: { background: '#f3f4f6', color: C.dim, border: `1px solid ${C.border}` } };

  return (
    <div className="pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-black" style={{ color: C.text }}>{zone.label}</div>
          <div className="text-sm mt-0.5" style={{ color: C.dim }}>
            {zone.stage_th} · {zone.density} ต้น/ไร่
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-sm px-3 py-2 rounded-xl flex items-center gap-2 font-semibold active:opacity-70"
          style={{ background: C.greenLight, color: C.green, border: `1px solid ${C.border}` }}
        >
          <ArrowLeft size={14} /> ภาพรวม
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatChip val={zone.tree_count} label="ต้นทั้งหมด" color={C.green} bg={C.plantBg} />
        <StatChip val={probTotal} label="ปัญหา" color={probTotal > 0 ? C.red : C.green} bg={probTotal > 0 ? C.redBg : C.plantBg} />
        <StatChip val={`${zone.health_score * 100 | 0}%`} label="สุขภาพ" color={zone.health_score > 0.7 ? C.green : zone.health_score > 0.5 ? C.amber : C.red} bg={zone.health_score > 0.7 ? C.plantBg : zone.health_score > 0.5 ? C.amberBg : C.redBg} />
      </div>

      <InfoCard title="คุณภาพผลผลิต">
        <GradeBar grades={zone.grades} />
      </InfoCard>

      <InfoCard title="สถานะการเก็บเกี่ยว">
        <span className="text-sm font-bold px-4 py-2 rounded-xl inline-block" style={harvestBadge.style}>
          {harvestBadge.text}
        </span>
      </InfoCard>

      <div className="rounded-2xl p-4 text-center" style={{ background: C.greenLight, border: `1px solid ${C.border}` }}>
        <div className="text-3xl mb-2">🌿</div>
        <div className="text-sm font-semibold" style={{ color: C.green }}>
          แตะต้นไม้บนแผนที่
        </div>
        <div className="text-xs mt-1" style={{ color: C.dim }}>เพื่อดูรายละเอียดแต่ละต้น</div>
      </div>
    </div>
  );
}

// ── Zone Detail (satellite) ───────────────────────────────────────
function ZoneDetail({ zone, problems, onClose, onNavigate }: {
  zone: ZonePolygon;
  problems: ProblemCounts;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const meta = ZONE_META[zone.zone_id];
  const score = Math.round(zone.health_score * 100);
  const totalTrees = meta?.rows.reduce((s, r) => s + r.count, 0) ?? 0;
  const maxRow = meta ? Math.max(...meta.rows.map(r => r.count)) : 1;
  const { total } = problems;

  return (
    <div className="pb-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-black leading-tight" style={{ color: C.text }}>{zone.zone_name}</h3>
          <p className="text-sm mt-0.5" style={{ color: C.dim }}>
            {meta ? `${meta.stageTH} · ${meta.density} ต้น/ไร่` : `สุขภาพ: ${score}/100`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {meta && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{
              background: meta.stageBg, color: meta.stageColor, border: `1px solid ${meta.stageBg}`,
            }}>
              {meta.stageTH}
            </span>
          )}
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center active:opacity-70"
            style={{ background: '#f3f4f6', border: `1px solid ${C.border}` }}>
            <X size={16} style={{ color: C.dim }} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatChip val={totalTrees || zone.detection_count * 10} label="ต้นทั้งหมด" color={C.green} bg={C.plantBg} />
        <StatChip val={total} label="ปัญหา" color={total > 0 ? C.red : C.green} bg={total > 0 ? C.redBg : C.plantBg} />
        <StatChip val={meta?.density ?? '—'} label="ต้น/ไร่" color={C.amber} bg={C.amberBg} />
        <StatChip val={score} label="สุขภาพ" color={score > 70 ? C.green : score > 50 ? C.amber : C.red} bg={score > 70 ? C.plantBg : score > 50 ? C.amberBg : C.redBg} />
      </div>

      {meta && (
        <InfoCard title="คุณภาพผลผลิต">
          <GradeBar grades={meta.grades} />
        </InfoCard>
      )}

      <InfoCard title="ปัญหาที่ตรวจพบ">
        <MiniBar label="🦠 โรคพืช" val={problems.disease} max={Math.max(total, 1)} color={C.amber} bg={C.amberBg} />
        <MiniBar label="🪲 แมลง" val={problems.pest} max={Math.max(total, 1)} color={C.red} bg={C.redBg} />
        <MiniBar label="🌿 วัชพืช" val={problems.weed} max={Math.max(total, 1)} color={C.plantGreen} bg={C.plantBg} />
      </InfoCard>

      {meta && (
        <InfoCard title="จำนวนต้นแต่ละแถว">
          {meta.rows.map(({ label, count }) => (
            <MiniBar key={label} label={label} val={count} max={maxRow} color={meta.stageColor} bg={meta.stageBg} />
          ))}
        </InfoCard>
      )}

      <button
        onClick={onNavigate}
        className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 text-base font-black text-white active:opacity-90"
        style={{ background: C.header }}
      >
        ดูรายละเอียดการตรวจพบ
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ── Tree Detail ───────────────────────────────────────────────────
function TreeDetail({ tree, zone, onClose }: { tree: SvgTree; zone: SvgZoneMeta; onClose: () => void }) {
  const gradeColor =
    tree.grade === 'A' ? C.green : tree.grade === 'B' ? '#65a30d'
    : tree.grade === 'C' ? C.amber : C.dim;
  const gradeBg =
    tree.grade === 'A' ? C.plantBg : tree.grade === 'B' ? '#ecfccb'
    : tree.grade === 'C' ? C.amberBg : '#f3f4f6';

  const hReady = tree.harvest_days <= 7;
  const hSoon = tree.harvest_days <= 30 && !hReady;
  const harvestPct = Math.max(0, Math.min(100, Math.round((120 - tree.harvest_days) / 120 * 100)));
  const harvestColor = hReady ? C.green : hSoon ? C.amber : C.dim;
  const harvestBg = hReady ? C.plantBg : hSoon ? C.amberBg : '#f3f4f6';

  const sevColor = tree.problem_sev === 'High' ? C.red : tree.problem_sev === 'Medium' ? C.amber : C.green;
  const sevBg = tree.problem_sev === 'High' ? C.redBg : tree.problem_sev === 'Medium' ? C.amberBg : C.plantBg;

  return (
    <div className="pb-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-black" style={{ color: C.text }}>{tree.id.toUpperCase()}</div>
          <div className="text-sm mt-0.5" style={{ color: C.dim }}>
            {tree.species} · อายุ {tree.age} ปี · {zone.label}
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
            แถว {tree.row} คอลัมน์ {tree.col}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black px-3 py-1.5 rounded-xl" style={{
            background: gradeBg, color: gradeColor, border: `1px solid ${gradeBg}`,
          }}>เกรด {tree.grade}</span>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center active:opacity-70"
            style={{ background: '#f3f4f6', border: `1px solid ${C.border}` }}>
            <X size={16} style={{ color: C.dim }} />
          </button>
        </div>
      </div>

      {/* 1. ผลผลิต */}
      <InfoCard title="1. จำนวนผลผลิต">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatChip val={tree.fruit_count} label="ผลรวม (ลูก)" color={gradeColor} bg={gradeBg} />
          <StatChip val={`เกรด ${tree.grade}`} label="คุณภาพ" color={gradeColor} bg={gradeBg} />
        </div>
        <div className="flex h-3 rounded-lg overflow-hidden gap-0.5 mb-3">
          {tree.grade === 'A' ? <div style={{ width: '100%', background: '#16a34a' }} />
          : tree.grade === 'B' ? <><div style={{ width: '60%', background: '#16a34a' }} /><div style={{ width: '40%', background: '#65a30d' }} /></>
          : tree.grade === 'C' ? <><div style={{ width: '30%', background: '#65a30d' }} /><div style={{ width: '70%', background: '#d97706' }} /></>
          : <div style={{ width: '100%', background: '#d1d5db' }} />}
        </div>
        <p className="text-sm" style={{ color: C.dim }}>
          {tree.grade === 'A' ? 'ผลผลิตคุณภาพดีเยี่ยม ขนาดใหญ่ สม่ำเสมอ'
          : tree.grade === 'B' ? 'ผลผลิตคุณภาพดี ขนาดกลาง'
          : tree.grade === 'C' ? 'ผลผลิตต่ำกว่ามาตรฐาน'
          : 'ยังไม่พร้อมให้ผลผลิต'}
        </p>
      </InfoCard>

      {/* 2. ปัญหา */}
      <InfoCard title="2. การตรวจจับปัญหา">
        {tree.has_problem && tree.problem_type ? (
          <div className="rounded-xl p-3" style={{ background: C.redBg, border: `1px solid #fecaca` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-black" style={{ color: tree.problem_type === 'แมลง' ? C.red : tree.problem_type === 'โรค' ? C.amber : C.plantGreen }}>
                {tree.problem_type}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{
                color: sevColor, background: sevBg, border: `1px solid ${sevBg}`,
              }}>
                ความรุนแรง: {tree.problem_sev}
              </span>
            </div>
            <p className="text-sm mb-2" style={{ color: C.dim }}>
              ตำแหน่ง: {tree.problem_type === 'วัชพืช' ? 'บริเวณโคนต้น' : 'ใบ/กิ่งบน'} · แถว {tree.row} คอลัมน์ {tree.col}
            </p>
            <p className="text-xs font-bold mb-1.5" style={{ color: C.mid }}>ความแม่นยำ AI</p>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#fecaca' }}>
              <div className="h-full rounded-full" style={{
                width: `${tree.problem_conf}%`,
                background: (tree.problem_conf ?? 0) >= 85 ? C.green : (tree.problem_conf ?? 0) >= 70 ? C.amber : C.red,
              }} />
            </div>
            <p className="text-sm font-bold mt-1" style={{ color: C.mid }}>{tree.problem_conf}%</p>
          </div>
        ) : (
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: C.plantBg }}>
            <span className="text-2xl">✅</span>
            <span className="text-sm font-bold" style={{ color: C.green }}>ไม่พบปัญหา</span>
          </div>
        )}
      </InfoCard>

      {/* 3. ความพร้อมเก็บเกี่ยว */}
      <InfoCard title="3. ความพร้อมเก็บเกี่ยว">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-black px-4 py-2 rounded-xl" style={{
            background: harvestBg, color: harvestColor, border: `1px solid ${harvestBg}`,
          }}>
            {hReady ? '🎉 พร้อมเก็บเกี่ยว' : hSoon ? `อีก ~${tree.harvest_days} วัน` : `อีก ${tree.harvest_days} วัน`}
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: '#f3f4f6' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${harvestPct}%`, background: harvestColor }} />
        </div>
        <p className="text-sm" style={{ color: C.dim }}>
          {zone.harvest === 'ready' ? 'แปลงนี้พร้อมเก็บเกี่ยวแล้ว'
          : zone.harvest === 'soon' ? 'แปลงนี้ใกล้พร้อมเก็บเกี่ยว'
          : 'แปลงนี้ยังไม่พร้อม'}
        </p>
      </InfoCard>
    </div>
  );
}

// ── Main MapPage ──────────────────────────────────────────────────
export function MapPage() {
  const navigate = useNavigate();
  const { data: mapData, isLoading, isError } = useMapData();
  const { data: detectionsData } = useDetections({ limit: 100 });

  const [viewMode, setViewMode] = useState<'svg' | 'satellite'>('svg');
  const [svgActiveZoneId, setSvgActiveZoneId] = useState<string | null>(null);
  const [selectedTree, setSelectedTree] = useState<SvgTree | null>(null);
  const [showProblems, setShowProblems] = useState(true);
  const [showStageColors, setShowStageColors] = useState(true);
  const [selectedZone, setSelectedZone] = useState<ZonePolygon | null>(null);
  const [activeLayer, setActiveLayer] = useState<LayerKey>('health');
  const [panelExpanded, setPanelExpanded] = useState(false);

  const problemsByZone = useMemo<Record<string, ProblemCounts>>(() => {
    const items = detectionsData?.items ?? [];
    const map: Record<string, ProblemCounts> = {};
    items.filter(d => d.status === 'active').forEach(d => {
      if (!map[d.zone_id]) map[d.zone_id] = { disease: 0, pest: 0, weed: 0, total: 0 };
      map[d.zone_id][d.type]++;
      map[d.zone_id].total++;
    });
    return map;
  }, [detectionsData]);

  const totalProblems = useMemo(
    () => Object.values(problemsByZone).reduce((s, p) => s + p.total, 0),
    [problemsByZone]
  );

  const totalTrees = SVG_ZONES.reduce((s, z) => s + z.tree_count, 0);
  const readyZones = SVG_ZONES.filter(z => z.harvest === 'ready').length;
  const svgActiveZone = SVG_ZONES.find(z => z.zone_id === svgActiveZoneId) ?? null;

  const panelH =
    selectedTree ? '65dvh'
    : svgActiveZoneId && viewMode === 'svg' ? '50dvh'
    : selectedZone && viewMode === 'satellite' ? '60dvh'
    : panelExpanded ? '44dvh'
    : '200px';

  const panelTitle =
    selectedTree ? `🌳 ${selectedTree.id.toUpperCase()}`
    : svgActiveZoneId ? `${svgActiveZone?.label ?? ''} · รายละเอียดต้นไม้`
    : selectedZone ? selectedZone.zone_name
    : `ภาพรวมปัญหา · ${totalProblems} รายการ`;

  function handleSvgZoneClick(zoneId: string) {
    setSvgActiveZoneId(zoneId);
    setSelectedTree(null);
    setPanelExpanded(true);
  }

  function handleSvgTreeClick(tree: SvgTree) {
    setSelectedTree(tree);
  }

  function handleSvgBack() {
    if (selectedTree) {
      setSelectedTree(null);
    } else {
      setSvgActiveZoneId(null);
      setPanelExpanded(false);
    }
  }

  function handleViewToggle() {
    setViewMode(v => v === 'svg' ? 'satellite' : 'svg');
    setSelectedZone(null);
    setSvgActiveZoneId(null);
    setSelectedTree(null);
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: C.bg }}>

      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-12 pb-4" style={{ background: C.header }}>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 active:opacity-70"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-black text-lg leading-tight">🗺️ แผนที่ฟาร์ม</h1>
            <p className="text-xs mt-0.5" style={{ color: C.headerSub }}>
              {viewMode === 'svg' ? 'แตะแปลง → ดูต้นไม้ → แตะต้นไม้เพื่อรายละเอียด' : 'แตะแปลงเพื่อดูรายละเอียด'}
            </p>
          </div>
          <button
            onClick={handleViewToggle}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold shrink-0 active:opacity-70"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            {viewMode === 'svg' ? <><Satellite size={14} /> ดาวเทียม</> : <><Map size={14} /> แผนผัง</>}
          </button>
        </div>

        {/* Status pills */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: `⚠️ ${totalProblems} ปัญหา`, style: { background: '#fee2e2', color: C.red } },
            { label: `🌳 ${totalTrees.toLocaleString()} ต้น`, style: { background: '#dcfce7', color: C.green } },
            { label: `✅ ${readyZones} แปลงพร้อม`, style: { background: '#fef3c7', color: C.amber } },
          ].map(({ label, style }) => (
            <span key={label} className="text-xs font-bold px-3 py-1.5 rounded-full" style={style}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Control bar ── */}
      <div className="shrink-0 px-3 py-2.5 overflow-x-auto" style={{ background: C.card, borderBottom: `1px solid ${C.border}`, scrollbarWidth: 'none' }}>
        <div className="flex gap-2 items-center min-w-max">
          {viewMode === 'svg' ? (
            <>
              {svgActiveZoneId && (
                <button
                  onClick={handleSvgBack}
                  className="text-sm px-3 py-2 rounded-xl flex items-center gap-1.5 font-semibold active:opacity-70"
                  style={{ background: C.greenLight, color: C.green, border: `1px solid ${C.border}` }}
                >
                  <ArrowLeft size={13} />
                  {selectedTree ? 'ต้นไม้' : 'ภาพรวม'}
                </button>
              )}

              <span className="text-xs font-bold px-3 py-2 rounded-xl"
                style={{ background: C.plantBg, color: C.green }}>
                {selectedTree ? '🌳 รายละเอียดต้น' : svgActiveZoneId ? `📍 ${svgActiveZone?.quadrant ?? ''}` : '🗺️ ภาพรวมฟาร์ม'}
              </span>

              <div className="w-px h-5 mx-1" style={{ background: C.border }} />

              <button
                onClick={() => setShowProblems(v => !v)}
                className="text-sm px-3 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all active:opacity-70"
                style={{
                  background: showProblems ? '#dcfce7' : '#f9fafb',
                  color: showProblems ? C.green : C.dim,
                  border: `1px solid ${showProblems ? '#bbf7d0' : C.border}`,
                }}
              >
                {showProblems ? <Eye size={13} /> : <EyeOff size={13} />} ปัญหา
              </button>

              <button
                onClick={() => setShowStageColors(v => !v)}
                className="text-sm px-3 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all active:opacity-70"
                style={{
                  background: showStageColors ? '#dcfce7' : '#f9fafb',
                  color: showStageColors ? C.green : C.dim,
                  border: `1px solid ${showStageColors ? '#bbf7d0' : C.border}`,
                }}
              >
                <Layers size={13} /> {showStageColors ? 'ขั้นตอน' : 'เกรด'}
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-bold mr-1" style={{ color: C.dim }}>ชั้นข้อมูล:</span>
              {LAYERS.map(({ key, label, emoji }) => (
                <button
                  key={key}
                  onClick={() => setActiveLayer(key)}
                  className="text-sm px-3 py-2 rounded-xl font-semibold transition-all active:opacity-70"
                  style={{
                    background: activeLayer === key ? C.plantBg : '#f9fafb',
                    color: activeLayer === key ? C.green : C.dim,
                    border: `1px solid ${activeLayer === key ? '#bbf7d0' : C.border}`,
                  }}
                >
                  {emoji} {label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Map area ── */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {viewMode === 'svg' ? (
          <div className="w-full h-full" style={{ background: '#f0fdf4' }}>
            <FarmSvgMap
              zones={SVG_ZONES}
              showProblems={showProblems}
              showStageColors={showStageColors}
              activeZoneId={svgActiveZoneId}
              selectedTreeId={selectedTree?.id ?? null}
              onZoneClick={handleSvgZoneClick}
              onTreeClick={handleSvgTreeClick}
            />
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#f0fdf4' }}>
                <div className="text-center">
                  <div className="text-5xl mb-3">🗺️</div>
                  <Skeleton className="w-40 h-3 mx-auto rounded-full" />
                  <p className="text-sm mt-2" style={{ color: C.dim }}>กำลังโหลดแผนที่...</p>
                </div>
              </div>
            )}
            {isError && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#f0fdf4' }}>
                <div className="text-center">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="text-sm font-semibold" style={{ color: C.red }}>ไม่สามารถโหลดแผนที่ได้</p>
                </div>
              </div>
            )}
            {mapData && <FarmMap data={mapData} onZoneClick={setSelectedZone} />}
          </>
        )}
      </div>

      {/* ── Bottom panel ── */}
      <div
        className="shrink-0 overflow-hidden transition-all duration-300"
        style={{ height: panelH, background: C.card, borderTop: `2px solid ${C.border}` }}
      >
        {/* Panel handle */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
          style={{ borderBottom: `1px solid ${C.border}` }}
          onClick={() => {
            const noSelection = !selectedTree && !svgActiveZoneId && !selectedZone;
            if (noSelection) setPanelExpanded(v => !v);
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-1.5 rounded-full" style={{ background: C.border }} />
            <span className="text-sm font-bold" style={{ color: C.text }}>
              {panelTitle}
            </span>
          </div>
          {!selectedTree && !svgActiveZoneId && !selectedZone && (
            <span style={{ color: C.dim }}>
              {panelExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto h-full px-4 pt-3" style={{ paddingBottom: '80px' }}>
          {viewMode === 'svg' && selectedTree && svgActiveZone ? (
            <TreeDetail tree={selectedTree} zone={svgActiveZone} onClose={() => setSelectedTree(null)} />
          ) : viewMode === 'svg' && svgActiveZoneId && svgActiveZone ? (
            <ZoneTreeSummary zone={svgActiveZone} onBack={() => { setSvgActiveZoneId(null); setPanelExpanded(false); }} />
          ) : viewMode === 'satellite' && selectedZone ? (
            <ZoneDetail
              zone={selectedZone}
              problems={problemsByZone[selectedZone.zone_id] ?? { disease: 0, pest: 0, weed: 0, total: 0 }}
              onClose={() => setSelectedZone(null)}
              onNavigate={() => navigate('/detections')}
            />
          ) : (
            <SummaryPanel zones={mapData?.zones ?? []} problemsByZone={problemsByZone} />
          )}
        </div>
      </div>
    </div>
  );
}
