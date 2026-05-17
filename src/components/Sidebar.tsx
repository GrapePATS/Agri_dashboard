import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  Wheat,
  Search,
  Map,
  BarChart2,
  BrainCircuit,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import type { FarmOption } from '../lib/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeFarm: FarmOption | null;
}

const NAV_GROUPS = [
  {
    label: 'ภาพรวม',
    items: [
      { path: '/', label: 'หน้าแรก', Icon: Home },
      { path: '/yield', label: 'วิเคราะห์ผลผลิต', Icon: Wheat },
    ],
  },
  {
    label: 'ตรวจสอบ',
    items: [
      { path: '/detections', label: 'ผลการตรวจพบ', Icon: Search },
      { path: '/map', label: 'แผนที่ฟาร์ม', Icon: Map },
    ],
  },
  {
    label: 'วิเคราะห์',
    items: [
      { path: '/reports', label: 'รายงานฟาร์ม', Icon: BarChart2 },
      { path: '/ai-summary', label: 'AI Advisor', Icon: BrainCircuit },
    ],
  },
  {
    label: 'จัดการ',
    items: [
      { path: '/tasks', label: 'งานที่ต้องทำ', Icon: ClipboardList },
    ],
  },
];

export function Sidebar({ isOpen, onClose, activeFarm }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-50 bg-white shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '72vw', maxWidth: '288px' }}
      >
        {/* ── Sidebar header ─────────────────────── */}
        <div className="bg-gradient-to-br from-green-900 to-green-700 px-5 pt-12 pb-5 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg shrink-0">
                🌾
              </div>
              <div>
                <p className="text-white font-black text-sm leading-tight">AgriVision AI</p>
                <p className="text-green-300 text-[10px]">ระบบเกษตรอัจฉริยะ</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center active:bg-white/25 shrink-0"
            >
              <X size={15} className="text-white" />
            </button>
          </div>

          {/* Active farm chip */}
          {activeFarm && (
            <div className="bg-white/15 rounded-xl px-3 py-2.5">
              <p className="text-green-300 text-[10px] font-semibold uppercase tracking-wide mb-0.5">
                ฟาร์มที่ใช้งานอยู่
              </p>
              <p className="text-white text-sm font-bold leading-tight">{activeFarm.farm_name}</p>
              <p className="text-green-300 text-[10px] mt-0.5">
                {activeFarm.total_area_rai} ไร่ · {activeFarm.zones.length} แปลง
              </p>
            </div>
          )}
        </div>

        {/* ── Nav items ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto py-2">
          {NAV_GROUPS.map(({ label, items }) => (
            <div key={label} className="mb-1">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-5 py-2">
                {label}
              </p>
              {items.map(({ path, label: itemLabel, Icon }) => {
                const active = isActive(path);
                return (
                  <button
                    key={path}
                    onClick={() => handleNav(path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 min-h-[52px] transition-colors relative ${
                      active
                        ? 'bg-green-50'
                        : 'hover:bg-stone-50 active:bg-stone-100'
                    }`}
                  >
                    {/* Active left bar */}
                    {active && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-green-600 rounded-r-full" />
                    )}

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      active ? 'bg-green-100' : 'bg-stone-100'
                    }`}>
                      <Icon
                        size={17}
                        className={active ? 'text-green-700' : 'text-stone-500'}
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                    </div>

                    <span className={`text-sm font-semibold flex-1 text-left ${
                      active ? 'text-green-800' : 'text-stone-700'
                    }`}>
                      {itemLabel}
                    </span>

                    {active && <ChevronRight size={14} className="text-green-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Footer ─────────────────────────────── */}
        <div className="border-t border-stone-100 px-5 py-4 shrink-0">
          <p className="text-[10px] text-stone-400 text-center leading-relaxed">
            AgriVision AI v1.0
          </p>
          <p className="text-[10px] text-stone-300 text-center">ระบบวิเคราะห์ฟาร์มอัจฉริยะ</p>
        </div>
      </div>
    </>
  );
}
