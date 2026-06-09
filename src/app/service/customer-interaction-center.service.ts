import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { TrackLead, PaginationRequest, TrackLeadResponse } from "../models/track-lead-cic.model";

@Injectable({
  providedIn: 'root',
})
export class CustomerInteractionCenterService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getTrackLeads(pagination: PaginationRequest): Observable<TrackLeadResponse> {
    return this.http.post<TrackLeadResponse>(
      `${this.baseUrl}/CustomerInteractionCenter/view-track`,
      { pagination },
      { headers: this.getAuthHeaders() }
    );
  }

  approveLead(leadId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/CustomerInteractionCenter/leads/approve/${leadId}`,
      {},
      { 
        headers: this.getAuthHeaders(),
        responseType: 'text'
      }
    );
  }

  rejectLead(leadId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/CustomerInteractionCenter/leads/reject/${leadId}`,
      {},
      { 
        headers: this.getAuthHeaders(),
        responseType: 'text'
      }
    );
  }
}
