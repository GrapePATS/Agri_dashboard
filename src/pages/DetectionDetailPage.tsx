import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bug,
  Leaf,
  Microscope,
  Calendar,
  MapPin,
  Percent,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { useDetectionDetail } from '../hooks/useDetectionDetail';
import { SeverityBadge } from '../components/detections/SeverityBadge';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

// REDESIGN: weed uses Panache/Green Pea palette colors
const typeConfig = {
  disease: { Icon: Microscope, label: 'โรคพืช', iconBg: 'bg-red-50', iconColor: 'text-red-600' },
  weed: { Icon: Leaf, label: 'วัชพืช', iconBg: 'bg-[#e9f6eb]', iconColor: 'text-[#1d6233]' },
  pest: { Icon: Bug, label: 'แมลงศัตรู', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DetectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDetectionDetail(id ?? '');

  return (
    <div className="pb-8">
      {/* REDESIGN: Surf Crest border on sticky bar */}
      <div className="sticky top-0 bg-white border-b border-[#d2e5d3] z-10">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-[#e9f6eb] active:bg-[#d2e5d3] transition-colors"
          >
            <ArrowLeft size={20} className="text-stone-700" />
          </button>
          <h1 className="text-base font-bold text-stone-900">รายละเอียด</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-36" />
            <Skeleton className="h-20" />
          </div>
        )}

        {isError && (
          <div className="text-center py-10">
            <p className="text-stone-500 text-sm">ไม่พบข้อมูล</p>
          </div>
        )}

        {data && (() => {
          const { Icon, label, iconBg, iconColor } = typeConfig[data.type];
          return (
            <div className="space-y-4">
              {/* REDESIGN: Surf Crest border on all detail cards */}
              <div className="bg-white rounded-2xl border border-[#d2e5d3] shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 rounded-xl p-3 ${iconBg}`}>
                    <Icon size={24} className={iconColor} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-stone-900 leading-tight">{data.label}</h2>
                    <p className="text-sm text-stone-500 mt-0.5">{label}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <SeverityBadge severity={data.severity} />
                      <Badge variant={data.status === 'active' ? 'danger' : 'success'}>
                        {data.status === 'active' ? 'กำลังระบาด' : 'แก้ไขแล้ว'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* REDESIGN: Surf Crest placeholder bg */}
              <div className="bg-[#d2e5d3] rounded-2xl overflow-hidden h-48 flex items-center justify-center">
                {data.image_url ? (
                  <img src={data.image_url} alt={data.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className={`rounded-2xl p-4 ${iconBg} mx-auto w-fit mb-2`}>
                      <Icon size={32} className={iconColor} strokeWidth={1.5} />
                    </div>
                    <p className="text-stone-500 text-sm font-medium">{data.label}</p>
                    <p className="text-stone-400 text-xs mt-0.5">ไม่มีภาพ</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-[#d2e5d3] shadow-sm p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target size={13} className="text-stone-400" />
                    <p className="text-xs text-stone-500">ความเชื่อมั่น</p>
                  </div>
                  <p className="text-xl font-bold text-stone-900">
                    {Math.round(data.confidence * 100)}%
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-[#d2e5d3] shadow-sm p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Percent size={13} className="text-stone-400" />
                    <p className="text-xs text-stone-500">พื้นที่ติดโรค</p>
                  </div>
                  <p className="text-xl font-bold text-stone-900">
                    {data.affected_area_pct}%
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#d2e5d3] shadow-sm p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-400">แปลงนา</p>
                    <p className="text-sm font-medium text-stone-800">{data.zone_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar size={15} className="text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-400">เวลาที่ตรวจพบ</p>
                    <p className="text-sm font-medium text-stone-800">
                      {formatDateTime(data.detected_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* REDESIGN: Panache recommendation card, Surf Crest border */}
              <div className="bg-[#e9f6eb] border border-[#d2e5d3] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 bg-[#d2e5d3] rounded-xl p-2 mt-0.5">
                    <CheckCircle2 size={18} className="text-[#1d6233]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1d6233] mb-1.5">วิธีแก้ไข</p>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {data.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
