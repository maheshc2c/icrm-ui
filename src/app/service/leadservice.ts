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
  getOpenLeads(page: number = 0, size: number = 10, searchData: any = {}): Observable<any> {
    const payload = {
      leadId: searchData.leadId ? Number(searchData.leadId) : null,
      customerId: searchData.customerId ? Number(searchData.customerId) : null,
      customerName: searchData.customerName || searchData.customer || null,
      status: searchData.status ? Number(searchData.status) : null,
      startDate: searchData.startDate || null,
      endDate: searchData.endDate || null,
      pagination: {
        pageNumber: page,
        pageSize: size,
        sortBy: 'leadCreatedTime',
        sortOrder: 'DESC'
      }
    };

    return this.http.post<any>(`${this.baseUrl}/leads/search`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET CLOSED LEADS ================= */
  getClosedLeads(): Observable<LeadSummary[]> {
    return this.http.get<LeadSummary[]>(`${this.baseUrl}/salesengineer/salesmanager/leads-closed`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET LEAD BY ID ================= */
  getLeadById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/leads/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= UPDATE LEAD ================= */
   updateLead(id: number, lead: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/leads/${id}`, lead, {
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
    return this.http.post(`${this.baseUrl}/leads/leads-excel`, data, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  /* ================= GET CUSTOMERS DROPDOWN ================= */
  getCustomers(): Observable<any[]> {
    console.log('📡 Calling: /leads/customer-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/leads/customer-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET CONTACT PERSONS DROPDOWN ================= */
  getContacts(): Observable<any[]> {
    console.log('📡 Calling: /leads/contacts-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/leads/contacts-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET RELATIONSHIPS (RAPPORT) DROPDOWN ================= */
  getRelationships(): Observable<any[]> {
    console.log('📡 Calling: /leads/relationships-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/leads/relationships-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET SITE READINESS DROPDOWN ================= */
  getSiteReadiness(): Observable<any[]> {
    console.log('📡 Calling: /leads/site-readiness-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/leads/site-readiness-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET DISTRIBUTORS DROPDOWN ================= */
  getDistributors(): Observable<any[]> {
    console.log('📡 Calling: /leads/distributors-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/leads/distributors-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET SOURCES (LEAD SOURCE) ================= */
  getSources(): Observable<any[]> {
    console.log('📡 Calling: /leads/sourcelead-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/leads/sourcelead-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET CAMPAIGNS ================= */
  getCampaigns(): Observable<any[]> {
    console.log('📡 Calling: /leads/campaign-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/leads/campaign-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= LEAD CREATION ================= */
  createLead(lead: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/leads`, lead, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= SAVE QUOTE ================= */
  saveQuote(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quote/create/quote`, payload, { headers: this.getAuthHeaders() });
  }

  /* ================= GET OPPORTUNITIES BY LEAD ID ================= */
  getOpportunitiesByLeadId(leadId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/opportunity/by-lead/${leadId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= CREATE OPPORTUNITY ================= */
  createOpportunity(leadId: number, opportunityDto: any): Observable<any> {
    opportunityDto.leadId = leadId;
    return this.http.post<any>(`${this.baseUrl}/opportunity/create/opportunity`, opportunityDto, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET OPPORTUNITY BY ID ================= */
  getOpportunityById(oppId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/opportunity/opportunity/${oppId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= UPDATE OPPORTUNITY ================= */
  updateOpportunity(oppId: number, opportunityDto: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/opportunity/update-opportunity/${oppId}`, opportunityDto, {
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
    return this.http.get<any[]>(`${this.baseUrl}/opportunity/categories-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET PRODUCT SEGMENTS DROPDOWN ================= */
  getSegmentsByCategory(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/opportunity/groups-by-category/${categoryId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET PRODUCTS BY SEGMENT ================= */
  getProductsBySegment(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/opportunity/products-by-group/${groupId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET FUNDS DROPDOWN ================= */
  getFunds(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/opportunity/funds-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET STATUS DROPDOWN ================= */
  getStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/opportunity/status-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET STAGES DROPDOWN ================= */
  getStages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/opportunity/stage-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET DEALERS DROPDOWN ================= */
  getDealers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quote/dealers`, {
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

  /* ================= QUOTE DROPDOWNS & LIST ================= */
  getQuotesByLead(leadId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quote/quotes-view?leadId=${leadId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getQuoteRevisionDetails(quoteId: number | string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/quote/quote-revision-details/${quoteId}`, {
      headers: this.getAuthHeaders()
    });
  }

  createContractNote(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/contractnote`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  getContractNoteDetails(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/contractnote/details`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  getBillingOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quote/billing`, {
      headers: this.getAuthHeaders()
    });
  }

  getCompanyOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quote/company`, {
      headers: this.getAuthHeaders()
    });
  }

  downloadQuotePdf(quoteId: string | number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/quote/quotes/${quoteId}/pdf`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  getCompetitors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/opportunity/competitors-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= OPPORTUNITY FUNNEL HISTORY ================= */
  searchOpportunityFunnelHistory(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/opportunity/funnel-history/search`,
      payload,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  downloadOpportunityFunnelHistory(payload: any) {
    const token = localStorage.getItem('token');

    return this.http.post(
      `${this.baseUrl}/opportunity/downloadFunnelHistory`,
      payload,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        }),
        responseType: 'blob'
      }
    );
  }
}
