import { useMemo, useState } from 'react';
import type { MapData, ZonePolygon } from '../../lib/types';
import type { SvgTree, SvgZoneMeta } from '../../lib/types';
import { SVG_ZONES } from '../../lib/mockData';
// @ts-ignore — Vite JSON import, unusual filename copied to lib
import farmSegData from '../../lib/farmSegData.json';

// ── Image coordinate space ────────────────────────────────────────
const IMG_W = 2760;
const IMG_H = 1504;

// ── Zone colour map (matches SVG_ZONES stage_color) ───────────────
const ZONE_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  'zone-a': { fill: '#2D6A4F', stroke: '#52B788', label: 'แปลง 1' },
  'zone-b': { fill: '#B8860B', stroke: '#F5C065', label: 'แปลง 2' },
  'zone-c': { fill: '#C0622F', stroke: '#F47E7A', label: 'แปลง 3' },
  'zone-d': { fill: '#1d6233', stroke: '#4ECFA0', label: 'แปลง 4' },
};

// JSON group_id → zone_id
const GROUP_TO_ZONE: Record<number, string> = { 1: 'zone-a', 2: 'zone-b', 3: 'zone-c', 4: 'zone-d' };

// Ray-cast point-in-polygon test (Jordan curve theorem)
function pointInPolygon(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

// Fallback bbox split (used only if a plant falls outside all polygons)
function assignZoneFallback(cx: number, cy: number): string {
  if (cx < 1385 && cy < 800) return 'zone-a';
  if (cx >= 1385 && cy < 800) return 'zone-b';
  if (cx < 1385 && cy >= 800) return 'zone-c';
  return 'zone-d';
}

// ── Deterministic RNG (seeded) ────────────────────────────────────
function seedRand(seed: number) {
  let s = seed;
  return () => { s = Math.sin(s) * 10000; return s - Math.floor(s); };
}

// ── Generate a synthetic SvgTree for a plant circle ──────────────
const ORANGE_SPECIES = ['ส้มสายน้ำผึ้ง', 'ส้มโชกุน', 'ส้มนาเกลือ', 'ส้มสายน้ำ'] as const;
const PROB_TYPES     = ['แมลง', 'โรค', 'วัชพืช'] as const;
const SEV_TYPES      = ['Low', 'Medium', 'High'] as const;

function generatePlantTree(
  plantId: string, cx: number, cy: number,
  zoneId: string, idx: number,
  zone: SvgZoneMeta,
): SvgTree {
  const rand = seedRand(idx * 137 + 7);
  const { A, B, C } = zone.grades;
  const gr = rand();
  const grade: 'A' | 'B' | 'C' | 'U' =
    gr < A / 100 ? 'A' : gr < (A + B) / 100 ? 'B' : gr < (A + B + C) / 100 ? 'C' : 'U';

  const fruitCount =
    grade === 'A' ? Math.floor(80 + rand() * 40)
    : grade === 'B' ? Math.floor(50 + rand() * 30)
    : grade === 'C' ? Math.floor(20 + rand() * 30)
    : 0;

  const hasProb = rand() < 0.08;
  return {
    id: plantId,
    zone_id: zoneId,
    px: cx, py: cy,
    grade, fruit_count: fruitCount,
    has_problem: hasProb,
    problem_type: hasProb ? PROB_TYPES[Math.floor(rand() * 3)] : null,
    problem_sev:  hasProb ? SEV_TYPES[Math.floor(rand() * 3)]  : null,
    problem_conf: hasProb ? Math.floor(72 + rand() * 25) : null,
    row: Math.floor(idx / 25) + 1,
    col: (idx % 25) + 1,
    lat: parseFloat((13.5 + rand() * 0.01).toFixed(6)),
    lng: parseFloat((100.5 + rand() * 0.01).toFixed(6)),
    species: ORANGE_SPECIES[Math.floor(rand() * 4)],
    age: Math.floor(3 + rand() * 10),
    harvest_days:
      zone.harvest === 'ready' ? Math.floor(rand() * 7)
      : zone.harvest === 'soon' ? Math.floor(14 + rand() * 16)
      : Math.floor(45 + rand() * 75),
  };
}

// ── Problem dot colour ────────────────────────────────────────────
const PROB_DOT: Record<string, string> = {
  'แมลง': '#F47E7A', 'โรค': '#F5C065', 'วัชพืช': '#7FD47F',
};

// ── Types ─────────────────────────────────────────────────────────
interface FarmPolygon {
  zoneId: string;
  groupId: number;
  pointsStr: string;
  points: [number, number][];
  centroid: [number, number];
}

interface PlantCircle {
  id: string;
  idx: number;
  cx: number;
  cy: number;
  r: number;
  zoneId: string;
}

interface FarmMapProps {
  data: MapData;
  onZoneClick?: (zone: ZonePolygon) => void;
  onPlantClick?: (tree: SvgTree, zone: SvgZoneMeta) => void;
  zoomLevel?: number;
}

// ── Component ─────────────────────────────────────────────────────
export function FarmMap({ data, onZoneClick, onPlantClick, zoomLevel = 1 }: FarmMapProps) {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  // ── Process JSON once ────────────────────────────────────────────
  const { farmPolygons, allPlants } = useMemo(() => {
    const shapes = (farmSegData as { shapes: {
      label: string;
      points: [number, number][];
      group_id: number | null;
      shape_type: string;
    }[] }).shapes;

    const farmPolygons: FarmPolygon[] = shapes
      .filter(s => s.label === 'farm')
      .map(s => {
        const pts = s.points as [number, number][];
        const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
        const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
        return {
          zoneId: GROUP_TO_ZONE[s.group_id as number] ?? 'zone-a',
          groupId: s.group_id as number,
          pointsStr: pts.map(([x, y]) => `${x},${y}`).join(' '),
          points: pts,
          centroid: [cx, cy] as [number, number],
        };
      });

    const allPlants: PlantCircle[] = shapes
      .filter(s => s.label === 'plant')
      .map((s, i) => {
        const [cx, cy] = s.points[0];
        const [px, py] = s.points[1];
        const r = Math.hypot(px - cx, py - cy);
        const match = farmPolygons.find(fp => pointInPolygon(cx, cy, fp.points));
        const zoneId = match?.zoneId ?? assignZoneFallback(cx, cy);
        return {
          id: `plant-${i}`,
          idx: i,
          cx, cy,
          r: Math.max(r, 8),
          zoneId,
        };
      });

    return { farmPolygons, allPlants };
  }, []);

  // ── Zone bounding boxes for zoom viewBox ─────────────────────────
  const zoneBboxes = useMemo(() => {
    const map: Record<string, { x: number; y: number; w: number; h: number }> = {};
    for (const fp of farmPolygons) {
      const xs = fp.points.map(p => p[0]);
      const ys = fp.points.map(p => p[1]);
      const pad = 80;
      map[fp.zoneId] = {
        x: Math.min(...xs) - pad,
        y: Math.min(...ys) - pad,
        w: Math.max(...xs) - Math.min(...xs) + pad * 2,
        h: Math.max(...ys) - Math.min(...ys) + pad * 2,
      };
    }
    return map;
  }, [farmPolygons]);

  const viewBox = useMemo(() => {
    const z = Math.max(0.1, zoomLevel);
    if (activeZoneId && zoneBboxes[activeZoneId]) {
      const bb = zoneBboxes[activeZoneId];
      const cx = bb.x + bb.w / 2;
      const cy = bb.y + bb.h / 2;
      return `${cx - bb.w / z / 2} ${cy - bb.h / z / 2} ${bb.w / z} ${bb.h / z}`;
    }
    const vw = IMG_W / z;
    const vh = IMG_H / z;
    return `${IMG_W / 2 - vw / 2} ${IMG_H / 2 - vh / 2} ${vw} ${vh}`;
  }, [activeZoneId, zoneBboxes, zoomLevel]);

  const activePlants = useMemo(
    () => activeZoneId ? allPlants.filter(p => p.zoneId === activeZoneId) : allPlants,
    [activeZoneId, allPlants],
  );

  // ── Handlers ─────────────────────────────────────────────────────
  function handleZoneClick(zoneId: string) {
    setActiveZoneId(zoneId);
    setSelectedPlantId(null);
    const zp = data.zones.find(z => z.zone_id === zoneId);
    if (zp && onZoneClick) onZoneClick(zp);
  }

  function handlePlantClick(plant: PlantCircle, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedPlantId(plant.id);
    const zoneMeta = SVG_ZONES.find(z => z.zone_id === plant.zoneId);
    if (!zoneMeta || !onPlantClick) return;
    const tree = generatePlantTree(plant.id, plant.cx, plant.cy, plant.zoneId, plant.idx, zoneMeta);
    onPlantClick(tree, zoneMeta);
  }

  function handleBackgroundClick() {
    if (activeZoneId) {
      setActiveZoneId(null);
      setSelectedPlantId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: '#0a1520' }}>
      {/* Back button when zoomed in */}
      {activeZoneId && (
        <button
          onClick={() => { setActiveZoneId(null); setSelectedPlantId(null); }}
          className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl active:opacity-70"
          style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          ← ภาพรวมฟาร์ม
        </button>
      )}

      {/* Zone indicator when zoomed */}
      {activeZoneId && (
        <div
          className="absolute top-3 right-3 z-10 text-xs font-bold px-3 py-2 rounded-xl"
          style={{
            background: ZONE_COLORS[activeZoneId]?.stroke ?? '#52B788',
            color: '#0a1520',
          }}
        >
          {ZONE_COLORS[activeZoneId]?.label ?? activeZoneId} · แตะต้นส้มเพื่อดูรายละเอียด
        </div>
      )}

      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'manipulation' }}
        onClick={handleBackgroundClick}
      >
        {/* ── Base image ── */}
        <image href="/farm_area_seg.png" x="0" y="0" width={IMG_W} height={IMG_H} />

        {!activeZoneId ? (
          /* ══ OVERVIEW ══ */
          <>
            {/* Farm polygon overlays */}
            {farmPolygons.map(fp => {
              const col = ZONE_COLORS[fp.zoneId] ?? ZONE_COLORS['zone-a'];
              const zoneData = data.zones.find(z => z.zone_id === fp.zoneId);
              const alpha = zoneData?.status === 'critical' ? 0.35 : 0.22;
              return (
                <g
                  key={fp.zoneId}
                  onClick={(e) => { e.stopPropagation(); handleZoneClick(fp.zoneId); }}
                  style={{ cursor: 'pointer' }}
                >
                  <polygon
                    points={fp.pointsStr}
                    fill={col.fill}
                    fillOpacity={alpha}
                    stroke={col.stroke}
                    strokeWidth="5"
                    strokeLinejoin="round"
                  />
                  {/* Zone label badge */}
                  <rect
                    x={fp.centroid[0] - 58}
                    y={fp.centroid[1] - 18}
                    width="116" height="36" rx="18"
                    fill="rgba(10,21,32,0.85)"
                    stroke={col.stroke}
                    strokeWidth="1.5"
                  />
                  <text
                    x={fp.centroid[0]}
                    y={fp.centroid[1] - 3}
                    textAnchor="middle"
                    fontFamily="'IBM Plex Mono',monospace"
                    fontSize="12"
                    fontWeight="700"
                    fill={col.stroke}
                  >
                    {col.label}
                  </text>
                  <text
                    x={fp.centroid[0]}
                    y={fp.centroid[1] + 12}
                    textAnchor="middle"
                    fontFamily="'IBM Plex Mono',monospace"
                    fontSize="9"
                    fill="#6B8A9E"
                  >
                    {zoneData ? `${Math.round(zoneData.health_score * 100)}% สุขภาพ` : ''}
                  </text>
                </g>
              );
            })}

            {/* Plant dots — overview (fixed 28px radius for visibility at full zoom) */}
            {allPlants.map(p => (
              <circle
                key={p.id}
                cx={p.cx} cy={p.cy} r="28"
                fill="#22c55e" fillOpacity="0.45"
                stroke="#16a34a" strokeWidth="2"
                style={{ pointerEvents: 'none' }}
              />
            ))}

            {/* Legend */}
            <g transform={`translate(40, ${IMG_H - 160})`}>
              <rect x="-10" y="-10" width="240" height="160" rx="12" fill="rgba(10,21,32,0.85)" />
              <text x="10" y="15" fontFamily="'IBM Plex Mono',monospace" fontSize="11" fill="#6B8A9E" fontWeight="600">ชั้นข้อมูล</text>
              {Object.entries(ZONE_COLORS).map(([, col], i) => (
                <g key={i} transform={`translate(10, ${30 + i * 28})`}>
                  <rect width="16" height="16" rx="4" fill={col.fill} fillOpacity="0.7" stroke={col.stroke} strokeWidth="1.5" />
                  <text x="24" y="13" fontFamily="'IBM Plex Mono',monospace" fontSize="10" fill={col.stroke}>{col.label}</text>
                </g>
              ))}
              <g transform="translate(10, 144)">
                <circle cx="8" cy="7" r="8" fill="#22c55e" fillOpacity="0.45" stroke="#16a34a" strokeWidth="1.5" />
                <text x="24" y="11" fontFamily="'IBM Plex Mono',monospace" fontSize="10" fill="#4ADE80">ต้นส้ม</text>
              </g>
            </g>
          </>
        ) : (
          /* ══ ZONE ZOOM ══ */
          <>
            {/* Dim overlay for context outside active zone */}
            {farmPolygons.filter(fp => fp.zoneId !== activeZoneId).map(fp => (
              <polygon
                key={fp.zoneId}
                points={fp.pointsStr}
                fill="rgba(0,0,0,0.35)"
                stroke="transparent"
                strokeWidth="0"
              />
            ))}

            {/* Active zone boundary */}
            {farmPolygons.filter(fp => fp.zoneId === activeZoneId).map(fp => {
              const col = ZONE_COLORS[fp.zoneId] ?? ZONE_COLORS['zone-a'];
              return (
                <polygon
                  key={fp.zoneId}
                  points={fp.pointsStr}
                  fill={col.fill}
                  fillOpacity="0.08"
                  stroke={col.stroke}
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Individual plant circles */}
            {activePlants.map(p => {
              const isSelected = p.id === selectedPlantId;
              const zoneMeta = SVG_ZONES.find(z => z.zone_id === p.zoneId);
              const col = ZONE_COLORS[p.zoneId] ?? ZONE_COLORS['zone-a'];
              // Pre-generate tree to get grade/problem for colouring
              const tree = zoneMeta
                ? generatePlantTree(p.id, p.cx, p.cy, p.zoneId, p.idx, zoneMeta)
                : null;
              const treeColor =
                tree?.grade === 'A' ? '#1D6B40'
                : tree?.grade === 'B' ? '#7DAA30'
                : tree?.grade === 'C' ? '#C0622F'
                : '#3A4A55';

              return (
                <g
                  key={p.id}
                  onClick={(e) => handlePlantClick(p, e)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Tap target */}
                  <circle cx={p.cx} cy={p.cy} r={p.r + 10} fill="transparent" />
                  {/* Selection ring */}
                  {isSelected && (
                    <circle cx={p.cx} cy={p.cy} r={p.r + 14}
                      fill="none" stroke="#FFFFFF" strokeWidth="3"
                      strokeDasharray="6,3" opacity="0.9"
                    />
                  )}
                  {/* Plant body */}
                  <circle
                    cx={p.cx} cy={p.cy} r={p.r}
                    fill={treeColor}
                    fillOpacity={isSelected ? 1 : 0.75}
                    stroke={col.stroke}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  {/* Grade label */}
                  {tree && (
                    <text
                      x={p.cx} y={p.cy + 5}
                      textAnchor="middle"
                      fontFamily="'IBM Plex Mono',monospace"
                      fontSize={p.r * 0.7}
                      fill="#FFFFFF"
                      fontWeight="700"
                      pointerEvents="none"
                    >
                      {tree.grade}
                    </text>
                  )}
                  {/* Problem indicator */}
                  {tree?.has_problem && tree.problem_type && (
                    <circle
                      cx={p.cx + p.r * 0.7} cy={p.cy - p.r * 0.7}
                      r={p.r * 0.4}
                      fill={PROB_DOT[tree.problem_type] ?? '#F47E7A'}
                      stroke="#0A1520" strokeWidth="1.5"
                    />
                  )}
                </g>
              );
            })}

            {/* Plant count badge */}
            {(() => {
              const bb = zoneBboxes[activeZoneId];
              if (!bb) return null;
              const col = ZONE_COLORS[activeZoneId] ?? ZONE_COLORS['zone-a'];
              return (
                <g transform={`translate(${bb.x + 10}, ${bb.y + bb.h - 60})`}>
                  <rect x="0" y="0" width="200" height="50" rx="10" fill="rgba(10,21,32,0.85)" />
                  <text x="12" y="20" fontFamily="'IBM Plex Mono',monospace" fontSize="11" fill={col.stroke} fontWeight="700">
                    {col.label} · {activePlants.length} ต้นส้ม
                  </text>
                  <text x="12" y="38" fontFamily="'IBM Plex Mono',monospace" fontSize="9" fill="#6B8A9E">
                    แตะต้นส้มเพื่อดูรายละเอียด
                  </text>
                </g>
              );
            })()}
          </>
        )}
      </svg>
    </div>
  );
}
