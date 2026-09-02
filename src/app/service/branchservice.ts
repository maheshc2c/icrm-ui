import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';
 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  private baseUrl = environment.baseUrl;
 
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}
 
  // ================= GET ALL BRANCHES =================
  getBranches(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.baseUrl}/superadmin/branch-dropdown`,
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
 