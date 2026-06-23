import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Router } from '@angular/router';
import { Adminservice } from '../../../service/adminservice';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-c-note-approval',
  standalone: true, 
  imports: [CommonModule,
    Header,
    Sidebar,
    Pageheader,
    DataTable],
  templateUrl: './c-note-approval.html',
  styleUrl: './c-note-approval.css',
})
export class CNoteApproval {

   constructor(
    private adminservice: Adminservice,
    private router: Router
  ) {}

  headerTitle = 'Manage C Notes';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'C Notes', route: '/admin/c-note' }
  ];

  columns = [
    { header: 'C Note ID', field: 'cNoteId' },
    { header: 'C-Note Type', field: 'cNoteType' },
    { header: 'Customer Name', field: 'customerName' },
    { header: 'Created On', field: 'createdOn' },
    { header: 'PO Number', field: 'poNumber' },
    { header: 'PO Date', field: 'poDate' }
  ];

  rows: any[] = [];
  fullRows: any[] = [];

  searchFields: SearchFieldConfig[] = [
  {
    key: 'cNoteId',
    label: 'C-Note ID',
    placeholder: 'Enter C-Note ID',
    type: 'text'
  },
  {
    key: 'cNoteType',
    label: 'C-Note Type',
    placeholder: 'Enter C-Note Type',
    type: 'text'
  },
  {
    key: 'customerName',
    label: 'Customer Name',
    placeholder: 'Enter Customer Name',
    type: 'text'
  }
];




  onView(row: any): void {
    this.router.navigate([
      '/admin/c-note/view',
      row.cNoteId
    ]);
  }

  onEdit(row: any): void {
    this.router.navigate([
      '/admin/c-note/edit',
      row.cNoteId
    ]);
  }

  onSearch(){

  };

  onReset(){
    
  }

}
