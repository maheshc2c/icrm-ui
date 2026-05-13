import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from './auth-service';
import { SuperAdminManageUser } from '../models/super-admin-mange-user-model';
 
@Injectable({
  providedIn: 'root'
})
export class ManageUserService {
 
  private baseUrl = 'http://localhost:8080';
  private usersCache$: Observable<SuperAdminManageUser[]> | null = null;
 
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }
 
  // ================= COMMON AUTH HEADER =================
  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
 
    // Debug: Log token status
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
 
    return token
      ? new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
      : new HttpHeaders();
  }
 
  // ================= GET ALL USERS (CACHED) =================
  getUsers(): Observable<SuperAdminManageUser[]> {
    if (!this.usersCache$) {
      const headers = this.getAuthHeaders();
      this.usersCache$ = this.http
        .get<SuperAdminManageUser[]>(`${this.baseUrl}/superadmin/view-adminuser`, { headers })
        .pipe(shareReplay(1));
    }
    return this.usersCache$;
  }
 
  clearUsersCache(): void {
    this.usersCache$ = null;
  }
 
  // ================= GET USER BY ID =================
  getUserById(id: string): Observable<SuperAdminManageUser | undefined> {
    const numericId = parseInt(id, 10);
    return this.getUsers().pipe(
      map(users => users.find(u => u.id === numericId))
    );
  }
 
  // ================= CREATE USER =================
  createUser(user: SuperAdminManageUser): Observable<SuperAdminManageUser> {
    const headers = this.getAuthHeaders();
    return this.http.post<SuperAdminManageUser>(
      `${this.baseUrl}/superadmin/create-adminUser`,
      user,
      { headers }
    );
  }
 
  // ================= UPDATE USER =================
  updateUser(
    id: string,
    user: any
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<SuperAdminManageUser>(
      `${this.baseUrl}/superadmin/update-adminUser/${id}`,
      user,
      { headers }
    );
  }
 
  // ================= SEARCH USERS =================
  searchUsers(
    username?: any,
    companyName?: string,
    name?: string
  ): Observable<SuperAdminManageUser[]> {
    const params: any = {};
 
    if (typeof username === 'string' && !companyName && !name) {
      params.name = username;
    } else if (typeof username === 'object' && username !== null) {
      if (username.username) params.username = username.username;
      if (username.companyName) params.companyName = username.companyName;
      if (username.name) params.name = username.name;
    } else {
      if (username) params.username = username;
      if (companyName) params.companyName = companyName;
      if (name) params.name = name;
    }
 
    const headers = this.getAuthHeaders();
    return this.http.get<SuperAdminManageUser[]>(
      `${this.baseUrl}/superadmin/search-adminUser`,
      { params, headers }
    );
  }
 
  // ================= PROFILE =================
  getProfile(): Observable<Map<string, string>> {
    const headers = this.getAuthHeaders();
    return this.http.get<Map<string, string>>(
      `${this.baseUrl}/superadmin/profile-adminUser`,
      { headers }
    );
  }
 
  // ================= CHANGE PASSWORD =================
  changePassword(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.post<string>(
      `${this.baseUrl}/superadmin/change-password`,
      { oldPassword, newPassword, confirmPassword },
      { headers }
    );
  }
 
  // ================= DOWNLOAD EXCEL =================
  downloadManageUsersExcel(data: any[]): Observable<Blob> {
    const headers = this.getAuthHeaders().set(
      'Accept',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    return this.http.post(
      `${this.baseUrl}/superadmin/download-manage-users-excel`,
      data,
      { responseType: 'blob', headers }
    );
  }
}