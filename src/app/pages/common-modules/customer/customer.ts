import { CommonModule } from '@angular/common';
import { ToastService } from '../../../service/toast.service';
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
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';

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
    private adminservice: Adminservice,
    private confirmService: ConfirmDialogService,
    private toastService: ToastService
  ) {}
   headerTitle = 'Customer List';

   headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Customer', route: '/customer' }
  ];

   // 🔹 Table Columns
  columns = [
    { header: 'Customer Name', field: 'customerName' },
    { header: 'Category', field: 'customerCategory' },
    { header: 'Sub Category', field: 'subCategory' },
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

  // Map categoryId → categoryName for search
  private categoryMap: Map<number, string> = new Map();

  ngOnInit(): void {
    this.loadCustomers();
    this.loadDropdowns();
  }

  private loadCustomersTimeout: any;

  private loadCustomers(): void {
    if (this.loadCustomersTimeout) {
      clearTimeout(this.loadCustomersTimeout);
    }

    this.loadCustomersTimeout = setTimeout(() => {
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

          this.rows = customerList.map((c: any, index: number) => {
            const cust = c.customer ? c.customer : c;
            return {
              sno: (this.currentPage - 1) * this.pageSize + index + 1,
              customerId: cust.customerId,
              customerName: cust.customerName,
              customerCategory: cust.customerCategory?.customerCategoryName || cust.customerCategoryName || cust.category || '',
              subCategory: cust.subCategory?.subcategoryName || cust.subcategoryName || cust.subCategory || '',
              customerTelephone: cust.customerTelephone,
              customerMobile: cust.customerMobile,
              customerStatus: cust.customerStatus,
              locationName: Array.from(new Set(cust.locations?.map((l: any) => l.locationName) || [])).filter(Boolean).join(', ')
            };
          });
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Customer API Error:', err);
        }
      });
    }, 50); // 50ms debounce
  }

  private loadDropdowns(): void {
    // Load categories from /customer/categories
    this.adminservice.getCategoryDropdown().subscribe({
      next: (res: any[]) => {
        const categories = Array.isArray(res) ? res : [];
        this.categoryMap.clear();
        const options = categories.map((c: any) => {
          const catId = Number(c.customerCategoryId);
          this.categoryMap.set(catId, c.customerCategoryName);
          return { label: c.customerCategoryName, value: catId };
        });
        const field = this.searchFields.find(f => f.key === 'customerCategoryName');
        if (field) { field.options = options; }
      },
      error: (err: any) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  // Handle dependent dropdown: category → subcategory
  onFieldChange(event: { key: string; value: any }): void {
    if (event.key === 'customerCategoryName' && event.value) {
      const categoryId = Number(event.value);
      // Clear existing subcategory options
      const subField = this.searchFields.find(f => f.key === 'subCategoryName');
      if (subField) { subField.options = []; }

      // Fetch subcategories for the selected category
      this.adminservice.getSubCategoryDropdown(categoryId).subscribe({
        next: (res: any[]) => {
          const subCategories = Array.isArray(res) ? res : [];
          const options = subCategories.map((sc: any) => ({
            label: sc.name,
            value: sc.name
          }));
          if (subField) { subField.options = options; }
        },
        error: (err: any) => {
          console.error('Failed to load subcategories:', err);
        }
      });
    } else if (event.key === 'customerCategoryName' && !event.value) {
      // Category cleared → clear subcategory options
      const subField = this.searchFields.find(f => f.key === 'subCategoryName');
      if (subField) { subField.options = []; }
    }
  }

  onAdd() {
    this.router.navigate(['customer/add']);
  }

  onEdit(row: any) {
    const fullCustomer = this.fullRows.find((c: any) => 
      (c.customer?.customerId === row.customerId) || (c.customerId === row.customerId)
    );
    
    // Merge the wrapper object back into a flat object for addcustomer.ts to consume easily
    let mergedCustomer = fullCustomer;
    if (fullCustomer && fullCustomer.customer) {
      mergedCustomer = {
        ...fullCustomer.customer,
        customerInstalledBaseDTO: fullCustomer.installedBases // map it back to DTO name expected by frontend
      };
    }

    this.router.navigate(['customer/edit', row.customerId], { state: { customerData: mergedCustomer } });
  }

  isEditMode = false;
  customerId!: number;

  //activate and deactivate
  onDelete(row: any) {
    const Id = row?.customerId;
    if (!Id) {
      return;
    }
    const status = Number(row?.customerStatus);
    const isActive = status === 1;

    this.confirmService.confirm({
      title: 'Confirm',
      message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this customer?`,
      confirmText: isActive ? 'Deactivate' : 'Activate'
    }).then((confirmed) => {
      if (!confirmed) return;

      const apiCall = isActive
        ? this.adminservice.deactivateCustomer(Id)
        : this.adminservice.activateCustomer(Id);

      apiCall.subscribe({
        next: () => {
          row.customerStatus = isActive ? 2 : 1;
          this.rows = [...this.rows];
          this.fullRows = [...this.fullRows];
          this.toastService.success(`Customer ${isActive ? 'deactivated' : 'activated'} successfully`);
        },
        error: (err) => {
          console.error('Status update failed', err);
          this.toastService.error('Failed to update status');
        }
      });
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
      dependsOn: 'customerCategoryName',
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
    // Convert categoryId back to categoryName for the search API
    const searchFilters = { ...filters };
    if (searchFilters.customerCategoryName) {
      const catId = Number(searchFilters.customerCategoryName);
      if (!isNaN(catId)) {
        searchFilters.customerCategoryName = this.categoryMap.get(catId) || searchFilters.customerCategoryName;
      }
    }
    this.searchFilters = searchFilters;
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
    console.log('DOWNLOAD CLICKED');

  this.adminservice.downloadCustomer(
    this.searchFilters.customerName || null,
    this.searchFilters.customerCategoryName || null,
    this.searchFilters.subCategoryName || null,
    this.searchFilters.cityName || null
  )
  .subscribe({
    next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
  
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Customers.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
  
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
    },
    error: (err) => {
      console.error('Download failed', err);
    }
  });
}

onReset(): void {
  this.searchFilters = {};
  this.currentPage = 1;
  this.loadCustomers();
}
 
}
