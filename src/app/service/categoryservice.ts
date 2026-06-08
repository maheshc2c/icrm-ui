import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class Categoryservice {
  private baseUrl = 'http://localhost:8080';
 
  constructor(private http: HttpClient) { }
 
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
 
  // Get all categories - YOU NEED TO ADD THIS ENDPOINT TO BACKEND
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/productCategory-view`, {
      headers: this.getAuthHeaders()
    });
  }
 
  // Create category
  createCategory(category: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/productCategory-create`, category, {
      headers: this.getAuthHeaders()
    });
  }
 
  // Update category - Backend expects query param: ?id=
  updateCategory(id: number, category: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/productCategory-edite?id=${id}`, category, {
      headers: this.getAuthHeaders()
    });
  }
 
  // Search category
  searchCategory(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/productCategory-search?categoryName=${keyword}`, {
      headers: this.getAuthHeaders()
    });
  }
 
  // Download Excel
  downloadCategoryExcel(data: any[]): Observable<Blob> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
   
    return this.http.post(`${this.baseUrl}/admin/productCategory-excel`, data, {
      headers: headers,
      responseType: 'blob'
    });
  }

  // Activate category
  activateCategory(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/activate-productCategory/${id}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // Deactivate category
  deactivateCategory(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/deactivate-productCategory/${id}`, {}, {
      headers: this.getAuthHeaders()
    });
  }
}