import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class Contactservice {
  private baseUrl = 'http://localhost:8080/SalesEngineer';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getSpecialities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dropdown-speciality`, {
      headers: this.getAuthHeaders()
    });
  }

  searchContacts(params: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/view-contact`, {
      headers: this.getAuthHeaders()
    });
  }

  updateContact(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update-contact/${id}`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  createContact(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create-contact`, payload, {
      headers: this.getAuthHeaders()
    });
  }
}
