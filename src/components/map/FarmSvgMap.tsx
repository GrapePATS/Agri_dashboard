import { useMemo } from 'react';
import type { SvgZoneMeta, SvgTree } from '../../lib/types';

const PROB_COLORS: Record<string, string> = {
  'แมลง': '#F47E7A',
  'โรค': '#F5C065',
  'วัชพืช': '#7FD47F',
};
const PROB_TYPES = ['แมลง', 'โรค', 'วัชพืช'] as const;
const SEV_TYPES = ['Low', 'Medium', 'High'] as const;
const SPECIES = ['ข้าวหอมมะลิ', 'ข้าวเจ้า', 'ข้าวหอมนิล', 'ข้าวหอมปทุม'];

const SVG_W = 560;
const SVG_H = 440;

function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

export function genTrees(zone: SvgZoneMeta): SvgTree[] {
  const seed = zone.zone_id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) * 31;
  const rand = seedRand(seed);
  const { x, y, w, h } = zone.svg_rect;
  const cols = Math.floor((w - 16) / 22);
  const rows = Math.floor((h - 16) / 22);
  const trees: SvgTree[] = [];
  let idx = 0;

  const probCount = Math.round(zone.tree_count * 0.08);
  const probIdxs = new Set<number>();
  while (probIdxs.size < probCount) probIdxs.add(Math.floor(rand() * zone.tree_count));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= zone.tree_count) break;
      const px = x + 10 + c * 22 + (rand() * 6 - 3);
      const py = y + 10 + r * 22 + (rand() * 6 - 3);
      const gr = rand();
      const { A, B, C } = zone.grades;
      const grade: 'A' | 'B' | 'C' | 'U' =
        gr < A / 100 ? 'A' : gr < (A + B) / 100 ? 'B' : gr < (A + B + C) / 100 ? 'C' : 'U';
      const fruitCount =
        grade === 'A' ? Math.floor(28 + rand() * 17)
        : grade === 'B' ? Math.floor(15 + rand() * 13)
        : grade === 'C' ? Math.floor(5 + rand() * 10)
        : 0;
      const hasProb = probIdxs.has(idx);
      const probType = hasProb ? PROB_TYPES[Math.floor(rand() * 3)] : null;
      const probSev = hasProb ? SEV_TYPES[Math.floor(rand() * 3)] : null;
      const probConf = hasProb ? Math.floor(72 + rand() * 25) : null;
      const harvestDays =
        zone.harvest === 'ready' ? Math.floor(rand() * 7)
        : zone.harvest === 'soon' ? Math.floor(14 + rand() * 16)
        : Math.floor(45 + rand() * 75);
      const age =
        zone.stage === 'seedling' ? Math.floor(1 + rand() * 2)
        : zone.stage === 'growing' ? Math.floor(3 + rand() * 3)
        : Math.floor(6 + rand() * 10);

      trees.push({
        id: `${zone.zone_id}-t${idx}`,
        zone_id: zone.zone_id,
        px, py, grade,
        fruit_count: fruitCount,
        has_problem: hasProb,
        problem_type: probType,
        problem_sev: probSev,
        problem_conf: probConf,
        row: r + 1, col: c + 1,
        lat: parseFloat((9.382 + rand() * 0.001).toFixed(6)),
        lng: parseFloat((99.184 + rand() * 0.002).toFixed(6)),
        species: SPECIES[Math.floor(rand() * 4)],
        age, harvest_days: harvestDays,
      });
      idx++;
    }
    if (idx >= zone.tree_count) break;
  }
  return trees;
}

function gradeTreeColor(grade: 'A' | 'B' | 'C' | 'U') {
  return grade === 'A' ? '#1D6B40' : grade === 'B' ? '#7DAA30' : grade === 'C' ? '#C0622F' : '#3A4A55';
}

interface FarmSvgMapProps {
  zones: SvgZoneMeta[];
  showProblems: boolean;
  showStageColors: boolean;
  activeZoneId: string | null;
  selectedTreeId: string | null;
  onZoneClick: (zoneId: string) => void;
  onTreeClick: (tree: SvgTree) => void;
}

