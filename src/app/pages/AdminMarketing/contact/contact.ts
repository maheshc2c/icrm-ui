import { Component } from '@angular/core';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { DataTable } from '../../../shared/data-table/data-table';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { adminMarketingservice } from '../../../service/adminmarketingservice';
import { DropdownOption } from '../../../models/assign-lead.model';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-contact',
  imports: [Pageheader, Header, DataTable, Sidebar, ],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {

  constructor(
      private adminMarketingservice: adminMarketingservice,
      private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
    ) {}

    headerTitle = 'Manage Contact List';
        
          headerBreadcrumbs: Breadcrumb[] = [
            { label: 'Home', route: '/adminmarketingdashboard' },
            { label: 'Contact', route: '/adminmarketing/contact' }
          ];

          // 🔹 Table Columns
    columns = [
  { header: 'Name', field: 'contactFirstName' },
  { header: 'Customer', field: 'contactLastName' },
  { header: 'Speciality', field: 'specialityName' },   // ✅ fixed
  { header: 'Email', field: 'contactEmail' },
  { header: 'Mobile', field: 'contactMobileNo' },
];

      rows: any[] = [];
  // allRows: any[] = []; // 🔹 master copy
  fullRows: any[] = [];   // ✅ full API data (for Excel)


  ngOnInit(): void {
    this.loadContact();
    this.loadCustomerDropdown();
    // this.loadLocations();
    this.loadSpecialities();
  }

//   private loadLocations(): void {
//   this.adminMarketingservice.getLocationCities().subscribe({
//     next: (locations: any[]) => {
//       console.log('📍 Locations loaded:', locations.length);

//       const options = locations.map(l => ({
//         label: l.locationName,
//         value: l.locationName
//       }));

//       const locationField = this.searchFields.find(f => f.key === 'locationName');
//       if (locationField) {
//         locationField.options = options;
//       }
//     },
//     error: (err) => {
//       console.error('Failed to load locations', err);
//     }
//   });
// }

private loadSpecialities(): void {
  this.adminMarketingservice.getSpecialities().subscribe({
    next: (res: any) => {
      // ✅ Handle paginated response (res.content) or direct array
      const list = Array.isArray(res) ? res : (res?.content || (res ? [res] : []));
      const activeSpecialities = list.filter((s: any) =>
        s.specialityStatus === 1 || s.isActive === true
      );

      const options = activeSpecialities.map((s: any) => ({
        label: s.specialityName,
        value: s.specialityName
      }));

      const field = this.searchFields.find(f => f.key === 'specialityName');
      if (field) {
        field.options = options;
      }
    },
    error: (err) => {
      console.error('Failed to load speciality dropdown', err);
    }
  });
}


  // ✅ LIST API ONLY
private loadContact(): void {
  this.adminMarketingservice.getContact().subscribe({
    next: (response: any) => {
      const contactlist = Array.isArray(response) ? response : [response];

      this.fullRows = contactlist;

      this.rows = contactlist.map((c, index) => ({
        sno: index + 1,
        contactId: c.contactId,
        contactFirstName: c.contactFirstName,
        contactLastName: c.contactLastName,
        specialityName: c.speciality?.specialityName ?? '',
        contactEmail: c.contactEmail,
        contactMobileNo: c.contactMobileNo,
      }));
    },
    error: (err) => {
      console.error('Contact API failed', err);
    }
  });
}

onAdd() {
    this.router.navigate(['/adminmarketing/contact/add']);
  }


  //search Functionality
        searchFields: SearchFieldConfig[] = [
          {
            key: 'contactFirstName',
            label: 'First Name',
            placeholder: 'Name',
            type: 'text'   // ✅ now TypeScript knows this is literal
          },
          {
    key: 'customerName',
    label: 'Customer',
    placeholder: 'Select Customer',
    type: 'select',
    options: []
  },   
          {
    key: 'specialityName',
    label: 'Speciality',
    placeholder: 'Select Speciality',
    type: 'select',
    options: []    // ✅ will be filled dynamically
  },
  {
            key: 'contactMobileNo',
            label: 'Mobile',
            placeholder: 'Enter Mobile Number',
            type: 'text'   // ✅ now TypeScript knows this is literal
          },
  //          {
  //   key: 'locationName',
  //   label: 'Location',
  //   placeholder: 'Select Location',
  //   type: 'select',
  //   options: []   // 👈 dynamically filled
  // }
        ];

       private loadCustomerDropdown(): void {
  this.adminMarketingservice.getCustomerDropdown().subscribe({
    next: (options: DropdownOption[]) => {
      const field = this.searchFields.find(f => f.key === 'customerName');
      if (field) {
        field.options = options;
      }
    },
    error: (err: any) => {
      console.error('Failed to load customer dropdown', err);
    }
  });
}


  onSearch(data: { keyword: string; filters: any }) {
  const keyword = data.keyword;
  const filters = data.filters;
  const specialityValue = filters?.specialityName;
  const customerValue = filters?.customerName;

  if ((!keyword || keyword.trim() === '') && !specialityValue && !customerValue) {
    this.loadContact();
    return;
  }

  let filtered = this.fullRows;

  if (keyword && keyword.trim() !== '') {
    const lower = keyword.toLowerCase();
    filtered = filtered.filter(c =>
      c.contactFirstName?.toLowerCase().includes(lower) ||
      c.contactLastName?.toLowerCase().includes(lower) ||
      c.speciality?.specialityName?.toLowerCase().includes(lower) ||
      c.contactMobileNo?.toLowerCase().includes(lower)
    );
  }

  if (specialityValue) {
    filtered = filtered.filter(c =>
      c.speciality?.specialityName === specialityValue
    );
  }

  if (customerValue) {
    filtered = filtered.filter(c =>
      c.contactLastName === customerValue
    );
  }

  this.rows = filtered.map((c, index) => ({
    sno: index + 1,
    contactId: c.contactId,
    contactFirstName: c.contactFirstName,
    contactLastName: c.contactLastName,
    specialityName: c.speciality?.specialityName ?? '',
    contactEmail: c.contactEmail,
    contactMobileNo: c.contactMobileNo,
  }));
}


onSearchChange(values: any) {
  const specialityValue = values?.specialityName;
  const customerValue = values?.customerName;

  if (!specialityValue && !customerValue) {
    this.loadContact();
    return;
  }

  let filtered = this.fullRows;

  if (specialityValue) {
    filtered = filtered.filter(c =>
      c.speciality?.specialityName === specialityValue
    );
  }

  if (customerValue) {
    filtered = filtered.filter(c =>
      c.contactLastName === customerValue
    );
  }

  this.rows = filtered.map((c, index) => ({
    sno: index + 1,
    contactId: c.contactId,
    contactFirstName: c.contactFirstName,
    contactLastName: c.contactLastName,
    specialityName: c.speciality?.specialityName ?? '',
    contactEmail: c.contactEmail,
    contactMobileNo: c.contactMobileNo,
  }));
}


onEdit(row: any) {
  const id = row?.contactId;
  console.log('EDIT CLICKED ID =>', id);   // 👈 ADD THIS

  if (!id) {
    this.toastService.error('Contact ID missing');
    return;
  }

  this.router.navigate(['/adminmarketing/contact/edit', id]);
}
isEditMode = false;
companyId!: number

  onDelete(row: any) {
    this.toastService.confirm(
      `Are you sure you want to delete contact "${row.contactFirstName} ${row.contactLastName}"?`,
      () => {
        // Simulating delete
        this.toastService.success('Contact deleted successfully');
        // this.adminMarketingservice.deleteContact(row.contactId).subscribe(...)
      }
    );
  }


  //Download

 onImport() {

  if (!this.fullRows || this.fullRows.length === 0) {
    this.toastService.warning('No data available to download');
    return;
  }

  this.adminMarketingservice.downloadContact(this.fullRows).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Contact.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Download failed:', err);
      this.toastService.error(`Download failed: ${err.status}`);
    }
  });
}



}
