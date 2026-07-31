import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { CommonModule, Location } from '@angular/common';
import { Form } from '../../../../shared/form/form';
import { Adminservice } from '../../../../service/adminservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { CustomerModel } from '../../../../models/customer-model';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../service/toast.service';
 
@Component({
  selector: 'app-addcustomer',
  standalone: true,
  imports: [Header, Sidebar, Pageheader, CommonModule, Form, FormsModule],
  templateUrl: './addcustomer.html',
  styleUrl: './addcustomer.css',
})
export class Addcustomer implements OnInit {
 
  constructor(
    private adminService: Adminservice,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private location: Location
  ) {}
 
  /* ================= HEADER ================= */
  headerTitle = 'Add New Customer';
  headerBreadcrumbs: Breadcrumb[] = [];
 
  /* ================= STATE ================= */
  isEditMode = false;
  customerId!: number;
  formInitialData: any = {};
  
  showInstalledBaseModal = false;
  installedBases: any[] = [];
  
  // formInitialData: Partial<CustomerModel> = {};
 
  /* ================= FORM FIELDS ================= */
  customerFields: any[] = [
    { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
    { name: 'customerName1', label: 'Customer Code', type: 'text', required: true },
 
    {
      name: 'customerCategory',
      label: 'Category',
      placeholder: 'Select-Category',
      type: 'select',
      required: true,
      options: [],
    },
    {
      name: 'subCategory',
      label: 'Sub Category',
      dependsOn: 'customerCategory',
      type: 'select',
      required: true,
      options: [],
    },
 
    { name: 'customerEmail', label: 'Email', type: 'email', required: true },
    { name: 'customerTelephone', label: 'Telephone', type: 'number', required: false },
    { name: 'customerMobile', label: 'Mobile', type: 'number', required: true },
    { name: 'customerFax', label: 'Fax', type: 'text', required: false },
    { name: 'customerWebsite', label: 'Website', type: 'text', required: false },
 
    {
      name: 'locations',
      label: 'City',
      type: 'select',
      required: true,
      options: [],
      searchable: true,
      dynamicLoad: (search: string) => {
        return this.adminService.getLocationCityDropdown(search).pipe(
          map((cities: any[]) => (cities || []).map(c => ({ label: c.name, value: c.name })))
        );
      }
    },
 
    { name: 'customerAddress1', label: 'Address Line 1', type: 'text', required: true },
    { name: 'customerAddress2', label: 'Address Line 2', type: 'textarea', required: false },
    { name: 'customerAddress3', label: 'Address Line 3', type: 'textarea', required: false },
    { name: 'customerLandmark', label: 'Landmark', type: 'text', required: false },
    { name: 'customerPincode', label: 'Pincode', type: 'number', required: false },
    { name: 'customerPan', label: 'PAN', type: 'text', required: false },
    { name: 'customerTan', label: 'TAN', type: 'text', required: false },
    { name: 'customerTin', label: 'TIN', type: 'text', required: false },
  ];
 
  /* ================= INIT ================= */
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
 
    if (idParam !== null) {
      this.isEditMode = true;
      this.customerId = Number(idParam);
 
      this.headerTitle = 'Edit Customer';
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'Customer', route: '/customer' },
        { label: 'Edit Customer' }
      ];

