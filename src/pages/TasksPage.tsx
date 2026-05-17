import { ClipboardList, CheckCircle2, Clock, Circle } from 'lucide-react';
import { useTasks, useUpdateTask } from '../hooks/useTasks';
import { SkeletonCard } from '../components/ui/Skeleton';
import type { Task } from '../lib/types';

const statusCycle: Record<Task['status'], Task['status']> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
};

const statusConfig = {
  pending: {
    Icon: Circle,
    iconColor: 'text-stone-300',
    label: 'รอดำเนินการ',
    badge: 'bg-stone-100 text-stone-500',
  },
  in_progress: {
    Icon: Clock,
    iconColor: 'text-amber-500',
    label: 'กำลังดำเนินการ',
    badge: 'bg-amber-100 text-amber-700',
  },
  done: {
    Icon: CheckCircle2,
    iconColor: 'text-green-600',
    label: 'เสร็จแล้ว',
    badge: 'bg-green-100 text-green-700',
  },
};

const priorityConfig = {
  high: { label: 'เร่งด่วน', classes: 'bg-red-100 text-red-700 border border-red-200' },
  medium: { label: 'ปานกลาง', classes: 'bg-amber-100 text-amber-700 border border-amber-200' },
  low: { label: 'ต่ำ', classes: 'bg-stone-100 text-stone-600 border border-stone-200' },
};

const priorityOrder = { high: 0, medium: 1, low: 2 };

function TaskCard({ task }: { task: Task }) {
  const mutation = useUpdateTask();
  const { Icon, iconColor } = statusConfig[task.status];
  const pConfig = priorityConfig[task.priority];

  const handleToggle = () => {
    mutation.mutate({ taskId: task.task_id, status: statusCycle[task.status] });
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${task.status === 'done' ? 'border-stone-100 opacity-70' : 'border-stone-100'}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          disabled={mutation.isPending}
          className="shrink-0 mt-0.5 min-h-[44px] min-w-[44px] -ml-2 -mt-1 flex items-center justify-center rounded-xl active:bg-stone-100 transition-colors"
        >
          <Icon
            size={22}
            className={`${iconColor} ${mutation.isPending ? 'animate-pulse' : ''}`}
            strokeWidth={2}
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pConfig.classes}`}>
              {pConfig.label}
            </span>
          </div>
          <p className={`text-sm font-semibold ${task.status === 'done' ? 'line-through text-stone-400' : 'text-stone-800'}`}>
            {task.title}
          </p>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">{task.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-stone-400">
              ครบกำหนด {new Date(task.due_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
            </span>
            {task.zone_id && (
              <>
                <span className="text-stone-200">•</span>
                <span className="text-xs text-stone-400">
                  {task.zone_id === 'zone-a' ? 'แปลง A' : task.zone_id === 'zone-b' ? 'แปลง B' : 'แปลง C'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TasksPage() {
  const { data, isLoading, isError } = useTasks();

  const sortedTasks = data?.items
    ? [...data.items].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      )
    : [];

  const high = sortedTasks.filter((t) => t.priority === 'high' && t.status !== 'done');
  const medium = sortedTasks.filter((t) => t.priority === 'medium' && t.status !== 'done');
  const low = sortedTasks.filter((t) => t.priority === 'low' && t.status !== 'done');
  const done = sortedTasks.filter((t) => t.status === 'done');

  return (
    <div className="px-4 pb-8">
      <div className="pt-4 pb-4">
        <h1 className="text-xl font-bold text-stone-900">งานที่ต้องทำ</h1>
        <p className="text-sm text-stone-500 mt-0.5">แตะไอคอนเพื่ออัปเดตสถานะ</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-10">
          <p className="text-stone-500 text-sm">โหลดข้อมูลไม่สำเร็จ</p>
        </div>
      )}

      {data && (
        <div className="space-y-5">
          {high.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                  เร่งด่วน ({high.length})
                </h2>
              </div>
              <div className="space-y-3">
                {high.map((t) => <TaskCard key={t.task_id} task={t} />)}
              </div>
            </section>
          )}

          {medium.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                  ปานกลาง ({medium.length})
                </h2>
              </div>
              <div className="space-y-3">
                {medium.map((t) => <TaskCard key={t.task_id} task={t} />)}
              </div>
            </section>
          )}

          {low.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-stone-400" />
                <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                  ลำดับต่ำ ({low.length})
                </h2>
              </div>
              <div className="space-y-3">
                {low.map((t) => <TaskCard key={t.task_id} task={t} />)}
              </div>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                  เสร็จแล้ว ({done.length})
                </h2>
              </div>
              <div className="space-y-3">
                {done.map((t) => <TaskCard key={t.task_id} task={t} />)}
              </div>
            </section>
          )}

          {sortedTasks.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-green-50 rounded-2xl p-5 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={28} className="text-green-600" />
              </div>
              <p className="text-stone-600 font-medium">ไม่มีงานค้างอยู่</p>
              <p className="text-stone-400 text-sm mt-1">ยอดเยี่ยม!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
