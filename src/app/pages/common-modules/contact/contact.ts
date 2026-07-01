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
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
import { CommonModule } from '@angular/common';

  @Component({
    selector: 'app-contact',
    imports: [Pageheader, Header, DataTable, Sidebar, CommonModule ],
    templateUrl: './contact.html',
    styleUrl: './contact.css',
  })
  export class Contact {

    constructor(
        private adminservice: Adminservice,
        private router: Router,
      private route: ActivatedRoute,
      private toastService: ToastService,
      private confirmService: ConfirmDialogService
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

        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.fullRows = response.content;
    

        this.rows = response.content.map((c: any, index: number) => ({

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
}));
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
  sortBy: 'contactId',
    sortOrder: 'DESC'
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

  this.confirmService.confirm({
    title: 'Confirm',
    message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this contact?`,
    confirmText: isActive ? 'Deactivate' : 'Activate'
  }).then((confirmed) => {

    if (!confirmed) {
      return;
    }

    this.adminservice.toggleContactStatus(row.contactId).subscribe({
      next: (updated: any) => {

        // If API returns updated object
        row.contactStatus = updated.contactStatus;

        // Or simply toggle locally
        // row.contactStatus = isActive ? 2 : 1;

        this.rows = [...this.rows];
        this.fullRows = [...this.fullRows];

        this.toastService.success(
          `Contact ${isActive ? 'deactivated' : 'activated'} successfully`
        );
      },

      error: (err: any) => {
        console.error('Status update failed', err);
        this.toastService.error('Failed to update status');
      }
    });

  });

}

onReset(): void {
  this.searchFilters = {};
  this.currentPage = 1;
  this.loadContact();
}

searchFilters: any = {};
currentFilters: any = {};


onImport() {

  const payload = {
    customerName: this.currentFilters?.customerName || '',
    specialityName: this.currentFilters?.specialityName || '',
    contactFirstName: this.currentFilters?.contactFirstName || '',
    pagination: {
      pageNumber: 0,
      pageSize: this.totalElements, 
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
    },
    error: err => {
      console.error('Download failed', err);
    }
  });
}

showUploadModal = false;
showFileModal = false;

selectedFile: File | null = null;


onUpload() {
  this.showUploadModal = true;
}
closeUploadModal() {
  this.showUploadModal = false;
}
downloadTemplate() {

  const link = document.createElement('a');

  link.href = 'assets/templates/Contact_Template.xlsx';

  link.download = 'Contact_Template.xlsx';

  link.click();
}
onFileSelected(event: any) {

  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const extension = file.name.split('.').pop()?.toLowerCase();

  if (
    extension !== 'xlsx' &&
    extension !== 'xls'
  ) {

    this.toastService.error(
      'Only Excel files are allowed'
    );

    event.target.value = '';
    this.selectedFile = null;
    return;
  }

  this.selectedFile = file;
}

closeFileModal() {

  this.showFileModal = false;
  this.selectedFile = null;

}

// uploadExcel() {

//   const input = document.createElement('input');

//   input.type = 'file';
//   input.accept = '.xlsx,.xls';

//   input.onchange = (event: any) => {

//     const file = event.target.files[0];

//     if (!file) {
//       return;
//     }
//     this.showUploadModal = false;
//   this.showFileModal = true;

//     this.showUploadModal = false;

//     this.adminservice.uploadContact(file).subscribe({
//       next: (response: string) => {

//   console.log(response);

//   if (response.includes('Row')) {

//     this.toastService.warning(
//       response,
//       15000
//     );
//   }

//   if (response.includes('Successfully')) {

//     this.toastService.success(
//       'Valid contacts uploaded successfully',
//       5000
//     );
//   }

//   this.loadContact();
// }
//     });
//   };

//   input.click();
// }
uploadExcel() {
  this.showUploadModal = false;
  this.showFileModal = true;
}

submitUpload() {

if (!this.selectedFile) {


this.toastService.warning(
  'Please select an Excel file'
);

return;


}

this.adminservice.uploadContact(this.selectedFile).subscribe({


next: (response: string) => {

  console.log('UPLOAD RESPONSE =>', response);

  if (response.includes('Row')) {

    this.toastService.warning(
      response,
      15000
    );
  }

  if (
    response.includes('Successfully') ||
    response.includes('Uploaded Successfully')
  ) {

    this.toastService.success(
      'Valid contacts uploaded successfully',
      5000
    );
  }

  this.showFileModal = false;
  this.selectedFile = null;

  this.loadContact();
},

error: (err: any) => {

  const errorMessage =
    typeof err.error === 'string'
      ? err.error
      : err?.error?.message ||
        err?.message ||
        'Upload failed';

  this.toastService.error(
    errorMessage,
    10000
  );
}


});
}


  }
