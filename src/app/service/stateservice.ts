import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth-service';
import { State } from '../models/state';
 
@Injectable({
  providedIn: 'root'
})
export class Stateservice {
 
  private baseUrl = 'http://localhost:8080';
 
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }
 
  getStateById(id: number) {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
 
    // Call the correct endpoint - state-view returns all states
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/state-view`,
      { headers }
    );
  }
 
  // ================= SEARCH =================
  searchState(name: string) {
    const headers = this.getAuthHeaders();
    console.log('Search State API Call:');
    console.log('URL:', `${this.baseUrl}/admin/search-region-country-state?locationName=${name}`);
    console.log('Headers:', headers);
 
    return this.http.get<State[]>(
      `${this.baseUrl}/admin/search-region-country-state?locationName=${name}`,
      { headers }
    );
  }
 
  downloadStateExcel(data: State[]): Observable<Blob> {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
   
    console.log('========== STATE EXCEL DOWNLOAD SERVICE ==========');
    console.log('URL:', `${this.baseUrl}/admin/state-excel`);
    console.log('Data being sent:', data);
    console.log('Headers:', headers);
   
    return this.http.post(
      `${this.baseUrl}/admin/state-excel`,
      data,
      {
        headers: headers,
        responseType: 'blob',
        observe: 'response' // Get full response to see headers
      }
    ).pipe(
      catchError((error) => {
        console.error('Download error details:', error);
        console.error('Error status:', error.status);
        console.error('Error headers:', error.headers);
        return throwError(() => error);
      })
    ) as any;
  }
 
  // ================= GET ALL STATES =================
  getStates(): Observable<State[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<State[]>(
      `${this.baseUrl}/admin/state-view`,
      { headers }
    );
  }
 
  // ================= CREATE STATE =================
  createState(state: any): Observable<State> {
    const jsonHeaders = this.getAuthHeaders().set('Content-Type', 'application/json');
    console.log('Create State API Call:');
    console.log('URL:', `${this.baseUrl}/admin/state-create`);
    console.log('Headers:', jsonHeaders);
    console.log('Auth header present:', jsonHeaders.has('Authorization'));
    console.log('Payload:', state);
 
    const jsonBody = {
      geoName: state.geoName || '',
      countryName: state.countryName,
      regionName: state.regionName,
      stateName: state.stateName,
      countryId: state.countryId,
      regionId: state.regionId,
      serialNo: 1
    };
 
    return this.http.post<State>(
      `${this.baseUrl}/admin/state-create`,
      jsonBody,
      { headers: jsonHeaders }
    );
  }
 
  // ================= UPDATE STATE =================
  updateState(stateId: number, state: State) {
    const jsonHeaders = this.getAuthHeaders().set('Content-Type', 'application/json');
    const body = {
      geoName: (state as any).geoName || '',
      countryName: (state as any).countryName,
      regionName: (state as any).regionName,
      stateName: (state as any).stateName,
      countryId: (state as any).countryId,
      regionId: (state as any).regionId,
      serialNo: 1
    };
    return this.http.put<State>(
      `${this.baseUrl}/admin/state-update/${stateId}`,
      body,
      { headers: jsonHeaders }
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