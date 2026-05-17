import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import type { ScanRecord } from '../../lib/types';

interface Props {
  scans: ScanRecord[];
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

export function DateFilterSection({ scans }: Props) {
  const [selected, setSelected] = useState(scans[0]?.scan_id ?? '');
  const selectedScan = scans.find((s) => s.scan_id === selected) ?? scans[0];

  return (
    <div className="px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-green-700" />
          <p className="text-sm font-bold text-stone-900">ผลการวิเคราะห์ล่าสุด</p>
        </div>

        {/* Current scan display */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mb-3 flex items-center justify-between min-h-[52px]">
          <div>
            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide mb-0.5">
              วันที่ตรวจสอบ
            </p>
            <p className="text-base font-bold text-stone-900 leading-tight">
              {selectedScan ? formatThaiDateTime(selectedScan.scanned_at) : '—'}
            </p>
          </div>
          <ChevronDown size={20} className="text-stone-400 shrink-0 ml-2" />
        </div>

        {/* Scan history chips */}
        <div>
          <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide mb-2">
            เลือกช่วงเวลา
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {scans.map((scan) => (
              <button
                key={scan.scan_id}
                onClick={() => setSelected(scan.scan_id)}
                className={`shrink-0 min-h-[40px] px-4 rounded-xl text-sm font-semibold border transition-all ${
                  selected === scan.scan_id
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-stone-600 border-stone-200'
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