      const stateData = history.state.customerData;
      if (stateData && stateData.customerId === this.customerId) {
        
        if (stateData.customerInstalledBaseDTO && Array.isArray(stateData.customerInstalledBaseDTO)) {
          this.installedBases = JSON.parse(JSON.stringify(stateData.customerInstalledBaseDTO));
        }

        const customerCodeVal = this.getCustomerCodeValue(stateData);
        this.formInitialData = {
          ...stateData,
          customerName1: customerCodeVal,
          customerCategory: stateData.customerCategory?.customerCategoryName || stateData.customerCategoryName,
          subCategory: stateData.subCategory?.subcategoryName || stateData.subcategoryName,
          locations: stateData.locations?.[0]?.locationName || stateData.cityName?.[0]
        };

        // Load dropdowns silently in background
        this.loadDropdowns(() => {
          const subCategoryName = stateData.subCategory?.subcategoryName || stateData.subcategoryName;
          if (subCategoryName) {
            const subField = this.customerFields.find(f => f.name === 'subCategory');
            if (subField) {
              subField.options = [{ label: subCategoryName, value: subCategoryName }];
            }
          }
        });
      } else {
        // SLOW PATH: No router state, wait for dropdowns then fetch
        this.loadDropdowns(() => {
          this.loadCustomerById(this.customerId);
        });
      }
    } else {
      this.isEditMode = false;
      this.headerTitle = 'Add New Customer';
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'Customer', route: '/customer' },
        { label: 'Add Customer' }
      ];
      this.loadDropdowns();
    }
  }

  private getCustomerCodeValue(c: any): string {
    if (!c) return '';
    if (c.customerName1 && String(c.customerName1).trim()) return String(c.customerName1).trim();
    if (c.customerCode && String(c.customerCode).trim()) return String(c.customerCode).trim();
    if (c.name1 && String(c.name1).trim()) return String(c.name1).trim();
    if (c.sapCode && String(c.sapCode).trim()) return String(c.sapCode).trim();
    if (c.code && String(c.code).trim()) return String(c.code).trim();
    const id = c.customerId || c.id;
    if (id) {
      return 'CUST-' + String(id).padStart(4, '0');
    }
    return '';
  }

  /* ================= DROPDOWNS ================= */
  private categoryMap: Map<string, number> = new Map();

  private loadDropdowns(onComplete?: () => void): void {
    // 1. Load Categories from /customer/categories
    this.adminService.getCategoryDropdown().subscribe({
      next: (res: any[]) => {
        const categories = Array.isArray(res) ? res : [];
        this.categoryMap.clear();
        const options = categories.map((c: any) => {
          this.categoryMap.set(c.customerCategoryName, c.customerCategoryId);
          return { label: c.customerCategoryName, value: c.customerCategoryName };
        });
        const field = this.customerFields.find(f => f.name === 'customerCategory');
        if (field) {
          field.options = options;
        }

        // 2. Load Cities from /location/all-locations
        this.adminService.getLocationCityDropdown().subscribe({
          next: (cities: any[]) => {
            const cityOptions = (cities || []).map(c => ({
              label: c.name,
              value: c.name
            }));
            const cityField = this.customerFields.find(f => f.name === 'locations');
            if (cityField) {
              cityField.options = cityOptions;
            }

            if (onComplete) {
              onComplete();
            }
          },
          error: (err: any) => {
            console.error('Failed to load cities:', err);
            if (onComplete) {
              onComplete();
            }
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to load categories:', err);
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  // Handle category changing in add/edit form
  onFieldChange(event: { name: string; value: any }): void {
    if (event.name === 'customerCategory') {
      const categoryName = event.value;
      const subField = this.customerFields.find(f => f.name === 'subCategory');
      if (subField) {
        subField.options = [];
      }

      if (categoryName) {
        const categoryId = this.categoryMap.get(categoryName);
        if (categoryId) {
          this.adminService.getSubCategoryDropdown(categoryId).subscribe({
            next: (res: any[]) => {
              const subCategories = Array.isArray(res) ? res : [];
              const options = subCategories.map((sc: any) => ({
                label: sc.name,
                value: sc.name
              }));
              if (subField) {
                subField.options = options;
              }
            },
            error: (err: any) => console.error('Failed to load subcategories:', err)
          });
        }
      }
    } else if (event.name === 'locations') {
      // dynamicLoad handles the search now!
    }
  }

  /* ================= LOAD CUSTOMER (EDIT) ================= */
  private loadCustomerById(id: number): void {
    // Slow path: fallback
    this.adminService.getCustomers(0, 100000, true).subscribe({
      next: (customers: any[]) => {
        const fullCustomer = customers.find(c => 
          (c.customer?.customerId === id) || (c.customerId === id)
        );

        if (!fullCustomer) {
          this.toastService.error('Customer not found');
          this.navigateBackToList();
          return;
        }

        let mergedCustomer = fullCustomer;
        if (fullCustomer && fullCustomer.customer) {
          mergedCustomer = {
            ...fullCustomer.customer,
            customerInstalledBaseDTO: fullCustomer.installedBases
          };
        }

        this.populateCustomerForm(mergedCustomer);
      },
      error: () => {
        this.toastService.error('Failed to load customer');
        this.navigateBackToList();
      }
    });
  }

  private populateCustomerForm(customer: any): void {
    if (customer.customerInstalledBaseDTO && Array.isArray(customer.customerInstalledBaseDTO)) {
      this.installedBases = JSON.parse(JSON.stringify(customer.customerInstalledBaseDTO));
    }

    const subCategoryName = customer.subCategory?.subcategoryName || customer.subcategoryName;
    if (subCategoryName) {
      const subField = this.customerFields.find(f => f.name === 'subCategory');
      if (subField) {
        subField.options = [{ label: subCategoryName, value: subCategoryName }];
      }
    }

    const customerCodeVal = this.getCustomerCodeValue(customer);
    this.formInitialData = {
      ...customer,
      customerName1: customerCodeVal,
      customerCategory: customer.customerCategory?.customerCategoryName || customer.customerCategoryName,
      subCategory: subCategoryName,
      locations: customer.locations?.[0]?.locationName || customer.cityName?.[0]
    };
  }
 
  /* ================= INSTALLED BASE MODAL ================= */
  openInstalledBaseModal() {
    if (this.installedBases.length === 0) {
      this.addInstalledBaseRow();
    }
    this.showInstalledBaseModal = true;
  }

  closeInstalledBaseModal() {
    this.showInstalledBaseModal = false;
  }

  addInstalledBaseRow() {
    this.installedBases.push({
      competitors: '',
      productModel: '',
      quantity: null,
      make: '',
      yearOfPurchase: '',
      replacementYear: ''
    });
  }

  removeInstalledBaseRow(index: number) {
    if (this.installedBases.length > 1) {
      this.installedBases.splice(index, 1);
    }
  }

  /* ================= SAVE ================= */
  saveCompany(data: any): void {
 
    // Filter out rows where all fields are empty and format numbers correctly
      const cleanInstalledBases = this.installedBases
        .filter(b => 
          (b.competitors && b.competitors.trim() !== '') || 
          (b.productModel && b.productModel.trim() !== '') || 
          (b.make && b.make.trim() !== '') || 
          b.quantity !== null ||
          (b.yearOfPurchase && b.yearOfPurchase.trim() !== '') || 
          (b.replacementYear && b.replacementYear.trim() !== '')
        )
        .map(b => ({
          ...b,
          customerInstalledBaseId: b.customerInstalledId || b.customerInstalledBaseId || null,
          quantity: b.quantity ? Number(b.quantity) : null,
          yearOfPurchase: b.yearOfPurchase ? Number(b.yearOfPurchase) : null,
          replacementYear: b.replacementYear ? Number(b.replacementYear) : null
        }));

    const payload = {
      ...data,
      customerStatus: 1,
      customerCategoryName: data.customerCategory,
      subcategoryName: data.subCategory,
      cityName: [data.locations],
      customerInstalledBaseDTO: cleanInstalledBases
    };
 
    delete payload.customerCategory;
    delete payload.subCategory;
    delete payload.locations;
 
    console.log('📦 Saving Customer Payload:', payload);
 
    // ================= EDIT =================
    if (this.isEditMode) {
 
      const updatePayload = {
        customerId: this.customerId,   // IMPORTANT
        ...payload
      };
 
      this.adminService.updateCustomer(this.customerId, updatePayload).subscribe({
        next: () => {
          this.toastService.success('Customer updated successfully');
          this.navigateBackToList();
        },
        error: (err: any) => {
          console.error('Update failed:', err);
          this.toastService.error('Update failed. Check console.');
        }
      });
    }
    // ================= CREATE (UNCHANGED) =================
    else {
      this.adminService.createCustomer(payload).subscribe({
        next: () => {
          this.toastService.success('Customer created successfully');
          this.navigateBackToList();
        },
        error: (err: any) => {
          console.error('Create failed:', err);
          this.toastService.error('Create failed. Check console.');
        }
      });
    }
  }
 
  navigateBackToList(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    if (window.history.state && window.history.state.navigationId > 1) {
      this.location.back();
    } else {
      const url = this.router.url;
      if (url.includes('/edit/')) {
        this.router.navigateByUrl(url.substring(0, url.indexOf('/edit/')));
      } else if (url.includes('/add')) {
        this.router.navigateByUrl(url.substring(0, url.indexOf('/add')));
      } else {
        this.router.navigate(['/customer']);
      }
    }
  }

  /* ================= CANCEL ================= */
  // onCancel(): void {
  //   this.router.navigate(['/admin/customer']);
  // }
  onCancel(): void {
    this.navigateBackToList();
  }
}
 