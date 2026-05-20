import { useState } from 'react';
import { CheckCircle2, Clock, Circle, CalendarDays, MapPin, AlertCircle } from 'lucide-react';
import { useTasks, useUpdateTask } from '../hooks/useTasks';
import { BottomNav } from '../components/BottomNav';
import { SkeletonCard } from '../components/ui/Skeleton';
import type { Task } from '../lib/types';

type StatusTab = 'pending' | 'in_progress' | 'done';

const statusCycle: Record<Task['status'], Task['status']> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
};

const PRIORITY = {
  high: {
    label: 'เร่งด่วน',
    dot: 'bg-red-500',
    text: 'text-red-600',
    badge: 'bg-red-50 text-red-700 border-red-200',
    border: 'border-l-red-500',
  },
  medium: {
    label: 'ปานกลาง',
    dot: 'bg-amber-400',
    text: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    border: 'border-l-amber-400',
  },
  low: {
    label: 'ทั่วไป',
    dot: 'bg-[#abd8c8]',
    text: 'text-[#1d6233]',
    badge: 'bg-[#e9f6eb] text-[#1d6233] border-[#d2e5d3]',
    border: 'border-l-[#abd8c8]',
  },
};

const ZONE_NAMES: Record<string, string> = {
  'zone-a': 'แปลง 1', 'zone-b': 'แปลง 2', 'zone-c': 'แปลง 3',
  'zone-d': 'แปลง 4', 'zone-e': 'แปลง 2', 'zone-f': 'แปลง 1',
  'zone-g': 'แปลง 2', 'zone-h': 'แปลง 3', 'zone-i': 'แปลง 4',
};

const TODAY = new Date().toISOString().split('T')[0];

function getDueMeta(dateStr: string, isDone: boolean) {
  if (isDone) return { label: new Date(dateStr).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }), color: 'text-stone-400' };
  if (dateStr < TODAY) return { label: `เกินกำหนด · ${new Date(dateStr).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}`, color: 'text-red-500' };
  if (dateStr === TODAY) return { label: `วันนี้ · ${new Date(dateStr).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}`, color: 'text-amber-600' };
  return { label: new Date(dateStr).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }), color: 'text-stone-400' };
}

