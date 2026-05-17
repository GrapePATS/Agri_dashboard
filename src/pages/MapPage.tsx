import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMapData } from '../hooks/useMapData';
import { FarmMap } from '../components/map/FarmMap';
import { Skeleton } from '../components/ui/Skeleton';
import type { ZonePolygon } from '../lib/types';

const statusLabel = { healthy: 'สุขภาพดี', warning: 'เฝ้าระวัง', critical: 'วิกฤติ' };
const statusColor = {
  healthy: 'text-green-700 bg-green-50 border-green-200',
  warning: 'text-amber-700 bg-amber-50 border-amber-200',
  critical: 'text-red-700 bg-red-50 border-red-200',
};
const statusBorderLeft = {
  healthy: 'border-l-green-500',
  warning: 'border-l-amber-500',
  critical: 'border-l-red-500',
};

type LayerKey = 'health' | 'disease' | 'pest' | 'weed';
const LAYERS: { key: LayerKey; label: string; emoji: string }[] = [
  { key: 'health', label: 'สุขภาพ', emoji: '🏥' },
  { key: 'disease', label: 'โรคพืช', emoji: '🦠' },
  { key: 'pest', label: 'แมลง', emoji: '🪲' },
  { key: 'weed', label: 'วัชพืช', emoji: '🌿' },
];

export function MapPage() {
  const { data, isLoading, isError } = useMapData();
  const [selectedZone, setSelectedZone] = useState<ZonePolygon | null>(null);
  const [activeLayer, setActiveLayer] = useState<LayerKey>('health');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-stone-900">
      {/* Header */}
      <div className="bg-stone-900/95 backdrop-blur-sm px-4 pt-12 pb-3 flex items-center gap-3 z-[1001] shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 active:bg-white/25"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-lg leading-tight">แผนที่ฟาร์ม</h1>
          <p className="text-stone-400 text-xs">แตะแปลงนาเพื่อดูรายละเอียด</p>
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-1">
          {[
            { color: 'bg-green-500', label: 'ดี' },
            { color: 'bg-amber-500', label: 'เฝ้า' },
            { color: 'bg-red-500', label: 'วิกฤติ' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-[10px] text-stone-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer selector */}
      <div className="bg-stone-800/90 backdrop-blur-sm px-4 py-2.5 shrink-0 z-[1000]">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {LAYERS.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setActiveLayer(key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                activeLayer === key
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white/10 border-white/20 text-stone-300'
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-800">
            <div className="text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <Skeleton className="w-48 h-4 mx-auto" />
            </div>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-800">
            <p className="text-stone-400 text-sm">ไม่สามารถโหลดแผนที่ได้</p>
          </div>
        )}

        {data && <FarmMap data={data} onZoneClick={setSelectedZone} />}

        {/* Zone detail panel */}
        {selectedZone && (
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[1001] p-5">
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-4" />
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">{selectedZone.zone_name}</h3>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border mt-1.5 inline-block ${statusColor[selectedZone.status]}`}
                >
                  {statusLabel[selectedZone.status]}
                </span>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center active:bg-stone-200"
              >
                <X size={18} className="text-stone-600" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs text-stone-500 mb-1">คะแนนสุขภาพ</p>
                <p className="text-3xl font-black text-stone-900">
                  {Math.round(selectedZone.health_score * 100)}
                  <span className="text-sm text-stone-400 font-normal"> /100</span>
                </p>
              </div>
              <div className={`rounded-xl p-3 border-l-4 ${statusBorderLeft[selectedZone.status]} bg-stone-50`}>
                <p className="text-xs text-stone-500 mb-1">พบปัญหา</p>
                <p className="text-3xl font-black text-stone-900">
                  {selectedZone.detection_count}
                  <span className="text-sm text-stone-400 font-normal"> รายการ</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/detections')}
              className="w-full bg-green-700 text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 active:bg-green-800"
            >
              ดูรายละเอียดการตรวจพบ →
            </button>
          </div>
        )}

        {/* Floating action buttons */}
        {!selectedZone && (
          <div className="absolute bottom-6 right-4 flex flex-col gap-3 z-[1000]">
            <button
              onClick={() => navigate('/detections')}
              className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg active:bg-red-600 text-2xl"
            >
              🦠
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="w-14 h-14 bg-green-700 rounded-full flex items-center justify-center shadow-lg active:bg-green-800 text-2xl"
            >
              📊
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
