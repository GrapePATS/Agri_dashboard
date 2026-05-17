import type { ChartDataPoint } from '../../lib/types';

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export function BarChart({ data, height = 120 }: BarChartProps) {
  const maxDetections = Math.max(...data.map((d) => d.detections), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((point, i) => {
          const barH = Math.round((point.detections / maxDetections) * (height - 24));
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 relative">
              <div
                className="w-full bg-green-100 rounded-t-md relative group"
                style={{ height: Math.max(barH, 4) }}
              >
                <div
                  className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-stone-500 hidden group-hover:block whitespace-nowrap"
                >
                  {point.detections}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 mt-1">
        {data.map((point, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[10px] text-stone-500 font-medium">{point.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-200" />
          <span className="text-xs text-stone-500">การพบ</span>
        </div>
      </div>
    </div>
  );
}

export function HealthTrendLine({ data }: { data: ChartDataPoint[] }) {
  const w = 280;
  const h = 80;
  const pad = 12;
  const maxScore = 1;
  const minScore = Math.min(...data.map((d) => d.health_score), 0.3);
  const range = maxScore - minScore;

  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = pad + ((1 - (d.health_score - minScore) / range) * (h - pad * 2));
    return { x, y, d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#scoreGrad)" />
      <path d={pathD} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#16a34a" stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}
