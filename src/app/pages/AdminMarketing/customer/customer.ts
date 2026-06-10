import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Search, SearchFieldConfig } from "../../../shared/search/search";
import { adminMarketingservice } from '../../../service/adminmarketingservice';
import { CustomerModel } from '../../../models/customer-model';
import { ToastService } from '../../../service/toast.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-adminmarketing-customer',
  imports: [CommonModule,
    Header,
    Sidebar,
    Pageheader,
    DataTable],
  templateUrl: './customer.html',
  styleUrl: './customer.css',
})
export class Customer {

  constructor(
    private router: Router,
    private adminMarketingService: adminMarketingservice,
    private toastService: ToastService
  ) {}
   headerTitle = 'Customer List';

   headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/adminmarketingdashboard' },
    { label: 'Customer', route: '/adminmarketing/customer' }
  ];

   // 🔹 Table Columns
  columns = [
    { header: 'Customer Name', field: 'customerName' },
    { header: 'Telephone', field: 'customerTelephone' },
    { header: 'Mobile', field: 'customerMobile' },
    { header: 'Location', field: 'locationName' },
  
  ];



 customers: CustomerModel[] = [];
  loading = false;
  errorMsg = '';

 
  ngOnInit(): void {
    this.loadCustomers();
  }

  rows: any[] = [];
  mappedRowsCache: any[] = [];   // ✅ ADD THIS LINE
  // allRows: any[] = []; // 🔹 master copy
  fullRows: any[] = [];   // ✅ full API data (for Excel)


  private loadCustomers(): void {
  const start = performance.now();

  this.adminMarketingService.getCustomers().subscribe({
    next: (customers: CustomerModel[]) => {

      console.log('API Customers count:', customers.length);

      // ✅ Store full data
      this.fullRows = customers;

      this.buildDropdownOptions(
  customers,
  'category',
  c => c.customerCategory?.customerCategoryName
);

this.buildDropdownOptions(
  customers,
  'subCategory',
  c => c.subCategory?.subcategoryName
);

this.buildDropdownOptions(
  customers,
  'locations',
  c => c.locations?.[0]?.locationName
);



      // ✅ Pre-map ONCE (cache)
      this.mappedRowsCache = customers.map((c, index) => ({
  sno: index + 1,
  customerId: c.customerId,
  customerName: c.customerName,
  customerTelephone: c.customerTelephone,
  customerMobile: c.customerMobile,
  specialityStatus: c.customerStatus, // ✅ Add this for DataTable status toggle

  // ✅ searchable fields
  category: c.customerCategory?.customerCategoryName ?? '',
  subCategory: c.subCategory?.subcategoryName ?? '',
  locationName: c.locations
    ?.map((l: { locationName: string }) => l.locationName)
    .join(', ')
}));


      // ✅ Render only first 300 rows initially
      this.rows = this.mappedRowsCache.slice(0, 300);

      const end = performance.now();
      console.log(`⚡ UI mapping took ${(end - start).toFixed(1)} ms`);
    },
    error: (err) => {
      console.error('Customer API Error:', err);
    }
  });
}



  //  onImport() {
  //   console.log('Import clicked');
  // }

  onAdd() {
    this.router.navigate(['/adminmarketing/customer/add']);
  }

onEdit(row: any) {
  this.router.navigate(['/adminmarketing/customer/edit', row.customerId]);
}
isEditMode = false;
customerId!: number

  onDelete(row: any) {
    this.toastService.confirm(
      `Are you sure you want to delete customer "${row.customerName}"?`,
      () => {
        // Here you would call your delete service method
        // For now, let's simulate success
        console.log('Confirmed delete for:', row);
        this.toastService.success('Customer deleted successfully');
        // this.adminMarketingService.deleteCustomer(row.customerId).subscribe(...)
      },
      () => {
        console.log('Delete cancelled');
      }
    );
  }

  onStatusToggle(row: any) {
    console.log('Status toggle clicked for customer:', row);
    const customerId = row.customerId;
    const currentStatus = Number(row.specialityStatus);

    if (!customerId && customerId !== 0) {
      this.toastService.error('Cannot toggle status: Customer ID is missing.');
      return;
    }

    if (currentStatus === 1) {
      // Deactivate
      this.adminMarketingService.deactivateCustomer(customerId).subscribe({
        next: () => {
          this.toastService.success('Customer deactivated successfully');
          this.loadCustomers();
        },
        error: (err) => {
          console.error('Deactivate failed', err);
          this.toastService.error('Failed to deactivate customer.');
        }
      });
    } else {
      // Activate
      this.adminMarketingService.activateCustomer(customerId).subscribe({
        next: () => {
          this.toastService.success('Customer activated successfully');
          this.loadCustomers();
        },
        error: (err) => {
          console.error('Activate failed', err);
          this.toastService.error('Failed to activate customer.');
        }
      });
    }
  }

  

  //Search Functioanlity 

  searchFields: SearchFieldConfig[] = [
    {
      key: 'customerName',
      label: 'Customer Name',
      placeholder: 'Name',
      type: 'text'   // ✅ now TypeScript knows this is literal
    },

    {
    key: 'category',
    label: 'Category',
    placeholder: 'Select Category',
    type: 'select',
    options: []
  },

  {
    key: 'subCategory',
    label: 'Sub Category',
    dependsOn: 'category',
    placeholder: 'Select Sub Category',
    type: 'select',
    options: [
    ]
  },

  {
    key: 'locationName',
    label: 'Location',
    placeholder: 'Select location',
    type: 'text',
  }
  ];
  
  
onSearch(keyword: string) {
  console.log('🔍 Customer search keyword:', keyword);

  if (!keyword || keyword.trim() === '') {
    this.rows = this.mappedRowsCache.slice(0, 300);
    return;
  }

  const lower = keyword.toLowerCase();

  const filtered = this.mappedRowsCache.filter(r => {
    return (
      r.customerName?.toLowerCase().includes(lower) ||
      r.category?.toLowerCase().includes(lower) ||
      r.subCategory?.toLowerCase().includes(lower) ||
      r.locationName?.toLowerCase().includes(lower)
    );
  });

  console.log('✅ Filtered count:', filtered.length);
  this.rows = filtered.slice(0, 300);
}

//DropDown
private buildDropdownOptions<T>(
  customers: CustomerModel[],
  fieldKey: string,
  extractor: (c: CustomerModel) => string | undefined
) {
  const unique = new Set<string>();

  customers.forEach(c => {
    const value = extractor(c);
    if (value) {
      unique.add(value);
    }
  });

  const options = Array.from(unique).map(v => ({
    label: v,
    value: v
  }));

  const field = this.searchFields.find(f => f.key === fieldKey);
  if (field) {
    field.options = options;
  }

  console.log(`✅ ${fieldKey} options loaded:`, options.length);
}


//Download
 onDownload() {

  if (!this.mappedRowsCache || this.mappedRowsCache.length === 0) {
    this.toastService.warning('No data available to download');
    return;
  }

  const exportData = this.mappedRowsCache.map(row => ({
    'S.No': row.sno,
    'Customer Name': row.customerName,
    'Telephone': row.customerTelephone,
    'Mobile': row.customerMobile,
    'Location': row.locationName
  }));

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
  XLSX.writeFile(workbook, 'Customers_' + new Date().toISOString().slice(0, 10) + '.xlsx');
}


  
}
