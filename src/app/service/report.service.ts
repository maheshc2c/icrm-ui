import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth-service';
import { ApiResponse, LostDealsReportResponseDto, LostRegionDto, LostProductDto } from '../models/opportunity-lost.model';

export interface FunnelReportFilter {
  userId?: number | null;
  regionId?: number | null;
  viewTime?: string;
  measure?: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface FunnelSeriesDto {
  name: string;
  data: (number | null)[];
}

export interface FunnelReportResponseDto {
  xAxisCategories: string[];
  series: FunnelSeriesDto[];
}

/** Matches UserSearchDTO on the backend */
export interface UserSearchPayload {
  roleName?: string | null;
  userName?: string | null;
  employeeId?: string | null;
  email?: string | null;
  mobile?: string | null;
  pagination: {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortOrder: string;
  };
}

export interface FunnelReportDrillDownDto {
  category?: string;
  seriesName?: string;
  viewTime?: string;
  measure?: number;
  startDate?: string | null;
  endDate?: string | null;
  regionIds?: number[];
  userId?: number | null;
}

export interface FunnelReportDrillDownResponseDto {
  xAxisLable2: string;
  xAxisCategory2: string[];
  yAxisCategory2: string;
  chart2Series: any[];
}

export interface FunnelReportTableResponseDto {
  lable: string;
  results: any[];
}

export interface IncentiveFilterRequest {
  fromDate?: string | null;
  toDate?: string | null;
  financialYearId?: number | null;
  regionId?: number | null;
  userId?: number | null;
  roleId?: number | null;
  quarter?: string | null;
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private baseUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // ================= COMMON AUTH HEADER =================
  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  // ================= FUNNEL REPORT METHODS =================
  getFunnelReport(filter: FunnelReportFilter): Observable<FunnelReportResponseDto> {
    return this.http.post<any>(`${this.baseUrl}/reports/funnel`, filter, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (!res.status) {
          throw new Error(res.message || 'Failed to fetch report');
        }
        return res.data as FunnelReportResponseDto;
      })
    );
  }

  getFunnelLevel2(filter: FunnelReportDrillDownDto): Observable<FunnelReportDrillDownResponseDto> {
    return this.http.post<any>(`${this.baseUrl}/reports/funnel/drill-down`, filter, {
      headers: this.getAuthHeaders()
    }).pipe(map(res => res.data as FunnelReportDrillDownResponseDto));
  }

  getFunnelLevel3(filter: FunnelReportDrillDownDto): Observable<FunnelReportDrillDownResponseDto> {
    return this.http.post<any>(`${this.baseUrl}/reports/funnel/competitor`, filter, {
      headers: this.getAuthHeaders()
    }).pipe(map(res => res.data as FunnelReportDrillDownResponseDto));
  }

  getFunnelLevel4(filter: FunnelReportDrillDownDto): Observable<any[]> {
     return this.http.post<any>(`${this.baseUrl}/reports/funnel/table`, filter, {
       headers: this.getAuthHeaders()
     }).pipe(map(res => res.data));
  }

  getFunnelTable(filter: FunnelReportDrillDownDto): Observable<FunnelReportTableResponseDto> {
    return this.http.post<any>(`${this.baseUrl}/reports/funnel/table`, filter, {
      headers: this.getAuthHeaders()
    }).pipe(map(res => res.data as FunnelReportTableResponseDto));
  }

  searchUsers(payload: UserSearchPayload): Observable<any[]> {
    return this.http.post<any>(`${this.baseUrl}/api/user/search`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (res.status && Array.isArray(res.data?.content)) {
          return res.data.content;
        }
        return [];
      })
    );
  }

  getUsersForDropdown(): Observable<{ id: number; label: string }[]> {
    const payload: UserSearchPayload = {
      roleName: null,
      userName: null,
      employeeId: null,
      email: null,
      mobile: null,
      pagination: {
        pageNumber: 0,
        pageSize: 1000,
        sortBy: 'firstName',
        sortOrder: 'ASC'
      }
    };

    return this.http.post<any>(
      `${this.baseUrl}/user/search`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map((response: any) => {
        const users: any[] = response?.content ?? (Array.isArray(response) ? response : []);
        return users.map((u: any) => ({
          id: u.id ?? u.userId,
          label: [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
                  + (u.username ? ` (${u.username})` : '')
        }));
      })
    );
  }

  // ================= INCENTIVES METHODS =================
  getIncentivesReport(filter: IncentiveFilterRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reports/incentives/filter`, filter, {
      headers: this.getAuthHeaders()
    });
  }

  downloadIncentivesReport(filter: IncentiveFilterRequest): Observable<Blob> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this.http.post(`${this.baseUrl}/reports/incentives/download`, filter, {
      headers: headers,
      responseType: 'blob'
    });
  }

  // ================= REGION DROPDOWNS =================
  getRegionsForDropdown(): Observable<{ id: number; label: string }[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/location/locations?territoryLevelId=4`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map((locations: any[]) => {
        if (!Array.isArray(locations)) return [];
        return locations.map((loc: any) => ({
          id: loc.locationId ?? loc.id,
          label: loc.locationName ?? loc.name
        }));
      })
    );
  }

  // ================= MARGIN ANALYSIS METHODS =================
  getMarginAnalysisReport(filter: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reports/margin-analysis`, filter, {
      headers: this.getAuthHeaders()
    });
  }

  downloadMarginAnalysisReport(filter: any): Observable<Blob> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this.http.post(`${this.baseUrl}/reports/margin-analysis/download`, filter, {
      headers: headers,
      responseType: 'blob'
    });
  }

  getSegmentsForDropdown(): Observable<{ id: number; label: string }[]> {
    return this.http.get<any>(`${this.baseUrl}/product/group?name=`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        const groups = Array.isArray(res) ? res : (res?.content || res?.data || []);
        return groups.map((g: any) => ({
          id: g.groupId ?? g.id,
          label: g.groupName || g.name || `Segment ${g.groupId}`
        }));
      })
    );
  }

  getProductsForDropdown(groupId?: number | null): Observable<{ id: number; label: string }[]> {
    const payload: any = {
      pagination: {
        pageNumber: 0,
        pageSize: 500,
        sortBy: 'productId',
        sortOrder: 'ASC'
      }
    };
    if (groupId) {
      payload.groupId = groupId;
    }
    return this.http.post<any>(`${this.baseUrl}/product/search`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        const products = Array.isArray(res) ? res : (res?.content || res?.data || []);
        return products.map((p: any) => ({
          id: p.productId ?? p.id,
          label: p.productName || p.productDescription || p.name || `Product ${p.productId}`
        }));
      })
    );
  }

  // ================= FRESH BUSINESS METHODS =================
  getFreshBusinessReport(filter: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reports/fresh-business`, filter, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (!res.status) {
          throw new Error(res.message || 'Failed to fetch fresh business report');
        }
        return res.data;
      })
    );
  }

  getFreshBusinessDrillDown(filter: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reports/fresh-business/drilldown`, filter, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (!res.status) {
          throw new Error(res.message || 'Failed to fetch fresh business drilldown');
        }
        return res.data;
      })
    );
  }

  // ================= CATEGORIES METHODS =================
  getCategoriesForDropdown(): Observable<{ id: number; label: string }[]> {
    return this.http.get<any>(`${this.baseUrl}/product/category`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        const categories = Array.isArray(res) ? res : (res?.data || res?.content || []);
        return categories.map((c: any) => ({
          id: c.categoryId ?? c.id,
          label: c.categoryName || c.name || `Category ${c.categoryId}`
        }));
      })
    );
  }

  // ================= RUN RATE METHODS =================
  getRunRateProjection(filter: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reports/runrate-projection`, filter, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (!res.status) {
          throw new Error(res.message || 'Failed to fetch run rate projection report');
        }
        return res.data;
      })
    );
  }

  // ================= TARGET VS SALES METHODS =================
  getTargetVsSales(filter: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reports/target-vs-sales`, filter, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (!res.status) {
          throw new Error(res.message || 'Failed to fetch target vs sales report');
        }
        return res.data;
      })
    );
  }

  // ================= STOCK IN HAND METHODS =================
  getStockInHandReport(filter: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reports/stock-in-hand`, filter, {
      headers: this.getAuthHeaders()
    });
  }

  downloadStockInHandReport(filter: any): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/reports/stock-in-hand/download`, filter, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  // ================= OUTSTANDING METHODS =================
  getOutstandingUploadReport(filter: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reports/outstanding-upload`, filter, {
      headers: this.getAuthHeaders()
    });
  }

  downloadOutstandingUploadReport(filter: any): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/reports/outstanding-upload/download`, filter, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  // ================= OPPORTUNITY LOST METHODS =================
  getLostDealsLevel1(startDate?: string, endDate?: string, userId?: number, groupId?: number, regionId?: number): Observable<ApiResponse<LostDealsReportResponseDto>> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (userId) params = params.set('userId', userId.toString());
    if (groupId) params = params.set('groupId', groupId.toString());
    if (regionId) params = params.set('regionId', regionId.toString());

    return this.http.get<ApiResponse<LostDealsReportResponseDto>>(
      `${this.baseUrl}/reports/lost-deals/level1`,
      { headers, params }
    );
  }

  getLostDealsLevel2(reasonId?: number, competitorId?: number, startDate?: string, endDate?: string, groupId?: number, regionId?: number): Observable<ApiResponse<LostRegionDto[]>> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams();
    if (reasonId) params = params.set('reasonId', reasonId.toString());
    if (competitorId) params = params.set('competitorId', competitorId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (groupId) params = params.set('groupId', groupId.toString());
    if (regionId) params = params.set('regionId', regionId.toString());

    return this.http.get<ApiResponse<LostRegionDto[]>>(
      `${this.baseUrl}/reports/lost-deals/level2`,
      { headers, params }
    );
  }

  getLostDealsLevel3(regionId: number, reasonId?: number, competitorId?: number, startDate?: string, endDate?: string, groupId?: number): Observable<ApiResponse<LostProductDto[]>> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams();
    params = params.set('regionId', regionId.toString());
    if (reasonId) params = params.set('reasonId', reasonId.toString());
    if (competitorId) params = params.set('competitorId', competitorId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (groupId) params = params.set('groupId', groupId.toString());

    return this.http.get<ApiResponse<LostProductDto[]>>(
      `${this.baseUrl}/reports/lost-deals/level3`,
      { headers, params }
    );
  }

  getLostReasonsDropdown(): Observable<ApiResponse<any[]>> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/opportunity/lost-reasons-dropdown`,
      { headers }
    );
  }

  getActiveUsersDropdown(search?: string): Observable<ApiResponse<any[]>> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/reports/lost-deals/active-users-dropdown`,
      { headers, params }
    );
  }

  getSegmentsDropdown(search?: string): Observable<ApiResponse<any[]>> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/reports/lost-deals/segments-dropdown`,
      { headers, params }
    );
  }

  getRegionsDropdown(search?: string): Observable<ApiResponse<any[]>> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/reports/lost-deals/regions-dropdown`,
      { headers, params }
    );
  }
}
