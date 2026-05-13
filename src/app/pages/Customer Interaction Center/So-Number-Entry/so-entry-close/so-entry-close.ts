import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../../shared/search/search';

@Component({
  selector: 'app-so-entry-close',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './so-entry-close.html',
  styleUrl: './so-entry-close.css',
})
export class SoEntryClose {

  headerTitle = 'So Entry Close';

  headerBreadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'SO Entry Close', route: '/customer-interaction-center/so-number-entry/closed' },
  ];

  /* TABLE COLUMNS */
  columns = [
    { header: 'C-Note ID', field: 'cnoteId' },
    { header: 'C-Note Type', field: 'cnoteType' },
    { header: 'Customer Name', field: 'customerName' },
    { header: 'Sales Engineer', field: 'salesEngineer' },
    { header: 'C-Note Date', field: 'cnoteDate' },
    { header: 'Quote Ref ID', field: 'quoteRefId' },
    { header: 'SO Number', field: 'soNumber' },
    { header: 'CNote Info', field: 'cNoteInfo' }
  ];

  /* STATIC DATA */
  rows = [
    {
      cnoteId: 201,
      cnoteType: 'Regular',
      customerName: 'Miot Hospitals',
      salesEngineer: 'Ravi',
      cnoteDate: '2025-09-15',
      quoteRefId: 'Q201',
      soNumber: 'SO123',
      cNoteInfo: 'Download'
    },
    {
      cnoteId: 202,
      cnoteType: 'Purchase Order',
      customerName: 'Apollo Hospitals',
      salesEngineer: 'Kumar',
      cnoteDate: '2025-09-16',
      quoteRefId: 'Q202',
      soNumber: 'SO124',
      cNoteInfo: 'Download'
    }
  ];

  /* SEARCH FIELDS */
  searchFields: SearchFieldConfig[] = [
    { key: 'cnoteId', label: 'Cnote ID', placeholder: 'Cnote ID', type: 'text' },
    {
      key: 'cnoteType',
      label: 'C-Note Type',
      type: 'select',
      options: [
        { label: 'Regular', value: 'Regular' },
        { label: 'Purchase Order', value: 'Purchase Order' }
      ]
    },
    { key: 'customerName', label: 'Customer Name', placeholder: 'Customer Name', type: 'text' }
  ];

  /* =========================
     EVENTS (UI ONLY)
  ========================== */

  onSearch(params?: any): void {
    console.log('Search:', params);
  }

  onRefresh(): void {
    console.log('Refresh clicked');
  }

  onImport(): void {
    console.log('Import clicked');
  }

  onDelete(row: any): void {
    console.log('Delete:', row);
    alert('Deleted (UI only)');
  }

  onCellChange(evt: any): void {
    console.log('Cell changed:', evt);
  }

  onDownload(row: any): void {
    alert(`Downloading CNote ID: ${row.cnoteId} (UI only)`);
  }
}