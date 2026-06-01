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

  rows: any[] = [];
  fullRows: any[] = []; // ✅ full API data (for Excel)

  totalElements = 0;
  currentPage = 1;
  pageSize = 10;
  searchFilters: any = {};

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.loading = true;

    // Check if we have active search filters
    const hasSearch = Object.values(this.searchFilters).some(v => v && String(v).trim().length > 0);

    const apiCall = hasSearch
      ? this.adminservice.searchCustomersPaged(
          this.searchFilters.customerName || null,
          this.searchFilters.customerCategoryName || null,
          this.searchFilters.subCategoryName || null,
          this.searchFilters.cityName || null,
          this.currentPage - 1,
          this.pageSize
        )
      : this.adminservice.getCustomers(this.currentPage - 1, this.pageSize);

    apiCall.subscribe({
      next: (res: any) => {
        this.loading = false;
        const customerList = Array.isArray(res) ? res : (res?.content || []);
        this.totalElements = Array.isArray(res) ? res.length : (res?.totalElements || 0);

        this.fullRows = customerList;

        this.rows = customerList.map((c: any, index: number) => ({
          sno: (this.currentPage - 1) * this.pageSize + index + 1,
          customerId: c.customerId,
          customerName: c.customerName,
          customerTelephone: c.customerTelephone,
          customerMobile: c.customerMobile,
          customerStatus: c.customerStatus,
          locationName: c.locations?.map((l: any) => l.locationName).join(', ') ?? ''
        }));
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Customer API Error:', err);
      }
    });
  }

  private loadDropdowns(): void {
    // Load Customer Categories
    this.adminservice.getCustomerCategories().subscribe({
      next: (res: any) => {
        const categories = Array.isArray(res) ? res : [];
        const unique = new Set<string>();
        categories.forEach((c: any) => {
          if (c.customerCategory?.customerCategoryName) {
            unique.add(c.customerCategory.customerCategoryName);
          }
        });
        const options = Array.from(unique).map(v => ({ label: v, value: v }));
        const field = this.searchFields.find(f => f.key === 'customerCategoryName');
        if (field) {
          field.options = options;
        }
      }
    });

    // Load Sub Categories
    this.adminservice.getSubSystem().subscribe({
      next: (res: any) => {
        const subCategories = Array.isArray(res) ? res : [];
        const unique = new Set<string>();
        subCategories.forEach((c: any) => {
          if (c.subcategoryName) {
            unique.add(c.subcategoryName);
          }
        });
        const options = Array.from(unique).map(v => ({ label: v, value: v }));
        const field = this.searchFields.find(f => f.key === 'subCategoryName');
        if (field) {
          field.options = options;
        }
      }
    });
  }

  onAdd() {
    this.router.navigate(['customer/add']);
  }

  onEdit(row: any) {
    this.router.navigate(['customer/edit', row.customerId]);
  }

  isEditMode = false;
  customerId!: number;

  //actiavte and deactivate
onDelete(row: any) {
 
  const Id = row?.customerId;
 
  if (!Id) {
    return;
  }
 
  const status = Number(row?.customerStatus);
 
  const isActive = status === 1;
 
  const apiCall = isActive
    ? this.adminservice.deactivateCustomer(Id)
    : this.adminservice.activateCustomer(Id);
 
  apiCall.subscribe({
    next: () => {
 
      row.customerStatus = isActive ? 2 : 1;
 
      this.rows = [...this.rows];
      this.fullRows = [...this.fullRows];
 
    },
 
    error: (err) => {
      console.error('Status update failed', err);
      alert('Failed to update status');
    }
  });
}

  searchFields: SearchFieldConfig[] = [
    {
      key: 'customerName',
      label: 'Customer Name',
      placeholder: 'Name',
      type: 'text'
    },
    {
      key: 'customerCategoryName',
      label: 'Category',
      placeholder: 'Select Category',
      type: 'select',
      options: []
    },
    {
      key: 'subCategoryName',
      label: 'Sub Category',
      placeholder: 'Select Sub Category',
      type: 'select',
      options: []
    },
    {
      key: 'cityName',
      label: 'Location',
      placeholder: 'Select location',
      type: 'text',
    }
  ];

  onSearch(keyword: string) {
    console.log('🔍 Customer quick search keyword:', keyword);
    this.searchFilters = { customerName: keyword };
    this.currentPage = 1;
    this.loadCustomers();
  }

  onSearchChange(filters: any) {
    console.log('🔍 Customer structured search filters:', filters);
    this.searchFilters = filters;
    this.currentPage = 1;
    this.loadCustomers();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCustomers();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadCustomers();
  }

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
      error: (err: any) => {
        console.error('Download failed:', err);
        alert(`Download failed: ${err.status}`);
      }
    });
  }

onReset(): void {
  this.searchFilters = {};
  this.currentPage = 1;
  this.loadCustomers();
}
 
}
