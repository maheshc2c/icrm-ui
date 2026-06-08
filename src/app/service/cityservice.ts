import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class Cityservice {
  private baseUrl = 'http://localhost:8080';
 
  constructor(private http: HttpClient) { }
 
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
 
  // CRUD Operations
  getCities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/city-view`, {
      headers: this.getAuthHeaders()
    });
  }

  // ================= GET CITIES FOR DISTRICT =================
  getCitiesForDistrict(districtId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/location/city/${districtId}`, {
      headers: this.getAuthHeaders()
    });
  }
 
  createCity(city: any): Observable<any> {
    const payload = {
      cityName: city.cityName,
      districtId: city.districtId
    };
 
    console.log('========== CITY SERVICE CREATE ==========');
    console.log('API URL:', `${this.baseUrl}/location/city`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('========================================');
 
    return this.http.post(`${this.baseUrl}/location/city`, payload, {
      headers: this.getAuthHeaders()
    });
  }
 
  updateCity(id: number, city: any): Observable<any> {
    const body = {
      countryName: city.countryName,
      countryId: city.countryId,
      regionName: city.regionName,
      regionId: city.regionId,
      stateName: city.stateName,
      stateId: city.stateId,
      districtName: city.districtName,
      districtId: city.districtId,
      cityName: city.cityName,
      serialNo: 1
    };
 
    return this.http.put(`${this.baseUrl}/admin/city-update/${id}`, body, {
      headers: this.getAuthHeaders()
    });
  }
 
  deleteCity(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/city-delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
 
  // Search
  searchCity(keyword: string): Observable<any[]> {
    console.log('========== CITY SERVICE SEARCH ==========');
    console.log('API URL:', `${this.baseUrl}/admin/search-region-country-state-district-city`);
    console.log('Search keyword:', keyword);
    console.log('========================================');
   
    return this.http.get<any[]>(`${this.baseUrl}/admin/search-region-country-state-district-city?locationName=${keyword}`, {
      headers: this.getAuthHeaders()
    });
  }
 
  // Download/Export
  downloadCityExcel(data: any[]): Observable<Blob> {
    console.log('========== DOWNLOAD CITY EXCEL SERVICE ==========');
    console.log('Data to export:', data.length, 'rows');
   
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
   
    // Backend expects POST with List<Location> body
    return this.http.post(`${this.baseUrl}/admin/city-excel`, data, {
      headers: headers,
      responseType: 'blob'
    });
  }
}