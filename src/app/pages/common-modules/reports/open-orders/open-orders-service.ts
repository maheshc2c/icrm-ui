import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../../service/auth-service';

// ─── Request DTOs ─────────────────────────────────────────────────────────────

/**
 * Mirrors Java: OpenOrderFilterDto
 * Used for Chart 1.
 *
 * viewTime: 'w' | 'm' | 'q' | 'y' | 'a'
 *   w = Week, m = Month, q = Quarter, y = Financial Year, a = All
 */
export interface OpenOrderFilter {
  userId?:       number | null;
  regionId?:     number | null;
  viewTime?:     string;
  duration?:     number | null;
  durationText?: string | null;
  fromDate?:     string | null;  // ISO yyyy-MM-dd
  toDate?:       string | null;  // ISO yyyy-MM-dd
}

/**
 * Mirrors Java: OpenOrderRequestDto
 * Used for Chart 2 (segment drill-down) and Chart 3 (customer/product tables).
 *
 * status: the series name from chart1 (e.g. "Fresh not cleared") or "3"/"1".
 * categoryName: the x-axis category label clicked in chart1 (e.g. "Valves").
 * segmentName: the x-axis segment label clicked in chart2; omit or "ALL" for all.
 */
export interface OpenOrderDrillDownRequest {
  userId?:       number | null;
  regionId?:     number | null;
  viewTime?:     string;
  duration?:     number | null;
  durationText?: string | null;
  fromDate?:     string | null;
  toDate?:       string | null;
  // drill-down context
  categoryName:  string;
  status:        string;
  segmentName?:  string | null;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface ChartSeriesDto {
  name:  string;
  data:  number[];
  color: string;
  stack: string;
}

/**
 * Mirrors Java: OpenOrderChartResponseDto
 * Used by Chart 1 and Chart 2.
 */
export interface OpenOrderChartResponseDto {
  xAxisCategories: string[];
  series:          ChartSeriesDto[];
  xAxisLabel:      string;
  title:           string;
}

/**
 * Mirrors Java: OpenOrderDrillDownResponseDto
 * Used by Chart 3.
 */
export interface CustomerRow {
  name:        string;
  location:    string;
  totalOrders: number;   // value in Lakhs
}

export interface ProductRow {
  productName:        string;
  productDescription: string;
  segmentName:        string;
  qty:                number;
  totalOrders:        number;   // value in Lakhs
}

export interface OpenOrderDrillDownResponseDto {
  customers: CustomerRow[];
  products:  ProductRow[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class OpenOrdersService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Auth helpers
  // ─────────────────────────────────────────────────────────────────────────

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${token}`
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chart 1 – Category-wise Open Orders (CFI vs SO)
  // Maps to: POST /reports/open-orders/chart1
  // ─────────────────────────────────────────────────────────────────────────

  getOpenOrderChart1(filter: OpenOrderFilter): Observable<OpenOrderChartResponseDto> {
    return this.http
      .post<any>(`${this.baseUrl}/reports/open-orders/chart1`, filter, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(res => {
          if (!res.status) {
            throw new Error(res.message || 'Failed to fetch open order chart');
          }
          return this.normalizeChartResponse(res.data);
        })
      );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chart 2 – Segment-wise drill-down
  // Maps to: POST /reports/open-orders/chart2
  // Called when user clicks a bar in Chart 1.
  // ─────────────────────────────────────────────────────────────────────────

  getOpenOrderChart2(request: OpenOrderDrillDownRequest): Observable<OpenOrderChartResponseDto> {
    return this.http
      .post<any>(`${this.baseUrl}/reports/open-orders/chart2`, request, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(res => {
          if (!res.status) {
            throw new Error(res.message || 'Failed to fetch segment chart');
          }
          return this.normalizeChartResponse(res.data);
        })
      );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chart 3 – Customer & product tables
  // Maps to: POST /reports/open-orders/chart3
  // Called when user clicks a segment bar in Chart 2.
  // ─────────────────────────────────────────────────────────────────────────

  getOpenOrderChart3(request: OpenOrderDrillDownRequest): Observable<OpenOrderDrillDownResponseDto> {
    return this.http
      .post<any>(`${this.baseUrl}/reports/open-orders/chart3`, request, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(res => {
          if (!res.status) {
            throw new Error(res.message || 'Failed to fetch customer/product data');
          }
          return res.data as OpenOrderDrillDownResponseDto;
        })
      );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Users dropdown helper (filtered by region)
  // Maps to: GET /reports/open-orders/users?regionId={regionId}
  // ─────────────────────────────────────────────────────────────────────────

  getUsersForDropdown(regionId?: number | null): Observable<{ id: number; label: string }[]> {
    const url = regionId 
      ? `${this.baseUrl}/reports/open-orders/users?regionId=${regionId}`
      : `${this.baseUrl}/reports/open-orders/users`;
    
    return this.http
      .get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          if (!response.status) {
            throw new Error(response.message || 'Failed to fetch users');
          }
          return response.data as { id: number; label: string }[];
        })
      );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Regions dropdown helper
  // Maps to: GET /reports/open-orders/regions
  // ─────────────────────────────────────────────────────────────────────────

  getRegionsForDropdown(): Observable<{ id: number; label: string }[]> {
    return this.http
      .get<any>(`${this.baseUrl}/reports/open-orders/regions`, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(response => {
          if (!response.status) {
            throw new Error(response.message || 'Failed to fetch regions');
          }
          return response.data as { id: number; label: string }[];
        })
      );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Months dropdown helper
  // Maps to: GET /reports/open-orders/months
  // PHP format: label = "M-y" (e.g., "Apr-24"), value = "month_notoyear_no" (e.g., "1to2024")
  // ─────────────────────────────────────────────────────────────────────────

  getMonthsForDropdown(): Observable<{ id: number; label: string; value: string; monthNo: number; yearNo: number; fromDate: string; toDate: string }[]> {
    return this.http
      .get<any>(`${this.baseUrl}/reports/open-orders/months`, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(response => {
          if (!response.status) {
            throw new Error(response.message || 'Failed to fetch months');
          }
          return response.data as { id: number; label: string; value: string; monthNo: number; yearNo: number; fromDate: string; toDate: string }[];
        })
      );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Weeks dropdown helper
  // Maps to: GET /reports/open-orders/weeks
  // PHP format: label = "Week X (YYYY-MM-DD to YYYY-MM-DD)", value = "YYYY-MM-DDtoYYYY-MM-DD"
  // ─────────────────────────────────────────────────────────────────────────

  getWeeksForDropdown(): Observable<{ id: number; label: string; value: string; weekNo: number; fromDate: string; toDate: string }[]> {
    console.log('=== Service: Calling /reports/open-orders/weeks ===');
    return this.http
      .get<any>(`${this.baseUrl}/reports/open-orders/weeks`, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(response => {
          console.log('Service: Weeks response received:', response);
          if (!response.status) {
            throw new Error(response.message || 'Failed to fetch weeks');
          }
          console.log('Service: Returning weeks data:', response.data);
          return response.data as { id: number; label: string; value: string; weekNo: number; fromDate: string; toDate: string }[];
        })
      );
  }

  private normalizeChartResponse(data: any): OpenOrderChartResponseDto {
    return {
      title: data?.title ?? '',
      xAxisLabel: data?.xAxisLabel ?? data?.xaxisLabel ?? 'Categories',
      xAxisCategories: data?.xAxisCategories ?? data?.xaxisCategories ?? [],
      series: (data?.series ?? []).map((s: any) => ({
        name: s.name,
        data: s.data ?? [],
        color: s.color,
        stack: s.stack
      }))
    };
  }
}
