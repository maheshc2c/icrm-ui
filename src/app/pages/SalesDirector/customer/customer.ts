import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Search, SearchFieldConfig } from "../../../shared/search/search";

import { CustomerModel } from '../../../models/customer-model';
import { SalesDirectorService } from '../../../service/sales-director.service';

@Component({
  selector: 'app-customer',
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
    private salesdirector: SalesDirectorService

  ) {}
   headerTitle = 'Customer List';

   headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sddashboard' },
    { label: 'Customer', route: '/salesdirector/customer' }
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

  this.salesdirector.getCustomers().subscribe({
    next: (response: CustomerModel | CustomerModel[]) => {

      // ✅ FIX: normalize response → always array
      let customers: CustomerModel[] = [];

      if (Array.isArray(response)) {
        customers = response;
      } else if (response) {
        customers = [response];
      }

      console.log('API Customers count:', customers.length);

      // ✅ Store full data
      this.fullRows = customers;

      // ✅ Dropdowns
      this.buildDropdownOptions(
        customers,
        'category',
        (c: CustomerModel) => c.customerCategory?.customerCategoryName
      );

      this.buildDropdownOptions(
        customers,
        'subCategory',
        (c: CustomerModel) => c.subCategory?.subcategoryName
      );

      this.buildDropdownOptions(
        customers,
        'locations',
        (c: CustomerModel) => c.locations?.[0]?.locationName
      );

      // ✅ Mapping (FIXED TYPES)
      this.mappedRowsCache = customers.map(
        (c: CustomerModel, index: number) => ({
          sno: index + 1,
          customerId: c.customerId,
          customerName: c.customerName,
          customerTelephone: c.customerTelephone,
          customerMobile: c.customerMobile,
          category: c.customerCategory?.customerCategoryName ?? '',
          subCategory: c.subCategory?.subcategoryName ?? '',
          locationName: c.locations
            ?.map((l: { locationName: string }) => l.locationName)
            .join(', ') ?? ''
        })
      );

      // ✅ Initial render
      this.rows = this.mappedRowsCache.slice(0, 300);

      const end = performance.now();
      console.log(`⚡ UI mapping took ${(end - start).toFixed(1)} ms`);
    },

    error: (err) => {
      console.error('Customer API Error:', err);
      this.errorMsg = 'Failed to load customers';
    }
  });
}


  //  onImport() {
  //   console.log('Import clicked');
  // }

  onAdd() {
    this.router.navigate(['salesdirector/customer/add']);
  }

onEdit(row: any) {
  this.router.navigate(['salesdirector/customer/edit', row.customerId]);
}
isEditMode = false;
customerId!: number

  onDelete(row: any) {
    console.log('Delete row:', row);
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
      // r.customerName?.toLowerCase().includes(lower) ||
      r.name?.toLowerCase().includes(lower) ||
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
 onImport() {

  if (!this.fullRows || this.fullRows.length === 0) {
    alert('No data available to download');
    return;
  }

  this.salesdirector.downloadCustomer(this.fullRows).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Customer.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Download failed:', err);
      alert(`Download failed: ${err.status}`);
    }
  });
}


  
}
