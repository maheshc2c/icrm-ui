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
  getOpenLeads(page: number = 0, size: number = 1000): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.baseUrl}/salesengineer/salesmanager/leads-open`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  /* ================= GET CLOSED LEADS ================= */
  getClosedLeads(): Observable<LeadSummary[]> {
    return this.http.get<LeadSummary[]>(`${this.baseUrl}/salesengineer/salesmanager/leads-closed`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET LEAD BY ID ================= */
  getLeadById(id: number): Observable<LeadPayload> {
    return this.http.get<LeadPayload>(`${this.baseUrl}/salesengineer/salesmanager/lead/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= UPDATE LEAD ================= */
  updateLead(id: number, lead: LeadPayload): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/salesengineer/salesmanager/lead-update/${id}`, lead, {
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

    return this.http.get<LeadSummary[]>(`${this.baseUrl}/salesengineer/salesmanager/leads-search`, {
      headers: this.getAuthHeaders(),
      params: httpParams
    });
  }

  /* ================= DOWNLOAD EXCEL ================= */
  downloadLeadsExcel(data: any[]): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/salesengineer/salesmanager/leads-excel`, data, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  /* ================= GET CUSTOMERS DROPDOWN ================= */
  getCustomers(): Observable<any[]> {
    console.log('📡 Calling: /salesengineer/customer/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/customer/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET CONTACT PERSONS DROPDOWN ================= */
  getContacts(): Observable<any[]> {
    console.log('📡 Calling: /salesengineer/contacts/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/contacts/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET RELATIONSHIPS (RAPPORT) DROPDOWN ================= */
  getRelationships(): Observable<any[]> {
    console.log('📡 Calling: /salesengineer/relationships/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/relationships/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET SITE READINESS DROPDOWN ================= */
  getSiteReadiness(): Observable<any[]> {
    console.log('📡 Calling: /salesengineer/site-readiness/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/site-readiness/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET DISTRIBUTORS DROPDOWN ================= */
  getDistributors(): Observable<any[]> {
    console.log('📡 Calling: /salesengineer/distributors/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/distributors/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET SOURCES (LEAD SOURCE) ================= */
  getSources(): Observable<any[]> {
    console.log('📡 Calling: /salesengineer/sourcelead-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/sourcelead-dropdown`, {
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
    return this.http.post<any>(`${this.baseUrl}/salesengineer/assign-lead`, lead, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET OPPORTUNITIES BY LEAD ID ================= */
  getOpportunitiesByLeadId(leadId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/opportunityTable/${leadId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= CREATE OPPORTUNITY ================= */
  createOpportunity(leadId: number, opportunityDto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/salesengineer/leadOopCreate/${leadId}`, opportunityDto, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET OPPORTUNITY BY ID ================= */
  getOpportunityById(oppId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/salesengineer/opportunity/${oppId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= UPDATE OPPORTUNITY ================= */
  updateOpportunity(oppId: number, opportunityDto: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/salesengineer/update-opportunity/${oppId}`, opportunityDto, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET ALL OPPORTUNITIES (TABLE) ================= */
  getOpportunityTable(page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.baseUrl}/salesengineer/opportunity/table`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  /* ================= SEARCH OPPORTUNITIES (TABLE) ================= */
  searchOpportunitiesTable(params: any, page: number = 0, size: number = 10): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.post<any>(`${this.baseUrl}/salesengineer/opportunity/search`, params, {
      headers: this.getAuthHeaders(),
      params: httpParams
    });
  }

  /* ================= GET CATEGORIES DROPDOWN ================= */
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/categories-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET PRODUCT SEGMENTS DROPDOWN ================= */
  getSegmentsByCategory(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/groups-by-category/${categoryId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET PRODUCTS BY SEGMENT ================= */
  getProductsBySegment(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/products-by-group/${groupId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET FUNDS DROPDOWN ================= */
  getFunds(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/funds-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET STATUS DROPDOWN ================= */
  getStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/status-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET STAGES DROPDOWN ================= */
  getStages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/stage-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET REGIONS DROPDOWN ================= */
  getRegions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=4`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET SALES USERS DROPDOWN ================= */
  getSalesUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/salesengineer/sales-users/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }
}
