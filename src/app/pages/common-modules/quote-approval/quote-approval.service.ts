import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../../../service/auth-service";
import { SearchQuoteApproval } from "../../../models/QouteApproval/search-quote-approval.model";
import { QuoteApprovalAction } from "../../../models/QouteApproval/quote-approval-action.model";

@Injectable({
  providedIn: 'root'
})
export class QuoteApprovalService {

  private baseUrl = "http://localhost:8080";

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

  search(payload: SearchQuoteApproval) {

  return this.http.post<any>(
    `${this.baseUrl}/quoteApproval/search`,
    payload,
    {
      headers: this.getAuthHeaders()
    }
  );

}

action(payload: QuoteApprovalAction) {

  return this.http.put<any>(
    `${this.baseUrl}/quoteApproval/action`,
    payload,
    {
      headers: this.getAuthHeaders()
    }
  );

}

getMarginAnalysis(quoteRevisionId: number) {

  return this.http.get<any>(
    `${this.baseUrl}/quoteApproval/margin-analysis/${quoteRevisionId}`,
    {
      headers: this.getAuthHeaders()
    }
  );

}

}