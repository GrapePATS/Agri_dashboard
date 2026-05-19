interface MiniMapSVGProps {
  mode?: 'health' | 'yield';
  showHotspots?: boolean;
  className?: string;
}

const HEALTH_COLORS = {
  healthy: { fill: '#16a34a', stroke: '#15803d', text: '#fff' },
  warning: { fill: '#d97706', stroke: '#b45309', text: '#fff' },
  critical: { fill: '#dc2626', stroke: '#b91c1c', text: '#fff' },
};

const YIELD_COLORS = {
  high: { fill: '#15803d', stroke: '#166534', text: '#fff' },
  medium: { fill: '#ca8a04', stroke: '#a16207', text: '#fff' },
  low: { fill: '#b91c1c', stroke: '#991b1b', text: '#fff' },
};

const HOTSPOTS = [
  { cx: 68, cy: 48, r: 4, severity: 'high' },
  { cx: 82, cy: 62, r: 3, severity: 'medium' },
  { cx: 48, cy: 35, r: 3, severity: 'medium' },
  { cx: 168, cy: 38, r: 5, severity: 'critical' },
  { cx: 195, cy: 55, r: 4, severity: 'critical' },
  { cx: 180, cy: 25, r: 3, severity: 'high' },
  { cx: 60, cy: 118, r: 4, severity: 'high' },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#d97706',
  medium: '#eab308',
};

export function MiniMapSVG({ mode = 'health', showHotspots = true, className = '' }: MiniMapSVGProps) {
  const zoneA = mode === 'health' ? HEALTH_COLORS.healthy : YIELD_COLORS.high;
  const zoneB = mode === 'health' ? HEALTH_COLORS.warning : YIELD_COLORS.medium;
  const zoneC = mode === 'health' ? HEALTH_COLORS.critical : YIELD_COLORS.low;
  const zoneD = mode === 'health' ? HEALTH_COLORS.healthy : YIELD_COLORS.high;

  return (
    <svg
      viewBox="0 0 280 160"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full ${className}`}
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect width="280" height="160" fill="#e7e5e4" rx="0" />

      <defs>
        <pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="280" height="160" fill="url(#grid)" />

      {/* Road dividers */}
      <rect x="132" y="0" width="16" height="160" fill="#c4b5a0" opacity="0.8" />
      <rect x="0" y="76" width="280" height="12" fill="#c4b5a0" opacity="0.8" />
      <line x1="132" y1="0" x2="132" y2="160" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
      <line x1="148" y1="0" x2="148" y2="160" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
      <line x1="0" y1="76" x2="280" y2="76" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
      <line x1="0" y1="88" x2="280" y2="88" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />

      {/* Zone A — NW — ข้าวหอมมะลิ */}
      <rect x="2" y="2" width="128" height="72" rx="5"
        fill={zoneA.fill} fillOpacity="0.75" stroke={zoneA.stroke} strokeWidth="1.5" />
      <text x="66" y="34" textAnchor="middle" fill={zoneA.text} fontSize="11" fontWeight="700">แปลง A</text>
      <text x="66" y="48" textAnchor="middle" fill={zoneA.text} fontSize="8.5" opacity="0.85">ข้าวหอมมะลิ</text>
      <rect x="36" y="54" width="60" height="13" rx="6.5" fill="rgba(255,255,255,0.25)" />
      <text x="66" y="64" textAnchor="middle" fill={zoneA.text} fontSize="8" fontWeight="600">
        {mode === 'health' ? 'สุขภาพดี 87%' : 'ผลผลิตสูง'}
      </text>

      {/* Zone B — NE — ข้าวเจ้า */}
      <rect x="150" y="2" width="128" height="72" rx="5"
        fill={zoneB.fill} fillOpacity="0.75" stroke={zoneB.stroke} strokeWidth="1.5" />
      <text x="214" y="34" textAnchor="middle" fill={zoneB.text} fontSize="11" fontWeight="700">แปลง B</text>
      <text x="214" y="48" textAnchor="middle" fill={zoneB.text} fontSize="8.5" opacity="0.85">ข้าวเจ้า</text>
      <rect x="184" y="54" width="60" height="13" rx="6.5" fill="rgba(255,255,255,0.25)" />
      <text x="214" y="64" textAnchor="middle" fill={zoneB.text} fontSize="8" fontWeight="600">
        {mode === 'health' ? 'เฝ้าระวัง 58%' : 'ผลผลิตปานกลาง'}
      </text>

      {/* Zone C — SW — ข้าวหอมนิล */}
      <rect x="2" y="90" width="128" height="68" rx="5"
        fill={zoneC.fill} fillOpacity="0.75" stroke={zoneC.stroke} strokeWidth="1.5" />
      <text x="66" y="120" textAnchor="middle" fill={zoneC.text} fontSize="11" fontWeight="700">แปลง C</text>
      <text x="66" y="133" textAnchor="middle" fill={zoneC.text} fontSize="8.5" opacity="0.85">ข้าวหอมนิล</text>
      <rect x="36" y="139" width="60" height="13" rx="6.5" fill="rgba(255,255,255,0.25)" />
      <text x="66" y="149" textAnchor="middle" fill={zoneC.text} fontSize="8" fontWeight="600">
        {mode === 'health' ? 'วิกฤติ 31%' : 'ผลผลิตต่ำ'}
      </text>

      {/* Zone D — SE — ข้าวหอมปทุม */}
      <rect x="150" y="90" width="128" height="68" rx="5"
        fill={zoneD.fill} fillOpacity="0.75" stroke={zoneD.stroke} strokeWidth="1.5" />
      <text x="214" y="120" textAnchor="middle" fill={zoneD.text} fontSize="11" fontWeight="700">แปลง D</text>
      <text x="214" y="133" textAnchor="middle" fill={zoneD.text} fontSize="8.5" opacity="0.85">ข้าวหอมปทุม</text>
      <rect x="184" y="139" width="60" height="13" rx="6.5" fill="rgba(255,255,255,0.25)" />
      <text x="214" y="149" textAnchor="middle" fill={zoneD.text} fontSize="8" fontWeight="600">
        {mode === 'health' ? 'สุขภาพดี 92%' : 'ผลผลิตสูง'}
      </text>

      {/* Hotspots */}
      {showHotspots && HOTSPOTS.map((h, i) => (
        <g key={i}>
          <circle cx={h.cx} cy={h.cy} r={h.r + 4} fill={SEVERITY_COLORS[h.severity]} opacity="0.3" />
          <circle cx={h.cx} cy={h.cy} r={h.r} fill={SEVERITY_COLORS[h.severity]} stroke="white" strokeWidth="1.5" />
        </g>
      ))}

      {/* North indicator */}
      <circle cx="15" cy="15" r="9" fill="rgba(0,0,0,0.3)" />
      <text x="15" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">N</text>

      {/* Scale bar */}
      <rect x="220" y="150" width="40" height="3" fill="rgba(0,0,0,0.4)" rx="1.5" />
      <text x="220" y="162" fill="rgba(0,0,0,0.5)" fontSize="7">100 ม.</text>
    </svg>
  );
}
