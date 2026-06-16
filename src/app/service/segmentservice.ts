import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth-service';
import { Segment, SegmentDto, Competitor } from '../models/segment';
 
@Injectable({
  providedIn: 'root'
})
export class SegmentService {
  private baseUrl = 'http://localhost:8080/admin';
 
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
      `${this.baseUrl}/view-group`,
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
    return this.getSegments().pipe(
      map(segments => {
        const seg = segments.find(s => s.groupId === id);
        if (!seg) throw new Error('Segment not found');
        return seg;
      })
    );
  }
 
 
  createSegment(payload: SegmentDto): Observable<Segment> {
    return this.http.post<Segment>(
      `${this.baseUrl}/create-group`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }
 
  updateSegment(groupId: number, payload: SegmentDto): Observable<Segment> {
    return this.http.put<Segment>(
      `${this.baseUrl}/update-group/${groupId}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  deactivateSegment(id: number) {
    return this.http.put(
      `${this.baseUrl}/deactivate-group/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  activateSegment(id: number) {
    return this.http.put(
      `${this.baseUrl}/activate-group/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
 
   searchSegments(params: {
    categoryName?: string;
    groupName?: string;
    groupDescription?: string;
  }): Observable<Segment[]> {
    return this.http.get<Segment[]>(
      `${this.baseUrl}/search-group`,
      {
        headers: this.getAuthHeaders(),
        params
      }
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
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/categories-list-admin`,
      { headers: this.getAuthHeaders() }
    );
  }
 
  // Fetch existing competitors for dropdown
  getCompetitors(): Observable<Competitor[]> {
    return this.http.get<any>(
      `${this.baseUrl}/get-competitors?size=1000`,
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