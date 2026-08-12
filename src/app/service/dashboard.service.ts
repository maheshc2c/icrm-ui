import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8080/dashboard';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getTargetVsActual(timeline: number = 2, userId?: number): Observable<any> {
    let params = new HttpParams().set('timeline', timeline.toString());
    if (userId) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<any>(`${this.baseUrl}/target-vs-actual`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getLeadConversionByRegion(timeline: number = 2, userId?: number): Observable<any> {
    let params = new HttpParams().set('timeline', timeline.toString());
    if (userId) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<any>(`${this.baseUrl}/lead-conversion-by-region`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getLeadsCreatedYtd(timeline: number = 2, userId?: number): Observable<any> {
    let params = new HttpParams().set('timeline', timeline.toString());
    if (userId) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<any>(`${this.baseUrl}/leads-created-ytd`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getLeadsCreatedCumulative(timeline: number = 2, userId?: number): Observable<any> {
    let params = new HttpParams().set('timeline', timeline.toString());
    if (userId) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<any>(`${this.baseUrl}/leads-created-cumulative`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getUsersDropdown(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  getOpportunityDashboard(pcRegion: number = 1, timeline: number = 3, userId?: number): Observable<any> {
    let params = new HttpParams()
      .set('pcRegion', pcRegion.toString())
      .set('timeline', timeline.toString());
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    return this.http.get<any>(`${this.baseUrl}/opportunity-dashboard`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getOpportunityFunnel(timeline: number = 3, userId?: number): Observable<any> {
    let params = new HttpParams().set('timeline', timeline.toString());
    if (userId) params = params.set('userId', userId.toString());
    return this.http.get<any>(`${this.baseUrl}/opportunity/funnel`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getOpportunityPipeline(pcRegion: number = 1, timeline: number = 3, userId?: number): Observable<any> {
    let params = new HttpParams()
      .set('pcRegion', pcRegion.toString())
      .set('timeline', timeline.toString());
    if (userId) params = params.set('userId', userId.toString());
    return this.http.get<any>(`${this.baseUrl}/opportunity/pipeline-by-group`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getTopHotOpportunities(timeline: number = 3, userId?: number): Observable<any> {
    let params = new HttpParams().set('timeline', timeline.toString());
    if (userId) params = params.set('userId', userId.toString());
    return this.http.get<any>(`${this.baseUrl}/opportunity/top-hot`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getOpportunityClosed(pcRegion: number = 1, timeline: number = 3, userId?: number): Observable<any> {
    let params = new HttpParams()
      .set('pcRegion', pcRegion.toString())
      .set('timeline', timeline.toString());
    if (userId) params = params.set('userId', userId.toString());
    return this.http.get<any>(`${this.baseUrl}/opportunity/closed-by-group`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getClosureSuccess(pcRegion: number = 1, timeline: number = 3, userId?: number): Observable<any> {
    let params = new HttpParams()
      .set('pcRegion', pcRegion.toString())
      .set('timeline', timeline.toString());
    if (userId) params = params.set('userId', userId.toString());
    return this.http.get<any>(`${this.baseUrl}/opportunity/closure-success`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getTopClosedOpportunities(timeline: number = 3, userId?: number): Observable<any> {
    let params = new HttpParams().set('timeline', timeline.toString());
    if (userId) params = params.set('userId', userId.toString());
    return this.http.get<any>(`${this.baseUrl}/opportunity/top-closed`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }
}
