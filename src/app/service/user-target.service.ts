import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
    providedIn: 'root'
})
export class UserTargetService {
    private apiUrl = 'http://localhost:8080/admin';

    constructor(
        private http: HttpClient,
        private auth: AuthService
    ) { }

    private getAuthHeaders(): HttpHeaders {
        const token = this.auth.getToken();
        return token
            ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })
            : new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    // POST /admin/UserTarget/{userId} - Create a user product target
    createUserProductTarget(userId: number, target: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/UserTarget/${userId}`, target, { headers: this.getAuthHeaders() });
    }

    // GET /admin/view-userTarget - Returns List<UserViewDto> or Paginated Response Map
    viewUserTarget(page?: number, size?: number): Observable<any> {
        let params = new HttpParams();
        if (page !== undefined) params = params.set('page', page.toString());
        if (size !== undefined) params = params.set('size', size.toString());
        return this.http.get<any>(`${this.apiUrl}/view-userTarget`, { headers: this.getAuthHeaders(), params });
    }

    // PUT /admin/toggle-user-status/{userId} - Toggle active/inactive status
    toggleUserStatus(userId: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/toggle-user-status/${userId}`, {}, { headers: this.getAuthHeaders() });
    }

    // POST /user/search - Search users
    searchTarget(
        username?: string,
        roleName?: string,
        email?: string,
        phoneNumber?: string,
        name?: string
    ): Observable<any[]> {
        const body = {
            username: username || null,
            roleName: roleName || null,
            email: email || null,
            phoneNumber: phoneNumber || null,
            name: name || null
        };
        return this.http.post<any[]>('http://localhost:8080/user/search', body, { headers: this.getAuthHeaders() });
    }

    // GET /admin/user-products/{userId} — get product names assigned to user
    getUserProducts(userId: number): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/user-products/${userId}`, { headers: this.getAuthHeaders() });
    }

    // GET /admin/dropdown-financial-year
    getFinancialYears(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/dropdown-financial-year`, { headers: this.getAuthHeaders() });
    }

    // GET /admin/view-product
    getProducts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/view-product`, { headers: this.getAuthHeaders() });
    }

    // POST /admin/upload-userTarget/{id} — upload CSV file
    uploadUserTargetFile(userId: string, formData: FormData): Observable<any> {
        const token = this.auth.getToken();
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);
        return this.http.post<any>(`${this.apiUrl}/upload-userTarget/${userId}`, formData, { headers });
    }

    // POST /admin/download-userTarget — download XLS template
    downloadUserTargetTemplate(userId: string): Observable<Blob> {
        const token = this.auth.getToken();
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/download-userTarget`, { userId }, { headers, responseType: 'blob' });
    }

    // DELETE /admin/delete-user/{userId} — Delete a user
    deleteUser(userId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/delete-user/${userId}`, { headers: this.getAuthHeaders() });
    }

    // POST /admin/assign-targets — Assign product targets to users
    assignTargets(targetAssignments: any[]): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/assign-targets`, targetAssignments, { headers: this.getAuthHeaders() });
    }
}
