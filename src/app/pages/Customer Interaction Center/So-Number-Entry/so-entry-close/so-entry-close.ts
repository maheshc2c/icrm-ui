import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { CustomerInteractionCenterService } from '../../../../service/customer-interaction-center.service';
import { ToastService } from '../../../../service/toast.service';
import { SoEntryCloseRow } from '../../../../models/so-entry-close.model';

@Component({
  selector: 'app-so-entry-close',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './so-entry-close.html',
  styleUrl: './so-entry-close.css',
})
export class SoEntryClose implements OnInit {

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
    { header: 'CNote Info', field: 'cNoteInfo', type: 'icon', icon: 'fas fa-download', title: 'Download' }
  ];

  /* SEARCH FIELDS */
  searchFields: SearchFieldConfig[] = [
    { key: 'cnoteId', label: 'Cnote ID', placeholder: 'Cnote ID', type: 'text' },
    {
      key: 'cnoteType',
      label: 'C-Note Type',
      type: 'select',
      options: [
        { label: 'Select C-Note Type', value: '' },
        { label: 'Regular', value: 'Regular' },
        { label: 'Purchase Order', value: 'Purchase Order' }
      ]
    },
    { key: 'customerName', label: 'Customer Name', placeholder: 'Customer Name', type: 'text' }
  ];

  /* TABLE DATA */
  rows: SoEntryCloseRow[] = [];
  searchValues: any = {};

  /* PAGINATION STATE */
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private cicService: CustomerInteractionCenterService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadClosedSoEntries();
  }

  loadClosedSoEntries(): void {
    const cnoteId = this.searchValues.cnoteId ? this.searchValues.cnoteId.trim() : undefined;
    const cnoteType = this.searchValues.cnoteType ? this.searchValues.cnoteType : undefined;
    const customerName = this.searchValues.customerName ? this.searchValues.customerName.trim() : undefined;

    this.cicService.getClosedSoEntries(this.currentPage - 1, this.pageSize, cnoteId, cnoteType, customerName).subscribe({
      next: (res: any) => {
        const content = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;

        this.rows = content.map((item: any) => ({
          cnoteId: item.cnoteId ? item.cnoteId.toString() : '',
          cnoteType: item.cnoteType === 1 ? 'Regular' : (item.cnoteType === 2 ? 'Purchase Order' : 'Regular'),
          customerName: item.customerName || '',
          salesEngineer: item.salesEngineer || '',
          cnoteDate: item.cnoteDate ? item.cnoteDate.substring(0, 10) : '',
          quoteRefId: item.quoteRefId || '',
          soNumber: item.soNumber || '',
          cNoteInfo: 'Download'
        }));
      },
      error: (err: any) => {
        console.error('Error loading closed SO entries:', err);
        this.toastService.error('Failed to load closed SO entries');
      }
    });
  }

  onSearch(params?: any): void {
    this.searchValues = params || {};
    this.currentPage = 1;
    this.loadClosedSoEntries();
  }

  onRefresh(): void {
    this.searchValues = {};
    this.currentPage = 1;
    this.loadClosedSoEntries();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadClosedSoEntries();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadClosedSoEntries();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const downloadBtn = target.closest('button[title="Download CSV"]');
    if (downloadBtn) {
      this.onBulkDownload();
    }
  }

  onImport(): void {
    console.log('Import clicked');
  }

  onDelete(row: any): void {
    console.log('Delete:', row);
  }

  onCellChange(evt: any): void {
    console.log('Cell changed:', evt);
  }

  onDownload(row: any): void {
    if (!row.cnoteId) return;
    this.cicService.downloadContractNotePdf(parseInt(row.cnoteId)).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const today = new Date().toISOString().substring(0, 10);
        a.download = `contract_note_${row.cnoteId}_${today}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Failed to download PDF:', err);
        this.toastService.error('Failed to download C-Note PDF');
      }
    });
  }

  onBulkDownload(): void {
    const cnoteId = this.searchValues.cnoteId ? this.searchValues.cnoteId.trim() : undefined;
    const cnoteType = this.searchValues.cnoteType ? this.searchValues.cnoteType : undefined;
    const customerName = this.searchValues.customerName ? this.searchValues.customerName.trim() : undefined;

    this.cicService.downloadSoEntriesExcel(
      cnoteId,
      cnoteType,
      customerName,
      false // isOpen
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Closed_SO_Entries.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      },
      error: (err: any) => {
        console.error('Failed to download CSV:', err);
        this.toastService.error('Failed to download CSV file');
      }
    });
  }
}