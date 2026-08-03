import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ContentChildDecorator, Injectable } from '@angular/core';
import { Observable, map, shareReplay, catchError, of } from 'rxjs';
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
import { GeneralSettingsResponse } from '../models/general-settings.model';


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


  // ================= COMPETITOR =================


getCompetitors(
  competitorName: string | null = null,
  pageNumber: number = 0,
  pageSize: number = 10
) {
  return this.http.post<any>(
    `${this.baseUrl}/product/competitor-search`,
    {
      competitorName,
      pagination: {
        pageNumber,
        pageSize,
        sortBy: 'competitorId',
        sortOrder: 'DESC'
      }
    },
    { headers: this.getAuthHeaders() }
  );
}

  createCompetitor(data: any) {
  return this.http.post(
    `${this.baseUrl}/product/competitor`,
    data,
    { headers: this.getAuthHeaders() }
  );
}

getCompetitorById(id: number) {
  return this.http.get(
    `${this.baseUrl}/product/competitor/${id}`,
    { headers: this.getAuthHeaders() }
  );
}

getGeneralSettings() {
  return this.http.get<GeneralSettingsResponse>(
    `${this.baseUrl}/user/general-settings`,
    { headers: this.getAuthHeaders() }
  );
}

getMarginBandConfig() {
  return this.http.get(
    `${this.baseUrl}/marginBand/marginConfig`,
    { headers: this.getAuthHeaders() }
  );
}

updateMarginBandConfig(payload: any) {
  return this.http.put(
    `${this.baseUrl}/marginBand`,
    payload,
    { headers: this.getAuthHeaders() }
  );
}

saveGeneralSettings(payload: any) {
  return this.http.post(
    `${this.baseUrl}/user/save-general-settings`,
    payload,
    { headers: this.getAuthHeaders() }
  );
}

getRolesSearchDropdown() {
  return this.http.get<any>(
    `${this.baseUrl}/user/rolessearch-dropdown`,
    { headers: this.getAuthHeaders() }
  );
}

getFinancialYearsDropdown() {
  return this.http.get<any>(
    `${this.baseUrl}/user/financialyears-dropdown`,
    { headers: this.getAuthHeaders() }
  );
}

getIncentivesList(payload: any) {
  return this.http.post<any>(
    `${this.baseUrl}/user/incentives-list`,
    payload,
    { headers: this.getAuthHeaders() }
  );
}

getIncentiveById(id: number) {
  return this.http.get<any>(
    `${this.baseUrl}/user/incentive/${id}`,
    { headers: this.getAuthHeaders() }
  );
}

saveIncentive(payload: any) {
  return this.http.post<any>(
    `${this.baseUrl}/user/save-incentive`,
    payload,
    { headers: this.getAuthHeaders() }
  );
}

toggleCompetitorStatus(id: number) {
  console.log('PATCH URL =>', `${this.baseUrl}/competitor/${id}`);
  return this.http.patch(
    `${this.baseUrl}/product/competitor/${id}`,
    {},
    {
      headers: this.getAuthHeaders()
    }
  );
}

