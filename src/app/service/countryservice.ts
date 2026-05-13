import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';
import { Country } from '../models/country';
 
@Injectable({
  providedIn: 'root'
})
export class Countryservice {
 
  private baseUrl = 'http://localhost:8080';
 
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}
 
  getCountryById(id: number) {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
 
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/view-country`,
      { headers }
    );
  }
 
  // ================= SEARCH =================
  searchCountry(name: string) {
    const headers = this.getAuthHeaders();
    console.log('Search Country API Call:');
    console.log('URL:', `${this.baseUrl}/admin/search-geo-country?locationName=${name}`);
    console.log('Headers:', headers);
 
    return this.http.get<Country[]>(
      `${this.baseUrl}/admin/search-geo-country?locationName=${name}`,
      { headers }
    );
  }
 
  downloadCountryExcel(data: Country[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/admin/country-excel`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }
 
  // ================= GET ALL COUNTRIES =================
  getCountries(): Observable<Country[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Country[]>(
      `${this.baseUrl}/admin/view-country`,
      { headers }
    );
  }
 
  // ================= CREATE COUNTRY =================
  createCountry(country: Country): Observable<Country> {
    const headers = this.getAuthHeaders();
    console.log('Create Country API Call:');
    console.log('URL:', `${this.baseUrl}/admin/country-add`);
    console.log('Headers:', headers);
    console.log('Payload:', country);
   
    return this.http.post<Country>(
      `${this.baseUrl}/admin/country-add`,
      country,
      { headers }
    );
  }
 
  // ================= UPDATE COUNTRY =================
  updateCountry(countryId: number, country: Country) {
    const headers = this.getAuthHeaders();
 
    return this.http.put<Country>(
      `${this.baseUrl}/admin/country-update/${countryId}`,
      country,
      { headers }
    );
  }
 
  // ================= COMMON AUTH HEADER =================
  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
  }
}