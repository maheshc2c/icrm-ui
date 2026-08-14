import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { FormsModule } from '@angular/forms';
import { CNoteApprovalService } from './CnoteApprovalService';
import { CustomerInteractionCenterService } from '../../../service/customer-interaction-center.service';


@Component({
  selector: 'app-c-note-approval',
  standalone: true, 
  imports: [CommonModule, FormsModule,
    Sidebar,
    Pageheader,
    DataTable, Header],
  templateUrl: './c-note-approval.html',
  styleUrl: './c-note-approval.css',
})
export class CNoteApproval {

   constructor(
    private cnoteservice: CNoteApprovalService,
    private cicService: CustomerInteractionCenterService,
    private router: Router
  ) {}

  headerTitle = 'Manage C Notes';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'C Notes', route: '/admin/c-note' }
  ];

  columns = [
  { header: 'C Note ID', field: 'contractNoteId' },
  { header: 'C-Note Type', field: 'cnoteType' },
  { header: 'Customer Name', field: 'customerName' },
  { header: 'Created On', field: 'createdOn' },
  { header: 'PO Number', field: 'poNumber' },
  { header: 'PO Date', field: 'poDate' },
  { header: 'Current Stage', field: 'currentStage' },
 { header: 'CNote Info', field: 'cNoteInfo', type: 'icon', icon: 'fas fa-cloud-download', title: 'Download' }
];

  rows: any[] = [];
  fullRows: any[] = [];

  searchFields: SearchFieldConfig[] = [
  {
  key: 'contractNoteId',
  label: 'C-Note ID',
  placeholder: 'Enter C-Note ID',
  type: 'text'
},
 {
  key: 'cnoteType',
  label: 'C-Note Type',
  type: 'select',
  options: [
    {
      label: 'Regular',
      value: 'REGULAR'
    },
    {
      label: 'Purchase Order',
      value: 'PURCHASE_ORDER'
    }
  ]
},
  {
    key: 'customerName',
    label: 'Customer Name',
    placeholder: 'Enter Customer Name',
    type: 'text'
  }
];

searchModel = {
  contractNoteId: null,
  cnoteType: null,
  customerName: ''
};

currentPage = 0;
pageSize = 10;
totalPages = 0;
totalElements = 0;

ngOnInit(): void {
  this.searchContractNotes();
}





  onView(row: any): void {
    this.router.navigate([
      '/admin/c-note/view',
      row.contractNoteId
    ]);
  }
onEdit(row: any): void {

  console.log("Edit Clicked", row);

  this.selectedContractNote = row;
  this.remarks = '';
  this.showApprovalPopup = true;

  console.log(this.showApprovalPopup);

}
searchContractNotes(): void {

  const payload = {
    contractNoteId: this.searchModel.contractNoteId,
    cnoteType: this.searchModel.cnoteType,
    customerName: this.searchModel.customerName,
    pagination: {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      sortBy: '',
      sortOrder: 'DESC'
    }
  };

  console.log('Payload', payload);

  this.cnoteservice.searchContractNoteApproval(payload).subscribe({

    next: (response) => {

      console.log('Response', response);

      if (response?.status) {

        this.rows = response.data || [];

        this.rows = (response.data || []).map((item: any) => ({
  ...item,
  cnoteId: item.contractNoteId ?? item.cnoteId
}));
this.fullRows = [...this.rows];

        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;

      } else {

        this.rows = [];
        this.fullRows = [];

      }

    },

    error: (err) => {

      console.error(err);

      this.rows = [];
      this.fullRows = [];

    }

  });

}

closePopup() {

  this.showApprovalPopup = false;

  this.selectedContractNote = null;

  this.remarks = '';

}
approveContractNote(row: any) {

  const payload = {

    contractNoteId: row.contractNoteId,

    action: 'APPROVE',

    remarks: ''

  };

  this.cnoteservice.contractNoteAction(payload)
      .subscribe({

        next: () => {

          this.searchContractNotes();

        },

        error: err => console.error(err)

      });

}
// rejectContractNote(row: any) {

//   const payload = {

//     contractNoteId: row.contractNoteIdInternal,

//     action: 'REJECT',

//     remarks: ''

//   };

//   this.cnoteservice.contractNoteAction(payload)
//       .subscribe(() => this.searchContractNotes());

// }

onSearch(searchValues: any): void {

  console.log("Search Values:", searchValues);

  this.searchModel.contractNoteId = searchValues?.contractNoteId ?? null;
  this.searchModel.cnoteType = searchValues?.cnoteType ?? null;
  this.searchModel.customerName = searchValues?.customerName ?? '';

  this.currentPage = 0;

  this.searchContractNotes();
}

showApprovalPopup = false;

selectedContractNote: any = null;

remarks = '';


onReset(): void {

  this.searchModel = {
    contractNoteId: null,
    cnoteType: null,
    customerName: ''
  };

  this.currentPage = 0;

  this.searchContractNotes();

}


//download

onDownloadRow(row: any) {
  const id = row.contractNoteId;

  if (!id) {
    console.error("Contract Note Id not found", row);
    return;
  }

  this.downloadContractNote(id);

  this.cicService.downloadContractNotePdf(parseInt(row.cnoteId)).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract_note_${row.cnoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    error: err => console.error(err)
  });
}

downloadContractNote(cnoteId: number): void {

  this.cicService.downloadContractNotePdf(cnoteId).subscribe({

    next: (blob: Blob) => {

      const file = new Blob([blob], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(file);

      const link = document.createElement('a');

      link.href = url;
      link.download = `Contract_Note_${cnoteId}.pdf`;

      link.click();

      window.URL.revokeObjectURL(url);

    },

    error: (err) => {
      console.error('Download failed', err);
    }

  });

}


onPageChange(page: number): void {

  this.currentPage = page - 1;   // backend uses 0-based page numbering

  this.searchContractNotes();

}

onPageSizeChange(size: number): void {

  this.pageSize = size;

  this.currentPage = 0;

  this.searchContractNotes();

}

}
