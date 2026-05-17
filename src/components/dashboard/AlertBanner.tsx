import { AlertTriangle } from 'lucide-react';

interface AlertBannerProps {
  count: number;
  message: string;
}

export function AlertBanner({ count, message }: AlertBannerProps) {
  if (count === 0) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
      <div className="shrink-0 bg-red-100 rounded-xl p-2">
        <AlertTriangle size={18} className="text-red-600" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-800">
          แจ้งเตือน {count} รายการ
        </p>
        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
