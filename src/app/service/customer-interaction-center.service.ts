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

  getOpenSoEntries(page: number, size: number, cnoteId?: string, cnoteType?: string, customerName?: string): Observable<any> {
    const cnoteIdNum = cnoteId ? parseInt(cnoteId) : null;
    const typeVal = cnoteType === 'Regular' || cnoteType === '1' ? 1 : (cnoteType === 'Purchase Order' || cnoteType === '2' ? 2 : null);

    const requestBody = {
      cnoteId: cnoteIdNum,
      cnoteType: typeVal,
      customerName: customerName || null,
      pagination: {
        pageNumber: page,
        pageSize: size,
        sortBy: 'cnoteId',
        sortOrder: 'desc'
      }
    };

    return this.http.post<any>(
      `${this.baseUrl}/CustomerInteractionCenter/so-entries/open`,
      requestBody,
      { headers: this.getAuthHeaders() }
    );
  }

  getClosedSoEntries(page: number, size: number, cnoteId?: string, cnoteType?: string, customerName?: string): Observable<any> {
    const cnoteIdNum = cnoteId ? parseInt(cnoteId) : null;
    const typeVal = cnoteType === 'Regular' || cnoteType === '1' ? 1 : (cnoteType === 'Purchase Order' || cnoteType === '2' ? 2 : null);

    const requestBody = {
      cnoteId: cnoteIdNum,
      cnoteType: typeVal,
      customerName: customerName || null,
      pagination: {
        pageNumber: page,
        pageSize: size,
        sortBy: 'cnoteId',
        sortOrder: 'desc'
      }
    };

    return this.http.post<any>(
      `${this.baseUrl}/CustomerInteractionCenter/so-entries/closed`,
      requestBody,
      { headers: this.getAuthHeaders() }
    );
  }

  updateSoNumbers(updates: any[]): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/CustomerInteractionCenter/so-entries/update`,
      updates,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }

  bulkUploadSoEntries(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // We override Content-Type header so the browser sets the boundary correctly for Multipart Form Data
    const headers = this.getAuthHeaders();
    const headersWithoutContentType = new HttpHeaders({
      Authorization: headers.get('Authorization') || ''
    });

    return this.http.post(
      `${this.baseUrl}/CustomerInteractionCenter/so-entries/bulk-upload`,
      formData,
      { headers: headersWithoutContentType, responseType: 'text' }
    );
  }

  downloadContractNotePdf(cnoteId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/CustomerInteractionCenter/so-entries/download-pdf/${cnoteId}`,
      { headers: this.getAuthHeaders(), responseType: 'blob' }
    );
  }

  downloadSoEntriesExcel(cnoteId?: string, cnoteType?: string, customerName?: string, isOpen: boolean = true): Observable<Blob> {
    const cnoteIdNum = cnoteId ? parseInt(cnoteId) : null;
    const typeVal = cnoteType === 'Regular' || cnoteType === '1' ? 1 : (cnoteType === 'Purchase Order' || cnoteType === '2' ? 2 : null);

    const requestBody = {
      cnoteId: cnoteIdNum,
      cnoteType: typeVal,
      customerName: customerName || null,
      pagination: {
        pageNumber: 0,
        pageSize: 10,
        sortBy: 'cnoteId',
        sortOrder: 'desc'
      }
    };

    return this.http.post(
      `${this.baseUrl}/CustomerInteractionCenter/so-entries/download-excel?isOpen=${isOpen}`,
      requestBody,
      { headers: this.getAuthHeaders(), responseType: 'blob' }
    );
  }
}

