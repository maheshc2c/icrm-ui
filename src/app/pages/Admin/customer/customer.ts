import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Search, SearchFieldConfig } from "../../../shared/search/search";
import { Adminservice } from '../../../service/adminservice';
import { CustomerModel } from '../../../models/customer-model';

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
    private adminservice: Adminservice

  ) {}
   headerTitle = 'Customer List';

   headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Customer', route: '/admin/customer' }
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

  this.adminservice.getCustomers().subscribe({
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
    this.router.navigate(['customer/add']);
  }

onEdit(row: any) {
  this.router.navigate(['customer/edit', row.customerId]);
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
 onImport() {

  if (!this.fullRows || this.fullRows.length === 0) {
    alert('No data available to download');
    return;
  }

  this.adminservice.downloadCustomer(this.fullRows).subscribe({
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
