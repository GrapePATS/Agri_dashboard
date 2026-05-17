import {
  RefreshCw, Bell, BrainCircuit, X, ChevronRight,
  Menu, ChevronDown, CheckCircle2, Circle, MapPin,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarmSummary } from '../hooks/useFarmSummary';
import { useDetections } from '../hooks/useDetections';
import { useYieldSummary } from '../hooks/useYieldSummary';
import { useDroneStatus, useScanHistory } from '../hooks/useDroneStatus';
import { FarmHealthSection } from '../components/home/FarmHealthSection';
import { DateFilterSection } from '../components/home/DateFilterSection';
import { CompactYieldCard } from '../components/home/YieldSummarySection';
import { SmartAlertsSection } from '../components/home/SmartAlertsSection';
import { DroneStatusSection } from '../components/home/DroneStatusSection';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';
import { Sidebar } from '../components/Sidebar';
import { FARM_LIST } from '../lib/mockData';
import type { FarmOption, FarmZoneOption } from '../lib/types';

function formatLastScan(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (h > 0) return `สแกนเมื่อ ${h} ชม. ${m} นาทีที่แล้ว`;
  return `สแกนเมื่อ ${m} นาทีที่แล้ว`;
}

export function HomePage() {
  const navigate = useNavigate();

  // ── UI state ────────────────────────────────────
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showFarmSelector, setShowFarmSelector] = useState(false);

  // ── Farm / zone selection ────────────────────────
  const [selectedFarm, setSelectedFarm] = useState<FarmOption>(FARM_LIST[0]);
  const [selectedZone, setSelectedZone] = useState<FarmZoneOption | null>(null);

  // ── Data ─────────────────────────────────────────
  const { data: farm, isLoading: farmLoading, refetch, isFetching } = useFarmSummary();
  const { data: detectionsData, isLoading: detLoading } = useDetections({ status: 'active', limit: 20 });
  const { data: yieldData, isLoading: yieldLoading } = useYieldSummary();
  const { data: drone, isLoading: droneLoading } = useDroneStatus();
  const { data: scans, isLoading: scansLoading } = useScanHistory();

  const isLoading = farmLoading || detLoading || yieldLoading || droneLoading || scansLoading;
  const activeAlerts = farm?.active_alerts ?? 0;

  const handleFarmSelect = (f: FarmOption) => {
    setSelectedFarm(f);
    setSelectedZone(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">

      {/* ── Sidebar ─────────────────────────────── */}
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        activeFarm={selectedFarm}
      />

      {/* ── App Header ──────────────────────────── */}
      <div className="bg-gradient-to-br from-green-900 to-green-700 px-4 pt-12 pb-5">

        {/* Top bar: hamburger + logo + actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {/* Hamburger */}
            <button
              onClick={() => setShowSidebar(true)}
              className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center active:bg-white/25 shrink-0"
            >
              <Menu size={20} className="text-white" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-base shrink-0">
                🌾
              </div>
              <div>
                <p className="text-white font-black text-base leading-tight">AgriVision AI</p>
                <p className="text-green-300 text-[10px]">ระบบวิเคราะห์ฟาร์มอัจฉริยะ</p>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center active:bg-white/25"
            >
              <RefreshCw size={17} className={`text-white ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAlerts(true)}
              className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center relative active:bg-white/25"
            >
              <Bell size={17} className="text-white" />
              {activeAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-green-800 text-white text-[10px] font-black flex items-center justify-center">
                  {activeAlerts}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Farm greeting + selector */}
        <div>
          <p className="text-green-300 text-xs mb-1">สวัสดีคุณเกษตรกร 👨‍🌾</p>

          {/* Farm selector button */}
          <button
            onClick={() => setShowFarmSelector(true)}
            className="flex items-center gap-2 group active:opacity-80"
          >
            <p className="text-white text-2xl font-black leading-tight">{selectedFarm.farm_name}</p>
            <div className="flex items-center gap-0.5 bg-white/20 rounded-full px-2 py-0.5 mt-0.5">
              <ChevronDown size={13} className="text-green-200" />
            </div>
          </button>

          {/* Sub-info row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {farm && (
              <p className="text-green-300 text-xs">
                {formatLastScan(farm.last_scan_at)} · {selectedFarm.total_area_rai} ไร่
              </p>
            )}
            {/* Active zone chip */}
            {selectedZone && (
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5">
                <MapPin size={10} className="text-green-200" />
                <span className="text-green-100 text-[10px] font-semibold">
                  {selectedZone.zone_name} · {selectedZone.crop}
                </span>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="ml-0.5 text-green-300 active:text-white"
                >
                  <X size={10} />
                </button>
              </div>
            )}
          </div>

          {/* Zone quick-chips (shown only if > 1 zone) */}
          {selectedFarm.zones.length > 1 && (
            <div className="flex gap-1.5 mt-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setSelectedZone(null)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  selectedZone === null
                    ? 'bg-white text-green-800 border-white'
                    : 'bg-white/15 text-white border-white/25'
                }`}
              >
                ทั้งหมด
              </button>
              {selectedFarm.zones.map((z) => (
                <button
                  key={z.zone_id}
                  onClick={() => setSelectedZone(z)}
                  className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                    selectedZone?.zone_id === z.zone_id
                      ? 'bg-white text-green-800 border-white'
                      : 'bg-white/15 text-white border-white/25'
                  }`}
                >
                  {z.zone_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Loading skeleton ─────────────────────── */}
      {isLoading && (
        <div className="px-4 py-5 space-y-4">
          <Skeleton className="h-52 rounded-2xl" />
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <Skeleton className="h-52 rounded-2xl" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* ── Main content ─────────────────────────── */}
      {!isLoading && farm && (
        <div className="py-5 space-y-5">

          <SectionWrapper title="สุขภาพฟาร์ม" emoji="🏥">
            <FarmHealthSection
              farm={farm}
              detections={detectionsData?.items ?? []}
              lastScanLabel={formatLastScan(farm.last_scan_at)}
            />
          </SectionWrapper>

          {yieldData && (
            <SectionWrapper title="วิเคราะห์ผลผลิต" emoji="🌾">
              <CompactYieldCard yield_={yieldData} />
            </SectionWrapper>
          )}

          <SectionWrapper title="เลือกช่วงเวลา" emoji="📅">
            <DateFilterSection scans={scans ?? []} />
          </SectionWrapper>

          {drone && (
            <SectionWrapper title="สถานะโดรน" emoji="🛸">
              <DroneStatusSection drone={drone} />
            </SectionWrapper>
          )}

          {/* AI Advisor Banner */}
          <div className="px-4">
            <button
              onClick={() => navigate('/ai-summary')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 flex items-center gap-4 shadow-md active:opacity-90"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <BrainCircuit size={26} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-bold text-base">AI Farm Advisor</p>
                <p className="text-indigo-200 text-xs mt-0.5">วิเคราะห์ฟาร์มเชิงลึกด้วย AI</p>
              </div>
              <div className="text-white text-2xl">›</div>
            </button>
          </div>
        </div>
      )}

      {/* ── Farm selector bottom sheet ───────────── */}
      {showFarmSelector && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowFarmSelector(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-stone-50 rounded-t-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '75dvh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-9 h-1 rounded-full bg-stone-300" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 py-2.5 shrink-0">
              <h2 className="text-sm font-black text-stone-900">เลือกฟาร์มและแปลง</h2>
              <button
                onClick={() => setShowFarmSelector(false)}
                className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center active:bg-stone-300"
              >
                <X size={14} className="text-stone-600" />
              </button>
            </div>

            <div className="h-px bg-stone-200 shrink-0" />

            <div className="overflow-y-auto overscroll-contain pt-3 pb-8">

              {/* Farm list */}
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-2">
                ฟาร์มของคุณ
              </p>
              <div className="space-y-2 px-4">
                {FARM_LIST.map((f) => {
                  const active = f.farm_id === selectedFarm.farm_id;
                  return (
                    <button
                      key={f.farm_id}
                      onClick={() => handleFarmSelect(f)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all active:opacity-80 ${
                        active
                          ? 'bg-green-50 border-green-300'
                          : 'bg-white border-stone-100'
                      }`}
                    >
                      {/* Farm icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        active ? 'bg-green-100' : 'bg-stone-100'
                      }`}>
                        🌾
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold leading-tight ${active ? 'text-green-800' : 'text-stone-900'}`}>
                          {f.farm_name}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {f.total_area_rai} ไร่ · {f.zones.length} แปลง
                        </p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {f.zones.map((z) => (
                            <span
                              key={z.zone_id}
                              className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full"
                            >
                              {z.zone_name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {active
                        ? <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                        : <Circle size={20} className="text-stone-300 shrink-0" />
                      }
                    </button>
                  );
                })}
              </div>

              {/* Zone list for selected farm */}
              <div className="mt-5 px-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                  แปลงใน {selectedFarm.farm_name}
                </p>

                {/* "All zones" option */}
                <button
                  onClick={() => setSelectedZone(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border mb-2 text-left transition-all active:opacity-80 ${
                    selectedZone === null
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-stone-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${
                    selectedZone === null ? 'bg-green-100' : 'bg-stone-100'
                  }`}>
                    🗺️
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${selectedZone === null ? 'text-green-800' : 'text-stone-700'}`}>
                      ทุกแปลง
                    </p>
                    <p className="text-xs text-stone-400">{selectedFarm.total_area_rai} ไร่รวม</p>
                  </div>
                  {selectedZone === null
                    ? <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                    : <Circle size={18} className="text-stone-300 shrink-0" />
                  }
                </button>

                {/* Individual zones */}
                <div className="space-y-2">
                  {selectedFarm.zones.map((z) => {
                    const zoneActive = selectedZone?.zone_id === z.zone_id;
                    return (
                      <button
                        key={z.zone_id}
                        onClick={() => setSelectedZone(z)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all active:opacity-80 ${
                          zoneActive
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-stone-100'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${
                          zoneActive ? 'bg-green-100' : 'bg-stone-100'
                        }`}>
                          🌱
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${zoneActive ? 'text-green-800' : 'text-stone-700'}`}>
                            {z.zone_name}
                          </p>
                          <p className="text-xs text-stone-400">{z.crop} · {z.area_rai} ไร่</p>
                        </div>
                        {zoneActive
                          ? <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                          : <Circle size={18} className="text-stone-300 shrink-0" />
                        }
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirm button */}
              <div className="px-4 mt-5">
                <button
                  onClick={() => setShowFarmSelector(false)}
                  className="w-full bg-green-700 text-white rounded-2xl py-3.5 font-bold text-sm active:bg-green-800"
                >
                  ยืนยันการเลือก
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Alerts bottom sheet ──────────────────── */}
      {showAlerts && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAlerts(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-stone-50 rounded-t-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '65dvh' }}
          >
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-9 h-1 rounded-full bg-stone-300" />
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-red-500" />
                <h2 className="text-sm font-black text-stone-900">การแจ้งเตือน</h2>
                {activeAlerts > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeAlerts}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setShowAlerts(false); navigate('/detections'); }}
                  className="text-green-700 text-xs font-semibold flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-green-50 active:bg-green-100"
                >
                  ดูทั้งหมด <ChevronRight size={12} />
                </button>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center active:bg-stone-300"
                >
                  <X size={14} className="text-stone-600" />
                </button>
              </div>
            </div>

            <div className="h-px bg-stone-200 shrink-0" />

            <div className="overflow-y-auto overscroll-contain pt-3 pb-6">
              <SmartAlertsSection detections={detectionsData?.items ?? []} showHeader={false} compact />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SectionWrapper({
  title,
  emoji,
  urgent = false,
  children,
}: {
  title: string;
  emoji: string;
  urgent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 px-4 mb-3">
        <span className="text-lg">{emoji}</span>
        <h2 className="text-base font-black text-stone-900">{title}</h2>
        {urgent && (
          <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
            ต้องดำเนินการ
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
