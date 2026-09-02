import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth-service';
import { Segment, SegmentDto, Competitor } from '../models/segment';
 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SegmentService {
  private baseUrl = `${environment.baseUrl}/admin`;
  private productUrl = `${environment.baseUrl}/product`;
 
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }
 
  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
  }
 
    getSegments(): Observable<Segment[]> {
    return this.http.get<any>(
      `${this.productUrl}/group?name=`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.content)) return res.content;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
      })
    );
  }
 
  getSegmentById(id: number): Observable<Segment> {
    return this.http.get<Segment>(
      `${this.productUrl}/group/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
 
 
  createSegment(payload: SegmentDto): Observable<Segment> {
    return this.http.post<Segment>(
      `${this.productUrl}/group`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }
 
  updateSegment(groupId: number, payload: SegmentDto): Observable<Segment> {
    return this.http.put<Segment>(
      `${this.productUrl}/group/${groupId}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  deactivateSegment(id: number) {
    return this.http.delete(
      `${this.productUrl}/group/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  activateSegment(id: number) {
    return this.http.delete(
      `${this.productUrl}/group/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
 
   searchSegments(params: {
    categoryName?: string;
    groupName?: string;
    groupDescription?: string;
  }): Observable<Segment[]> {
    return this.http.post<any>(
      `${this.productUrl}/group-search`,
      {
        pagination: { pageNumber: 0, pageSize: 1000, sortBy: "groupId", sortOrder: "DESC" }
        // Depending on backend support we can map params here
      },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.content)) return res.content;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
      })
    );
  }
 
  downloadSegmentExcel(segments: Segment[]): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.baseUrl}/group-excel`,
      segments,
      { headers, responseType: 'blob' }
    );
  }
  // Fetch existing categories for dropdown (prevent 403 errors)
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.productUrl}/category`,
      { headers: this.getAuthHeaders() }
    );
  }
 
  // Fetch existing competitors for dropdown
  getCompetitors(): Observable<Competitor[]> {
    return this.http.post<any>(
      `${this.productUrl}/competitor-search`,
      { pagination: { pageNumber: 0, pageSize: 1000, sortBy: "competitorName", sortOrder: "ASC" } },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.content)) return res.content;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
      })
    );
  }

  getCompetitorsByCategoryId(categoryId: number): Observable<any[]> {
    return this.http.get<any>(
      `${this.productUrl}/competitors/category/${categoryId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.content)) return res.content;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
      })
    );
  }
}