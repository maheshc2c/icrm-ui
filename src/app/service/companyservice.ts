import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';
import { Company } from '../models/company';

@Injectable({
  providedIn: 'root'
})
export class Companyservice {

  private baseUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getCompanyById(id: number) {
  const token = this.auth.getToken();

  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();

  return this.http.get<any[]>(
    `${this.baseUrl}/superadmin/getCompany`,
    { headers }
  );
}


// ================= SEARCH =================
searchCompany(name: string) {
  const headers = this.getAuthHeaders();
  console.log('Search headers:', headers);   // 👈 check token here

  return this.http.get<Company[]>(
    `${this.baseUrl}/superadmin/search-company`,
    {
      headers,
      params: { name: name }
    }
  );
}

downloadCompanyExcel(data: Company[]): Observable<Blob> {
  return this.http.post(
    `${this.baseUrl}/superadmin/company-excel`,
    data,    // ✅ send actual table data
    {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }
  );
}

  // ================= GET ALL COMPANIES =================
  getCompanies(): Observable<Company[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Company[]>(
      `${this.baseUrl}/superadmin/getCompany`,
      { headers }
    );
  }

  // ================= CREATE COMPANY =================
  createCompany(company: Company): Observable<Company> {
    const headers = this.getAuthHeaders();
    return this.http.post<Company>(
      `${this.baseUrl}/superadmin/createCompany`,
      company,
      { headers }
    );
  }

  // ================= UPDATE COMPANY =================
updateCompany(companyId: number, company: Company) {
  const headers = this.getAuthHeaders();

  return this.http.put<Company>(
    `${this.baseUrl}/superadmin/update-company/${companyId}`,
    company,
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