downloadCompetitor(payload: any) {
  return this.http.post(
    `${this.baseUrl}/product/competitor/download`,
    payload,
    {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }
  );
}

  updateCompetitor(id: number, data: any) {
  return this.http.put(
    `${this.baseUrl}/product/competitor/${id}`,
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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put<CustomerModel>(
      `${this.baseUrl}/admin/deactivate-customer/${id}`,
      {},
      { headers }
    ).pipe(
      catchError(() => {
        return this.http.put<CustomerModel>(
          `${this.baseUrl}/customer/deactivate-customer/${id}`,
          {},
          { headers }
        );
      })
    );
  }

  activateCustomer(id: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put<CustomerModel>(
      `${this.baseUrl}/admin/activate-customer/${id}`,
      {},
      { headers }
    ).pipe(
      catchError(() => {
        return this.http.put<CustomerModel>(
          `${this.baseUrl}/customer/activate-customer/${id}`,
          {},
          { headers }
        );
      })
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



  searchCustomers(
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
  private categoryDropdownCache$: Observable<any[]> | null = null;
  getCategoryDropdown(): Observable<any[]> {
    if (!this.categoryDropdownCache$) {
      this.categoryDropdownCache$ = this.http.get<any[]>(
        `${this.baseUrl}/customer/categories`,
        { headers: this.getAuthHeaders() }
      ).pipe(shareReplay(1));
    }
    return this.categoryDropdownCache$;
  }

  getSubCategoryDropdown(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/customer/subcategory/${categoryId}`,
      { headers: this.getAuthHeaders() }
    );
  }


  // ================= CREATE CUSTOMER =================
  createCustomer(customer: any): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('🔑 CREATE CUSTOMER HEADERS:', headers);
    console.log('🔑 CREATE CUSTOMER TOKEN:', this.auth.getToken());
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
      cityName,
      pagination: {
        pageNumber: 0,
        pageSize: 1000000,
        sortBy: 'customerId',
        sortOrder: 'desc'
      }
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

  // ================= DELETE CUSTOMER =================
  deleteCustomer(id: number) {
    return this.http.delete(
      `${this.baseUrl}/customer/${id}`,
      { headers: this.getAuthHeaders() }
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
// Search + View
getFinancialYears(
  fyName: string | null = null,
  pageNumber: number = 0,
  pageSize: number = 10
) {
  return this.http.post<any>(
    `${this.baseUrl}/product/financial-year-search`,
    {
      fyName,
      pagination: {
        pageNumber,
        pageSize,
        sortBy: 'fyId',
        sortOrder: 'DESC'
      }
    },
    {
      headers: this.getAuthHeaders()
    }
  );
}

// Create
createfy(payload: any) {
  return this.http.post(
    `${this.baseUrl}/product/financial-year`,
    payload,
    {
      headers: this.getAuthHeaders()
    }
  );
}

// Dropdown
getDropfy() {
  return this.http.get<string[]>(
    `${this.baseUrl}/product/financial-year/dropdown`,
    {
      headers: this.getAuthHeaders()
    }
  );
}

// Calendar View
getFinancialYearCalendar(fyId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/product/financial-year/calendar/${fyId}`,
    {
      headers: this.getAuthHeaders()
    }
  );
}


  // ================= SPECIALTIY =================

  searchSpeciality(
    name: string | null,
    pageNumber: number = 0,
    pageSize: number = 10,
    sortBy: string = 'specialityName',
    sortOrder: string = 'ASC'
  ): Observable<any> {
    const payload = {
      pageNumber,
      pageSize,
      sortBy,
      sortOrder
    };
    
    let params = new HttpParams();
    if (name) {
      params = params.set('name', name);
    }
    
    return this.http.post<any>(
      `${this.baseUrl}/customer/speciality-search`,
      payload,
      { headers: this.getAuthHeaders(), params }
    );
  }

  toggleSpeciality(id: number) {
    return this.http.delete<any>(
      `${this.baseUrl}/customer/speciality/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  createSpeciality(data: SpecialityModel): Observable<SpecialityModel> {
    return this.http.post<SpecialityModel>(
      `${this.baseUrl}/customer/speciality`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  updateSpeciality(data: SpecialityModel): Observable<SpecialityModel> {
  return this.http.put<SpecialityModel>(
    `${this.baseUrl}/customer/speciality`,
    data,
    { headers: this.getAuthHeaders() }
  );
}


  downloadSpecialityExcel(
    name: string | null,
    pageNumber: number = 0,
    pageSize: number = 10,
    sortBy: string = 'specialityName',
    sortOrder: string = 'ASC'
  ): Observable<Blob> {

  const payload = {
    pageNumber,
    pageSize,
    sortBy,
    sortOrder
  };

  let params = new HttpParams();

  params = params.set('name', name || '');

  return this.http.post(
    `${this.baseUrl}/customer/speciality-download`,
    payload,
    {
      headers: this.getAuthHeaders(),
      params,
      responseType: 'blob'
    }
  );
}
  // downloadSpecialityExcel(
  //   name: string | null,
  //   pageNumber: number = 0,
  //   pageSize: number = 10,
  //   sortBy: string = 'specialityName',
  //   sortOrder: string = 'ASC'
  // ): Observable<Blob> {
  //   const payload = {
  //     pageNumber,
  //     pageSize,
  //     sortBy,
  //     sortOrder
  //   };
    
  //   let params = new HttpParams();
  //   if (name) {
  //     params = params.set('name', name);
  //   } else {
  //     params = params.set('name', '');
  //   }
    
  //   return this.http.post(
  //     `${this.baseUrl}/customer/speciality-download`,
  //     payload,
  //     {
  //       headers: this.getAuthHeaders(),
  //       params,
  //       responseType: 'blob'
  //     }
  //   );
  // }

  // ================= View Demo =================
  getDemo(): Observable<any[]> {
    const body = {
      pagination: {
        pageNumber: 0,
        pageSize: 1000,
        sortBy: "demoId",
        sortOrder: "DESC"
      }
    };
    return this.http.post<any>(
      `${this.baseUrl}/product/demo-search`,
      body,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => {
        const data = res.data || res;
        return data.content || data;
      })
    );
  }

  getDemoById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/product/demo/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data || res)
    );
  }

   deactivateDemo(id: number) {
  return this.http.delete<any>(
    `${this.baseUrl}/product/demo/${id}`,
    { headers: this.getAuthHeaders() }
  );
}
 
activateDemo(id: number) {
  return this.http.delete<any>(
    `${this.baseUrl}/product/demo/${id}`,
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
      `${this.baseUrl}/product/demo`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }



  updateDemo(
    id: number,
    data: any
  ) {
    return this.http.put(
      `${this.baseUrl}/product/demo/${id}`,
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
    searchDemoPaginated(filters: any, page: number = 0, size: number = 10) {
      const body = {
        categoryId: filters.categoryId || null,
        segmentId: filters.segmentId || null,
        productId: filters.productId || null,
        location: filters.location || null,
        serialNumber: filters.serialNumber || null,
        regionId: filters.regionId || null,
        pagination: {
          pageNumber: page,
          pageSize: size,
          sortBy: "demoId",
          sortOrder: "DESC"
        }
      };

      return this.http.post<any>(
        `${this.baseUrl}/product/demo-search`,
        body,
        {
          headers: this.getAuthHeaders()
        }
      );
    }

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
  downloadDemo(searchDto: any): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/product/demo/download`,
      searchDto,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }

  //product methods migrated to productservice.ts

  //Demo Dropdowns

  getProductCategoriesDropdown(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/product/demo/categories`,
      { headers: this.getAuthHeaders() }
    ).pipe(map((res: any) => res.data || res));
  }

  getAllCategoriesForSearch(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/product/category?name=`, { headers: this.getAuthHeaders() });
  }

  getAllGroupsForSearch(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/product/group?name=`, { headers: this.getAuthHeaders() });
  }

  getSegmentDropdown(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/product/demo/segments/${categoryId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(map((res: any) => res.data || res));
  }

  getProductDropdown(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/product/demo/products/${groupId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(map((res: any) => res.data || res));
  }

  getRegionDropdown(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/product/demo/regions`,
      { headers: this.getAuthHeaders() }
    ).pipe(map((res: any) => res.data || res));
  }

  getBranchDropdown(regionId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/product/demo/branches/${regionId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(map((res: any) => res.data || res));
  }

  getCityDropdown(branchId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/product/demo/cities/${branchId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(map((res: any) => res.data || res));
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
      // sortBy: 'contactFirstName',
      // sortOrder: 'asc'
       sortBy: 'contactId',
  sortOrder: 'DESC'
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

uploadContact(file: File) {

  const formData = new FormData();

  formData.append('file', file);

  return this.http.post(
    `${this.baseUrl}/contact/upload`,
    formData,
    {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }),
      responseType: 'text'
    }
  );
}

getContactsPaged(
  customerName: string | null,
  specialityName: string | null,
  contactFirstName: string | null,
  pageNumber: number = 0,
  pageSize: number = 10,
  sortBy: string = 'contactId',
  sortOrder: string = 'desc'
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
// getSpecialityDropDown(search: string = '') {
//   return this.http.get<any[]>(
//     `${this.baseUrl}/contact/speciality`,
//     {
//       headers: this.getAuthHeaders(),
//       params: { name: search }
//     }
//   );
// }   

private specialityDropdownCache$: Observable<any[]> | null = null;

getSpecialityDropDown(search: string = ''): Observable<any[]> {

  if (!this.specialityDropdownCache$ || search !== '') {

    const request$ = this.http.get<any[]>(
      `${this.baseUrl}/contact/speciality`,
      {
        headers: this.getAuthHeaders(),
        params: { name: search }
      }
    );

    if (search === '') {
      this.specialityDropdownCache$ = request$.pipe(
        shareReplay(1)
      );
      return this.specialityDropdownCache$;
    }

    return request$;
  }

  return this.specialityDropdownCache$;
}

clearSpecialityDropdownCache(): void {
  this.specialityDropdownCache$ = null;
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

  private cityCache$: Observable<Citymodel[]> | null = null;
  getCity(): Observable<Citymodel[]> {
    if (!this.cityCache$) {
      this.cityCache$ = this.http.get<Citymodel[]>(
        `${this.baseUrl}/admin/city-view`, // ✅ FIXED
        { headers: this.getAuthHeaders() }
      ).pipe(shareReplay(1));
    }
    return this.cityCache$;
  }

  // ================= NEW CITY DROPDOWN (Location Controller) =================
  private cityDropdownCache$: Observable<any[]> | null = null;
  getLocationCityDropdown(cityName: string = ''): Observable<any[]> {
    if (!this.cityDropdownCache$ || cityName !== '') {
      const request$ = this.http.get<any[]>(
        `${this.baseUrl}/location/all-locations`,
        { 
          headers: this.getAuthHeaders(),
          params: { cityName }
        }
      );
      if (cityName === '') {
        this.cityDropdownCache$ = request$.pipe(shareReplay(1));
        return this.cityDropdownCache$;
      }
      return request$;
    }
    return this.cityDropdownCache$;
  }


  // ================= SUB SYSTEM =================

// Search + View
getSubSystems(
  name: string | null = null,
  pageNumber: number = 0,
  pageSize: number = 10
) {
  return this.http.post<any>(
    `${this.baseUrl}/product/subcategory-search`,
    {
      name,
      pagination: {
        pageNumber,
        pageSize,
        sortBy: 'SubcategoryCreatedTime',
        sortOrder: 'DESC'
      }
    },
    {
      headers: this.getAuthHeaders()
    }
  );
}

// Get By Id
getSubSystemById(id: number) {
  return this.http.get(
    `${this.baseUrl}/product/subcategory/${id}`,
    { headers: this.getAuthHeaders() }
  );
}

// Create
createSubSystem(payload: any) {
  return this.http.post(
    `${this.baseUrl}/product/subcategory`,
    payload,
    { headers: this.getAuthHeaders() }
  );
}

// Update
updateSubSystem(id: number, payload: any) {
  return this.http.put(
    `${this.baseUrl}/product/subcategory/${id}`,
    payload,
    { headers: this.getAuthHeaders() }
  );
}

// Activate / Deactivate
toggleSubSystem(id: number) {
  return this.http.patch(
    `${this.baseUrl}/product/subcategory/${id}`,
    {},
    { headers: this.getAuthHeaders() }
  );
}

// Download
downloadSubSystemExcel(payload: any) {
  return this.http.post(
    `${this.baseUrl}/product/subcategory/download`,
    payload,
    {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }
  );
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

//   // VIEW
//   getChannelPartners() {
//     return this.http.get<ChannelPartnerModel[]>(
//       `${this.baseUrl}/admin/view-chanel`,
//       { headers: this.getAuthHeaders() }
//     );
//   }
//   getChannelPartnerById(id: number) {
//   return this.http.get<ChannelPartnerModel>(
//     `${this.baseUrl}/admin/view-chanel/${id}`,
//     { headers: this.getAuthHeaders() }
//   );
// }

//   deactivateChannelPartners(id: number) {
//   const token = localStorage.getItem('token'); // or your existing token key
//   const headers = new HttpHeaders({
//     Authorization: `Bearer ${token}`
//   });

//   return this.http.put<ChannelPartnerModel>(
//     `${this.baseUrl}/admin/deactivate-chanelpartner/${id}`,
//     {},
//     { headers }
//   );
// }

// activateChannelPartners(id: number) {
//   const token = localStorage.getItem('token'); // or your existing token key
//   const headers = new HttpHeaders({
//     Authorization: `Bearer ${token}`
//   });

//   return this.http.put<ChannelPartnerModel>(
//     `${this.baseUrl}/admin/activate-chanelpartner/${id}`,
//     {},
//     { headers }
//   );
// }

//   // SEARCH
//   searchChannelPartner(name: string) {
//     return this.http.get<ChannelPartnerModel[]>(
//       `${this.baseUrl}/admin/search-chanelpartner`,
//       {
//         headers: this.getAuthHeaders(),
//         params: { name }
//       }
//     );
//   }

//   createChannelPartner(data: ChannelPartnerModel) {
//     return this.http.post(
//       `${this.baseUrl}/admin/create-chanelpartner`,
//       data,
//       { headers: this.getAuthHeaders() }
//     );
//   }

//   updateChannelPartner(id: number, data: ChannelPartnerModel) {
//     return this.http.put(
//       `${this.baseUrl}/admin/edit-chanelpartner/${id}`,
//       data,
//       { headers: this.getAuthHeaders() }
//     );
//   }

//   // EXCEL DOWNLOAD
//   downloadChannelExcel(data: ChannelPartnerModel[]) {
//     return this.http.post(
//       `${this.baseUrl}/admin/chanel-excel`,
//       data,
//       {
//         headers: this.getAuthHeaders(),
//         responseType: 'blob'
//       }
//     ) as Observable<Blob>;
//   }

// ================= CHANNEL PARTNER =================

// Search
// searchChannelPartners(
//   channelPartnerName: string | null = null
// ): Observable<any> {

//   const payload = {
//     channelPartnerName
//   };

//   return this.http.post<any>(
//     `${this.baseUrl}/channelPartner/search`,
//     payload,
//     {
//       headers: this.getAuthHeaders()
//     }
//   );
// }



// Get By Id (if endpoint exists)
// getChannelPartnerById(id: number) {
//   return this.http.get<any>(
//     `${this.baseUrl}/channelPartner/${id}`,
//     {
//       headers: this.getAuthHeaders()
//     }
//   );
// }

// searchChannelPartners(payload: any): Observable<any> {
//   return this.http.post<any>(
//     `${this.baseUrl}/channelPartner/search`,
//     payload,
//     {
//       headers: this.getAuthHeaders()
//     }
//   );
// }

searchChannelPartners(
  channelPartnerName: string | null = null,
  pageNumber: number = 0,
  pageSize: number = 10
): Observable<any> {

  const payload = {
    channelPartnerName,
    pagination: {
      pageNumber,
      pageSize,
      sortBy: "channelPartnerId",
      sortOrder: "DESC"
    }
  };

  return this.http.post<any>(
    `${this.baseUrl}/channelPartner/search`,
    payload,
    {
      headers: this.getAuthHeaders()
    }
  );
}

// Create
createChannelPartner(payload: any) {
  return this.http.post(
    `${this.baseUrl}/channelPartner`,
    payload,
    {
      headers: this.getAuthHeaders()
    }
  );
}

// Update
updateChannelPartner(id: number, payload: any) {
  return this.http.put(
    `${this.baseUrl}/channelPartner/${id}`,
    payload,
    {
      headers: this.getAuthHeaders()
    }
  );
}

// Activate / Deactivate
changeChannelPartnerStatus(
  id: number,
  status: number
) {
  return this.http.put(
    `${this.baseUrl}/channelPartner/status/${id}?status=${status}`,
    {},
    {
      headers: this.getAuthHeaders()
    }
  );
}

// Download
downloadChannelPartners(channelPartnerName: string | null = null) {

  return this.http.post(
    `${this.baseUrl}/channelPartner/download`,
    {
      channelPartnerName
    },
    {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }
  );
}

  downloadGroup(data: Segment[]) {
    return this.http.post(
      `${this.baseUrl}/product/group-excel`,
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

  searchDeleteContractNotes(requestData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/contractnote/search-delete`, requestData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteContractNote(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/contractnote/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}