export function FarmSvgMap({
  zones, showProblems, showStageColors,
  activeZoneId, selectedTreeId,
  onZoneClick, onTreeClick,
}: FarmSvgMapProps) {
  const zoneTreesMap = useMemo(
    () => Object.fromEntries(zones.map(z => [z.zone_id, genTrees(z)])),
    [zones]
  );

  const activeZone = zones.find(z => z.zone_id === activeZoneId) ?? null;

  const viewBox = activeZone
    ? `${activeZone.svg_rect.x - 8} ${activeZone.svg_rect.y - 8} ${activeZone.svg_rect.w + 16} ${activeZone.svg_rect.h + 16}`
    : `0 0 ${SVG_W} ${SVG_H}`;

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block', touchAction: 'manipulation' }}
    >
      {/* Base background */}
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#0A1520" />

      {!activeZone ? (
        /* ══ LEVEL 1: FARM OVERVIEW ══ */
        <>
          {/* Road vertical */}
          <rect x="270" y="0" width="22" height={SVG_H} fill="#2A1E0F" opacity="0.8" />
          <line x1="270" y1="0" x2="270" y2={SVG_H} stroke="#4A3010" strokeWidth="1" opacity="0.6" />
          <line x1="292" y1="0" x2="292" y2={SVG_H} stroke="#4A3010" strokeWidth="1" opacity="0.6" />
          {/* Road horizontal */}
          <rect x="0" y="215" width={SVG_W} height="22" fill="#2A1E0F" opacity="0.8" />
          <line x1="0" y1="215" x2={SVG_W} y2="215" stroke="#4A3010" strokeWidth="1" opacity="0.6" />
          <line x1="0" y1="237" x2={SVG_W} y2="237" stroke="#4A3010" strokeWidth="1" opacity="0.6" />

          {zones.map(zone => {
            const { x, y, w, h } = zone.svg_rect;
            const col = showStageColors ? zone.stage_color : '#2A3A48';
            const trees = zoneTreesMap[zone.zone_id] ?? [];
            const bx = x + w / 2 - 50;
            const by = y + h / 2 - 14;
            const probTotal = zone.problems.insect + zone.problems.disease + zone.problems.weed;

            return (
              <g
                key={zone.zone_id}
                onClick={() => onZoneClick(zone.zone_id)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label={zone.label}
              >
                {/* Zone fill */}
                <rect x={x} y={y} width={w} height={h} rx="3"
                  fill={col} fillOpacity="0.18" stroke={col} strokeWidth="1.5" />

                {/* Tree dots (overview density) */}
                <g opacity="0.5">
                  {trees.slice(0, 180).map(t => (
                    <circle key={t.id} cx={t.px} cy={t.py} r="4" fill={col} />
                  ))}
                </g>

                {/* Problem markers */}
                {showProblems && (
                  <g>
                    {trees.filter(t => t.has_problem).slice(0, 30).map(t => (
                      <circle key={`p-${t.id}`}
                        cx={t.px} cy={t.py} r="3.5"
                        fill={t.problem_type ? PROB_COLORS[t.problem_type] : '#F47E7A'}
                        stroke="#0D1117" strokeWidth="0.8" opacity="0.95"
                      />
                    ))}
                  </g>
                )}

                {/* Center badge */}
                <rect x={bx} y={by} width="100" height="28" rx="14"
                  fill="#0D1117" fillOpacity="0.9" stroke={zone.stage_color} strokeWidth="1" />
                <text x={x + w / 2} y={by + 11}
                  fontFamily="'IBM Plex Mono',monospace" fontSize="8"
                  fill={zone.stage_color} textAnchor="middle" fontWeight="600">
                  {zone.label} · {zone.tree_count} ต้น
                </text>
                <text x={x + w / 2} y={by + 22}
                  fontFamily="'IBM Plex Mono',monospace" fontSize="7"
                  fill="#6B8A9E" textAnchor="middle">
                  {probTotal > 0 ? `⚠ ${probTotal} ปัญหา` : '✓ ปกติ'}
                </text>

                {/* Quadrant label */}
                <text x={x + 8} y={y + 15}
                  fontFamily="'IBM Plex Mono',monospace" fontSize="10"
                  fill={zone.stage_color} fontWeight="700" pointerEvents="none">
                  {zone.quadrant}
                </text>

                {/* Harvest badge (SE only / ready) */}
                {zone.harvest === 'ready' && (
                  <>
                    <rect x={x + w - 66} y={y + 6} width="60" height="16" rx="8"
                      fill="#0D2A1A" stroke="#1A5030" strokeWidth="0.8" />
                    <text x={x + w - 36} y={y + 17}
                      fontFamily="'IBM Plex Mono',monospace" fontSize="7"
                      fill="#4ECFA0" textAnchor="middle" fontWeight="500">
                      READY
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </>
      ) : (
        /* ══ LEVEL 2: ZONE ZOOM ══ */
        <>
          {/* Zone bg */}
          <rect
            x={activeZone.svg_rect.x - 8} y={activeZone.svg_rect.y - 8}
            width={activeZone.svg_rect.w + 16} height={activeZone.svg_rect.h + 16}
            fill="#0A1520"
          />
          <rect
            x={activeZone.svg_rect.x} y={activeZone.svg_rect.y}
            width={activeZone.svg_rect.w} height={activeZone.svg_rect.h}
            rx="3"
            fill={activeZone.stage_color} fillOpacity="0.06"
            stroke={activeZone.stage_color} strokeWidth="1"
          />

          {/* Row guide lines */}
          {(() => {
            const trees = zoneTreesMap[activeZone.zone_id] ?? [];
            const seenRows = new Set<number>();
            return trees
              .filter(t => { if (seenRows.has(t.row)) return false; seenRows.add(t.row); return true; })
              .map(t => (
                <line key={`rl-${t.row}`}
                  x1={activeZone.svg_rect.x + 2} y1={t.py}
                  x2={activeZone.svg_rect.x + activeZone.svg_rect.w - 2} y2={t.py}
                  stroke="#1E2A35" strokeWidth="0.5" strokeDasharray="2,5"
                />
              ));
          })()}

          {/* Individual trees */}
          {(zoneTreesMap[activeZone.zone_id] ?? []).map(t => {
            const treeCol = showStageColors ? activeZone.stage_color : gradeTreeColor(t.grade);
            const isSelected = t.id === selectedTreeId;
            return (
              <g key={t.id} onClick={() => onTreeClick(t)} style={{ cursor: 'pointer' }}>
                {/* Larger invisible hit area for mobile */}
                <circle cx={t.px} cy={t.py} r="13" fill="transparent" />
                {/* Selection ring */}
                {isSelected && (
                  <circle cx={t.px} cy={t.py} r="13"
                    fill="none" stroke="#FFFFFF" strokeWidth="1.8"
                    strokeDasharray="4,2.5" opacity="0.9"
                  />
                )}
                {/* Tree body */}
                <circle cx={t.px} cy={t.py} r="8" fill={treeCol} opacity={isSelected ? 1 : 0.72} />
                {/* Grade label */}
                <text x={t.px} y={t.py + 3.5}
                  fontFamily="'IBM Plex Mono',monospace" fontSize="6.5"
                  fill="#FFFFFF" textAnchor="middle" fontWeight="600" pointerEvents="none">
                  {t.grade}
                </text>
                {/* Problem dot */}
                {showProblems && t.has_problem && t.problem_type && (
                  <circle cx={t.px + 6.5} cy={t.py - 6.5} r="3.5"
                    fill={PROB_COLORS[t.problem_type]}
                    stroke="#0A1520" strokeWidth="1"
                  />
                )}
              </g>
            );
          })}

          {/* Zone header label */}
          <text
            x={activeZone.svg_rect.x + 6} y={activeZone.svg_rect.y + 15}
            fontFamily="'IBM Plex Mono',monospace" fontSize="9"
            fill={activeZone.stage_color} fontWeight="600" pointerEvents="none"
          >
            {activeZone.label_th}
          </text>
        </>
      )}
    </svg>
  );
}
