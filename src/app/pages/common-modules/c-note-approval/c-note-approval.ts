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
  { header: 'Current Stage', field: 'currentStage' }
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

searchContractNotes() {

  const payload = {

    contractNoteId: this.searchModel.contractNoteId,

    cnoteType: this.searchModel.cnoteType,

    customerName: this.searchModel.customerName,

    pagination: {

      pageNumber: this.currentPage,

      pageSize: this.pageSize,

      sortBy: 'contractNoteId',

      sortOrder: 'DESC'
    }
  };

  this.cnoteservice.searchContractNoteApproval(payload)
      .subscribe({

        next: (res: any) => {

          this.rows = res.data;

          this.fullRows = res.data;

          this.totalElements = res.totalElements;

          this.totalPages = res.totalPages;

        },

        error: err => {

          console.error(err);

        }

      });

}




  onView(row: any): void {
    this.router.navigate([
      '/admin/c-note/view',
      row.cNoteId
    ]);
  }
onEdit(row: any): void {

  console.log("Edit Clicked", row);

  this.selectedContractNote = row;
  this.remarks = '';
  this.showApprovalPopup = true;

  console.log(this.showApprovalPopup);

}


closePopup() {

  this.showApprovalPopup = false;

  this.selectedContractNote = null;

  this.remarks = '';

}
approveContractNote(row: any) {

  const payload = {

    contractNoteId: row.contractNoteIdInternal,

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
rejectContractNote(row: any) {

  const payload = {

    contractNoteId: row.contractNoteIdInternal,

    action: 'REJECT',

    remarks: ''

  };

  this.cnoteservice.contractNoteAction(payload)
      .subscribe(() => this.searchContractNotes());

}

onSearch(search: any) {

  this.searchModel = {
  contractNoteId: search.cNoteId,
  cnoteType: search.cnoteType,
  customerName: search.customerName
};

  this.currentPage = 0;

  this.searchContractNotes();

}  

  onReset() {

  this.searchModel = {

    contractNoteId: null,

    cnoteType: null,

    customerName: ''

  };

  this.currentPage = 0;

  this.searchContractNotes();

}

showApprovalPopup = false;

selectedContractNote: any = null;

remarks = '';

}
