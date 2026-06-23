import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { CommonModule } from '@angular/common';
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
    private toastService: ToastService
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

  this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Contact', route: '/contact' },
      { label: this.isEditMode ? 'Edit Contact' : 'Add Contact' }
    ];
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
        this.router.navigate(['contact']);
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
 
  onCancel(): void {
    this.router.navigate(['/contact']);
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
