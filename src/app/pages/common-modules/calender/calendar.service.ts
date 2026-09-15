import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment }
  from '../../../../environments/environment';

import {
  CalendarResponse,
  UserDropdown
} from '../../../models/calendar.model';

import { AuthService }
  from '../../../service/auth-service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private readonly baseUrl =
    `${environment.baseUrl}/calendar`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {

    const token =
      this.authService.getToken();

    let headers =
      new HttpHeaders({
        'Content-Type': 'application/json'
      });

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }

    return headers;
  }

  /**
   * GET /calendar/reportees
   * GET /calendar/reportees?name=Krishna
   */
  getReportees(
    name: string = ''
  ): Observable<UserDropdown[]> {

    let params =
      new HttpParams();

    const searchName =
      name?.trim() ?? '';

    if (searchName) {
      params = params.set(
        'name',
        searchName
      );
    }

    return this.http.get<UserDropdown[]>(
      `${this.baseUrl}/reportees`,
      {
        headers: this.getHeaders(),
        params
      }
    );
  }

  /**
   * POST /calendar/search
   *
   * Payload:
   * {
   *   "userId": 1
   * }
   */
  getCalendar(
    selectedUserId: number
  ): Observable<CalendarResponse> {

    const requestBody = {
      userId: Number(selectedUserId)
    };

    return this.http.post<CalendarResponse>(
      `${this.baseUrl}/search`,
      requestBody,
      {
        headers: this.getHeaders()
      }
    );
  }
}