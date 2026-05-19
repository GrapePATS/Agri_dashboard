import { useState } from 'react';
import { ChevronDown, Clock, Check } from 'lucide-react';
import type { ScanRecord } from '../../lib/types';

interface Props {
  scans: ScanRecord[];
  selectedScanId: string;
  onScanChange: (id: string) => void;
}

function formatThaiDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DateFilterSection({ scans, selectedScanId, onScanChange }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const selectedScan = scans.find((s) => s.scan_id === selectedScanId) ?? scans[0];

  function handleSelect(id: string) {
    onScanChange(id);
    setShowDropdown(false);
  }

  return (
    <div className="px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#d2e5d3] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-[#1d6233]" />
          <p className="text-sm font-bold text-stone-900">ผลการวิเคราะห์ล่าสุด</p>
        </div>

        {/* Dropdown trigger */}
        <div className="relative mb-3">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="w-full bg-[#e9f6eb] border border-[#d2e5d3] rounded-xl px-4 py-3 flex items-center justify-between min-h-[52px] active:bg-[#d2e5d3] transition-colors"
          >
            <div className="text-left">
              <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide mb-0.5">
                วันที่ตรวจสอบ
              </p>
              <p className="text-base font-bold text-stone-900 leading-tight">
                {selectedScan ? formatThaiDateTime(selectedScan.scanned_at) : '—'}
              </p>
            </div>
            <ChevronDown
              size={20}
              className={`text-stone-400 shrink-0 ml-2 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showDropdown && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              {/* Dropdown list */}
              <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-[#d2e5d3] overflow-hidden">
                {scans.map((scan, i) => {
                  const isSelected = scan.scan_id === selectedScanId;
                  return (
                    <button
                      key={scan.scan_id}
                      onClick={() => handleSelect(scan.scan_id)}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                        isSelected
                          ? 'bg-[#e9f6eb]'
                          : 'active:bg-stone-50'
                      } ${i > 0 ? 'border-t border-stone-100' : ''}`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${isSelected ? 'text-[#1d6233]' : 'text-stone-800'}`}>
                          {scan.label}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          {formatThaiDateTime(scan.scanned_at)}
                        </p>
                      </div>
                      {isSelected && <Check size={16} className="text-[#1d6233] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Quick-select chips */}
        <div>
          <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide mb-2">
            เลือกช่วงเวลา
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {scans.map((scan) => (
              <button
                key={scan.scan_id}
                onClick={() => handleSelect(scan.scan_id)}
                className={`shrink-0 min-h-[40px] px-4 rounded-xl text-sm font-semibold border transition-all ${
                  selectedScanId === scan.scan_id
                    ? 'bg-[#1d6233] text-white border-[#1d6233]'
                    : 'bg-white text-stone-600 border-[#d2e5d3]'
                }`}
              >
                {scan.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
