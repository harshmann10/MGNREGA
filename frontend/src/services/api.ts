import axios, { type AxiosInstance } from 'axios';
import type {
  ApiResponse,
  StateInfo,
  District,
  DistrictMetric,
  TrendDataPoint,
  ComparisonData,
  HealthStatus,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class APIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          console.warn(`Rate limited. Retry after ${retryAfter}s`);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET /api/states
   * Returns list of all states with district counts
   */
  async getStates(): Promise<StateInfo[]> {
    const response = await this.client.get<ApiResponse<StateInfo[]>>('/api/states');
    return response.data.data;
  }

  /**
   * GET /api/districts?state=STATE
   * Returns list of districts for a given state
   */
  async getDistricts(state: string): Promise<District[]> {
    const response = await this.client.get<ApiResponse<District[]>>('/api/districts', {
      params: { state },
    });
    return response.data.data;
  }

  /**
   * GET /api/metrics/:district_code?year=&month=
   * Returns metrics for a district (latest or specific month/year)
   */
  async getMetrics(
    districtCode: string,
    year?: number,
    month?: number
  ): Promise<{ metric: DistrictMetric; meta: { last_updated: string; stale: boolean } }> {
    const params: Record<string, any> = {};
    if (year) params.year = year;
    if (month) params.month = month;

    const response = await this.client.get<ApiResponse<DistrictMetric>>(
      `/api/metrics/${districtCode}`,
      { params }
    );

    return {
      metric: response.data.data,
      meta: response.data.meta || { last_updated: '', stale: false },
    };
  }

  /**
   * GET /api/trends/:district_code?months=12
   * Returns trend data for a district
   */
  async getTrends(districtCode: string, months: number = 12): Promise<TrendDataPoint[]> {
    const response = await this.client.get<ApiResponse<TrendDataPoint[]>>(
      `/api/trends/${districtCode}`,
      { params: { months } }
    );
    return response.data.data;
  }

  /**
   * GET /api/compare/:district_code
   * Returns comparison data (district vs state avg vs top district)
   */
  async getComparison(districtCode: string): Promise<ComparisonData> {
    const response = await this.client.get<ApiResponse<ComparisonData>>(
      `/api/compare/${districtCode}`
    );
    return response.data.data;
  }

  /**
   * GET /api/health
   * Returns backend health status
   */
  async getHealth(): Promise<HealthStatus> {
    const response = await this.client.get<ApiResponse<HealthStatus>>('/api/health');
    return response.data.data;
  }

  /**
   * Search districts by name
   * Client-side filter helper (can be moved to backend if needed)
   */
  async searchDistricts(query: string, state?: string): Promise<District[]> {
    const districts = state ? await this.getDistricts(state) : [];
    const lowerQuery = query.toLowerCase();
    
    return districts.filter((d) =>
      d.district_name.toLowerCase().includes(lowerQuery) ||
      d.aliases.some((alias) => alias.toLowerCase().includes(lowerQuery))
    );
  }
}

export const apiService = new APIService();
export default apiService;
