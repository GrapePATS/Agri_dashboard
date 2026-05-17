import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useYieldSummary } from '../hooks/useYieldSummary';
import { YieldSummarySection } from '../components/home/YieldSummarySection';
import { Skeleton } from '../components/ui/Skeleton';

export function YieldPage() {
  const navigate = useNavigate();
  const { data: yieldData, isLoading } = useYieldSummary();

  return (
    <div className="min-h-screen bg-stone-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-900 to-green-700 px-4 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center active:bg-white/25 shrink-0"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-black">วิเคราะห์ผลผลิต</h1>
            <p className="text-green-300 text-xs mt-0.5">ภาพรวมและการคาดการณ์ผลผลิต</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-4">
        {isLoading && (
          <div className="px-4 space-y-3">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
        )}

        {yieldData && <YieldSummarySection yield_={yieldData} />}
      </div>
    </div>
  );
}
