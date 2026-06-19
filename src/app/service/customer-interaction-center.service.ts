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

  getDropdownOwners(search: string = ''): Observable<{ label: string; value: any }[]> {
    let url = `${this.baseUrl}/CustomerInteractionCenter/dropdown-customers`;
    if (search) {
      url += `?customer=${encodeURIComponent(search)}`;
    }
    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() }).pipe(
      map(owners => {
        const seen = new Set();
        return owners
          .map(owner => ({
            label: `${owner.firstName} ${owner.lastName}`,
            value: `${owner.firstName} ${owner.lastName}`,
            id: owner.id // Add unique id
          }))
          .filter(item => {
            if (seen.has(item.value)) return false;
            seen.add(item.value);
            return true;
          });
      })
    );
  }

  getDropdownCustomers(search: string = ''): Observable<{ label: string; value: any }[]> {
    let url = `${this.baseUrl}/CustomerInteractionCenter/dropdown-owners`;
    if (search) {
      url += `?owner=${encodeURIComponent(search)}`;
    }
    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() }).pipe(
      map(customers => {
        const seen = new Set();
        return customers
          .map(customer => ({
            label: customer.customerName || customer.name || customer,
            value: customer.customerName || customer.name || customer,
            id: customer.customerId // Add unique id
          }))
          .filter(item => {
            if (seen.has(item.value)) return false;
            seen.add(item.value);
            return true;
          });
      })
    );
  }

  getDistributors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/SalesEngineer/distributors/dropdown`, { headers: this.getAuthHeaders() });
  }

  getSiteReadiness(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/SalesEngineer/site-readiness/dropdown`, { headers: this.getAuthHeaders() });
  }

  getLeadById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SalesEngineer/salesmanager/lead/${id}`, { headers: this.getAuthHeaders() });
  }

  getInstalledBase(customerId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/adminMarketing/installedBase/${customerId}`, { headers: this.getAuthHeaders() });
  }

  editLead(lead: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/SalesEngineer/lead/update/${lead.leadId}`, lead, { headers: this.getAuthHeaders() });
  }
}
