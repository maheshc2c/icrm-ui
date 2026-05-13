import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { Form } from '../../../../shared/form/form';
import { SearchFieldConfig } from '../../../../shared/search/search';

@Component({
  selector: 'app-so-entry-open',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader, DataTable, Form],
  templateUrl: './so-entry-open.html',
  styleUrl: './so-entry-open.css',
})
export class SoEntryOpen {

  headerTitle = 'SO Number Entry - Open';

  headerBreadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'SO Number Entry', route: '/customer-interaction-center/so-number-entry' },
  ];

  /* TABLE COLUMNS */
  columns = [
    { header: 'C-Note ID', field: 'cnoteId' },
    { header: 'C-Note Type', field: 'cnoteType' },
    { header: 'Customer Name', field: 'customerName' },
    { header: 'Sales Engineer', field: 'salesEngineer' },
    { header: 'C-Note Date', field: 'cnoteDate' },
    { header: 'Quote Ref ID', field: 'quoteRefId' },
    { header: 'SO Number', field: 'soNumber', editable: true },
    { header: 'CNote Info', field: 'cNoteInfo', type: 'download' }
  ];

  /* STATIC DATA */
  rows = [
    {
      cnoteId: 101,
      cnoteType: 'Regular',
      customerName: 'Miot Hospitals',
      salesEngineer: 'Ravi',
      cnoteDate: '2025-09-20',
      quoteRefId: 'Q123',
      soNumber: '',
      cNoteInfo: 'Download'
    },
    {
      cnoteId: 102,
      cnoteType: 'Purchase Order',
      customerName: 'Apollo Hospitals',
      salesEngineer: 'Kumar',
      cnoteDate: '2025-09-21',
      quoteRefId: 'Q124',
      soNumber: '',
      cNoteInfo: 'Download'
    }
  ];

  /* SEARCH FIELDS (STATIC) */
  searchFields: SearchFieldConfig[] = [
    { key: 'cnoteId', label: 'Cnote ID', type: 'text' },
    {
      key: 'cnoteType',
      label: 'C-Note Type',
      type: 'select',
      options: [
        { label: 'Regular', value: 'Regular' },
        { label: 'Purchase Order', value: 'Purchase Order' }
      ]
    },
    { key: 'customerName', label: 'Customer Name', type: 'text' }
  ];

  bulkUploadModalVisible = false;

  /* =========================
     EVENTS (UI ONLY)
  ========================== */

  onSearch(params?: any): void {
    console.log('Search params:', params);
  }

  onCellChange(evt: { row: any; field: string; value: any }) {
    if (evt.field === 'soNumber') {
      evt.row.soNumber = evt.value; // 🔥 local update only
      console.log('Updated locally:', evt.row);
    }
  }

  onUpload(): void {
    this.bulkUploadModalVisible = true;
  }

  submitBulkUpload(file: File): void {
    console.log('Uploaded file:', file.name);
    this.closeBulkUpload();
  }

  closeBulkUpload(): void {
    this.bulkUploadModalVisible = false;
  }

  onDownload(row: any): void {
    alert(`Downloading CNote for ID: ${row.cnoteId} (UI only)`);
  }

  onRefresh(): void {
    console.log('Refresh clicked');
  }

  onImport(): void {
    console.log('Import clicked');
  }

  onEdit(row: any): void {
    console.log('Edit row:', row);
  }

  onDelete(row: any): void {
    console.log('Delete row:', row);
  }
}