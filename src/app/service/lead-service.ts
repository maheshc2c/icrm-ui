import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';
import { LeadSummary, LeadPayload } from '../models/lead-model';
 
@Injectable({
  providedIn: 'root'
})
export class Leadservice {
  private baseUrl = 'http://localhost:8080';
 
  constructor(private http: HttpClient, private auth: AuthService) { }
 
  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    const headersConfig: any = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headersConfig);
  }
 
  /* ================= GET ALL LEADS (OPEN) ================= */
  getOpenLeads(): Observable<LeadSummary[]> {
    return this.http.get<LeadSummary[]>(`${this.baseUrl}/SalesDirector/salesmanager/leads-open`, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= GET CLOSED LEADS ================= */
  getClosedLeads(): Observable<LeadSummary[]> {
    return this.http.get<LeadSummary[]>(`${this.baseUrl}/SalesDirector/salesmanager/leads-closed`, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= GET LEAD BY ID ================= */
  getLeadById(id: number): Observable<LeadPayload> {
    return this.http.get<LeadPayload>(`${this.baseUrl}/SalesDirector/salesmanager/lead/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= UPDATE LEAD ================= */
  updateLead(id: number, lead: LeadPayload): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/SalesDirector/salesmanager/lead-update/${id}`, lead, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= SEARCH LEADS ================= */
  searchLeads(params: {
    leadId?: string;
    customerName?: string;
    status?: string;
  }): Observable<any[]> {
    let httpParams = new HttpParams();
   
    if (params.leadId) {
      httpParams = httpParams.set('leadId', params.leadId);
    }
    if (params.customerName) {
      httpParams = httpParams.set('customerName', params.customerName);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
 
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/salesmanager/leads-search`, {
      headers: this.getAuthHeaders(),
      params: httpParams
    });
  }
 
  /* ================= DOWNLOAD EXCEL ================= */
  downloadLeadsExcel(data: any[]): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/SalesDirector/salesmanager/leads-excel`, data, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
 
  /* ================= GET CUSTOMERS DROPDOWN ================= */
  getCustomers(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/customer/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/customer/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= GET CONTACT PERSONS DROPDOWN ================= */
  getContacts(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/contacts/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/contacts/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= GET RELATIONSHIPS (RAPPORT) DROPDOWN ================= */
  getRelationships(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/relationships/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/relationships/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= GET SITE READINESS DROPDOWN ================= */
  getSiteReadiness(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/site-readiness/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/site-readiness/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= GET DISTRIBUTORS DROPDOWN ================= */
  getDistributors(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/distributors/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/distributors/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= GET SOURCES (LEAD SOURCE) ================= */
  getSources(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/sourcelead-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/sourcelead-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= GET CAMPAIGNS ================= */
  getCampaigns(): Observable<any[]> {
    console.log('📡 Calling: /adminMarketing/view-campaign');
    return this.http.get<any[]>(`${this.baseUrl}/adminMarketing/view-campaign`, {
      headers: this.getAuthHeaders()
    });
  }
 
  /* ================= CREATE LEAD ================= */
  createLead(lead: LeadPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/SalesDirector/assign-lead`, lead, {
      headers: this.getAuthHeaders()
    });
  }
}