import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { TrackLead, PaginationRequest, TrackLeadResponse } from "../models/track-lead-cic.model";
import { AuthService } from "./auth-service";

@Injectable({
  providedIn: 'root',
})
export class CustomerInteractionCenterService {

  private baseUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();

    if (!token) {
      console.error('❌ No token found');
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return new HttpHeaders({
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
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

  getLeadById(leadId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/SalesEngineer/salesmanager/lead/${leadId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  editLead(dto: any): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/CustomerInteractionCenter/editLeads`,
      dto,
      { headers: this.getAuthHeaders() }
    );
  }

  getInstalledBase(customerId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/CustomerInteractionCenter/installed-base/${customerId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getDistributors(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/CustomerInteractionCenter/distributor`,
      { headers: this.getAuthHeaders() }
    );
  }

  getSiteReadiness(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/CustomerInteractionCenter/site-readiness`,
      { headers: this.getAuthHeaders() }
    );
  }

  getDropdownCustomers(query: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/CustomerInteractionCenter/dropdown-customers?customer=${encodeURIComponent(query)}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getDropdownOwners(query: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/CustomerInteractionCenter/dropdown-owners?owner=${encodeURIComponent(query)}`,
      { headers: this.getAuthHeaders() }
    );
  }

}
