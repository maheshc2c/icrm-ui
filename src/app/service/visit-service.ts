import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

export interface VisitDto {
  visitId?: number;
  leadId?: number;
  purposeId?: number;
  purposeName: string;
  startDate: string;
  endDate: string;
  status: number;
  remarks1: string;
  remarks2?: string;
  remarks3?: string;
  createdBy?: number;
  createdTime?: string;
  modifiedBy?: number;
  modifiedTime?: string;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private baseUrl = `${environment.baseUrl}/SalesEngineer`;

  constructor(private http: HttpClient, private auth: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /* ================= GET ALL VISITS ================= */
  getAllVisits(): Observable<VisitDto[]> {
    return this.http.get<VisitDto[]>(`${this.baseUrl}/viw-visit`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= CREATE VISIT ================= */
  createVisit(visit: VisitDto): Observable<VisitDto> {
    return this.http.post<VisitDto>(`${this.baseUrl}/create-visit`, visit, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= UPDATE VISIT ================= */
  updateVisit(id: number, visit: VisitDto): Observable<VisitDto> {
    return this.http.put<VisitDto>(`${this.baseUrl}/update/${id}`, visit, {
      headers: this.getAuthHeaders()
    });
  }
}
