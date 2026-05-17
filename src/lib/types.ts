export interface Zone {
  zone_id: string;
  zone_name: string;
  health_score: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface FarmSummary {
  farm_id: string;
  farm_name: string;
  last_scan_at: string;
  overall_health_score: number;
  health_trend: 'improving' | 'stable' | 'declining';
  total_area_rai: number;
  active_alerts: number;
  zones: Zone[];
  top_recommendation: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  detection_id: string;
  detected_at: string;
  type: 'disease' | 'weed' | 'pest';
  label: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_area_pct: number;
  zone_id: string;
  zone_name: string;
  status: 'active' | 'resolved';
  image_url: string | null;
  bounding_box: BoundingBox;
  recommendation: string;
}

export interface DetectionsResponse {
  total: number;
  items: Detection[];
}

export interface ZonePolygon {
  zone_id: string;
  zone_name: string;
  health_score: number;
  status: 'healthy' | 'warning' | 'critical';
  polygon: { lat: number; lng: number }[];
  detection_count: number;
}

export interface DetectionMarker {
  detection_id: string;
  lat: number;
  lng: number;
  type: 'disease' | 'weed' | 'pest';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MapData {
  farm_id: string;
  center_lat: number;
  center_lng: number;
  zoom_default: number;
  zones: ZonePolygon[];
  detection_markers: DetectionMarker[];
}

export interface ChartDataPoint {
  label: string;
  health_score: number;
  detections: number;
}

export interface Report {
  period: 'daily' | 'weekly' | 'monthly';
  generated_at: string;
  date_range: { from: string; to: string };
  summary: string;
  health_score_avg: number;
  health_score_change: number;
  total_detections: number;
  detections_by_type: { disease: number; weed: number; pest: number };
  yield_estimate_kg: number;
  yield_confidence: number;
  recommendations: string[];
  chart_data: ChartDataPoint[];
}

export interface Task {
  task_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'done';
  due_date: string;
  zone_id: string | null;
  related_detection_id: string | null;
}

export interface TasksResponse {
  items: Task[];
}

export interface ActionItem {
  priority: 'low' | 'medium' | 'high';
  action: string;
  expected_outcome: string;
}

export interface AISummary {
  generated_at: string;
  zone_id: string | null;
  overall_assessment: string;
  key_findings: string[];
  action_items: ActionItem[];
  confidence: number;
}

export type HealthTrend = 'improving' | 'stable' | 'declining';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type HealthStatus = 'healthy' | 'warning' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'done';
export type DetectionType = 'disease' | 'weed' | 'pest';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface YieldZone {
  zone_id: string;
  zone_name: string;
  yield_level: 'high' | 'medium' | 'low';
  estimated_kg: number;
}

export interface YieldTrendPoint {
  label: string;
  kg: number;
}

export interface YieldGradeBreakdown {
  A: number;
  B: number;
  C: number;
  damaged: number;
}

export type GrowthStage = 'early' | 'vegetative' | 'flowering' | 'near_harvest' | 'ready';

export interface YieldSummary {
  estimated_kg: number;
  quality_grade: 'A' | 'B' | 'C';
  harvest_readiness_pct: number;
  confidence: number;
  zone_yields: YieldZone[];
  plant_count: number;
  trend_pct: number;
  days_since_planting: number;
  estimated_harvest_date: string;
  growth_stage: GrowthStage;
  grade_breakdown: YieldGradeBreakdown;
  trend_data: YieldTrendPoint[];
  market_value_thb?: number;
  ai_insights: string[];
}

export interface FarmZoneOption {
  zone_id: string;
  zone_name: string;
  area_rai: number;
  crop: string;
}

export interface FarmOption {
  farm_id: string;
  farm_name: string;
  total_area_rai: number;
  zones: FarmZoneOption[];
}

export interface DroneStatus {
  mission_id: string;
  status: 'completed' | 'uploading' | 'scheduled' | 'in_progress';
  completed_at: string | null;
  coverage_pct: number;
  battery_pct: number;
  signal_strength: 'strong' | 'medium' | 'weak';
  upload_pct: number;
  last_scan_area_rai: number;
}

export interface ScanRecord {
  scan_id: string;
  scanned_at: string;
  label: string;
}
