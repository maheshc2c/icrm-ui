import { Router } from "@angular/router";
import { CustomerModel } from "../../../models/customer-model";
import { SalesDirectorService } from "../../../service/sales-director.service";
import { SearchFieldConfig } from "../../../shared/search/search";
import { Breadcrumb } from "../../../models/breadcrumb";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Header } from "../../../layout/header/header";
import { Sidebar } from "../../../layout/sidebar/sidebar";
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { DataTable } from "../../../shared/data-table/data-table";

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

  columns = [
    { header: 'Customer Name', field: 'customerName' },
    { header: 'Telephone', field: 'customerTelephone' },
    { header: 'Mobile', field: 'customerMobile' },
    { header: 'Category', field: 'category' },
    { header: 'Sub Category', field: 'subCategory' },
    { header: 'Location', field: 'locationName' },
  ];

  customers: CustomerModel[] = [];
  loading = false;
  errorMsg = '';

  rows: any[] = [];
  mappedRowsCache: any[] = [];
  fullRows: any[] = [];

  customerName = '';
  cityName = '';
  subCategoryName = '';
  customerCategoryName = '';

  searchFields: SearchFieldConfig[] = [
    {
      key: 'customerName',
      label: 'Customer Name',
      placeholder: 'Name',
      type: 'text'
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
      options: []
    },
    {
      key: 'locationName',
      label: 'Location',
      placeholder: 'Select location',
      type: 'text',
    }
  ];

  ngOnInit(): void {
    this.loadCustomers();
  }

  private mapCustomers(customers: CustomerModel[]) {
    return customers.map((c: CustomerModel, index: number) => ({
      sno: index + 1,
      customerId: c.customerId,
      customerName: c.customerName,
      customerTelephone: c.customerTelephone,
      customerMobile: c.customerMobile,
      category: c.customerCategory?.customerCategoryName ?? '',
      subCategory: c.subCategory?.subcategoryName ?? '',
      locationName: Array.from(new Set(c.locations?.map((l: { locationName: string }) => l.locationName) || [])).filter(Boolean).join(', ')
    }));
  }

  private buildDropdownOptions(
    customers: CustomerModel[],
    fieldKey: string,
    extractor: (c: CustomerModel) => string | undefined
  ) {
    const unique = new Set<string>();

    customers.forEach((c: CustomerModel) => {
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

  private loadCustomers(): void {
    const start = performance.now();

    this.salesdirector.getCustomer().subscribe({
      next: (response: CustomerModel | CustomerModel[]) => {
        let customers: CustomerModel[] = [];

        if (Array.isArray(response)) {
          customers = response;
        } else if (response) {
          customers = [response];
        }

        console.log('API Customers count:', customers.length);

        this.fullRows = customers;

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
          'locationName',
          (c: CustomerModel) => c.locations?.[0]?.locationName
        );

        this.mappedRowsCache = this.mapCustomers(customers);
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

  onSearch(keyword: string) {
    console.log('🔍 Customer search keyword:', keyword);

    this.customerName = keyword?.trim() ?? '';

    this.salesdirector.searchCustomer({
      customerName: this.customerName,
      cityName: this.cityName,
      subCategoryName: this.subCategoryName,
      customerCategoryName: this.customerCategoryName
    }).subscribe({
      next: (res) => {
        const customers = Array.isArray(res) ? res : [];

        console.log('✅ Search result count:', customers.length);

        this.fullRows = customers;
        this.mappedRowsCache = this.mapCustomers(customers);
        this.rows = this.mappedRowsCache.slice(0, 300);

        this.buildDropdownOptions(customers, 'category', (c: CustomerModel) => c.customerCategory?.customerCategoryName);
        this.buildDropdownOptions(customers, 'subCategory', (c: CustomerModel) => c.subCategory?.subcategoryName);
        this.buildDropdownOptions(customers, 'locationName', (c: CustomerModel) => c.locations?.[0]?.locationName);
      },
      error: (err) => {
        console.error('❌ Search API failed:', err);
      }
    });
  }

  onAdd() {
    this.router.navigate(['salesdirector/customer/add']);
  }

  onEdit(row: any) {
    this.router.navigate(['salesdirector/customer/edit', row.customerId]);
  }

  isEditMode = false;
  customerId!: number;

  onDelete(row: any) {
    console.log('Delete row:', row);
  }

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