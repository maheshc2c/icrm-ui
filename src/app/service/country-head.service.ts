import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';
import { QuoteTrackingModel } from '../models/quote-tracking.model';
import { PurchaseOrderTrackingModel } from '../models/purchase-order-tracking.model';

@Injectable({
  providedIn: 'root'
})
export class CountryHeadService {
  private baseUrl = 'http://localhost:8080/CountryHead';

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

  getQuoteList(): Observable<QuoteTrackingModel[]> {
    return this.http.get<QuoteTrackingModel[]>(`${this.baseUrl}/Track-quotes-view`, {
      headers: this.getAuthHeaders()
    });
  }

  getPOTrackingList(): Observable<PurchaseOrderTrackingModel[]> {
    return this.http.get<PurchaseOrderTrackingModel[]>(`${this.baseUrl}/purchase-orders-tracking-view`, {
      headers: this.getAuthHeaders()
    });
  }

  searchQuotes(search: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Track-quotes-search-quoteID-customer-opp`, {
      headers: this.getAuthHeaders(),
      params: new HttpParams().set('search', search)
    });
  }

  searchPO(poId?: number, status?: number, distributor?: string, product?: string): Observable<PurchaseOrderTrackingModel[]> {
    let httpParams = new HttpParams();
    if (poId !== undefined && poId !== null) httpParams = httpParams.set('poId', poId.toString());
    if (status !== undefined && status !== null) httpParams = httpParams.set('status', status.toString());
    if (distributor) httpParams = httpParams.set('distributor', distributor);
    if (product) httpParams = httpParams.set('product', product);

    return this.http.get<PurchaseOrderTrackingModel[]>(`${this.baseUrl}/purchase-orders/search`, {
      headers: this.getAuthHeaders(),
      params: httpParams
    });
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
