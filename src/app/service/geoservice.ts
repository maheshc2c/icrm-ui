import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';
import { Geo } from '../models/geo';
 
@Injectable({
  providedIn: 'root'
})
export class Geoservice {
 
  private baseUrl = 'http://localhost:8080';
 
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }
 
  getGeoById(id: number) {
    const token = this.auth.getToken();
 
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
 
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/geo-view`, // Corrected endpoint
      { headers }
    );
  }
 
  // ================= SEARCH =================
  searchGeo(name: string) {
    const headers = this.getAuthHeaders();
    console.log('Search API Call:');
    console.log('URL:', `${this.baseUrl}/admin/geo-search/${name}`);
    console.log('Headers:', headers);
 
    return this.http.get<Geo[]>(
      `${this.baseUrl}/admin/geo-search/${name}`,
      { headers }
    );
  }
 
  downloadGeoExcel(data: Geo[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/admin/Geo-excel`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }
 
  // ================= GET ALL GEOS =================
  getGeos(): Observable<Geo[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Geo[]>(
      `${this.baseUrl}/admin/geo-view`,
      { headers }
    );
  }
 
  // ================= CREATE GEO =================
  createGeo(geo: Geo): Observable<Geo> {
    const headers = this.getAuthHeaders();
    return this.http.post<Geo>(
      `${this.baseUrl}/admin/geo-add`,
      geo,
      { headers }
    );
  }
 
  // ================= UPDATE GEO =================
  updateGeo(geoId: number, geo: Geo) {
    const headers = this.getAuthHeaders();
    return this.http.put<Geo>(
      `${this.baseUrl}/admin/geo-edite/${geoId}`,
      geo,
      { headers }
    );
  }
 
 
  // ================= DELETE GEO =================
  deleteGeo(geoId: number) {
    const headers = this.getAuthHeaders();
    return this.http.delete(
      `${this.baseUrl}/admin/delete-geo/${geoId}`,
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
 