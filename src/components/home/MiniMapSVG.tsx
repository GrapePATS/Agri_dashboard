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

// Hotspot positions mapped to schematic layout
const HOTSPOTS = [
  { cx: 210, cy: 105, r: 5, severity: 'critical' },
  { cx: 238, cy: 118, r: 4, severity: 'critical' },
  { cx: 195, cy: 128, r: 4, severity: 'high' },
  { cx: 148, cy: 85, r: 4, severity: 'high' },
  { cx: 162, cy: 72, r: 3, severity: 'medium' },
  { cx: 55, cy: 45, r: 3, severity: 'medium' },
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

  return (
    <svg
      viewBox="0 0 280 160"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full ${className}`}
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect width="280" height="160" fill="#e7e5e4" rx="0" />

      {/* Grid pattern */}
      <defs>
        <pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
        </pattern>
        <filter id="glow-critical">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="280" height="160" fill="url(#grid)" />

      {/* Zone A — ข้าวหอมมะลิ (left large, healthy/high) */}
      <rect
        x="2" y="2" width="164" height="156"
        rx="6"
        fill={zoneA.fill}
        fillOpacity="0.75"
        stroke={zoneA.stroke}
        strokeWidth="1.5"
      />
      <text x="84" y="72" textAnchor="middle" fill={zoneA.text} fontSize="11" fontWeight="700">แปลง A</text>
      <text x="84" y="88" textAnchor="middle" fill={zoneA.text} fontSize="9" opacity="0.85">ข้าวหอมมะลิ</text>
      <rect x="60" y="96" width="48" height="16" rx="8" fill="rgba(255,255,255,0.25)" />
      <text x="84" y="108" textAnchor="middle" fill={zoneA.text} fontSize="9" fontWeight="600">
        {mode === 'health' ? 'สุขภาพดี 87%' : 'ผลผลิตสูง'}
      </text>

      {/* Zone B — ข้าวเจ้า (right top, warning/medium) */}
      <rect
        x="170" y="2" width="108" height="78"
        rx="6"
        fill={zoneB.fill}
        fillOpacity="0.75"
        stroke={zoneB.stroke}
        strokeWidth="1.5"
      />
      <text x="224" y="36" textAnchor="middle" fill={zoneB.text} fontSize="11" fontWeight="700">แปลง B</text>
      <text x="224" y="50" textAnchor="middle" fill={zoneB.text} fontSize="9" opacity="0.85">ข้าวเจ้า</text>
      <rect x="198" y="57" width="52" height="14" rx="7" fill="rgba(255,255,255,0.25)" />
      <text x="224" y="68" textAnchor="middle" fill={zoneB.text} fontSize="8.5" fontWeight="600">
        {mode === 'health' ? 'เฝ้าระวัง 58%' : 'ผลผลิตปานกลาง'}
      </text>

      {/* Zone C — ข้าวหอมนิล (right bottom, critical/low) */}
      <rect
        x="170" y="82" width="108" height="76"
        rx="6"
        fill={zoneC.fill}
        fillOpacity="0.75"
        stroke={zoneC.stroke}
        strokeWidth="1.5"
      />
      <text x="224" y="116" textAnchor="middle" fill={zoneC.text} fontSize="11" fontWeight="700">แปลง C</text>
      <text x="224" y="130" textAnchor="middle" fill={zoneC.text} fontSize="9" opacity="0.85">ข้าวหอมนิล</text>
      <rect x="198" y="137" width="52" height="14" rx="7" fill="rgba(255,255,255,0.25)" />
      <text x="224" y="148" textAnchor="middle" fill={zoneC.text} fontSize="8.5" fontWeight="600">
        {mode === 'health' ? 'วิกฤติ 31%' : 'ผลผลิตต่ำ'}
      </text>

      {/* Divider lines */}
      <line x1="168" y1="2" x2="168" y2="158" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <line x1="168" y1="80" x2="278" y2="80" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />

      {/* Hotspots */}
      {showHotspots && HOTSPOTS.map((h, i) => (
        <g key={i}>
          <circle
            cx={h.cx} cy={h.cy} r={h.r + 4}
            fill={SEVERITY_COLORS[h.severity]}
            opacity="0.3"
          />
          <circle
            cx={h.cx} cy={h.cy} r={h.r}
            fill={SEVERITY_COLORS[h.severity]}
            stroke="white"
            strokeWidth="1.5"
          />
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
