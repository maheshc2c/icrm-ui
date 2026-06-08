import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Contactservice {
  private baseUrl = 'http://localhost:8080/SalesEngineer';

  constructor(private http: HttpClient) {}

  getSpecialities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dropdown-speciality`);
  }

  searchContacts(params: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/view-contact`);
  }

  updateContact(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update-contact/${id}`, payload);
  }

  createContact(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create-contact`, payload);
  }
}