function TaskCard({ task }: { task: Task }) {
  const mutation = useUpdateTask();
  const p = PRIORITY[task.priority];
  const isDone = task.status === 'done';
  const due = getDueMeta(task.due_date, isDone);

  return (
    <div className={`bg-white rounded-2xl border-l-4 ${p.border} shadow-sm ${isDone ? 'opacity-60' : ''}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badge}`}>
                {p.label}
              </span>
            </div>
            <p className={`text-sm font-bold leading-snug ${isDone ? 'line-through text-stone-400' : 'text-stone-900'}`}>
              {task.title}
            </p>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          </div>

          {/* Status toggle */}
          <button
            onClick={() => mutation.mutate({ taskId: task.task_id, status: statusCycle[task.status] })}
            disabled={mutation.isPending}
            className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
              isDone
                ? 'bg-[#e9f6eb] active:bg-[#d2e5d3]'
                : task.status === 'in_progress'
                ? 'bg-amber-50 active:bg-amber-100'
                : 'bg-stone-50 active:bg-stone-100'
            } ${mutation.isPending ? 'opacity-40' : ''}`}
            aria-label="เปลี่ยนสถานะ"
          >
            {isDone
              ? <CheckCircle2 size={22} className="text-[#1d6233]" strokeWidth={2.5} />
              : task.status === 'in_progress'
              ? <Clock size={22} className="text-amber-500" strokeWidth={2.5} />
              : <Circle size={22} className="text-stone-300" strokeWidth={2.5} />
            }
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-stone-100">
          <div className={`flex items-center gap-1 ${due.color}`}>
            <CalendarDays size={11} />
            <span className="text-[10px] font-semibold">{due.label}</span>
          </div>
          {task.zone_id && (
            <>
              <div className="w-1 h-1 rounded-full bg-stone-200 shrink-0" />
              <div className="flex items-center gap-1 text-stone-400">
                <MapPin size={10} />
                <span className="text-[10px] font-medium">{ZONE_NAMES[task.zone_id] ?? task.zone_id}</span>
              </div>
            </>
          )}
          <div className="ml-auto">
            {isDone && (
              <span className="text-[10px] font-bold text-[#1d6233] bg-[#e9f6eb] px-2 py-0.5 rounded-full">
                ✓ เสร็จ
              </span>
            )}
            {task.status === 'in_progress' && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                ● กำลังทำ
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityGroup({ tasks, priority }: { tasks: Task[]; priority: Task['priority'] }) {
  if (tasks.length === 0) return null;
  const p = PRIORITY[priority];
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
        <span className={`text-[11px] font-black uppercase tracking-wider ${p.text}`}>
          {p.label} · {tasks.length} งาน
        </span>
      </div>
      <div className="space-y-2.5">
        {tasks.map((t) => <TaskCard key={t.task_id} task={t} />)}
      </div>
    </div>
  );
}

export function TasksPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>('pending');
  const { data, isLoading, isError } = useTasks();

  const tasks = data?.items ?? [];
  const pending = tasks.filter((t) => t.status === 'pending');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const done = tasks.filter((t) => t.status === 'done');

  const byTab: Record<StatusTab, Task[]> = { pending, in_progress: inProgress, done };
  const visible = byTab[activeTab];

  const highVisible = visible.filter((t) => t.priority === 'high');
  const mediumVisible = visible.filter((t) => t.priority === 'medium');
  const lowVisible = visible.filter((t) => t.priority === 'low');

  const donePct = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;
  const hasUrgentActive = pending.some((t) => t.priority === 'high') || inProgress.some((t) => t.priority === 'high');

  const TABS: { key: StatusTab; label: string; count: number }[] = [
    { key: 'pending', label: 'รอทำ', count: pending.length },
    { key: 'in_progress', label: 'กำลังทำ', count: inProgress.length },
    { key: 'done', label: 'เสร็จแล้ว', count: done.length },
  ];

  return (
    <div className="min-h-screen bg-[#e9f6eb] pb-24">

      {/* ── Header ── */}
      <div className="bg-[#1d6233] px-4 pt-12 pb-0">

        {/* Title row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-white text-xl font-black leading-tight">งานในไร่</h1>
            <p className="text-[#abd8c8] text-xs mt-0.5">
              เสร็จแล้ว {done.length} จาก {tasks.length} งาน
            </p>
          </div>
          {hasUrgentActive && (
            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 rounded-xl px-2.5 py-1.5 mt-0.5">
              <AlertCircle size={12} className="text-red-300" />
              <span className="text-red-200 text-[11px] font-bold">มีงานด่วน</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[#abd8c8] text-[10px] font-semibold">ความคืบหน้า</span>
            <span className="text-white text-[10px] font-black">{donePct}%</span>
          </div>
          <div className="h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#abd8c8] to-white rounded-full transition-all duration-700"
              style={{ width: `${donePct}%` }}
            />
          </div>
        </div>

        {/* 3-stat summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'รอทำ', count: pending.length, color: 'text-stone-200', dot: 'bg-stone-300' },
            { label: 'กำลังทำ', count: inProgress.length, color: 'text-amber-200', dot: 'bg-amber-400' },
            { label: 'เสร็จแล้ว', count: done.length, color: 'text-[#abd8c8]', dot: 'bg-[#abd8c8]' },
          ].map(({ label, count, color, dot }) => (
            <div key={label} className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
              <div className={`text-xl font-black leading-none ${color}`}>{count}</div>
              <div className={`text-[9px] font-semibold mt-0.5 ${color} opacity-80`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {TABS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-[12px] font-bold transition-all leading-none ${
                activeTab === key
                  ? 'bg-white text-[#1d6233] shadow-sm'
                  : 'text-white/60 active:bg-white/10'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-1 text-[10px] ${activeTab === key ? 'text-[#1d6233]' : 'text-white/40'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="h-5" />
      </div>

      {/* ── Content ── */}
      <div className="px-4 pt-1">

        {isLoading && (
          <div className="space-y-3 pt-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {isError && (
          <div className="text-center py-10 text-stone-500 text-sm">โหลดข้อมูลไม่สำเร็จ</div>
        )}

        {data && (
          <div className="space-y-5 pt-1">

            {/* Urgent banner */}
            {activeTab !== 'done' && highVisible.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle size={16} className="text-red-500" />
                </div>
                <p className="text-red-700 text-xs font-semibold leading-snug">
                  มี {highVisible.length} งานเร่งด่วนต้องดำเนินการ{activeTab === 'in_progress' ? 'ให้เสร็จ' : 'ทันที'}
                </p>
              </div>
            )}

            <PriorityGroup tasks={highVisible} priority="high" />
            <PriorityGroup tasks={mediumVisible} priority="medium" />
            <PriorityGroup tasks={lowVisible} priority="low" />

            {/* Status hint */}
            {visible.length > 0 && (
              <div className="flex items-center justify-center gap-4 py-2">
                {([
                  { Icon: Circle, color: 'text-stone-300', label: 'รอทำ' },
                  { Icon: Clock, color: 'text-amber-400', label: 'กำลังทำ' },
                  { Icon: CheckCircle2, color: 'text-[#1d6233]', label: 'เสร็จ' },
                ] as const).map(({ Icon, color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <Icon size={12} className={color} strokeWidth={2.5} />
                    <span className="text-[10px] text-stone-400">{label}</span>
                  </div>
                ))}
                <span className="text-[10px] text-stone-300">· แตะไอคอนเพื่อเปลี่ยน</span>
              </div>
            )}

            {/* Empty state */}
            {visible.length === 0 && (
              <div className="text-center py-14">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                  activeTab === 'done' ? 'bg-[#e9f6eb]' : 'bg-stone-100'
                }`}>
                  {activeTab === 'done'
                    ? <CheckCircle2 size={28} className="text-[#1d6233]" strokeWidth={2} />
                    : activeTab === 'in_progress'
                    ? <Clock size={28} className="text-stone-300" strokeWidth={1.5} />
                    : <Circle size={28} className="text-stone-300" strokeWidth={1.5} />
                  }
                </div>
                <p className="text-stone-600 font-semibold text-sm">
                  {activeTab === 'done' ? 'ยังไม่มีงานที่เสร็จสิ้น' :
                   activeTab === 'in_progress' ? 'ไม่มีงานที่กำลังดำเนิน' :
                   'ไม่มีงานรอดำเนินการ 🎉'}
                </p>
                <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                  {activeTab === 'done' ? 'เริ่มทำงานและกดไอคอนนาฬิกาเพื่อเสร็จ' :
                   activeTab === 'in_progress' ? 'แตะ ○ บนงาน "รอทำ" เพื่อเริ่มดำเนินการ' :
                   'ยอดเยี่ยม! ทุกงานถูกดำเนินการหมดแล้ว'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
