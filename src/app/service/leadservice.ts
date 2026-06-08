import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';
import { LeadSummary, LeadPayload } from '../models/lead-model';
import { OpportunityTableModel } from '../models/opportunity-table.model';

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
    return this.http.get<LeadSummary[]>(`${this.baseUrl}/SalesEngineer/salesmanager/leads-open`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET CLOSED LEADS ================= */
  getClosedLeads(): Observable<LeadSummary[]> {
    return this.http.get<LeadSummary[]>(`${this.baseUrl}/SalesEngineer/salesmanager/leads-closed`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET LEAD BY ID ================= */
  getLeadById(id: number): Observable<LeadPayload> {
    return this.http.get<LeadPayload>(`${this.baseUrl}/SalesEngineer/salesmanager/lead/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= UPDATE LEAD ================= */
  updateLead(id: number, lead: LeadPayload): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/SalesEngineer/salesmanager/lead-update/${id}`, lead, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= SEARCH LEADS ================= */
  searchLeads(params: {
    leadId?: string | number;
    customerName?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    owner?: string;
  }): Observable<LeadSummary[]> {
    let httpParams = new HttpParams();
    
    if (params.leadId) {
      httpParams = httpParams.set('leadId', params.leadId.toString());
    }
    if (params.customerName) {
      httpParams = httpParams.set('customerName', params.customerName);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    if (params.owner) {
      httpParams = httpParams.set('owner', params.owner);
    }

    return this.http.get<LeadSummary[]>(`${this.baseUrl}/SalesEngineer/salesmanager/leads-search`, {
      headers: this.getAuthHeaders(),
      params: httpParams
    });
  }

  /* ================= DOWNLOAD EXCEL ================= */
  downloadLeadsExcel(data: any[]): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/SalesEngineer/salesmanager/leads-excel`, data, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  /* ================= GET CUSTOMERS DROPDOWN ================= */
  getCustomers(): Observable<any[]> {
    console.log('📡 Calling: /SalesEngineer/customer/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesEngineer/customer/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET CONTACT PERSONS DROPDOWN ================= */
  getContacts(): Observable<any[]> {
    console.log('📡 Calling: /SalesEngineer/contacts/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesEngineer/contacts/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET RELATIONSHIPS (RAPPORT) DROPDOWN ================= */
  getRelationships(): Observable<any[]> {
    console.log('📡 Calling: /SalesEngineer/relationships/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesEngineer/relationships/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET SITE READINESS DROPDOWN ================= */
  getSiteReadiness(): Observable<any[]> {
    console.log('📡 Calling: /SalesEngineer/site-readiness/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesEngineer/site-readiness/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET DISTRIBUTORS DROPDOWN ================= */
  getDistributors(): Observable<any[]> {
    console.log('📡 Calling: /SalesEngineer/distributors/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesEngineer/distributors/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET SOURCES (LEAD SOURCE) ================= */
  getSources(): Observable<any[]> {
    console.log('📡 Calling: /SalesEngineer/sourcelead-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesEngineer/sourcelead-dropdown`, {
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
    return this.http.post<any>(`${this.baseUrl}/SalesEngineer/assign-lead`, lead, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET OPPORTUNITIES BY LEAD ID ================= */
  getOpportunitiesByLeadId(leadId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/SalesEngineer/opportunityTable/${leadId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET ALL OPPORTUNITIES (TABLE) ================= */
  getOpportunityTable(): Observable<OpportunityTableModel[]> {
    return this.http.get<OpportunityTableModel[]>(`${this.baseUrl}/SalesEngineer/opportunity/table`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET SALES USERS DROPDOWN ================= */
  getSalesUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/SalesEngineer/sales-users/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }
}
