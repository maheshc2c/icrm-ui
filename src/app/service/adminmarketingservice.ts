import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { CustomerModel } from "../models/customer-model";
import { AuthService } from "./auth-service";
import { SpecialityModel } from "../models/speciality-model";
import { Observable, mergeMap } from "rxjs";
import { Injectable } from "@angular/core";
import { Contactmodel } from "../models/contactmodel";
import { Campaign } from "../models/campaign.model";
import { CampaignDocument } from "../models/campaign-document.model";
import { TrackLeadApiRow } from "../models/track-leads.model";
import { catchError, of, tap, Subject, map } from "rxjs";
import * as XLSX from 'xlsx';
import { DropdownOption } from "../models/assign-lead.model";

@Injectable({
  providedIn: 'root',
})
export class adminMarketingservice {

  private customerCache: CustomerModel[] | null = null;
  public refreshSubject = new Subject<void>();


  public baseUrl = 'http://localhost:8080'; 

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) { }


  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }


// ================= GET ALL Speciality =================
  getSpecialities(name: string = ''): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/contact/speciality`,
      {
        headers: this.getAuthHeaders(),
        params: { name }
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
      data,    // 
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }


  // ================= UPDATE Speciality =================

  updateSpeciality(id: number, data: SpecialityModel): Observable<SpecialityModel> {
    return this.http.put<SpecialityModel>(
      `${this.baseUrl}/adminMarketing/update-Speciality/${id}`, // 
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

  // ================= DEACTIVATE Speciality =================
  deactivateSpeciality(id: number) {
    return this.http.put<SpecialityModel>(
      `${this.baseUrl}/adminMarketing/deactivate-Speciality/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= ACTIVATE Speciality =================
  activateSpeciality(id: number) {
    return this.http.put<SpecialityModel>(
      `${this.baseUrl}/adminMarketing/activate-Speciality/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

getContact(): Observable<Contactmodel | Contactmodel[]> {
    return this.http.get<Contactmodel | Contactmodel[]>(
      `${this.baseUrl}/adminMarketing/view-contact`,
      { headers: this.getAuthHeaders() }
    );
  }


  searchContact(name: string) {
    return this.http.get<Contactmodel>(
      `${this.baseUrl}/adminMarketing/search-contact`,
      {
        headers: this.getAuthHeaders(),   // 
        params: { name }
      }
    );
  }

  getSpecialityDropDown(): Observable<SpecialityModel[]> {
    return this.http.get<SpecialityModel[]>(
      `${this.baseUrl}/adminMarketing/dropdown-speciality`,
      { headers: this.getAuthHeaders() }
    );
  }

  searchContactByNumber(number: string) {
    return this.http.get<Contactmodel[]>(
      `${this.baseUrl}/adminMarketing/search-contact-by-number`,
      {
        headers: this.getAuthHeaders(),
        params: { number }
      }
    );
  }


  createContact(data: any) {
    return this.http.post(
      `${this.baseUrl}/adminMarketing/create-contact`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'text'
      }
    );
  }

updateContact(id: number, data: Partial<Contactmodel>): Observable<any> {
  return this.http.put(
    `${this.baseUrl}/adminMarketing/update-contact/${id}`,
    data,
    {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }
  );
}
  // updateContact(id: number, data: Contactmodel): Observable<any> {
  //   return this.http.put(
  //     `${this.baseUrl}/admin/update-contact/${id}`, // 
  //     data,
  //     {
  //       headers: this.getAuthHeaders(),
  //       responseType: 'text'
  //     }
  //   );
  // }

  getContactById(id: number): Observable<Contactmodel> {
    const headers = this.getAuthHeaders();
    const url = `${this.baseUrl}/adminMarketing/contact/${id}`;

    return this.http.get<Contactmodel>(url, { headers });
  }

  downloadContact(data: Contactmodel[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/adminMarketing/contact-excel`,
      data,    // 
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }

  // ================= GET ALL CUSTOMERS =================
  getCustomers(): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/adminMarketing/view-Customer`, // 
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= UPDATE CUSTOMER =================
  updateCustomer(customerId: number, customer: any): Observable<CustomerModel> {
    return this.http.put<CustomerModel>(
      `${this.baseUrl}/adminMarketing/update-customer/${customerId}`,
      customer,
      { headers: this.getAuthHeaders() }
    );
  }
  // ================= CREATE CUSTOMER =================
  createCustomer(customer: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/adminMarketing/create-customer`,
      customer,
      { headers: this.getAuthHeaders() }
    );
  }

  downloadCustomer(data: CustomerModel[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/adminMarketing/customer-excel`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }

  // ================= SEARCH CUSTOMER =================
  searchCustomer(name: string) {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/adminMarketing/search`,
      {
        headers: this.getAuthHeaders(),
        params: { name: name }
      }
    );
  }

  // ================= CUSTOMER ACTIVATION/DEACTIVATION =================
  deactivateCustomer(id: number) {
    return this.http.put(
      `${this.baseUrl}/adminMarketing/deactivate-customer/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  activateCustomer(id: number) {
    return this.http.put(
      `${this.baseUrl}/adminMarketing/activate-customer/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= CUSTOMER DROPDOWN METHODS =================
  getSubCategories(categoryId: number): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/adminMarketing/dropdown-sub-categories/${categoryId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getCustomerCategories(): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/adminMarketing/categories-dropdown`,
      { headers: this.getAuthHeaders() }
    );
  }

  getLocations(): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/adminMarketing/location-cities-dropdown`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= CAMPAIGN METHODS =================
  getCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.baseUrl}/adminMarketing/view-campaign`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error fetching campaigns', error);
        return of([]);
      })
    );
  }

  searchCampaignsPaged(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/user/managecampaign/search`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  downloadCampaignsReport(payload: any): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/user/managecampaign/download`,
      payload,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    ) as Observable<Blob>;
  }

  getCampaignById(campaignId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/user/managecampaign/${campaignId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ================= SEARCH CAMPAIGN =================
  searchCampaign(name: string): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(
      `${this.baseUrl}/adminMarketing/search-campaign`,
      {
        headers: this.getAuthHeaders(),
        params: { name }
      }
    ).pipe(
      catchError((error) => {
        console.error('Error searching campaigns', error);
        return of([]);
      })
    );
  }

  getGeos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=2`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(() => of([]))
    );
  }

  getCampaignDropdownOptions(): Observable<DropdownOption[]> {
    return this.http.get<any[]>(`${this.baseUrl}/adminMarketing/dropdown/campaigns`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((campaigns: any[]) => {
        const options = campaigns.map((c: any) => ({
          label: c.campaignName || c.name || String(c.campaignId || c.id),
          value: c.campaignName || c.name || String(c.campaignId || c.id)
        }));
        return [{ label: 'Select Campaign', value: '' }, ...options];
      }),
      catchError(() => of([{ label: 'Select Campaign', value: '' }]))
    );
  }

  // Location dropdowns - matching backend endpoints
  getCountries(geoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=3&parentId=${geoId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(() => of([]))
    );
  }

  getRegions(countryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=4&parentId=${countryId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(() => of([]))
    );
  }

  getStates(regionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=5&parentId=${regionId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError((err) => {
        return of([]);
      })
    );
  }

  getDistricts(stateId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=6&parentId=${stateId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(() => of([]))
    );
  }

  getCities(districtId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=7&parentId=${districtId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(() => of([]))
    );
  }

  getCampaignContacts(locationId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/user/managecampaign/contacts/${locationId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(() => of({ status: true, data: [] }))
    );
  }

  createCampaign(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    return this.http.post(`${this.baseUrl}/user/managecampaign`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  triggerRefresh() {
    this.refreshSubject.next();
  }

  // ================= CAMPAIGN DOCUMENT METHODS =================
  getCampaignDocuments(): Observable<CampaignDocument[]> {
    const payload = {
      searchTerm: null,
      roleName: null,
      pagination: {
        pageNumber: 0,
        pageSize: 100000,
        sortBy: 'campaignDoccreatedTime',
        sortOrder: 'desc'
      }
    };
    return this.http.post<any>(`${this.baseUrl}/marketing-document/view-document`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res?.content || []),
      catchError((error) => {
        console.error('Error fetching campaign documents', error);
        return of([]);
      })
    );
  }

  searchCampaignDocumentsPaged(
    searchTerm: string | null,
    roleName: string | null,
    pageNumber: number,
    pageSize: number,
    sortBy: string = 'campaignDoccreatedTime',
    sortOrder: string = 'desc'
  ): Observable<any> {
    const payload = {
      searchTerm: searchTerm || null,
      roleName: roleName || null,
      pagination: {
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder
      }
    };
    return this.http.post<any>(`${this.baseUrl}/marketing-document/view-document`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  getDocumentById(id: number): Observable<CampaignDocument[]> {
    const payload = {
      searchTerm: null,
      roleName: null,
      pagination: {
        pageNumber: 0,
        pageSize: 100000,
        sortBy: 'campaignDoccreatedTime',
        sortOrder: 'desc'
      }
    };
    return this.http.post<any>(`${this.baseUrl}/marketing-document/view-document`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res?.content || []),
      catchError(() => of([]))
    );
  }

  downloadFile(fileName: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/marketing-document/download/${fileName}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  createDocument(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.post(`${this.baseUrl}/marketing-document/create-document`, formData, {
      headers
    }).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  updateDocument(id: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.put(`${this.baseUrl}/marketing-document/document/${id}`, formData, {
      headers
    }).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  deactivateCampdoc(id: number) {
    return this.http.put<CampaignDocument>(
      `${this.baseUrl}/marketing-document/deactivate-document/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  activateCampdoc(id: number) {
    return this.http.put<CampaignDocument>(
      `${this.baseUrl}/marketing-document/activate-document/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= CAMPAIGN ACTIVATION/DEACTIVATION =================
  toggleCampaignStatus(id: number): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/user/managecampaign/status/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  deactivateCampaign(id: number): Observable<any> {
    return this.toggleCampaignStatus(id);
  }

  activateCampaign(id: number): Observable<any> {
    return this.toggleCampaignStatus(id);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/marketing-document/roles`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(() => of([
        { id: 3, roleName: 'ADMIN MARKETING' },
        { id: 6, roleName: 'Regional Sales Manager' },
        { id: 10, roleName: 'Sales Director' },
        { id: 4, roleName: 'Sales Engineer' },
        { id: 8, roleName: 'National Sales Manager' },
        { id: 9, roleName: 'Country Head' },
        { id: 5, roleName: 'Distributor' },
        { id: 7, roleName: 'Regional Branch Head' }
      ]))
    );
  }

  // ================= TRACK LEADS METHODS =================
  getTrackLeads(): Observable<TrackLeadApiRow[]> {
    return this.http.get<TrackLeadApiRow[]>(`${this.baseUrl}/adminMarketing/view-trackLead`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error fetching track leads', error);
        return of([]);
      })
    );
  }

  // ================= ASSIGN LEADS & DROPDOWN HELPERS =================

  assignLead(payload: any): Observable<any> {
    const url = `${this.baseUrl}/adminMarketing/assign-lead`;

    return this.http.post(url, payload, { headers: this.getAuthHeaders(), observe: 'response' }).pipe(
      map((res: HttpResponse<any>) => res.body),
      catchError((err: any) => {
        return of({ error: true, message: err?.message ?? 'Request failed' });
      })
    );
  }

  // New dropdown methods with exact endpoint paths

  getCustomerDropdown(): Observable<DropdownOption[]> {
    return this.http.get<any[]>(`${this.baseUrl}/adminMarketing/dropdown/customers`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((customers: any[]) => {
        // ✅ Filter out inactive customers (where customerStatus is not 1)
        const activeCustomers = customers.filter((c: any) => c.customerStatus === 1);
        
        const options = activeCustomers.map((c: any) => ({
          label: c.customerName || c.name || String(c.customerId || c.id),
          value: c.customerName || c.name || String(c.customerId || c.id)
        }));
        return [{ label: 'Select Customer', value: '' }, ...options];
      }),
      catchError(() => of([{ label: 'Select Customer', value: '' }]))
    );
  }

  getContactsDropdown(): Observable<DropdownOption[]> {
    return this.http.get<any[]>(`${this.baseUrl}/adminMarketing/dropdown/contacts`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((contacts: any[]) => {
        const options = contacts.map((c: any) => ({
          label: c.contactFirstName || c.contactId || String(c),
          value: c.contactFirstName || c.contactId || String(c)
        }));
        return [{ label: 'Select Contact Person', value: '' }, ...options];
      }),
      catchError(() => of([{ label: 'Select Contact Person', value: '' }]))
    );
  }

  getContactPerson2Dropdown(): Observable<DropdownOption[]> {
    return this.http.get<any[]>(`${this.baseUrl}/adminMarketing/contact-person2/dropdown`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((contacts: any[]) => {
        const options = contacts.map((c: any) => ({
          label: c.contactFirstName || c.contactId || String(c),
          value: c.contactFirstName || c.contactId || String(c)
        }));
        return [{ label: 'Select Contact Person 2', value: '' }, ...options];
      }),
      catchError(() => of([{ label: 'Select Contact Person 2', value: '' }]))
    );
  }

  getUsernamesDropdown(): Observable<DropdownOption[]> {
    return this.http.get<any[]>(`${this.baseUrl}/adminMarketing/dropdown/users`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((users: any[]) => {
        const options = users.map((u: any) => ({
          label: u.username || u.firstName || String(u.id),
          value: u.username || u.firstName || String(u.id)
        }));
        return [{ label: 'Select User to Assign', value: '' }, ...options];
      }),
      catchError(() => of([{ label: 'Select User to Assign', value: '' }]))
    );
  }
}
