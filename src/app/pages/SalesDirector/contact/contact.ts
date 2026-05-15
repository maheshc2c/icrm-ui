import { Component } from '@angular/core';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { DataTable } from '../../../shared/data-table/data-table';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { SalesDirectorService } from '../../../service/sales-director.service';

@Component({
  selector: 'app-contact',
  imports: [Pageheader, Header, DataTable, Sidebar, ],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {

  constructor(
      private salesdirectorservice: SalesDirectorService,
      private router: Router,
    private route: ActivatedRoute
    ) {}

    headerTitle = 'Manage Contact List';
        
          headerBreadcrumbs: Breadcrumb[] = [
            { label: 'Home', route: '/sddashboard' },
            { label: 'Contact', route: '/salesdirector/contact' }
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
//   this.salesdirectorservice.getLocationCities().subscribe({
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
  this.salesdirectorservice.getSpecialities().subscribe({
    next: (list: any[]) => {
      console.log('🩺 Specialities loaded:', list.length);

      const options = list.map(s => ({
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
  this.salesdirectorservice.getContact().subscribe({
    next: (response: any) => {

      console.log('RAW API RESPONSE =>', response);

      // ✅ Force convert to array
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

      console.log('TABLE ROWS =>', this.rows);
    },
    error: (err) => {
      console.error('Contact API failed', err);
    }
  });
}

onAdd() {
    this.router.navigate(['salesdirector/contact/add']);
  }


  //search Functionality
        searchFields: SearchFieldConfig[] = [
          // {
          //   key: 'contactFirstName',
          //   label: 'First Name',
          //   placeholder: 'Name',
          //   type: 'text'   // ✅ now TypeScript knows this is literal
          // },
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
            label: 'Contact',
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
  this.salesdirectorservice.getCustomerDropdown().subscribe({
    next: (response: any) => {

      console.log('👤 Customer dropdown raw =>', response);

      // ✅ Normalize to array
      const list = Array.isArray(response) ? response : [response];

      // ✅ Build dropdown options
      const options = list
        .filter(c => !!c.customerName)
        .map(c => ({
          label: c.customerName,
          value: c.customerName
        }));

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


  onSearch(keyword: string) {

  if (!keyword || keyword.trim() === '') {
    this.loadContact();
    return;
  }

  const lower = keyword.toLowerCase();

  // ✅ Existing local filter (unchanged)
  const filtered = this.fullRows.filter(c =>
    c.contactFirstName?.toLowerCase().includes(lower) ||
    c.contactLastName?.toLowerCase().includes(lower) ||
    c.speciality?.specialityName?.toLowerCase().includes(lower) ||

    // ✅ ADD: mobile number search
    c.contactMobileNo?.toLowerCase().includes(lower)
  );

  // ✅ If local results found → keep same behavior
  if (filtered.length > 0) {
    this.rows = filtered.map((c, index) => ({
      sno: index + 1,
      contactId: c.contactId,
      contactFirstName: c.contactFirstName,
      contactLastName: c.contactLastName,
      specialityName: c.speciality?.specialityName ?? '',
      contactEmail: c.contactEmail,
      contactMobileNo: c.contactMobileNo,
    }));
    return;
  }

  // ✅ ADD: fallback to backend search if no local match
  this.salesdirectorservice.searchContactByNumber(keyword.trim()).subscribe({
    next: (results: any[]) => {

      const list = Array.isArray(results) ? results : [];

      this.rows = list.map((c, index) => ({
        sno: index + 1,
        contactId: c.contactId,
        contactFirstName: c.contactFirstName,
        contactLastName: c.contactLastName,
        specialityName: c.speciality?.specialityName ?? '',
        contactEmail: c.contactEmail,
        contactMobileNo: c.contactMobileNo,
      }));
    },
    error: err => {
      console.error('Search API failed', err);
      this.rows = [];   // ✅ show "No records found"
    }
  });
}


onEdit(row: any) {
  const id = row?.contactId;
  console.log('EDIT CLICKED ID =>', id);   // 👈 ADD THIS

  if (!id) {
    alert('Contact ID missing');
    return;
  }

  this.router.navigate(['/salesdirector/contact/edit', id]);
}
isEditMode = false;
companyId!: number

  onDelete(row: any) {
    console.log('Delete row:', row);
  }


  //Download

 onImport() {

  if (!this.fullRows || this.fullRows.length === 0) {
    alert('No data available to download');
    return;
  }

  this.salesdirectorservice.downloadContact(this.fullRows).subscribe({
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
      alert(`Download failed: ${err.status}`);
    }
  });
}



}
