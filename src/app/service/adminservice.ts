import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ContentChildDecorator, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CompetitorModel } from '../models/competitor-model';
import { AuthService } from './auth-service';
import { CustomerModel } from '../models/customer-model';
import { FinancialyrModel } from '../models/financialyr-model';
import { SpecialityModel } from '../models/speciality-model';
import { DemoProductModel } from '../models/demo-product-model';
import { DemoProductDetailModel } from '../models/demo-product-detail-model';
import { Contactmodel } from '../models/contactmodel';
import { LocationModel } from '../models/location-model';
import { Citymodel } from '../models/citymodel';
import { SubsystemModel } from '../models/subsystem-model';
import { UserlogModel } from '../models/userlog-model';
import { ChannelPartnerModel } from '../models/channel-partner-model';
import { Segment, SegmentDto } from '../models/segment';
import { DiscountQuoteModel } from '../models/discountqoute-model';


@Injectable({
  providedIn: 'root',
})
export class Adminservice {

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

  if (!token) {
    console.error('❌ No token found');
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  return new HttpHeaders({
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
}
  // ================= SEARCH COMPETITOR =================
  searchCompetitors(name: string) {
    return this.http.get<CompetitorModel[]>(
      `${this.baseUrl}/admin/search-competitor`,
      {
        headers: this.getAuthHeaders(),
        params: { competitorName: name }
      }
    );
  }

  

  deactivateCompetitor(id: number) {
  const token = localStorage.getItem('token'); // or your existing token key
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.put<SpecialityModel>(
    `${this.baseUrl}/admin/deactivate-competitor/${id}`,
    {},
    { headers }
  );
}

activateCompetitor(id: number) {
  const token = localStorage.getItem('token'); // or your existing token key
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.put<SpecialityModel>(
    `${this.baseUrl}/admin/activate-competitor/${id}`,
    {},
    { headers }
  );
}

  // ================= EXCEL DOWNLOAD COMPETITORS=================
  downloadCompetitorExcel(data: CompetitorModel[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/admin/competitor-excel`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }

  // ================= GET ALL COMPETITORS =================
  // getCompetitors(): Observable<CompetitorModel[]> {
  //   return this.http.get<CompetitorModel[]>(
  //     `${this.baseUrl}/admin/get-competitors`, // ✅ FIXED
  //     { headers: this.getAuthHeaders() }
  //   );
  // }
  getCompetitors(page = 0, size = 10): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/admin/get-competitors?page=${page}&size=${size}`,
    {
      headers: this.getAuthHeaders()
    }
  );
}


  // ================= CREATE COMPETITORS =================
  createCompetitor(data: CompetitorModel): Observable<CompetitorModel> {
    return this.http.post<CompetitorModel>(
      `${this.baseUrl}/admin/create-competitor`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }



  // ================= UPDATE COMPETITORS =================
  updateCompetitor(id: number, data: CompetitorModel): Observable<CompetitorModel> {
    return this.http.put<CompetitorModel>(
      `${this.baseUrl}/admin/edite-competitor/${id}`, // ⚠ backend spelling preserved
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= CUSTOMER =================

  getCustomerById(id: number) {
    const token = this.auth.getToken();

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/admin/view-Customer`,
      { headers }
    );
  }

   deactivateCustomer(id: number) {
  const token = localStorage.getItem('token'); // or your existing token key
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.put<CustomerModel>(
    `${this.baseUrl}/admin/deactivate-customer/${id}`,
    {},
    { headers }
  );
}

activateCustomer(id: number) {
  const token = localStorage.getItem('token'); // or your existing token key
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.put<CustomerModel>(
    `${this.baseUrl}/admin/activate-customer/${id}`,
    {},
    { headers }
  );
}


  // ================= GET ALL CUSTOMERS =================
  getCustomers(page: number = 0, size: number = 10, fetchAll: boolean = false): Observable<any> {
    const payload = {
      customerName: null,
      customerCategoryName: null,
      subCategoryName: null,
      cityName: null,
      pagination: {
        pageNumber: page,
        pageSize: fetchAll ? 1000000 : size,
        sortBy: 'customerId',
        sortOrder: 'desc'
      }
    };

    const obs = this.http.post<any>(
      `${this.baseUrl}/customer/search`,
      payload,
      { headers: this.getAuthHeaders() }
    );

    if (fetchAll) {
      return obs.pipe(
        map(res => Array.isArray(res) ? res : (res?.content || []))
      );
    }
    return obs;
  }


  getCustomersPaged(
    customerName: string | null,
    customerCategoryName: string | null,
    subCategoryName: string | null,
    cityName: string | null,
    pageNumber: number = 0,
    pageSize: number = 10,
    sortBy: string = 'customerId',
    sortOrder: string = 'desc'
  ): Observable<any> {
    const payload = {
      customerName: customerName || null,
      customerCategoryName: customerCategoryName || null,
      subCategoryName: subCategoryName || null,
      cityName: cityName || null,
      pagination: {
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder
      }
    };

    return this.http.post<any>(
      `${this.baseUrl}/customer/search`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }
  searchCustomer(name: string) {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/customer/search`,
      {
        headers: this.getAuthHeaders(),
        params: { name: name } 
      }
    );
  }

  searchCustomersPaged(
    customerName: string | null,
    customerCategoryName: string | null,
    subCategoryName: string | null,
    cityName: string | null,
    pageNumber: number = 0,
    pageSize: number = 10,
    sortBy: string = 'customerId',
    sortOrder: string = 'desc'
  ): Observable<any> {
    const payload = {
      customerName: customerName || null,
      customerCategoryName: customerCategoryName || null,
      subCategoryName: subCategoryName || null,
      cityName: cityName || null,
      pagination: {
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder
      }
    };

    return this.http.post<any>(
      `${this.baseUrl}/customer/search`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= CATEGORY & SUBCATEGORY DROPDOWNS (ManageCustomer) =================
  getCategoryDropdown(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/customer/categories`,
      { headers: this.getAuthHeaders() }
    );
  }

  getSubCategoryDropdown(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/customer/subcategory/${categoryId}`,
      { headers: this.getAuthHeaders() }
    );
  }


  // ================= CREATE CUSTOMER =================
  createCustomer(customer: any): Observable<any> {

    const token = localStorage.getItem('token'); // or sessionStorage

    const headers = this.getAuthHeaders();

    console.log('🧪 CREATE CUSTOMER HEADERS:', headers);

    return this.http.post(
      `${this.baseUrl}/customer`,
      customer,
      { headers }
    );
  }

  // downloadCustomer(data: CustomerModel[]): Observable<Blob> {
  //   return this.http.post(
  //     `${this.baseUrl}/admin/customer-excel`,
  //     data,    // ✅ send actual table data
  //     {
  //       headers: this.getAuthHeaders(),
  //       responseType: 'blob'
  //     }
  //   );
  // }

  downloadCustomer(
  customerName: string | null,
  customerCategoryName: string | null,
  subCategoryName: string | null,
  cityName: string | null
): Observable<Blob> {

  return this.http.post(
    `${this.baseUrl}/customer/download`,
    {
      customerName,
      customerCategoryName,
      subCategoryName,
      cityName
    },
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
      `${this.baseUrl}/customer/${customerId}`,
      customer,
      { headers }
    );
  }

  // ================= CUSTOMER DROPDOWN CATEGORY =================
  getSubCategories(categoryId: number): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/customer/subcategory/${categoryId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getCustomerCategories(): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/customer/categories`,
      { headers: this.getAuthHeaders() }
    );
  }

  getLocations(): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>(
      `${this.baseUrl}/admin/dropdown-speciality`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= FINANCIAL YEAR =================

  // ================= GET ALL FY =================
  getfinancialyr(): Observable<FinancialyrModel[]> {
    return this.http.get<FinancialyrModel[]>(
      `${this.baseUrl}/admin/view-Fy`, // ✅ FIXED
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= SEARCH COMPETITOR =================
  searchfy(name: string) {
    return this.http.get<FinancialyrModel[]>(
      `${this.baseUrl}/admin/search-financial-year`,
      {
        headers: this.getAuthHeaders(),
        params: { name } // ✅ MATCHES BACKEND
      }
    );
  }


  getDropfy(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/admin/dropdown-financial-year`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= Download FY =================

  downloadFinancialYearExcel(data: FinancialyrModel[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/admin/financialyear-excel`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }



  //http://localhost:8080/admin/search-financial-year?name=2025

  // ================= CREATE FY =================
  createfy(payload: FinancialyrModel): Observable<any> {
    const headers = this.getAuthHeaders();

    console.log('FY CREATE HEADERS =>', headers);
    console.log('FY CREATE PAYLOAD =>', payload);

    return this.http.post(
      `${this.baseUrl}/admin/create-Fy`,
      payload,
      {
        headers,
        responseType: 'text'   // ✅ IMPORTANT FIX
      }
    );
  }


  // ================= UPDATE COMPETITORS =================

  updatefy(id: number, payload: FinancialyrModel): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.put(
      `${this.baseUrl}/admin/edite-Fy/${id}`,
      payload,
      { headers }
    );
  }


  // updatefy(id: number, data: FinancialyrModel): Observable<FinancialyrModel> {
  //   return this.http.put<FinancialyrModel>(
  //     `${this.baseUrl}/admin/edite-Fy/${id}`, // ⚠ backend spelling preserved
  //     data,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }


  // ================= SPECIALTIY =================

  // ================= GET ALL Speciality =================
  getSpecialities(pageNumber: number = 0, pageSize: number = 10): Observable<any> {
    return this.http.request<any>('GET', `${this.baseUrl}/admin/view-Speciality`, {
      headers: this.getAuthHeaders(),
      params: {
        pageNumber: String(pageNumber),
        pageSize: String(pageSize)
      },
      body: {
        pageNumber: pageNumber,
        pageSize: pageSize
      }
    });
  }

  deactivateSpeciality(id: number) {
  const token = localStorage.getItem('token'); // or your existing token key
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.put<SpecialityModel>(
    `${this.baseUrl}/admin/deactivate-Speciality/${id}`,
    {},
    { headers }
  );
}

activateSpeciality(id: number) {
  const token = localStorage.getItem('token'); // or your existing token key
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.put<SpecialityModel>(
    `${this.baseUrl}/admin/activate-Speciality/${id}`,
    {},
    { headers }
  );
}



  // ================= CREATE Speciality =================
  createSpeciality(data: SpecialityModel): Observable<SpecialityModel> {
    return this.http.post<SpecialityModel>(
      `${this.baseUrl}/admin/create-Speciality`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= Donwload Speciality =================

  downloadSpecialityExcel(data: SpecialityModel[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/admin/speciality-excel`,
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
      `${this.baseUrl}/admin/update-Speciality/${id}`, // ⚠ backend spelling preserved
      data,
      { headers: this.getAuthHeaders() }
    );
  }


  // ================= Search Speciality =================
  searchSpeciality(name: string) {
    return this.http.get<SpecialityModel[]>(
      `${this.baseUrl}/admin/search-Speciality`,
      {
        headers: this.getAuthHeaders(),
        params: { name }
      }
    );
  }

  // ================= View Demo =================
  getDemo(): Observable<DemoProductModel[]> {
    return this.http.get<DemoProductModel[]>(
      `${this.baseUrl}/admin/demo/view-table`, // ✅ FIXED
      { headers: this.getAuthHeaders() }
    );
  }

   deactivateDemo(id: number) {
  return this.http.put<DemoProductDetailModel>(
    `${this.baseUrl}/admin/demo/deactivate/${id}`,
    {},
    { headers: this.getAuthHeaders() }
  );
}
 
activateDemo(id: number) {
  return this.http.put<DemoProductDetailModel>(
    `${this.baseUrl}/admin/demo/activate/${id}`,
    {},
    { headers: this.getAuthHeaders() }
  );
}




  //  createDemo(data: DemoProductDetailModel) {
  //   return this.http.post(
  //     `${this.baseUrl}/admin/create-Demo`,
  //     data,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }
  // createDemo(data: DemoProductModel) {
  //   return this.http.post(
  //     `${this.baseUrl}/admin/create-Demo`,
  //     data,
  //     { headers: this.getAuthHeaders() }
  //   );
  // }

  createDemo(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/create-Demo`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }



  updateDemo(
    id: number,
    data: Partial<DemoProductDetailModel>
  ) {
    return this.http.put(
      `${this.baseUrl}/admin/demo/update/${id}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= SEARCH DEMO =================
  // searchDemo(filters: any) {
  //   return this.http.get<any[]>(
  //     `${this.baseUrl}/admin/demo-view/search`,
  //     {
  //       headers: this.getAuthHeaders(),
  //       params: {
  //   categoryName: filters.categoryName || null,
  //   groupName: filters.groupName || null,
  //   productName: filters.productName || null,
  //   location: filters.location || null,
  //   serialNo: filters.serialNo || null,
  //   regionName: filters.regionName || null
  // }
  //     }
  //   );
  // }
  // ================= SEARCH DEMO =================
  searchDemo(filters: any) {
    const params: any = {};

    Object.keys(filters).forEach(key => {
      const val = filters[key];
      if (val && val.trim() !== '') {
        params[key] = val.trim();
      }
    });

    return this.http.get<any[]>(
      `${this.baseUrl}/admin/demo-view/search`,
      {
        headers: this.getAuthHeaders(),
        params
      }
    );
  }



  //download demo
  downloadDemo(data: any[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/admin/demo-excel`,
      data,    // ✅ send actual table data
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }

  //product
  deactivateProduct(id: number) {
  return this.http.put(
    `${this.baseUrl}/admin/deactivate-product/${id}`,
    {},
    { headers: this.getAuthHeaders() }
  );
}

activateProduct(id: number) {
  return this.http.put(
    `${this.baseUrl}/admin/activate-product/${id}`,
    {},
    { headers: this.getAuthHeaders() }
  );
}

  //Demo Dropdowns

  getProductCategoriesDropdown(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/demo-categories-dropdown`,
      { headers: this.getAuthHeaders() }
    );
  }

  getSegmentDropdown(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/demo-groups-dropdown/${categoryId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getProductDropdown(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/demo-products-dropdown/${groupId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getRegionDropdown(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/demo-regions-dropdown`,
      { headers: this.getAuthHeaders() }
    );
  }

  getBranchDropdown(regionId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/demo-branches-dropdown/${regionId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getCityDropdown(regionId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/demo-cities-dropdown/${regionId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ================= GET ALL Contact =================
  getContacts(
  page: number = 0,
  size: number = 10,
  fetchAll: boolean = false
): Observable<any> {

  const payload = {
    customerName: null,
    specialityName: null,
    contactFirstName: null,
    pagination: {
      pageNumber: page,
      pageSize: fetchAll ? 1000000 : size,
      sortBy: 'contactId',
      // sortOrder: 'desc'
    }
  };

  const obs = this.http.post<any>(
    `${this.baseUrl}/contact/search`,
    payload,
    {
      headers: this.getAuthHeaders()
    }
  );

  if (fetchAll) {
    return obs.pipe(
      map(res => Array.isArray(res) ? res : (res?.content || []))
    );
  }

  return obs;
}
getContactsPaged(
  customerName: string | null,
  specialityName: string | null,
  contactFirstName: string | null,
  pageNumber: number = 0,
  pageSize: number = 10,
  sortBy: string = 'contactFirstName',
  sortOrder: string = 'asc'
) {

  const payload = {
    customerName,
    specialityName,
    contactFirstName,
    pagination: {
      pageNumber,
      pageSize,
      sortBy,
      sortOrder
    }
  };

  return this.http.post(
    `${this.baseUrl}/contact/search`,
    payload,
    { headers: this.getAuthHeaders() }
  );
}
  
  searchContacts(payload: any): Observable<any> {
  return this.http.post<any>(
    `${this.baseUrl}/contact/search`,
    payload,
    {
      headers: this.getAuthHeaders()
    }
  );
}

toggleContactStatus(id: number) {
  return this.http.delete(
    `${this.baseUrl}/contact/${id}`,
    {
      headers: this.getAuthHeaders()
    }
  );
}


  getCustomerDropdown(search: string = '') {
  return this.http.get<any[]>(
    `${this.baseUrl}/contact/customer`,
    {
      headers: this.getAuthHeaders(),
      params: { name: search }
    }
  );
}
getSpecialityDropDown(search: string = '') {
  return this.http.get<any[]>(
    `${this.baseUrl}/contact/speciality`,
    {
      headers: this.getAuthHeaders(),
      params: { name: search }
    }
  );
}                                  

  createContact(payload: any) {
  return this.http.post(
    `${this.baseUrl}/contact`,
    payload,
    {
      headers: this.getAuthHeaders()
    }
  );
}

updateContact(id: number, payload: any) {
  return this.http.put(
    `${this.baseUrl}/contact/${id}`,
    payload,
    {
      headers: this.getAuthHeaders()
    }
  );
}




  downloadContact(payload: any): Observable<Blob> {
  return this.http.post(
    `${this.baseUrl}/contact/download`,
    payload,
    {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }
  );
}

  getCity(): Observable<Citymodel[]> {
    return this.http.get<Citymodel[]>(
      `${this.baseUrl}/admin/city-view`, // ✅ FIXED
      { headers: this.getAuthHeaders() }
    );
  }


  getSubSystem(): Observable<SubsystemModel[]> {
    return this.http.get<SubsystemModel[]>(
      `${this.baseUrl}/admin/view-subcategory`,
      { headers: this.getAuthHeaders() }
    );
  }

  searchSubSystem(name: string) {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/search-subcategory`,
      {
        headers: this.getAuthHeaders(),
        params: { subcategoryName: name }
      }
    );
  }


  // ================= CREATE SubSystem =================
  createSubSystem(data: SubsystemModel): Observable<SubsystemModel> {
    return this.http.post<SubsystemModel>(
      `${this.baseUrl}/admin/create-subcategory`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }



  // ================= UPDATE SubSystem =================

  updateSubSystem(id: number, data: SubsystemModel): Observable<SubsystemModel> {
    return this.http.put<SubsystemModel>(
      `${this.baseUrl}/admin/edit-subcategory/${id}`, // ⚠ backend spelling preserved
      data,
      { headers: this.getAuthHeaders() }
    );
  }


  // ================= EXCEL DOWNLOAD COMPETITORS=================

  downloadSubSystemExcel(data: any[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/admin/subsystem-excel`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    ) as Observable<Blob>;
  }

  getUserLogs(): Observable<UserlogModel[]> {
    return this.http.get<UserlogModel[]>(
      `${this.baseUrl}/admin/report/latest-login`,
      { headers: this.getAuthHeaders() }
    );
  }
  searchUserLogs(keyword: string): Observable<UserlogModel[]> {
    return this.http.get<UserlogModel[]>(
      `${this.baseUrl}/admin/report/search`,
      {
        headers: this.getAuthHeaders(),
        params: { keyword } // adjust if backend uses different param
      }
    );
  }

  downloadUserLogExcel(data: UserlogModel[]): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/admin/loginHistory-excel`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    ) as Observable<Blob>;
  }

  //channel partner

  // VIEW
  getChannelPartners() {
    return this.http.get<ChannelPartnerModel[]>(
      `${this.baseUrl}/admin/view-chanel`,
      { headers: this.getAuthHeaders() }
    );
  }
  getChannelPartnerById(id: number) {
  return this.http.get<ChannelPartnerModel>(
    `${this.baseUrl}/admin/view-chanel/${id}`,
    { headers: this.getAuthHeaders() }
  );
}

  deactivateChannelPartners(id: number) {
  const token = localStorage.getItem('token'); // or your existing token key
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.put<ChannelPartnerModel>(
    `${this.baseUrl}/admin/deactivate-chanelpartner/${id}`,
    {},
    { headers }
  );
}

activateChannelPartners(id: number) {
  const token = localStorage.getItem('token'); // or your existing token key
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.put<ChannelPartnerModel>(
    `${this.baseUrl}/admin/activate-chanelpartner/${id}`,
    {},
    { headers }
  );
}

  // SEARCH
  searchChannelPartner(name: string) {
    return this.http.get<ChannelPartnerModel[]>(
      `${this.baseUrl}/admin/search-chanelpartner`,
      {
        headers: this.getAuthHeaders(),
        params: { name }
      }
    );
  }

  createChannelPartner(data: ChannelPartnerModel) {
    return this.http.post(
      `${this.baseUrl}/admin/create-chanelpartner`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  updateChannelPartner(id: number, data: ChannelPartnerModel) {
    return this.http.put(
      `${this.baseUrl}/admin/edit-chanelpartner/${id}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // EXCEL DOWNLOAD
  downloadChannelExcel(data: ChannelPartnerModel[]) {
    return this.http.post(
      `${this.baseUrl}/admin/chanel-excel`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    ) as Observable<Blob>;
  }

  downloadGroup(data: Segment[]) {
    return this.http.post(
      `${this.baseUrl}/admin/group-excel`,
      data,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    ) as Observable<Blob>;
  }


  getDiscountQuotes(): Observable<DiscountQuoteModel[]> {
  return this.http.get<DiscountQuoteModel[]>(
    `${this.baseUrl}/admin/quoteDiscountView`,
    { headers: this.getAuthHeaders() }
  );
}

saveDiscountQuote(data: DiscountQuoteModel[]): Observable<any> {
  return this.http.put(   // ✅ CORRECT
    `${this.baseUrl}/admin/quoteDiscountUpdate`,
    data,
    {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }
  );
}






}









