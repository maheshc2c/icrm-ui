import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TrackQuoteModel } from '../models/track-quote-model';
import { AuthService } from './auth-service';
import { TrackPomodel } from '../models/TrackPomodel';
import { PlanVisitModel } from '../models/planvisitmodel';
import { Contactmodel } from '../models/contactmodel';
import { SpecialityModel } from '../models/speciality-model';
import { CustomerModel } from '../models/customer-model';
import { LeadPayload, LeadSummary } from '../models/lead-model';
import { Visit } from '../models/visit';

@Injectable({
  providedIn: 'root',
})
export class SalesDirectorService {

  private baseUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // ✅ safer

    console.log("TOKEN =>", token); // 🔥 DEBUG

    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // ✅ GET TRACK QUOTES
  getTrackQuotes(): Observable<TrackQuoteModel[]> {
    return this.http.get<TrackQuoteModel[]>(
      `${this.baseUrl}/SalesDirector/Track-quotes-view`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= SEARCH Qoute =================
  searchQoute(search: string) {
    return this.http.get<TrackQuoteModel[]>(
      `${this.baseUrl}/SalesDirector/Track-quotes-search-quoteID-customer-opp`,
      {
        headers: this.getAuthHeaders(),
        params: { search } // ✅ MATCHES BACKEND
      }
    );
  }


  // ✅ GET TRACK PO
  getTrackPo(): Observable<TrackPomodel[]> {
    return this.http.get<TrackPomodel[]>(
      `${this.baseUrl}/SalesDirector/purchase-orders-tracking-view`,
      { headers: this.getAuthHeaders() }
    );
  }

  //   searchPo(keyword: string): Observable<TrackPomodel[]> {
  //   return this.http.get<TrackPomodel[]>(
  //     `${this.baseUrl}/SalesDirector/purchase-orders/search`,
  //     {
  //       headers: this.getAuthHeaders(),
  //       params: { keyword } // change only if backend expects another param name
  //     }
  //   );
  // }

  // searchPo(keyword: string): Observable<TrackPomodel[]> {
  //   const trimmed = keyword.trim();
  //   const isNumber = !isNaN(Number(trimmed));

  //   const params: any = {};

  //   if (isNumber) {
  //     params.poId = trimmed;
  //     params.status = trimmed;
  //   } else {
  //     params.distributor = trimmed;
  //     params.product = trimmed;
  //   }

  //   return this.http.get<TrackPomodel[]>(
  //     `${this.baseUrl}/SalesDirector/purchase-orders/search`,
  //     {
  //       headers: this.getAuthHeaders(),
  //       params
  //     }
  //   );
  // }

  searchPo(searchData: any): Observable<TrackPomodel[]> {
    const params: any = {};

    if (searchData.poId) {
      params.poId = searchData.poId;
    }

    if (searchData.status) {
      params.status = searchData.status;
    }

    if (searchData.distributor) {
      params.distributor = searchData.distributor;
    }

    if (searchData.product) {
      params.product = searchData.product;
    }

    return this.http.get<TrackPomodel[]>(
      `${this.baseUrl}/SalesDirector/purchase-orders/search`,
      {
        headers: this.getAuthHeaders(),
        params
      }
    );
  }
  searchPoById(keyword: string): Observable<TrackPomodel[]> {
    return this.http.get<TrackPomodel[]>(
      `${this.baseUrl}/SalesDirector/purchase-orders/search`,
      {
        headers: this.getAuthHeaders(),
        params: { poId: keyword }
      }
    );
  }

  // ✅ GET TRACK PO
  getPlanVisit(): Observable<PlanVisitModel[]> {
    return this.http.get<PlanVisitModel[]>(
      `${this.baseUrl}/SalesDirector/viw-visit`,
      { headers: this.getAuthHeaders() }
    );
  }

  downloadVisit(data: PlanVisitModel[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/SalesDirector/download-visits`,
      data,    // ✅ send actual table data
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }

  //  Plan(): Observable<PlanVisitModel[]> {
  //   return this.http.get<PlanVisitModel[]>(
  //     `${this.baseUrl}/SalesDirector/viw-visit`,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }

  // createVisit(data: PlanVisitModel): Observable<PlanVisitModel> {
  //   return this.http.post<PlanVisitModel>(
  //     `${this.baseUrl}/SalesDirector/create-visit/`,
  //     data,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }



  // updateVisit(id: number, data: PlanVisitModel): Observable<PlanVisitModel> {
  //   return this.http.put<PlanVisitModel>(
  //     `${this.baseUrl}/SalesDirector/update/${id}`,
  //     data,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }

  // getLeads(): Observable<any[]> {
  //   return this.http.get<any[]>(
  //     `${this.baseUrl}/SalesDirector/get-leads`,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }

  // getPurposes(): Observable<any[]> {
  //   return this.http.get<any[]>(
  //     `${this.baseUrl}/SalesDirector/get-purposes`,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }


  // ================= GET ALL Contact =================

  getContact(): Observable<Contactmodel | Contactmodel[]> {
    return this.http.get<Contactmodel | Contactmodel[]>(
      `${this.baseUrl}/SalesDirector/view-contact`,
      { headers: this.getAuthHeaders() }
    );
  }


  searchContact(name: string) {
    return this.http.get<Contactmodel>(
      `${this.baseUrl}/SalesDirector/search-contact`,
      {
        headers: this.getAuthHeaders(),   // ✅ must include token
        params: { name }
      }
    );
  }




  // getCustomerDropdown() {
  //   return this.http.get<CustomerModel | CustomerModel[]>(
  //     `${this.baseUrl}/SalesDirector/customer/dropdown`,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }

  searchContactByNumber(number: string) {
    return this.http.get<Contactmodel[]>(
      `${this.baseUrl}/SalesDirector/search-contact-by-number`,
      {
        headers: this.getAuthHeaders(),
        params: { number }
      }
    );
  }


  createContact(data: any) {
    return this.http.post(
      `${this.baseUrl}/SalesDirector/create-contact`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'text'
      }
    );
  }

  updateContact(id: number, data: Partial<Contactmodel>): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/SalesDirector/update-contact/${id}`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'text'
      }
    );
  }


  getContactById(id: number): Observable<Contactmodel> {
    return this.http.get<Contactmodel>(
      `${this.baseUrl}/SalesDirector/contact/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  downloadContact(data: Contactmodel[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/SalesDirector/contact-excel`,
      data,    // ✅ send actual table data
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }

  getSpecialities(): Observable<SpecialityModel[]> {
    return this.http.get<SpecialityModel[]>(
      `${this.baseUrl}/SalesDirector/dropdown-speciality`, // ✅ FIXED
      { headers: this.getAuthHeaders() }
    );
  }

  getSpecialityDropDown(): Observable<SpecialityModel[]> {
    return this.http.get<SpecialityModel[]>(
      `${this.baseUrl}/SalesDirector/dropdown-speciality`,
      { headers: this.getAuthHeaders() }
    );
  }
  getCustomerDropdown() {
    return this.http.get<CustomerModel | CustomerModel[]>(
      `${this.baseUrl}/SalesDirector/customer/dropdown`,
      { headers: this.getAuthHeaders() }
    );
  } getLocations(): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/SalesDirector/dropdown-speciality`,
      { headers: this.getAuthHeaders() }
    );
  }





  // ================= CUSTOMER =================

  // getCustomerById(id: number) {
  //   const token = this.auth.getToken();

  //   const headers = token
  //     ? new HttpHeaders({ Authorization: `Bearer ${token}` })
  //     : new HttpHeaders();

  //   return this.http.get<CustomerModel[]>(
  //     `${this.baseUrl}/SalesDirector/view-Customer`,
  //     { headers }
  //   );
  // }
  getCustomerById(id: number): Observable<CustomerModel> {
    return this.http.get<CustomerModel>(
      `${this.baseUrl}/SalesDirector/view-customer/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }


  // ================= GET ALL CUSTOMERS =================
  getCustomers(): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel | CustomerModel[]>(
      `${this.baseUrl}/SalesDirector/view-customer`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        } else if (response) {
          return [response]; // ✅ convert single object → array
        }
        return [];
      })
    );
  }


  // ================= SEARCH CUSTOMER =================
  searchCustomer(name: string) {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/SalesDirector/search`,
      {
        headers: this.getAuthHeaders(),
        params: { name: name } // ✅ MATCHES BACKEND
      }
    );
  }


  // ================= CREATE CUSTOMER =================
  // createCustomer(customer: CustomerModel): Observable<CustomerModel> {
  //   const headers = this.getAuthHeaders();
  //   return this.http.post<CustomerModel>(
  //     `${this.baseUrl}/SalesDirector/create-customer`,
  //     customer,
  //     { headers }
  //   );
  // }
  // ================= CREATE CUSTOMER =================
  createCustomer(customer: any): Observable<any> {

    const headers = this.getAuthHeaders();

    console.log('🧪 CREATE CUSTOMER HEADERS:', headers);

    return this.http.post(
      `${this.baseUrl}/SalesDirector/create-customer`,
      customer,
      { headers }
    );
  }

  downloadCustomer(data: CustomerModel[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/SalesDirector/customer-excel`,
      data,    // ✅ send actual table data
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }

  // ================= UPDATE CUSTOMER =================
  updateCustomer(customerId: number, customer: any) {
    const headers = this.getAuthHeaders();

    return this.http.put<CustomerModel>(
      `${this.baseUrl}/SalesDirector/update-customer/${customerId}`,
      customer,
      { headers }
    );
  }

  // ================= CUSTOMER DROPDOWN CATEGORY =================
  getSubCategories(categoryId: number): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/SalesDirector/dropdown-sub-categories/${categoryId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getCustomerCategories(): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/SalesDirector/dropdown-customer`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Lead 
  /* ================= GET ALL LEADS (OPEN) ================= */
  getOpenLeads(): Observable<LeadSummary[]> {
    return this.http.get<LeadSummary[]>(`${this.baseUrl}/SalesDirector/salesmanager/leads-open`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET CLOSED LEADS ================= */
  getClosedLeads(): Observable<LeadSummary[]> {
    return this.http.get<LeadSummary[]>(`${this.baseUrl}/SalesDirector/salesmanager/leads-closed`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET LEAD BY ID ================= */
  getLeadById(id: number): Observable<LeadPayload> {
    return this.http.get<LeadPayload>(`${this.baseUrl}/SalesDirector/salesmanager/lead/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= UPDATE LEAD ================= */
  updateLead(id: number, lead: LeadPayload): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/SalesDirector/salesmanager/lead-update/${id}`, lead, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= SEARCH LEADS ================= */
  searchLeads(params: {
    leadId?: string;
    customerName?: string;
    status?: string;
  }): Observable<any[]> {
    let httpParams = new HttpParams();

    if (params.leadId) {
      httpParams = httpParams.set('leadId', params.leadId);
    }
    if (params.customerName) {
      httpParams = httpParams.set('customerName', params.customerName);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/salesmanager/leads-search`, {
      headers: this.getAuthHeaders(),
      params: httpParams
    });
  }

  /* ================= DOWNLOAD EXCEL ================= */
  downloadLeadsExcel(data: any[]): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/SalesDirector/salesmanager/leads-excel`, data, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  /* ================= GET CUSTOMERS DROPDOWN ================= */
  // getCustomers(): Observable<any[]> {
  //   console.log('📡 Calling: /SalesDirector/customer/dropdown');
  //   return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/customer/dropdown`, {
  //     headers: this.getAuthHeaders()
  //   });
  // }

  /* ================= GET CONTACT PERSONS DROPDOWN ================= */
  getContacts(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/contacts/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/contacts/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET RELATIONSHIPS (RAPPORT) DROPDOWN ================= */
  getRelationships(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/relationships/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/relationships/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET SITE READINESS DROPDOWN ================= */
  getSiteReadiness(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/site-readiness/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/site-readiness/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET DISTRIBUTORS DROPDOWN ================= */
  getDistributors(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/distributors/dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/distributors/dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET SOURCES (LEAD SOURCE) ================= */
  getSources(): Observable<any[]> {
    console.log('📡 Calling: /SalesDirector/sourcelead-dropdown');
    return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/sourcelead-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= GET CAMPAIGNS ================= */
  getCampaigns(): Observable<any[]> {
    console.log('📡 Calling: /adminMarketing/view-campaign');
    return this.http.get<any[]>(`${this.baseUrl}/adminMarketing/view-campaign`, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= CREATE LEAD ================= */
  // createLead(lead: LeadPayload): Observable<any> {
  //   return this.http.post<any>(`${this.baseUrl}/SalesDirector/assign-lead`, lead, {
  //     headers: this.getAuthHeaders()
  //   });
  // }
  //   createLead(lead: LeadPayload): Observable<any> {
  //   return this.http.post(
  //     `${this.baseUrl}/SalesDirector/assign-lead`,
  //     lead,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }

  createLead(data: LeadPayload): Observable<LeadPayload> {
    return this.http.post<LeadPayload>(
      `${this.baseUrl}/SalesDirector/assign-lead`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }


  //visit

    createVisit(visitDto: Visit): Observable<any> {
        return this.http.post(`${this.baseUrl}/SalesDirector/create-visit`, 
          visitDto, { headers: this.getAuthHeaders() });
    }
 
    getAllVisits(): Observable<Visit[]> {
        return this.http.get<Visit[]>(`${this.baseUrl}/SalesDirector/viw-visit`,
           { headers: this.getAuthHeaders() });
    }
 
    getVisitById(id: number): Observable<Visit> {
        return this.http.get<Visit>(`${this.baseUrl}/SalesDirector/visit/${id}`,
           { headers: this.getAuthHeaders() });
    }
 
    updateVisit(id: number, visitDto: Visit): Observable<any> {
        return this.http.put(`${this.baseUrl}/SalesDirector/update/${id}`, visitDto,
           { headers: this.getAuthHeaders() });
    }

    getLeads(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/lead-dropdown`, { headers: this.getAuthHeaders() });
    }
    getVisitPurposes(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/SalesDirector/purpose-dropdown`, { headers: this.getAuthHeaders() });
    }







}