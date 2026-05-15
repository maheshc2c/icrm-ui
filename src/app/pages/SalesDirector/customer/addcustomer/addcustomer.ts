import { Component, OnInit } from '@angular/core';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { CommonModule } from '@angular/common';
import { Form } from '../../../../shared/form/form';

import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { CustomerModel } from '../../../../models/customer-model';
import { SalesDirectorService } from '../../../../service/sales-director.service';

@Component({
  selector: 'app-addcustomer',
  standalone: true,
  imports: [Header, Sidebar, Pageheader, CommonModule, Form],
  templateUrl: './addcustomer.html',
  styleUrl: './addcustomer.css',
})
export class Addcustomer implements OnInit {

  constructor(
    private saledService: SalesDirectorService,
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
    { name: 'customerName', label: 'Customer Name', placeholder: 'Enter customer name', type: 'text', required: true },
    { name: 'customerName1', label: 'Customer Code',placeholder: 'Enter customer code', type: 'text', required: false },

    {
      name: 'customerCategory',
      label: 'Category',
      type: 'select',
      required: false,
      placeholder: 'Select category',
      options: [],
    },
    {
      name: 'subCategory',
      label: 'Sub Category',
      type: 'select',
      required: false,
      placeholder: 'Select sub category',
      options: [],
    },

    { name: 'customerEmail', label: 'Email',placeholder: 'Enter email address', type: 'email', required: true },
    { name: 'customerTelephone', label: 'Telephone',placeholder: 'Enter telephone number', type: 'number', required: false },
    { name: 'customerMobile', label: 'Mobile', type: 'number', placeholder: 'Enter mobile number', required: true },
    { name: 'customerFax', label: 'Fax',placeholder: 'Enter fax number', type: 'text', required: false },
    { name: 'customerWebsite', label: 'Website',placeholder: 'Enter website URL', type: 'text', required: false },

    {
      name: 'locations',
      label: 'City',
      type: 'select',
      required: false,
      placeholder: 'Select city',
      options: [],
      searchable: true
    },

    { name: 'customerAddress1', label: 'Address Line 1',placeholder: 'Enter address line 1', type: 'text', required: true },
    { name: 'customerAddress2', label: 'Address Line 2',placeholder: 'Enter address line 2', type: 'textarea', required: false },
    { name: 'customerAddress3', label: 'Address Line 3', placeholder: 'Enter address line 3', type: 'textarea', required: false },
    { name: 'customerLandmark', label: 'Landmark',placeholder: 'Enter landmark', type: 'text', required: false },
    { name: 'customerPincode', label: 'Pincode',placeholder: 'Enter pincode', type: 'number', required: false },
    { name: 'customerPan', label: 'PAN', type: 'text',placeholder: 'Enter PAN number', required: false },
    { name: 'customerTan', label: 'TAN', type: 'text',placeholder: 'Enter TAN number', required: false },
    { name: 'customerTin', label: 'TIN', type: 'text',placeholder: 'Enter TIN number', required: false },
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
        { label: 'Home', route: '/sddashbaord' },
        { label: 'Customer', route: '/salesdirector/customer' },
        { label: 'Edit Customer' }
      ];

      this.loadCustomerById(this.customerId);
    } else {
      this.isEditMode = false;
      this.headerTitle = 'Add New Customer';
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/sddashboard' },
        { label: 'Customer', route: '/salesdirector/customer' },
        { label: 'Add Customer' }
      ];
    }
  }

  /* ================= DROPDOWNS ================= */
  private loadDropdowns(): void {
    this.saledService.getCustomers().subscribe({
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
      error: err => console.error('Dropdown load error', err)
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
    this.saledService.getCustomers().subscribe({
      next: (customers: CustomerModel[]) => {
        const customer = customers.find(c => c.customerId === id);

        if (!customer) {
          alert('Customer not found');
          this.router.navigate(['/salesdirector/customer']);
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
        this.router.navigate(['/salesdirector/customer']);
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

      this.saledService.updateCustomer(this.customerId, updatePayload).subscribe({
        next: () => {
          alert('Customer updated successfully');
          this.router.navigate(['/salesdirector/customer']);
        },
        error: (err) => {
          console.error('Update failed:', err);
          alert('Update failed. Check console.');
        }
      });
    } 
    // ================= CREATE (UNCHANGED) =================
    else {
      this.saledService.createCustomer(payload).subscribe({
        next: () => {
          alert('Customer created successfully');
          this.router.navigate(['salesdirector/customer']);
        },
        error: (err) => {
          console.error('Create failed:', err);
          alert('Create failed. Check console.');
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/salesdirector/customer']);
  }
  // onCancel(): void {

  // const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

  // if (returnUrl) {
  //   this.router.navigateByUrl(returnUrl);
  // } else {
  //   this.router.navigate(['/admin/customer']);
  // }

}
