// import { Component, OnInit } from '@angular/core';
// import { Header } from '../../../../layout/header/header';
// import { Sidebar } from '../../../../layout/sidebar/sidebar';
// import { Pageheader } from '../../../../shared/pageheader/pageheader';
// import { CommonModule } from '@angular/common';
// import { Form } from '../../../../shared/form/form';
// import { Adminservice } from '../../../../service/adminservice';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Breadcrumb } from '../../../../models/breadcrumb';
// import { CustomerModel } from '../../../../models/customer-model';

// @Component({
//   selector: 'app-addcustomer',
//   standalone: true,
//   imports: [Header, Sidebar, Pageheader, CommonModule, Form],
//   templateUrl: './addcustomer.html',
//   styleUrl: './addcustomer.css',
// })
// export class Addcustomer implements OnInit {

//   constructor(
//     private adminService: Adminservice,
//     private router: Router,
//     private route: ActivatedRoute
//   ) {}

//   /* ================= HEADER ================= */
//   headerTitle = 'Add New Customer';
//   headerBreadcrumbs: Breadcrumb[] = [];

//   /* ================= STATE ================= */
//   isEditMode = false;
//   customerId!: number;
//   formInitialData: any = {};

//   // formInitialData: Partial<CustomerModel> = {};

//   /* ================= FORM FIELDS ================= */
//   customerFields: any[] = [
//     { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
//     { name: 'customerName1', label: 'Customer Code', type: 'text', required: false },

//     {
//       name: 'customerCategory',
//       label: 'Category',
//       type: 'select',
//       required: false,
//       options: [],
//     },
//     {
//       name: 'subCategory',
//       label: 'Sub Category',
//       type: 'select',
//       required: false,
//       options: [],
//     },

//     { name: 'customerEmail', label: 'Email', type: 'email', required: true },
//     { name: 'customerTelephone', label: 'Telephone', type: 'number', required: false },
//     { name: 'customerMobile', label: 'Mobile', type: 'number', required: true },
//     { name: 'customerFax', label: 'Fax', type: 'text', required: false },
//     { name: 'customerWebsite', label: 'Website', type: 'text', required: false },

//     {
//       name: 'locations',
//       label: 'City',
//       type: 'select',
//       required: false,
//       options: [],
//       searchable: true
//     },

//     { name: 'customerAddress1', label: 'Address Line 1', type: 'text', required: true },
//     { name: 'customerAddress2', label: 'Address Line 2', type: 'textarea', required: false },
//     { name: 'customerAddress3', label: 'Address Line 3', type: 'textarea', required: false },
//     { name: 'customerLandmark', label: 'Landmark', type: 'text', required: false },
//     { name: 'customerPincode', label: 'Pincode', type: 'number', required: false },
//     { name: 'customerPan', label: 'PAN', type: 'text', required: false },
//     { name: 'customerTan', label: 'TAN', type: 'text', required: false },
//     { name: 'customerTin', label: 'TIN', type: 'text', required: false },
//   ];

//   /* ================= INIT ================= */
//   ngOnInit(): void {
//     this.loadDropdowns();

//     const idParam = this.route.snapshot.paramMap.get('id');

//     if (idParam !== null) {
//       this.isEditMode = true;
//       this.customerId = Number(idParam);

//       this.headerTitle = 'Edit Customer';
//       this.headerBreadcrumbs = [
//         { label: 'Home', route: '/admin' },
//         { label: 'Customer', route: '/customer' },
//         { label: 'Edit Customer' }
//       ];

//       this.loadCustomerById(this.customerId);
//     } else {
//       this.isEditMode = false;
//       this.headerTitle = 'Add New Customer';
//       this.headerBreadcrumbs = [
//         { label: 'Home', route: '/admin' },
//         { label: 'Customer', route: '/customer' },
//         { label: 'Add Customer' }
//       ];
//     }
//   }

//   /* ================= DROPDOWNS ================= */
//   private loadDropdowns(): void {
//     this.adminService.getCustomers(0, 100000, true).subscribe({
//       next: (customers: CustomerModel[]) => {

//         this.buildDropdownOptions(
//           customers,
//           'customerCategory',
//           c => c.customerCategory?.customerCategoryName
//         );

//         this.buildDropdownOptions(
//           customers,
//           'subCategory',
//           c => c.subCategory?.subcategoryName
//         );

//         this.buildDropdownOptions(
//           customers,
//           'locations',
//           c => c.locations?.[0]?.locationName
//         );
//       },
//       error: (err: any) => console.error('Dropdown load error', err)
//     });
//   }

//   private buildDropdownOptions(
//     customers: CustomerModel[],
//     fieldKey: string,
//     extractor: (c: CustomerModel) => string | undefined
//   ) {
//     const unique = new Set<string>();

//     customers.forEach(c => {
//       const value = extractor(c);
//       if (value) unique.add(value);
//     });

//     const options = Array.from(unique).map(v => ({
//       label: v,
//       value: v
//     }));

//     const field = this.customerFields.find(f => f.name === fieldKey);
//     if (field) {
//       field.options = options;
//     }
//   }

