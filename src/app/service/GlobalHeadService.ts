import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Visit } from '../models/visit';
import { AuthService } from './auth-service';
 
@Injectable({
    providedIn: 'root'
})
export class GlobalHeadService {
 
    private baseUrl = 'http://localhost:8080/GlobalHead';
 
    constructor(private http: HttpClient, private auth: AuthService) { }
 
    private getAuthHeaders(): HttpHeaders {
        const token = this.auth.getToken();
        return token
            ? new HttpHeaders({
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            })
            : new HttpHeaders({ 'Content-Type': 'application/json' });
    }
 
    // Dashboard Counts (Optional addition if needed again)
    getDashboardCounts(): Observable<any> {
        return this.http.get(`${this.baseUrl}/dashboard-counts`, { headers: this.getAuthHeaders() });
    }
 
    // Customers
    createCustomer(customerDto: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/create-customer`, customerDto, { headers: this.getAuthHeaders() });
    }
 
    getCustomerById(id: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/customer/${id}`, { headers: this.getAuthHeaders() });
    }
 
    deleteCustomer(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/delete-customer/${id}`, { headers: this.getAuthHeaders() });
    }
 
    updateCustomer(id: number, customerDto: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/update-customer/${id}`, customerDto, { headers: this.getAuthHeaders() });
    }
 
    searchCustomers(params: any): Observable<any> {
        let httpParams = new HttpParams();
        if (params.customerName) httpParams = httpParams.set('customerName', params.customerName);
        if (params.customerCategoryName) httpParams = httpParams.set('customerCategoryName', params.customerCategoryName);
        if (params.subCategoryName) httpParams = httpParams.set('subCategoryName', params.subCategoryName);
        if (params.cityName) httpParams = httpParams.set('cityName', params.cityName);
 
        return this.http.get(`${this.baseUrl}/search`, { params: httpParams, headers: this.getAuthHeaders() });
    }
 
    viewFirstCustomer(): Observable<any> {
        return this.http.get(`${this.baseUrl}/view-customer`, { headers: this.getAuthHeaders() });
    }
 
    exportCustomers(filteredUsers: any[]): Observable<Blob> {
        const token = this.auth.getToken();
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();
        return this.http.post(`${this.baseUrl}/customer-excel`, filteredUsers, { responseType: 'blob', headers });
    }
 
    // Contacts
    createContact(contactDto: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/create-contact`, contactDto, { headers: this.getAuthHeaders() });
    }
 
    updateContact(id: number, contactDto: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/update-contact/${id}`, contactDto, { headers: this.getAuthHeaders() });
    }
 
    viewFirstContact(): Observable<any> {
        return this.http.get(`${this.baseUrl}/view-contact`, { headers: this.getAuthHeaders() });
    }
 
    getContactById(id: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/contact/${id}`, { headers: this.getAuthHeaders() });
    }
 
    deleteContact(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/delete-contact/${id}`, { headers: this.getAuthHeaders() });
    }
 
    searchContacts(params: any): Observable<any> {
        let httpParams = new HttpParams();
        if (params.firstName) httpParams = httpParams.set('firstName', params.firstName);
        if (params.lastName) httpParams = httpParams.set('lastName', params.lastName);
        if (params.specialityName) httpParams = httpParams.set('specialityName', params.specialityName);
 
        return this.http.get(`${this.baseUrl}/search-contacts`, { params: httpParams, headers: this.getAuthHeaders() });
    }
 
    // Visits
    createVisit(visitDto: Visit): Observable<any> {
        return this.http.post(`${this.baseUrl}/create-visit`, visitDto, { headers: this.getAuthHeaders() });
    }
 
    getAllVisits(): Observable<Visit[]> {
        return this.http.get<Visit[]>(`${this.baseUrl}/viw-visit`, { headers: this.getAuthHeaders() });
    }
 
    getVisitById(id: number): Observable<Visit> {
        return this.http.get<Visit>(`${this.baseUrl}/visit/${id}`, { headers: this.getAuthHeaders() });
    }
 
    updateVisit(id: number, visitDto: Visit): Observable<any> {
        return this.http.put(`${this.baseUrl}/update/${id}`, visitDto, { headers: this.getAuthHeaders() });
    }
 
    // Leads
    getLeads(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/lead-dropdown`, { headers: this.getAuthHeaders() });
    }
 
    assignLead(leadDto: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/assign-lead`, leadDto, { headers: this.getAuthHeaders() });
    }
 
    // Dropdowns
    getCustomerCategories(): Observable<any> {
        return this.http.get(`${this.baseUrl}/dropdown-customer`, { headers: this.getAuthHeaders() });
    }
 
    getSubCategories(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/dropdown-sub-categories`, { headers: this.getAuthHeaders() });
    }
 
    getCities(): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/dropdown-cities`, { headers: this.getAuthHeaders() });
    }
 
    getSpecialities(): Observable<any> {
        return this.http.get(`${this.baseUrl}/dropdown-speciality`, { headers: this.getAuthHeaders() });
    }
 
    getVisitPurposes(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/purpose-dropdown`, { headers: this.getAuthHeaders() });
    }
 
    getSources(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/dropdown-source`, { headers: this.getAuthHeaders() });
    }
 
    getCampaigns(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/dropdown-campaign`, { headers: this.getAuthHeaders() });
    }
 
    getDistributors(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/dropdown-distributor`, { headers: this.getAuthHeaders() });
    }
 
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/view-users`, { headers: this.getAuthHeaders() });
    }
 
    getLeadsByCustomer(customerName: string): Observable<any[]> {
        let params = new HttpParams().set('customerName', customerName);
        return this.http.get<any[]>(`${this.baseUrl}/leads-by-customer`, { params, headers: this.getAuthHeaders() });
    }
}
 