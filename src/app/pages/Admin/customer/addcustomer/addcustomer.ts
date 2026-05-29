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

@Component({
  selector: 'app-addcustomer',
  standalone: true,
  imports: [Header, Sidebar, Pageheader, CommonModule, Form],
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
    this.loadDropdowns();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam !== null) {
      this.isEditMode = true;
      this.customerId = Number(idParam);

      this.headerTitle = 'Edit Customer';
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/admin' },
        { label: 'Customer', route: '/admin/customer' },
        { label: 'Edit Customer' }
      ];

      this.loadCustomerById(this.customerId);
    } else {
      this.isEditMode = false;
      this.headerTitle = 'Add New Customer';
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/admin' },
        { label: 'Customer', route: '/admin/customer' },
        { label: 'Add Customer' }
      ];
    }
  }

  /* ================= DROPDOWNS ================= */
  private loadDropdowns(): void {
    this.adminService.getCustomers(0, 100000, true).subscribe({
      next: (customers: CustomerModel[]) => {

        this.buildDropdownOptions(
          customers,
          'customerCategory',
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
      },
      error: (err: any) => console.error('Dropdown load error', err)
    });
  }

  private buildDropdownOptions(
    customers: CustomerModel[],
    fieldKey: string,
    extractor: (c: CustomerModel) => string | undefined
  ) {
    const unique = new Set<string>();

    customers.forEach(c => {
      const value = extractor(c);
      if (value) unique.add(value);
    });

    const options = Array.from(unique).map(v => ({
      label: v,
      value: v
    }));

    const field = this.customerFields.find(f => f.name === fieldKey);
    if (field) {
      field.options = options;
    }
  }

  /* ================= LOAD CUSTOMER (EDIT) ================= */
  private loadCustomerById(id: number): void {
    this.adminService.getCustomers(0, 100000, true).subscribe({
      next: (customers: CustomerModel[]) => {
        const customer = customers.find(c => c.customerId === id);

        if (!customer) {
          alert('Customer not found');
          this.router.navigate(['/admin/customer']);
          return;
        }

        // ✅ Map API model → form model
        this.formInitialData = {
          ...customer,
          customerCategory: customer.customerCategory?.customerCategoryName,
          subCategory: customer.subCategory?.subcategoryName,
          locations: customer.locations?.[0]?.locationName
        };
      },
      error: () => {
        alert('Failed to load customer');
        this.router.navigate(['/admin/customer']);
      }
    });
  }

  /* ================= SAVE ================= */
  saveCompany(data: any): void {

    const payload = {
      ...data,
      customerStatus: 1,
      customerCategoryName: data.customerCategory,
      subcategoryName: data.subCategory,
      cityName: [data.locations]
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
          this.router.navigate(['/admin/customer']);
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
          this.router.navigate(['/admin/customer']);
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

  const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

  if (returnUrl) {
    this.router.navigateByUrl(returnUrl);
  } else {
    this.router.navigate(['/admin/customer']);
  }

}
}
