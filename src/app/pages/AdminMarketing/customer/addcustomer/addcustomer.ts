import { Component, OnInit } from '@angular/core';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { CommonModule } from '@angular/common';
import { Form } from '../../../../shared/form/form';
import { adminMarketingservice } from '../../../../service/adminmarketingservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { CustomerModel } from '../../../../models/customer-model';
import { ToastService } from '../../../../service/toast.service';

@Component({
  selector: 'app-adminmarketing-addcustomer',
  standalone: true,
  imports: [Header, Sidebar, Pageheader, CommonModule, Form],
  templateUrl: './addcustomer.html',
  styleUrl: './addcustomer.css',
})
export class Addcustomer implements OnInit {

  constructor(
    private adminMarketingService: adminMarketingservice,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
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
    { 
      name: 'customerName', 
      label: 'Customer Name', 
      type: 'text', 
      required: true, 
      placeholder: 'Enter customer name' 
    },
    { 
      name: 'customerCode', 
      label: 'Customer Code', 
      type: 'text', 
      required: false, 
      placeholder: 'Enter customer Code' 
    },
    { 
      name: 'customerSalutation', 
      label: 'Salutation', 
      type: 'text', 
      required: false, 
      placeholder: 'salutation' 
    },
    { 
      name: 'customerDepartment', 
      label: 'Department', 
      type: 'text', 
      required: false, 
      placeholder: 'Department' 
    },
    {
      name: 'customerCategory',
      label: 'Category',
      type: 'select',
      required: false,
      options: [],
      placeholder: 'Select Category',
      searchable: true
    },
    {
      name: 'subCategory',
      label: 'Sub Category',
      type: 'select',
      required: false,
      options: [],
      placeholder: 'Select Sub Category',
      searchable: true
    },
    { 
      name: 'customerEmail', 
      label: 'Email', 
      type: 'email', 
      required: true, 
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$',
      placeholder: 'Enter email address' 
    },
    { 
      name: 'customerTelephone', 
      label: 'Telephone', 
      type: 'text', 
      required: false, 
      placeholder: 'Telephone' 
    },
    { 
      name: 'customerFax', 
      label: 'Fax', 
      type: 'text', 
      required: false, 
      placeholder: 'Fax' 
    },
    { 
      name: 'customerMobile', 
      label: 'Mobile', 
      type: 'text', 
      required: true, 
      pattern: '^[0-9]{10}$',
      placeholder: '91-9327091457' 
    },
    { 
      name: 'customerWebsite', 
      label: 'Website', 
      type: 'text', 
      required: false, 
      placeholder: 'www.example.com' 
    },
    {
      name: 'locations',
      label: 'City',
      type: 'select',
      required: true,
      options: [],
      searchable: true,
      placeholder: 'Select City'
    },
    { 
      name: 'customerAddress1', 
      label: 'Address Line 1', 
      type: 'textarea', 
      required: true, 
      placeholder: 'Street / Building' 
    },
    { 
      name: 'customerAddress2', 
      label: 'Address Line 2', 
      type: 'textarea', 
      required: false, 
      placeholder: 'Area / Landmark' 
    },
    { 
      name: 'customerAddress3', 
      label: 'Address Line 3', 
      type: 'textarea', 
      required: false, 
      placeholder: 'Additional details' 
    },
    { 
      name: 'customerLandmark', 
      label: 'Landmark', 
      type: 'text', 
      required: false, 
      placeholder: 'Landmark' 
    },
    { 
      name: 'customerPincode', 
      label: 'Pincode', 
      type: 'number', 
      required: false, 
      placeholder: 'Pincode' 
    },
    { 
      name: 'customerPan', 
      label: 'PAN', 
      type: 'text', 
      required: false, 
      placeholder: 'PAN Number' 
    },
    { 
      name: 'customerTan', 
      label: 'TAN', 
      type: 'text', 
      required: false, 
      placeholder: 'TAN Number' 
    },
    { 
      name: 'customerTin', 
      label: 'TIN', 
      type: 'text', 
      required: false, 
      placeholder: 'TIN Number' 
    },
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
        { label: 'Home', route: '/adminmarketingdashboard' },
        { label: 'Customer', route: '/adminmarketing/customer' },
        { label: 'Edit Customer' }
      ];

      this.loadCustomerById(this.customerId);
    } else {
      this.isEditMode = false;
      this.headerTitle = 'Add New Customer';
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/adminmarketingdashboard' },
        { label: 'Customer', route: '/adminmarketing/customer' },
        { label: 'Add Customer' }
      ];
    }
  }

  /* ================= DROPDOWNS ================= */
  private loadDropdowns(): void {
    this.adminMarketingService.getCustomers().subscribe({
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
    this.adminMarketingService.getCustomers().subscribe({
      next: (customers: CustomerModel[]) => {
        const customer = customers.find(c => c.customerId === id);

        if (!customer) {
          this.toastService.error('Customer not found');
          this.router.navigate(['/adminmarketing/customer']);
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
        this.toastService.error('Failed to load customer');
        this.router.navigate(['/adminmarketing/customer']);
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

      this.adminMarketingService.updateCustomer(this.customerId, updatePayload).subscribe({
        next: () => {
          this.toastService.success('Customer updated successfully');
          this.router.navigate(['/adminmarketing/customer']);
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.toastService.error('Update failed. Check console.');
        }
      });
    } 
    // ================= CREATE (UNCHANGED) =================
    else {
      this.adminMarketingService.createCustomer(payload).subscribe({
        next: () => {
          this.toastService.success('Customer created successfully');
          this.router.navigate(['/adminmarketing/customer']);
        },
        error: (err) => {
          console.error('Create failed:', err);
          this.toastService.error('Create failed. Check console.');
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
    this.router.navigate(['/adminmarketing/customer']);
  }

}
}
