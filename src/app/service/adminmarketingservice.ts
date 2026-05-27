import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CustomerModel } from "../models/customer-model";
import { AuthService } from "./auth-service";
import { SpecialityModel } from "../models/speciality-model";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class adminMarketingservice {

  private customerCache: CustomerModel[] | null = null;


  private baseUrl = 'http://localhost:8080'; // ✅ no trailing slash

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) { }

  // ================= AUTH HEADERS =================
//   private getAuthHeaders(): HttpHeaders {
//     const token = this.auth.getToken();

// const formattedToken = token?.startsWith('Bearer ')
//   ? token
//   : `Bearer ${token}`;
//     return token
//       ? new HttpHeaders({
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       })
//       : new HttpHeaders({ 'Content-Type': 'application/json' });
//   }
  private getAuthHeaders(): HttpHeaders {
  const token = this.auth.getToken();

  const formattedToken = token?.startsWith('Bearer ')
    ? token
    : `Bearer ${token}`;

  return token
    ? new HttpHeaders({
        Authorization: formattedToken,
        'Content-Type': 'application/json'
      })
    : new HttpHeaders({ 'Content-Type': 'application/json' });
}


  // ================= GET ALL Speciality =================
  getSpecialities(pageNumber: number = 0, pageSize: number = 10): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/adminMarketing/view-Speciality`,
      {
        headers: this.getAuthHeaders(),
        params: {
          page: String(pageNumber),
          size: String(pageSize)
        }
      }
    );
  }



  // ================= CREATE Speciality =================
  createSpeciality(data: SpecialityModel): Observable<SpecialityModel> {
    return this.http.post<SpecialityModel>(
      `${this.baseUrl}/adminMarketing/create-Speciality`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= Donwload Speciality =================

  downloadSpecialityExcel(data: SpecialityModel[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/adminMarketing/speciality-excel`,
      data,    // ✅ send actual table data
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }


  // ================= UPDATE Speciality =================

  updateSpeciality(id: number, data: SpecialityModel): Observable<SpecialityModel> {
    return this.http.put<SpecialityModel>(
      `${this.baseUrl}/adminMarketing/update-Speciality/${id}`, // ⚠ backend spelling preserved
      data,
      { headers: this.getAuthHeaders() }
    );
  }


  // ================= Search Speciality =================
  searchSpeciality(name: string) {
    return this.http.get<SpecialityModel[]>(
      `${this.baseUrl}/adminMarketing/search-Speciality`,
      {
        headers: this.getAuthHeaders(),
        params: { name }
      }
    );
  }

  //contact
}
