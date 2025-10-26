// District types
export interface District {
  _id: string;
  state: string;
  state_code: string;
  district_code: string;
  district_name: string;
  centroid: {
    lat: number;
    lng: number;
  };
  aliases: string[];
  geojsonRef?: string | null;
}

// Metric types
export interface DistrictMetric {
  _id: string;
  district_code: string;
  state: string;
  year: number;
  month: number;
  total_households_worked: number;
  total_persondays_generated: number;
  total_wage_disbursed: number;
  pending_payments: number;
  other_metrics: Record<string, any>;
  last_updated: string;
  source_raw_id: string;
  stale: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    last_updated: string;
    stale: boolean;
  };
}

export interface StateInfo {
  state_code: string;
  state: string;
  district_count: number;
}

export interface TrendDataPoint {
  year: number;
  month: number;
  total_households_worked: number;
  total_persondays_generated: number;
  total_wage_disbursed: number;
  pending_payments: number;
}

export interface ComparisonData {
  district: DistrictMetric;
  state_avg: {
    total_households_worked: number;
    total_persondays_generated: number;
    total_wage_disbursed: number;
    pending_payments: number;
  };
  top_district: {
    district_name: string;
    district_code: string;
    total_households_worked: number;
    total_persondays_generated: number;
    total_wage_disbursed: number;
    pending_payments: number;
  };
}

export interface HealthStatus {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  last_sync?: {
    job_type: string;
    end_time: string;
    status: 'success' | 'failed';
    records_fetched: number;
  };
  uptime: number;
}

// Location types
export interface LocationData {
  district_code?: string;
  district_name?: string;
  state?: string;
  detected_by: 'ip' | 'gps' | 'manual';
}

// Language types
export type Language = 'en' | 'hi';

// Cache types
export interface CachedDistrictData {
  district_code: string;
  metrics: DistrictMetric;
  cached_at: string;
}
