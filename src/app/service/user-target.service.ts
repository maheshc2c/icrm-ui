import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

    // POST /product/user-target-search - Returns Paginated Response
    viewUserTarget(page: number = 0, size: number = 10): Observable<any> {
        const body = {
            pagination: {
                pageNumber: page,
                pageSize: size,
                sortBy: "createdTime",
                sortOrder: "DESC"
            }
        };
        return this.http.post<any>('http://localhost:8080/product/user-target-search', body, { headers: this.getAuthHeaders() });
    }

    // PUT /admin/toggle-user-status/{userId} - Toggle active/inactive status
    toggleUserStatus(userId: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/toggle-user-status/${userId}`, {}, { headers: this.getAuthHeaders() });
    }

    // POST /product/user-target-search - Search users
    searchTarget(
        username?: string,
        roleName?: string,
        email?: string,
        phoneNumber?: string,
        name?: string,
        page: number = 0,
        size: number = 10
    ): Observable<any> {
        const body = {
            employeeId: username || null,
            roleName: roleName || null,
            email: email || null,
            mobile: phoneNumber || null,
            userName: name || null,
            pagination: {
                pageNumber: page,
                pageSize: size,
                sortBy: "createdTime",
                sortOrder: "DESC"
            }
        };
        return this.http.post<any>('http://localhost:8080/product/user-target-search', body, { headers: this.getAuthHeaders() });
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

    // POST /product/upload-userTarget/{id} — upload CSV file
    uploadUserTargetFile(userId: string, formData: FormData): Observable<any> {
        const token = this.auth.getToken();
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);
        return this.http.post<any>(`http://localhost:8080/product/upload-userTarget/${userId}`, formData, { headers });
    }

    // POST /product/download-userTarget — download CSV template
    downloadUserTargetTemplate(userId: string, financialYearName: string): Observable<Blob> {
        const token = this.auth.getToken();
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);
        return this.http.post(`http://localhost:8080/product/download-userTarget`, { userId, financialYearName }, { headers, responseType: 'blob' });
    }

    // GET /product/download-empty-userTarget — download empty CSV template
    downloadEmptyTargetTemplate(): Observable<Blob> {
        const token = this.auth.getToken();
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);
        return this.http.get(`http://localhost:8080/product/download-empty-userTarget`, { headers, responseType: 'blob' });
    }

    // DELETE /admin/delete-user/{userId} — Delete a user
    deleteUser(userId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/delete-user/${userId}`, { headers: this.getAuthHeaders() });
    }

    // POST /admin/assign-targets — Assign product targets to users
    assignTargets(targetAssignments: any[]): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/assign-targets`, targetAssignments, { headers: this.getAuthHeaders() });
    }

    // GET /product/assign-target/{userId}/{financialYearId}
    getProductTargetsForUser(userId: number, financialYearId: number): Observable<any[]> {
        return this.http.get<any[]>(`http://localhost:8080/product/assign-target/${userId}/${financialYearId}`, { headers: this.getAuthHeaders() });
    }

    // POST /product/assign-target/{userId}/{financialYearId}
    saveProductTargetsForUser(userId: number, financialYearId: number, targetDTOs: any[]): Observable<any> {
        return this.http.post<any>(`http://localhost:8080/product/assign-target/${userId}/${financialYearId}`, targetDTOs, { headers: this.getAuthHeaders(), responseType: 'text' as 'json' });
    }
}
