interface HealthScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

function getColor(score: number): string {
  if (score >= 0.7) return '#16a34a';
  if (score >= 0.4) return '#d97706';
  return '#dc2626';
}

export function HealthScoreRing({ score, size = 96, strokeWidth = 8 }: HealthScoreRingProps) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * score;
  const color = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-stone-800 leading-none">
          {Math.round(score * 100)}
        </span>
        <span className="text-xs text-stone-500 leading-tight mt-0.5">คะแนน</span>
      </div>
    </div>
  );
}
