import { useState } from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { useAISummary } from '../hooks/useAISummary';
import { AISummaryCard } from '../components/ai/AISummaryCard';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export function AIPage() {
  const [hasRun, setHasRun] = useState(false);
  const mutation = useAISummary();

  const handleRun = () => {
    setHasRun(true);
    mutation.mutate(null);
  };

  return (
    <div className="px-4 pb-8">
      <div className="pt-4 pb-4">
        <h1 className="text-xl font-bold text-stone-900">วิเคราะห์ AI</h1>
        <p className="text-sm text-stone-500 mt-0.5">วิเคราะห์สภาพฟาร์มและรับคำแนะนำอัจฉริยะ</p>
      </div>

      {!hasRun && (
        <div className="bg-gradient-to-br from-stone-50 to-green-50 border border-green-100 rounded-2xl p-8 flex flex-col items-center text-center">
          <div className="bg-green-100 rounded-2xl p-5 mb-5">
            <BrainCircuit size={40} className="text-green-700" strokeWidth={1.5} />
          </div>
          <h2 className="text-base font-bold text-stone-900 mb-2">วิเคราะห์สภาพฟาร์ม</h2>
          <p className="text-sm text-stone-500 leading-relaxed mb-6">
            AI จะสแกนข้อมูลโดรนล่าสุด วิเคราะห์โรคพืช วัชพืช และแมลงศัตรูพืช
            พร้อมแนะนำแผนการแก้ไขที่เหมาะสมที่สุด
          </p>
          <Button onClick={handleRun} size="lg" fullWidth>
            <Sparkles size={18} />
            เริ่มวิเคราะห์
          </Button>
        </div>
      )}

      {mutation.isPending && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <BrainCircuit size={28} className="text-green-600" strokeWidth={1.8} />
            </div>
            <div className="absolute -inset-1 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-stone-800">กำลังวิเคราะห์ฟาร์ม…</p>
            <p className="text-xs text-stone-500 mt-1">AI กำลังประมวลผลข้อมูลโดรน</p>
          </div>
        </div>
      )}

      {mutation.isError && (
        <div className="text-center py-8">
          <p className="text-sm text-stone-500 mb-4">เกิดข้อผิดพลาด ลองอีกครั้ง</p>
          <Button onClick={handleRun} variant="secondary">
            <Spinner size="sm" />
            ลองใหม่
          </Button>
        </div>
      )}

      {mutation.isSuccess && mutation.data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              วิเคราะห์เมื่อ{' '}
              {new Date(mutation.data.generated_at).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <button
              onClick={handleRun}
              className="text-xs text-green-600 font-medium flex items-center gap-1"
            >
              <Sparkles size={12} /> วิเคราะห์ใหม่
            </button>
          </div>
          <AISummaryCard summary={mutation.data} />
        </div>
      )}
    </div>
  );
}
