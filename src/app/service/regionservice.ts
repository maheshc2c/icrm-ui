import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';
import { Region } from '../models/region';
 
@Injectable({
  providedIn: 'root'
})
export class Regionservice {
 
  private baseUrl = 'http://localhost:8080';
 
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }
 
  getRegionById(id: number) {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
 
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/region-view`,
      { headers }
    );
  }
 
  // ================= SEARCH =================
  searchRegion(name: string) {
    const headers = this.getAuthHeaders();
    return this.http.get<Region[]>(
      `${this.baseUrl}/admin/search-region-country?locationName=${name}`,
      { headers }
    );
  }
 
  downloadRegionExcel(data: Region[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/admin/region-excel`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }
 
  // ================= GET ALL REGIONS =================
  getRegions(): Observable<Region[]> {
    const headers = this.getAuthHeaders();
    // Using search endpoint as a workaround because region-view is likely buggy in backend
    return this.http.get<Region[]>(
      `${this.baseUrl}/admin/search-region-country`,
      { headers }
    );
  }
 
  // ================= CREATE REGION =================
  createRegion(region: any): Observable<any> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    const body = {
      countryName: region.countryName,
      countryId: region.countryId,
      regionName: region.regionName,
      serialNo: 1
    };
    return this.http.post<any>(
      `${this.baseUrl}/admin/region-create`,
      body,
      { headers }
    );
  }
 
  // ================= UPDATE REGION =================
  updateRegion(regionId: number, region: any) {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    const body = {
      countryName: region.countryName,
      countryId: region.countryId,
      regionName: region.regionName,
      serialNo: 1
    };
    return this.http.put<any>(
      `${this.baseUrl}/admin/region-update/${regionId}`,
      body,
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