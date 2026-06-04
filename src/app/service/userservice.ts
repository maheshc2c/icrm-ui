import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class Userservice {
  private baseUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();

    if (!token) {
      console.error('❌ No token found');
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return new HttpHeaders({
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllUsers(): Observable<any[]> {
    const token = this.auth.getToken();

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<any[]>(
      `${this.baseUrl}/admin/view-admin`,
      { headers }
    );
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/admin/createUser`,
      userData,
      { headers: this.getAuthHeaders() }
    );
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/admin/updateUser-Admin/${id}`,
      userData,
      { headers: this.getAuthHeaders() }
    );
  }

  getUserById(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/getUser/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  viewAdmin(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/view-admin`,
      { headers: this.getAuthHeaders() }
    );
  }

  createUserAdmin(userData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/admin/createUser-Admin`,
      userData,
      { headers: this.getAuthHeaders() }
    );
  }

  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/admin/roles-list-admin`,
      { headers: this.getAuthHeaders() }
    );
  }

  getBranches(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/admin/branches-list-admin`,
      { headers: this.getAuthHeaders() }
    );
  }

  getWorlds(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/admin/worlds-list-admin`,
      { headers: this.getAuthHeaders() }
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/admin/categories-list-admin`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Returns Location objects { locationId, locationName, ... } for cascading
  getLocationsByLevel(levelId: number, parentId?: number): Observable<any[]> {
    let url = `${this.baseUrl}/admin/city-search?levelId=${levelId}`;
    if (parentId != null) url += `&parentId=${parentId}`;
    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() });
  }

  // Returns all groups (with categoryId) for frontend filtering
  getAllGroups(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/view-group`,
      { headers: this.getAuthHeaders() }
    );
  }

  getProductsByGroupId(groupId: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/admin/products-list-admin/${groupId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
