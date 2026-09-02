import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';
import { District } from '../models/district';
 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Districtservice {
 
  private baseUrl = environment.baseUrl;
 
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }
 
  // ================= GET ALL DISTRICTS =================
  getDistricts(): Observable<District[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<District[]>(
      `${this.baseUrl}/admin/district-view`,
      { headers }
    );
  }

  // ================= GET DISTRICTS FOR STATE =================
  getDistrictsForState(stateId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.baseUrl}/location/district/${stateId}`,
      { headers }
    );
  }
 
  // ================= CREATE DISTRICT =================
  createDistrict(district: any): Observable<District> {
    const headers = this.getAuthHeaders();
    const payload = {
      districtName: district.districtName,
      stateId: district.stateId
    };
 
    return this.http.post<District>(
      `${this.baseUrl}/location/district`,
      payload,
      { headers }
    );
  }
 
  // ================= UPDATE DISTRICT =================
  updateDistrict(districtId: number, district: any) {
    const headers = this.getAuthHeaders();
    const body = {
      countryName: district.countryName,
      countryId: district.countryId,
      regionName: district.regionName,
      regionId: district.regionId,
      stateName: district.stateName,
      stateId: district.stateId,
      districtName: district.districtName,
      serialNo: 1
    };
 
    return this.http.put<District>(
      `${this.baseUrl}/admin/district-update/${districtId}`,
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
 
  // ================= SEARCH =================
  searchDistrict(name: string) {
    const headers = this.getAuthHeaders();
    console.log('Search District API Call:');
    console.log('URL:', `${this.baseUrl}/admin/search-region-country-state-district?locationName=${name}`);
    console.log('Headers:', headers);
 
    return this.http.get<District[]>(
      `${this.baseUrl}/admin/search-region-country-state-district?locationName=${name}`,
      { headers }
    );
  }
 
  // ================= DOWNLOAD EXCEL =================
  downloadDistrictExcel(data: District[]): Observable<Blob> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
   
    return this.http.post(
      `${this.baseUrl}/admin/district-excel`,
      data,
      {
        headers: headers,
        responseType: 'blob'
      }
    );
  }
}