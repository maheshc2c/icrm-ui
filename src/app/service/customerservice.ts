import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Customerservice {
  private baseUrl = 'http://localhost:8080/SalesEngineer';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories-dropdown`);
  }

  getCities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/city-view`);
  }

  getSubCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dropdown-sub-categories`);
  }

  searchCustomers(params: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/view-customer`);
  }

  updateCustomer(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update-customer/${id}`, payload);
  }

  createCustomer(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create-customer`, payload);
  }

  getInstallationBase(customerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/customer-installation-base/${customerId}`);
  }

  saveInstallationBase(customerId: number, records: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer-installation-base/${customerId}`, records);
  }
}
