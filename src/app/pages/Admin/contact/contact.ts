  import { Component } from '@angular/core';
  import { Pageheader } from '../../../shared/pageheader/pageheader';
  import { Header } from '../../../layout/header/header';
  import { DataTable } from '../../../shared/data-table/data-table';
  import { Sidebar } from '../../../layout/sidebar/sidebar';
  import { Adminservice } from '../../../service/adminservice';
  import { ActivatedRoute, Router } from '@angular/router';
  import { Breadcrumb } from '../../../models/breadcrumb';
  import { SearchFieldConfig } from '../../../shared/search/search';
import { ToastService } from '../../../service/toast.service';

  @Component({
    selector: 'app-contact',
    imports: [Pageheader, Header, DataTable, Sidebar, ],
    templateUrl: './contact.html',
    styleUrl: './contact.css',
  })
  export class Contact {

    constructor(
        private adminservice: Adminservice,
        private router: Router,
      private route: ActivatedRoute,
      private toastService: ToastService
      ) {}

      headerTitle = 'Manage Contact List';
          
            headerBreadcrumbs: Breadcrumb[] = [
              { label: 'Home', route: '/admindashboard' },
              { label: 'Contact', route: '/contact' }
            ];

            // 🔹 Table Columns
      columns = [
    { header: 'Name', field: 'contactFirstName' },
    { header: 'Customer', field: 'customerName' },
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


  private loadSpecialities(): void {
    // this.adminservice.getSpecialities().subscribe({
    this.adminservice.getSpecialityDropDown().subscribe({
      next: (list: any[]) => {
        console.log('🩺 Active specialities loaded:', list.length);
      

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


currentPage = 1;
pageSize = 10;
totalElements = 0;
totalPages = 1;

private loadContact(): void {

  

  this.adminservice
    .getContactsPaged(
      null,
      null,
      null,
      this.currentPage - 1,
      this.pageSize
    )
    .subscribe({

      next: (response: any) => {

        console.log('API RESPONSE FOR CONTACTS:', response.content);
        
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.fullRows = response.content;
    

        this.rows = response.content.map((c: any, index: number) => {
          console.log('Contact row:', c);
          return {

  sno: ((this.currentPage - 1) * this.pageSize) + index + 1,

  contactId: c.contactId,

  // displayed
  contactFirstName: c.contactFirstName,
  customerName: c.customer?.customerName ?? '',
  specialityName: c.speciality?.specialityName ?? '',
  contactEmail: c.contactEmail,
  contactMobileNo: c.contactMobileNo,

  // hidden for edit
  contactSalutation: c.contactSalutation,
  contactLastName: c.contactLastName,
  contactTelephone: c.contactTelephone,
  contactFax: c.contactFax,
  contactAddress1: c.contactAddress1,
  contactAddress2: c.contactAddress2,
  contactStatus: c.contactStatus,

  customerId: c.customer?.customerId,
  specialityId: c.speciality?.specialityId
};
        });
      },

      error: err => console.error(err)
    });
}
onPageChange(page: number): void {
  this.currentPage = page;
  this.loadContact();
}

onPageSizeChange(size: number): void {
  this.pageSize = size;
  this.currentPage = 1;
  this.loadContact();
}



  onAdd() {
      this.router.navigate(['/contact/add']);
    }


    //search Functionality
          searchFields: SearchFieldConfig[] = [
            {
              key: 'contactFirstName',
              label: 'Contact',
              placeholder: 'Name',
              type: 'text'   
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
    }
          ];

        private loadCustomerDropdown(): void {
    this.adminservice.getCustomerDropdown().subscribe({
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


onSearch(filters: any) {
  this.currentFilters = filters;
  console.log('TYPE =>', typeof filters);
  console.log('VALUE =>', filters);

  console.log('SEARCH FILTERS =>', filters);

  const payload = {
    customerName: filters?.customerName || null,
    specialityName: filters?.specialityName || null,
    contactFirstName: filters?.contactFirstName || null,
    pagination: {
  pageNumber: this.currentPage - 1,
  pageSize: this.pageSize,
  sortBy: 'contactFirstName',
  sortOrder: 'ASC'
}
  };

  this.adminservice.searchContacts(payload).subscribe({

    next: (response: any) => {
      this.totalElements = response.totalElements;
      this.totalPages = response.totalPages;

      const contacts = response.content || [];

      this.rows = contacts.map((c: any, index: number) => ({
        sno: index + 1,

        contactId: c.contactId,
        contactFirstName: c.contactFirstName,
        customerName: c.customer?.customerName ?? '',
        specialityName: c.speciality?.specialityName ?? '',
        contactEmail: c.contactEmail,
        contactMobileNo: c.contactMobileNo,

        contactSalutation: c.contactSalutation,
        contactLastName: c.contactLastName,
        contactTelephone: c.contactTelephone,
        contactFax: c.contactFax,
        contactAddress1: c.contactAddress1,
        contactAddress2: c.contactAddress2,
        contactStatus: c.contactStatus,

        customerId: c.customer?.customerId,
        specialityId: c.speciality?.specialityId
      }));
    },

    error: err => {
      console.error('Search API failed', err);
      this.rows = [];
    }
  });
}


onEdit(row: any) {
  this.router.navigate(
    ['/contact/edit', row.contactId],
    {
      state: { contact: row }
    }
  );
}

 
  isEditMode = false;
  companyId!: number


    //actiavte and deactivate
  onDelete(row: any) {

  const isActive = row.contactStatus === 1;

  const apiCall = this.adminservice.toggleContactStatus(
  row.contactId
);

  apiCall.subscribe({
  next: (updated: any) => {
    row.contactStatus = updated.contactStatus;
    this.rows = [...this.rows];
    this.toastService.success(
          `Contact ${isActive ? 'deactivated' : 'activated'} successfully`
        );
  },
  error: (err) => {
          console.error('Status update failed', err);
          this.toastService.error('Failed to update status');
        }
});
}



searchFilters: any = {};
currentFilters: any = {};

onImport() {

  console.log('CURRENT PAGE SIZE =>', this.pageSize);
console.log('TOTAL ELEMENTS =>', this.totalElements);

  const payload = {
  customerName: this.currentFilters?.customerName || '',
  specialityName: this.currentFilters?.specialityName || '',
  contactFirstName: this.currentFilters?.contactFirstName || '',
  pagination: {
    pageNumber: this.currentPage - 1,
    pageSize: this.pageSize,
    sortBy: 'contactFirstName',
    sortOrder: 'ASC'
  }
};

  console.log('DOWNLOAD PAYLOAD =>', payload);

  this.adminservice.downloadContact(payload).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'Contacts.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    }
  });
}



  }
