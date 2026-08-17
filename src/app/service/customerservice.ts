import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class Customerservice {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/customer/categories`, {
      headers: this.getAuthHeaders()
    });
  }

  getCities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/location/cities`, {
      headers: this.getAuthHeaders()
    });
  }

  getSubCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/customer/subcategories`, {
      headers: this.getAuthHeaders()
    });
  }

  searchCustomers(params: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/customer/search`, params, {
      headers: this.getAuthHeaders()
    });
  }

  getCustomersDropdown(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/customer/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  updateCustomer(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/customer/${id}`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  createCustomer(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  getInstallationBase(customerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/customer-installation-base/${customerId}`, {
      headers: this.getAuthHeaders()
    });
  }

  saveInstallationBase(customerId: number, records: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer-installation-base/${customerId}`, records, {
      headers: this.getAuthHeaders()
    });
  }

  getCustomerById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/customer/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