//   /* ================= LOAD CUSTOMER (EDIT) ================= */
//   private loadCustomerById(id: number): void {
//     this.adminService.getCustomers(0, 100000, true).subscribe({
//       next: (customers: CustomerModel[]) => {
//         const customer = customers.find(c => c.customerId === id);

//         if (!customer) {
//           alert('Customer not found');
//           this.router.navigate(['/customer']);
//           return;
//         }

//         // ✅ Map API model → form model
//         this.formInitialData = {
//           ...customer,
//           customerCategory: customer.customerCategory?.customerCategoryName,
//           subCategory: customer.subCategory?.subcategoryName,
//           locations: customer.locations?.[0]?.locationName
//         };
//       },
//       error: () => {
//         alert('Failed to load customer');
//         this.router.navigate(['/customer']);
//       }
//     });
//   }

//   /* ================= SAVE ================= */
//   saveCompany(data: any): void {

//     const payload = {
//       ...data,
//       customerStatus: 1,
//       customerCategoryName: data.customerCategory,
//       subcategoryName: data.subCategory,
//       cityName: [data.locations]
//     };

//     delete payload.customerCategory;
//     delete payload.subCategory;
//     delete payload.locations;

//     console.log('📦 Saving Customer Payload:', payload);

//     // ================= EDIT =================
//     if (this.isEditMode) {

//       const updatePayload = {
//         customerId: this.customerId,   // ✅ IMPORTANT
//         ...payload
//       };

//       this.adminService.updateCustomer(this.customerId, updatePayload).subscribe({
//         next: () => {
//           alert('Customer updated successfully');
//           this.router.navigate(['/customer']);
//         },
//         error: (err: any) => {
//           console.error('Update failed:', err);
//           alert('Update failed. Check console.');
//         }
//       });
//     } 
//     // ================= CREATE (UNCHANGED) =================
//     else {
//       this.adminService.createCustomer(payload).subscribe({
//         next: () => {
//           alert('Customer created successfully');
//           this.router.navigate(['/customer']);
//         },
//         error: (err: any) => {
//           console.error('Create failed:', err);
//           alert('Create failed. Check console.');
//         }
//       });
//     }
//   }

//   /* ================= CANCEL ================= */
//   // onCancel(): void {
//   //   this.router.navigate(['/admin/customer']);
//   // }
//   onCancel(): void {

//   const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

//   if (returnUrl) {
//     this.router.navigateByUrl(returnUrl);
//   } else {
//     this.router.navigate(['/customer']);
//   }

// }
// }

import { Component, OnInit } from '@angular/core';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { CommonModule } from '@angular/common';
import { Form } from '../../../../shared/form/form';
import { Adminservice } from '../../../../service/adminservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { CustomerModel } from '../../../../models/customer-model';
import { FormsModule } from '@angular/forms';
 
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
    private route: ActivatedRoute
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
    { name: 'customerName1', label: 'Customer Code', type: 'text', required: false },
 
    {
      name: 'customerCategory',
      label: 'Category',
      type: 'select',
      required: false,
      options: [],
    },
    {
      name: 'subCategory',
      label: 'Sub Category',
      type: 'select',
      required: false,
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
      required: false,
      options: [],
      searchable: true
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

        this.formInitialData = {
          ...stateData,
          customerCategory: stateData.customerCategory?.customerCategoryName,
          subCategory: stateData.subCategory?.subcategoryName,
          locations: stateData.locations?.[0]?.locationName
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
      const keyword = event.value || '';
      // Only search if user typed at least 2 chars, or if it's empty (to reload all/defaults)
      if (keyword.length >= 2 || keyword.length === 0) {
        this.adminService.getLocationCityDropdown(keyword).subscribe({
          next: (cities: any[]) => {
            const cityOptions = (cities || []).map(c => ({
              label: c.name,
              value: c.name
            }));
            const cityField = this.customerFields.find(f => f.name === 'locations');
            if (cityField) {
              cityField.options = cityOptions;
            }
          },
          error: (err: any) => console.error('Failed to search cities:', err)
        });
      }
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
          alert('Customer not found');
          this.router.navigate(['/customer']);
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
        alert('Failed to load customer');
        this.router.navigate(['/customer']);
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

    this.formInitialData = {
      ...customer,
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
        customerInstalledBaseId: b.customerInstalledBaseId || 0,
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
        customerId: this.customerId,   // ✅ IMPORTANT
        ...payload
      };
 
      this.adminService.updateCustomer(this.customerId, updatePayload).subscribe({
        next: () => {
          alert('Customer updated successfully');
          this.router.navigate(['/customer']);
        },
        error: (err: any) => {
          console.error('Update failed:', err);
          alert('Update failed. Check console.');
        }
      });
    }
    // ================= CREATE (UNCHANGED) =================
    else {
      this.adminService.createCustomer(payload).subscribe({
        next: () => {
          alert('Customer created successfully');
          this.router.navigate(['/customer']);
        },
        error: (err: any) => {
          console.error('Create failed:', err);
          alert('Create failed. Check console.');
        }
      });
    }
  }
 
  /* ================= CANCEL ================= */
  // onCancel(): void {
  //   this.router.navigate(['/admin/customer']);
  // }
  onCancel(): void {
    this.router.navigate(['/customer']);
  }
}
 