import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth-service';
import { QuoteTrackingModel } from '../models/quote-tracking.model';
import { PurchaseOrderTrackingModel } from '../models/purchase-order-tracking.model';

@Injectable({
  providedIn: 'root'
})
export class CountryHeadService {
  private baseUrl = 'http://localhost:8080/CountryHead';

  private commonUrl = 'http://localhost:8080/track-quote-po';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  getQuoteListPaginated(
    page: number,
    size: number,
    quoteId?: string,
    customerName?: string,
    opportunityDetails?: string,
    search?: string
  ): Observable<any> {
    const requestBody = {
      quoteId: quoteId || null,
      customerName: customerName || null,
      opportunityDetails: opportunityDetails || null,
      search: search || null,
      pagination: {
        pageNumber: page,
        pageSize: size,
        sortBy: 'quoteId',
        sortOrder: 'desc'
      }
    };
    return this.http.post<any>(`${this.commonUrl}/view-quotes`, requestBody, {
      headers: this.getAuthHeaders()
    });
  }

  getPOTrackingListPaginated(
    page: number,
    size: number,
    poId?: number,
    status?: number,
    distributor?: string,
    product?: string
  ): Observable<any> {
    const requestBody = {
      poId: poId || null,
      status: status !== undefined && status !== null ? status : null,
      distributor: distributor || null,
      product: product || null,
      pagination: {
        pageNumber: page,
        pageSize: size,
        sortBy: 'purchaseOrderId',
        sortOrder: 'desc'
      }
    };
    return this.http.post<any>(`${this.commonUrl}/view-pos`, requestBody, {
      headers: this.getAuthHeaders()
    });
  }

  getQuoteList(): Observable<QuoteTrackingModel[]> {
    const requestBody = {
      pagination: {
        pageNumber: 0,
        pageSize: 1000,
        sortBy: 'quoteId',
        sortOrder: 'desc'
      }
    };
    return this.http.post<any>(`${this.commonUrl}/view-quotes`, requestBody, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res.content || [])
    );
  }

  getPOTrackingList(): Observable<PurchaseOrderTrackingModel[]> {
    const requestBody = {
      pagination: {
        pageNumber: 0,
        pageSize: 1000,
        sortBy: 'purchaseOrderId',
        sortOrder: 'desc'
      }
    };
    return this.http.post<any>(`${this.commonUrl}/view-pos`, requestBody, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res.content || [])
    );
  }

  searchQuotes(search: string): Observable<any[]> {
    const requestBody = {
      search: search || null,
      pagination: {
        pageNumber: 0,
        pageSize: 1000,
        sortBy: 'quoteId',
        sortOrder: 'desc'
      }
    };
    return this.http.post<any>(`${this.commonUrl}/view-quotes`, requestBody, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res.content || [])
    );
  }

  searchPO(poId?: number, status?: number, distributor?: string, product?: string): Observable<PurchaseOrderTrackingModel[]> {
    const requestBody = {
      poId: poId || null,
      status: status !== undefined && status !== null ? status : null,
      distributor: distributor || null,
      product: product || null,
      pagination: {
        pageNumber: 0,
        pageSize: 1000,
        sortBy: 'purchaseOrderId',
        sortOrder: 'desc'
      }
    };
    return this.http.post<any>(`${this.commonUrl}/view-pos`, requestBody, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res.content || [])
    );
  }

  getQuoteTrackingList(params?: { quoteId?: string; customerName?: string; opportunityDetails?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.quoteId) httpParams = httpParams.set('quoteId', params.quoteId);
    if (params?.customerName) httpParams = httpParams.set('customerName', params.customerName);
    if (params?.opportunityDetails) httpParams = httpParams.set('opportunityDetails', params.opportunityDetails);

    return this.http.get(`${this.baseUrl}/track-quotes`, {
      headers: this.getAuthHeaders(),
      params: httpParams
    });
  }

  getQuoteTrackingById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/quotes-view/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateQuoteStatus(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/edit-quoteApprovals`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  getDashboardCounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard-counts`, {
      headers: this.getAuthHeaders()
    });
  }
}
