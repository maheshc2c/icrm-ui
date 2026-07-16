import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
      `${this.baseUrl}/user`,
      userData,
      { headers: this.getAuthHeaders() }
    );
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/user/${id}`,
      userData,
      { headers: this.getAuthHeaders() }
    );
  }

  searchUser(searchDTO: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/user/search`,
      searchDTO,
      { headers: this.getAuthHeaders() }
    );
  }

  downloadUsers(searchDTO: any): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/user/download`,
      searchDTO,
      { headers: this.getAuthHeaders(), responseType: 'blob' }
    );
  }

  activateUser(userId: number): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/user/activate/${userId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  deactivateUser(userId: number): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/user/deactivate/${userId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/user/${id}`,
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
      `${this.baseUrl}/user`,
      userData,
      { headers: this.getAuthHeaders() }
    );
  }

  getRoles(): Observable<string[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/user/roles`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.map(r => r.name))
    );
  }

  getRoleConfiguration(name: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/user/role?name=${encodeURIComponent(name)}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getBranches(): Observable<string[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/user/branch`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.map(b => b.branchName))
    );
  }

  getCompanies(): Observable<string[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/user/company`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.map(c => c.companyName))
    );
  }

  getWorlds(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/admin/worlds-list-admin`,
      { headers: this.getAuthHeaders() }
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/product/category`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.map(c => c.categoryName))
    );
  }

  // Returns Location objects { locationId, locationName, ... } for cascading
  getLocationsByLevel(levelId: number, parentId?: number): Observable<any[]> {
    let url = `${this.baseUrl}/location/locations?territoryLevelId=${levelId}`;
    if (parentId != null) url += `&parentId=${parentId}`;
    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() }).pipe(
      map(res => res.map(loc => ({
         locationId: loc.id,
         locationName: loc.name
      })))
    );
  }

  // Returns all groups (with categoryId) for frontend filtering
  getAllGroups(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/product/group?name=`,
      { headers: this.getAuthHeaders() }
    );
  }

  getProductsByGroupId(groupId: number): Observable<string[]> {
    return this.http.post<any>(
      `${this.baseUrl}/product/search`,
      { groupId: groupId, pagination: { pageNumber: 0, pageSize: 1000, sortBy: "productName", sortOrder: "ASC" } },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => {
        const content = res.content || [];
        return content.map((p: any) => p.productName);
      })
    );
  }
}
