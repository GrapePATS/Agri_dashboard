import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDetections } from '../hooks/useDetections';
import { DetectionCard } from '../components/detections/DetectionCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import type { DetectionType } from '../lib/types';

type FilterType = 'all' | DetectionType;

const filterTabs: { key: FilterType; label: string; emoji: string }[] = [
  { key: 'all', label: 'ทั้งหมด', emoji: '🔍' },
  { key: 'disease', label: 'โรคพืช', emoji: '🦠' },
  { key: 'weed', label: 'วัชพืช', emoji: '🌿' },
  { key: 'pest', label: 'แมลง', emoji: '🪲' },
];

export function DetectionsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useDetections({
    type: activeFilter === 'all' ? undefined : activeFilter,
    limit: 50,
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-900 to-green-700 px-4 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center active:bg-white/25 shrink-0"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-black">ผลการตรวจพบ</h1>
            <p className="text-green-300 text-xs mt-0.5">โรค วัชพืช และแมลงศัตรูพืช</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {filterTabs.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`shrink-0 flex items-center gap-1.5 px-4 min-h-[40px] rounded-xl text-sm font-bold transition-all ${
                activeFilter === key
                  ? 'bg-white text-green-800'
                  : 'bg-white/15 text-white border border-white/20'
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {isError && (
          <div className="text-center py-10">
            <p className="text-stone-500 text-sm mb-3">โหลดข้อมูลไม่สำเร็จ</p>
            <button onClick={() => refetch()} className="text-green-700 text-sm font-semibold">
              ลองอีกครั้ง
            </button>
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-stone-600 font-bold">ไม่พบข้อมูล</p>
            <p className="text-stone-400 text-sm mt-1">ลองเปลี่ยนตัวกรอง</p>
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-stone-500 font-semibold">
                พบ {data.total} รายการ
              </p>
              <button
                onClick={() => navigate('/map')}
                className="text-xs text-green-700 font-bold px-3 py-1.5 bg-green-50 rounded-xl"
              >
                🗺️ ดูบนแผนที่
              </button>
            </div>
            {data.items.map((d) => (
              <DetectionCard key={d.detection_id} detection={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
