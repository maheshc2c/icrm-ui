import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../../../service/auth-service";
import { SearchQuoteApproval } from "../../../models/QouteApproval/search-quote-approval.model";
import { QuoteApprovalAction } from "../../../models/QouteApproval/quote-approval-action.model";
import { SearchContractNoteApproval } from "../../../models/SearchContractNoteApproval";
import { Observable } from "rxjs";

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CNoteApprovalService {

  private baseUrl = environment.baseUrl;

  constructor(
      private http: HttpClient,
      private auth: AuthService
  ){}

  private getAuthHeaders(): HttpHeaders {

  const token = this.auth.getToken();

  if (!token) {
    console.error('No token found');
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  return new HttpHeaders({
    Authorization: token.startsWith('Bearer ')
      ? token
      : `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
}
searchContractNoteApproval(data: SearchContractNoteApproval) {

  return this.http.post<any>(
    `${this.baseUrl}/contractNoteApproval/search`,
    data,
    {
      headers: this.getAuthHeaders()
    }
  );

}

contractNoteAction(data: any) {

  return this.http.put<any>(
      `${this.baseUrl}/contractNoteApproval/action`,
      data,
      {
        headers: this.getAuthHeaders()
      }
  );

}


}