import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { CommonModule, Location } from '@angular/common';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Contactmodel } from '../../../../models/contactmodel';
import { Form } from '../../../../shared/form/form';
import { Adminservice } from '../../../../service/adminservice';
import { ToastService } from '../../../../service/toast.service';
 
@Component({
  selector: 'app-addcontact',
  imports: [Pageheader, Header, Sidebar, CommonModule, Form],
  templateUrl: './addcontact.html',
  styleUrl: './addcontact.css',
})
export class Addcontact implements OnInit {
 
  constructor(
    private adminService: Adminservice,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private location: Location
  ) { }
 
  /* ================= HEADER ================= */
  headerTitle = 'Add Contact';
  headerBreadcrumbs: Breadcrumb[] = [];
 
  /* ================= STATE ================= */
  isEditMode = false;
  contactId!: number;
  formInitialData: any = {};
 
  /* ================= FORM FIELDS ================= */
  contactFields: any[] = [
    { name: 'contactSalutation', label: 'Salutation', placeholder: 'Mr / Ms / Mrs', type: 'text', required: true },
    { name: 'contactFirstName', label: 'First Name', placeholder: 'Enter first name', type: 'text', required: true },
    { name: 'contactLastName', label: 'Last Name', placeholder: 'Enter last name', type: 'text', required: true },
 
    {
      name: 'specialityId',
      label: 'Speciality',
      type: 'select',
      placeholder: 'Select Speciality',
      required: true,
      options: [],
      searchable: true
    },
    {
      name: 'customerId',
      label: 'Customer',
      placeholder: 'Select Customer',
      type: 'select',
      required: true,
      options: [],
      searchable: true
    },
 
    { name: 'contactMobileNo', label: 'Mobile', placeholder: 'Enter mobile number', type: 'text', required: true },
    { name: 'contactTelephone', label: 'Telephone', placeholder: 'Enter telephone number (optional)', type: 'text' },
    { name: 'contactEmail', label: 'Email', placeholder: 'Enter email address', type: 'email', required: true },
    { name: 'contactFax', label: 'Fax', placeholder: 'Enter fax number (if any)', type: 'text' },
    { name: 'contactAddress1', label: 'Address 1', placeholder: 'Street / Building / Area', type: 'text', required: true },
    { name: 'contactAddress2', label: 'Address 2', placeholder: 'City / State / Landmark', type: 'text', required: true },
    // { name: 'contactPincode', label: 'Pincode', placeholder: 'Enter pin code', type: 'number' }
  ];
 
  /* ================= INIT ================= */
  ngOnInit() {

     this.loadSpecialities();
    this.loadCustomers();

  const contact = history.state.contact;

  if (contact) {
    this.isEditMode = true;
    this.contactId = contact.contactId;

    this.formInitialData = {
      contactSalutation: contact.contactSalutation,
      contactFirstName: contact.contactFirstName,
      contactLastName: contact.contactLastName,
      contactMobileNo: contact.contactMobileNo,
      contactTelephone: contact.contactTelephone,
      contactEmail: contact.contactEmail,
      contactFax: contact.contactFax,
      contactAddress1: contact.contactAddress1,
      contactAddress2: contact.contactAddress2,
      specialityId: contact.specialityId,
      customerId: contact.customerId
    };
  }

  setTimeout(() => {
  this.formInitialData = {
    ...this.formInitialData
  };
});

  this.buildBreadcrumbs(this.isEditMode);
}

  private buildBreadcrumbs(isEditMode: boolean): void {
    let homeRoute = '/dashboard';
    if (typeof window !== 'undefined' && window.localStorage) {
      const role = localStorage.getItem('role');
      if (role === 'SUPERADMIN') {
        homeRoute = '/superadmindashboard';
      } else if (role === 'Admin') {
        homeRoute = '/admindashboard';
      } else if (role === 'Regional Branch Head') {
        homeRoute = '/regional-branch-head-dashboard';
      } else if (role === 'Regional Sales Manager') {
        homeRoute = '/regional-sales-manager-dashboard';
      } else if (role === 'Country Head') {
        homeRoute = '/country-head';
      } else if (role === 'Sales Engineer' || role === 'SALES_MANAGER' || role === 'SALESMANAGER' || role === 'Sales Manager') {
        homeRoute = '/sales-manager-dashboard';
      } else if (role === 'ADMINMARKETING' || role === 'ADMIN MARKETING') {
        homeRoute = '/adminmarketingdashboard';
      }
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && (returnUrl.includes('leads') || returnUrl.includes('lead'))) {
      this.headerBreadcrumbs = [
        { label: 'Home', route: homeRoute },
        { label: 'Lead', route: returnUrl },
        { label: isEditMode ? 'Edit Contact' : 'Add Contact' }
      ];
    } else {
      this.headerBreadcrumbs = [
        { label: 'Home', route: homeRoute },
        { label: 'Contact', route: '/contact' },
        { label: isEditMode ? 'Edit Contact' : 'Add Contact' }
      ];
    }
  }

  /* ================= SAVE ================= */
  saveContact(data: any): void {
    console.log('SAVE DATA =>', data);
 
    const payload: any = {
      contactId: this.isEditMode ? this.contactId : 0,
      contactSalutation: data.contactSalutation,
      contactFirstName: data.contactFirstName,
      contactLastName: data.contactLastName,
      contactTelephone: data.contactTelephone ?? '',
      contactMobileNo: data.contactMobileNo,
      contactFax: data.contactFax ?? '',
      contactEmail: data.contactEmail ?? '',
      contactAddress1: data.contactAddress1 ?? '',
      contactAddress2: data.contactAddress2 ?? '',
      // contactPincode: data.contactPincode ?? null,
      specialityId: data.specialityId,
customerId: data.customerId,
      contactStatus: 1
    };

    console.log('SAVE PAYLOAD =>', payload);
 
    const apiCall = this.isEditMode
      ? this.adminService.updateContact(this.contactId, payload)
      : this.adminService.createContact(payload);
 
    apiCall.subscribe({
      next: () => {
         this.toastService.success(
    `Contact ${this.isEditMode ? 'updated' : 'created'} successfully`
  );
        this.navigateBackToList();
      },
      error: err => {
  console.error('STATUS =>', err.status);
  console.error('ERROR BODY =>', err.error);
  console.error('FULL ERROR =>', err);

  this.toastService.error(
    err?.error?.message || 'Failed to save contact'
  );
}
    });
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
        this.router.navigate(['/contact']);
      }
    }
  }

  onCancel(): void {
    this.navigateBackToList();
  }
 
  private loadSpecialities(): void {
    this.adminService.getSpecialityDropDown().subscribe(res => {
      console.log('SPECIALITIES =>', res);
 
      const list = Array.isArray(res) ? res : [res];
 
      const options = list.map((s: any) => ({
        label: s.specialityName,
        value: s.specialityId
      }));
      console.log('OPTIONS =>', options);
 
      const idx = this.contactFields.findIndex(f => f.name === 'specialityId');
 
      this.contactFields[idx] = {
        ...this.contactFields[idx],
        options
      };
 
      this.contactFields = [...this.contactFields];
    });
  }
 
  private loadCustomers(): void {
    this.adminService.getCustomerDropdown().subscribe(res => {
 
      const options = (Array.isArray(res) ? res : [res]).map(c => ({
        label: c.customerName,
        value: c.customerId
      }));
 
      const idx = this.contactFields.findIndex(f => f.name === 'customerId');
      this.contactFields[idx] = { ...this.contactFields[idx], options };
      this.contactFields = [...this.contactFields];
    });
  }
}
