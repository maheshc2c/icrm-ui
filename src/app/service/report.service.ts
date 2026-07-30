import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth-service';

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

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

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

  /**
   * POST /user/search – fetches users for the "Select Users" dropdown.
   * Sends an empty search (no filters) to get all users, with a large page size.
   * The backend returns a Spring Page<User> object: { content: User[], totalElements, ... }
   */
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
        // Spring Page returns { content: [...], totalElements, ... }
        const users: any[] = response?.content ?? (Array.isArray(response) ? response : []);
        return users.map((u: any) => ({
          id: u.id ?? u.userId,
          label: [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
                  + (u.username ? ` (${u.username})` : '')
        }));
      })
    );
  }
}

