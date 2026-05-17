import type {
  FarmSummary,
  DetectionsResponse,
  Detection,
  MapData,
  Report,
  TasksResponse,
  Task,
  AISummary,
  DetectionType,
  ReportPeriod,
  YieldSummary,
  DroneStatus,
  ScanRecord,
} from './types';
import {
  FARM_SUMMARY,
  DETECTIONS,
  MAP_DATA,
  REPORTS,
  TASKS,
  AI_SUMMARY,
  YIELD_SUMMARY,
  DRONE_STATUS,
  SCAN_HISTORY,
} from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchFarmSummary(): Promise<FarmSummary> {
  await delay(600);
  return { ...FARM_SUMMARY };
}

export async function fetchDetections(params?: {
  zone_id?: string;
  type?: DetectionType;
  status?: 'active' | 'resolved';
  limit?: number;
}): Promise<DetectionsResponse> {
  await delay(500);
  let items = [...DETECTIONS];
  if (params?.zone_id) items = items.filter((d) => d.zone_id === params.zone_id);
  if (params?.type) items = items.filter((d) => d.type === params.type);
  if (params?.status) items = items.filter((d) => d.status === params.status);
  const limit = params?.limit ?? 20;
  items = items.slice(0, limit);
  return { total: items.length, items };
}

export async function fetchDetectionById(id: string): Promise<Detection> {
  await delay(400);
  const found = DETECTIONS.find((d) => d.detection_id === id);
  if (!found) throw new Error('Detection not found');
  return { ...found };
}

export async function fetchMapData(): Promise<MapData> {
  await delay(700);
  return { ...MAP_DATA };
}

export async function fetchReport(period: ReportPeriod): Promise<Report> {
  await delay(600);
  return { ...REPORTS[period] };
}

let taskStore = [...TASKS];

export async function fetchTasks(): Promise<TasksResponse> {
  await delay(400);
  return { items: [...taskStore] };
}

export async function updateTaskStatus(
  taskId: string,
  status: Task['status']
): Promise<Task> {
  await delay(300);
  const idx = taskStore.findIndex((t) => t.task_id === taskId);
  if (idx === -1) throw new Error('Task not found');
  taskStore = taskStore.map((t) =>
    t.task_id === taskId ? { ...t, status } : t
  );
  return { ...taskStore[idx], status };
}

export async function fetchAISummary(zoneId?: string | null): Promise<AISummary> {
  await delay(2200);
  return { ...AI_SUMMARY, zone_id: zoneId ?? null, generated_at: new Date().toISOString() };
}

export async function fetchYieldSummary(): Promise<YieldSummary> {
  await delay(500);
  return { ...YIELD_SUMMARY };
}

export async function fetchDroneStatus(): Promise<DroneStatus> {
  await delay(300);
  return { ...DRONE_STATUS };
}

export async function fetchScanHistory(): Promise<ScanRecord[]> {
  await delay(200);
  return [...SCAN_HISTORY];
}
