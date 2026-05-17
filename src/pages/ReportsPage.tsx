import { useState } from 'react';
import { ArrowLeft, Share2, Download, TrendingDown, Sprout, Microscope, Leaf, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReport } from '../hooks/useReports';
import { HealthTrendLine } from '../components/reports/BarChart';
import { Skeleton } from '../components/ui/Skeleton';
import type { ReportPeriod } from '../lib/types';

const periods: { key: ReportPeriod; label: string; emoji: string }[] = [
  { key: 'daily', label: 'วันนี้', emoji: '📋' },
  { key: 'weekly', label: 'สัปดาห์', emoji: '📊' },
  { key: 'monthly', label: 'เดือน', emoji: '📈' },
];

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const { data, isLoading, isError } = useReport(period);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 px-4 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center active:bg-white/25 shrink-0"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-xl font-black">รายงานฟาร์ม</h1>
            <p className="text-indigo-300 text-xs mt-0.5">สรุปสภาพฟาร์มและผลผลิต</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center active:bg-white/25">
            <Share2 size={18} className="text-white" />
          </button>
        </div>

        {/* Period selector */}
        <div className="flex gap-2">
          {periods.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-sm font-bold transition-all ${
                period === key
                  ? 'bg-white text-indigo-800'
                  : 'bg-white/15 text-white border border-white/20'
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </>
        )}

        {isError && (
          <div className="text-center py-10">
            <p className="text-stone-500 text-sm">โหลดรายงานไม่สำเร็จ</p>
          </div>
        )}

        {data && (
          <>
            {/* AI Summary Card */}
            <div className="bg-gradient-to-br from-indigo-700 to-purple-700 rounded-2xl p-5 shadow-md">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wide mb-2">
                🤖 สรุปจาก AI
              </p>
              <p className="text-white text-sm leading-relaxed">{data.summary}</p>
              <p className="text-indigo-300 text-[10px] mt-3">
                {data.date_range.from} — {data.date_range.to}
              </p>
            </div>

            {/* Score + Detections */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                <p className="text-xs text-stone-500 mb-1">คะแนนเฉลี่ย</p>
                <p className="text-4xl font-black text-stone-900">
                  {Math.round(data.health_score_avg * 100)}
                </p>
                <div className={`flex items-center gap-1 mt-2 ${data.health_score_change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  <TrendingDown size={14} className={data.health_score_change >= 0 ? 'rotate-180' : ''} />
                  <span className="text-sm font-bold">
                    {data.health_score_change >= 0 ? '+' : ''}
                    {Math.round(data.health_score_change * 100)}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                <p className="text-xs text-stone-500 mb-1">พบปัญหาทั้งหมด</p>
                <p className="text-4xl font-black text-stone-900">{data.total_detections}</p>
                <p className="text-xs text-stone-400 mt-2">รายการ</p>
              </div>
            </div>

            {/* By type */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">
                แยกตามประเภท
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { Icon: Microscope, label: 'โรคพืช', count: data.detections_by_type.disease, bg: 'bg-red-50', color: 'text-red-600' },
                  { Icon: Leaf, label: 'วัชพืช', count: data.detections_by_type.weed, bg: 'bg-green-50', color: 'text-green-600' },
                  { Icon: Bug, label: 'แมลง', count: data.detections_by_type.pest, bg: 'bg-amber-50', color: 'text-amber-600' },
                ].map(({ Icon, label, count, bg, color }) => (
                  <div key={label} className={`text-center rounded-xl p-3 ${bg}`}>
                    <Icon size={20} className={`${color} mx-auto mb-1.5`} strokeWidth={1.8} />
                    <p className="text-xl font-black text-stone-900">{count}</p>
                    <p className="text-[10px] text-stone-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Health trend chart */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">
                แนวโน้มสุขภาพ
              </p>
              <HealthTrendLine data={data.chart_data} />
              <div className="flex items-end gap-1.5 mt-3" style={{ height: 56 }}>
                {data.chart_data.map((d, i) => {
                  const max = Math.max(...data.chart_data.map((x) => x.detections), 1);
                  const h = Math.max(Math.round((d.detections / max) * 44), 4);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full bg-amber-300 rounded-t-sm" style={{ height: h }} />
                      <span className="text-[9px] text-stone-400 text-center">{d.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-stone-400 text-center mt-1">จำนวนการตรวจพบปัญหา (แท่ง)</p>
            </div>

            {/* Yield estimate */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sprout size={16} className="text-green-600" />
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                  ประมาณการผลผลิต
                </p>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-black text-stone-900">
                  {(data.yield_estimate_kg / 1000).toFixed(1)}
                </p>
                <p className="text-stone-500 text-sm mb-1">ตัน</p>
                <div className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full ${data.yield_confidence >= 0.7 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  เชื่อมั่น {Math.round(data.yield_confidence * 100)}%
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">
                💡 คำแนะนำจาก AI
              </p>
              <ul className="space-y-3">
                {data.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-black flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-stone-700 leading-relaxed">{r}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Export button */}
            <button className="w-full bg-indigo-700 text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-base shadow-md active:bg-indigo-800">
              <Download size={20} />
              ดาวน์โหลดรายงาน PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}
