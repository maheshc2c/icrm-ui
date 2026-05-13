import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Contactmodel } from '../../../../models/contactmodel';
import { Form } from '../../../../shared/form/form';
import { SalesDirectorService } from '../../../../service/sales-director.service';
 
@Component({
  selector: 'app-addcontact',
  imports: [Pageheader, Header, Sidebar, CommonModule, Form],
  templateUrl: './addcontact.html',
  styleUrl: './addcontact.css',
})
export class Addcontact implements OnInit {
 
  constructor(
    private salesDirService: SalesDirectorService,
    private route: ActivatedRoute,
    private router: Router
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
      name: 'specialityName',
      label: 'Speciality',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'customerName',
      label: 'Customer',
      type: 'select',
      required: true,
      options: []
    },
 
    { name: 'contactMobileNo', label: 'Mobile', placeholder: 'Enter mobile number', type: 'text', required: true },
    { name: 'contactTelephone', label: 'Telephone', placeholder: 'Enter telephone number (optional)', type: 'text' },
    { name: 'contactEmail', label: 'Email', placeholder: 'Enter email address', type: 'email' },
    { name: 'contactFax', label: 'Fax', placeholder: 'Enter fax number (if any)', type: 'text' },
    { name: 'contactAddress1', label: 'Address 1', placeholder: 'Street / Building / Area', type: 'text' },
    { name: 'contactAddress2', label: 'Address 2', placeholder: 'City / State / Landmark', type: 'text' },
    { name: 'contactPincode', label: 'Pincode', placeholder: 'Enter pin code', type: 'number' }
  ];
 
  /* ================= INIT ================= */
  ngOnInit(): void {
    this.loadSpecialities();
    this.loadCustomers();
 
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.contactId = +id;
      this.headerTitle = 'Edit Contact';
      this.loadContactById(this.contactId);
    }
 
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/sddashboard' },
      { label: 'Contact', route: '/salesdirector/addleads' },
      { label: this.isEditMode ? 'Edit Contact' : 'Add Contact' }
    ];
  }
 
  /* ================= LOAD CONTACT ================= */
  private loadContactById(id: number): void {
    this.salesDirService.getContactById(id).subscribe({
      next: contact => {
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
          contactPincode: contact.contactPincode,
 
          specialityName: contact.speciality?.specialityName,
          customerName: contact.customer?.customerName
        };
      },
      error: () => {
        alert('Contact not found');
        this.router.navigate(['/salesdirector/addleads']);
      }
    });
  }
 
  /* ================= SAVE ================= */
  saveContact(data: any): void {
 
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
      contactPincode: data.contactPincode ?? null,
      specialityName: data.specialityName ?? '',
      customerName: data.customerName ?? '',
      contactStatus: 1
    };
 
    const apiCall = this.isEditMode
      ? this.salesDirService.updateContact(this.contactId, payload)
      : this.salesDirService.createContact(payload);
 
    apiCall.subscribe({
      next: () => {
        alert(`Contact ${this.isEditMode ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/salesdirector/addleads']);
      },
      error: err => {
        console.error(err);
        alert('Save failed');
      }
    });
  }
 
  onCancel(): void {
    this.router.navigate(['/salesdirector/addleads']);
  }
 
  // onCancel(): void {
 
  //   const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
 
  //   if (returnUrl) {
  //     this.router.navigateByUrl(returnUrl);
  //   } else {
  //     this.router.navigate(['/salesdirector/addleads']);
  //   }
 
  // }
 
  /* ================= DROPDOWNS ================= */
  // private loadSpecialities(): void {
  //   this.salesDirService.getSpecialityDropDown().subscribe(res => {
  //     const options = (Array.isArray(res) ? res : [res]).map(s => ({
  //       label: s.specialityName,
  //       value: s.specialityId
  //     }));
 
  //     const idx = this.contactFields.findIndex(f => f.name === 'specialityId');
  //     this.contactFields[idx] = { ...this.contactFields[idx], options };
  //     this.contactFields = [...this.contactFields];
  //   });
  // }
  private loadSpecialities(): void {
    this.salesDirService.getSpecialities().subscribe(res => {
 
      const list = Array.isArray(res) ? res : [res];
 
      const options = list.map((s: any) => ({
        label: s.specialityName,
        value: s.specialityName
      }));
 
      const idx = this.contactFields.findIndex(f => f.name === 'specialityName');
 
      this.contactFields[idx] = {
        ...this.contactFields[idx],
        options
      };
 
      this.contactFields = [...this.contactFields];
    });
  }
 
  private loadCustomers(): void {
    this.salesDirService.getCustomerDropdown().subscribe(res => {
 
      const options = (Array.isArray(res) ? res : [res]).map(c => ({
        label: c.customerName,
        value: c.customerName
      }));
 
      const idx = this.contactFields.findIndex(f => f.name === 'customerName');
      this.contactFields[idx] = { ...this.contactFields[idx], options };
      this.contactFields = [...this.contactFields];
    });
  }
}