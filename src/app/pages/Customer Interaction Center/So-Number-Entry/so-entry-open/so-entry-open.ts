import { Component, OnInit, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { CustomerInteractionCenterService } from '../../../../service/customer-interaction-center.service';
import { ToastService } from '../../../../service/toast.service';
import { SoEntryOpenRow } from '../../../../models/so-entry-open.model';

@Component({
  selector: 'app-so-entry-open',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './so-entry-open.html',
  styleUrl: './so-entry-open.css',
})
export class SoEntryOpen implements OnInit {
  private platformId = inject(PLATFORM_ID);
  headerTitle = 'So Entry Open';
  headerBreadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'SO Number Entry', route: '/customer-interaction-center/so-number-entry' },
  ];

  /* SEARCH FIELDS */
  searchFields: SearchFieldConfig[] = [
    { key: 'cnoteId', label: 'C-Note ID', type: 'text' },
    { key: 'cnoteType', label: 'C-Note Type', type: 'select', options: [
      { value: '', label: 'Select C-Note Type' },
      { value: 'Regular', label: 'Regular' },
      { value: 'Purchase Order', label: 'Purchase Order' }
    ] },
    { key: 'customerName', label: 'Customer Name', type: 'text' }
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
    { header: 'CNote Info', field: 'cNoteInfo', type: 'icon', icon: 'fas fa-cloud-download', title: 'Download' }
  ];

  /* TABLE DATA */
  rows: SoEntryOpenRow[] = [];
  searchValues: any = {};

  /* PAGINATION STATE */
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  bulkUploadModalVisible = false;
  selectedFileName = '';
  selectedFile: File | null = null;

  constructor(
    private cicService: CustomerInteractionCenterService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadOpenSoEntries();
    }
  }

  loadOpenSoEntries() {
    const cnoteId = this.searchValues.cnoteId ? this.searchValues.cnoteId.trim() : undefined;
    const cnoteType = this.searchValues.cnoteType ? this.searchValues.cnoteType : undefined;
    const customerName = this.searchValues.customerName ? this.searchValues.customerName.trim() : undefined;

    this.cicService.getOpenSoEntries(this.currentPage - 1, this.pageSize, cnoteId, cnoteType, customerName).subscribe({
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
          soNumber: item.soNumber || ''
        }));
      },
      error: (err: any) => {
        console.error('Error loading open SO entries:', err);
        this.toastService.error('Failed to load open SO entries');
      }
    });
  }

  onSearch(values: any) {
    this.searchValues = values || {};
    this.currentPage = 1;
    this.loadOpenSoEntries();
  }

  onRefresh() {
    this.searchValues = {};
    this.currentPage = 1;
    this.loadOpenSoEntries();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadOpenSoEntries();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadOpenSoEntries();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const downloadBtn = target.closest('button[title="Download CSV"]');
    if (downloadBtn) {
      this.onDownload();
    }
  }

  onDownload() {
    const cnoteId = this.searchValues.cnoteId ? this.searchValues.cnoteId.trim() : undefined;
    const cnoteType = this.searchValues.cnoteType ? this.searchValues.cnoteType : undefined;
    const customerName = this.searchValues.customerName ? this.searchValues.customerName.trim() : undefined;

    this.cicService.downloadSoEntriesExcel(
      cnoteId,
      cnoteType,
      customerName,
      true // isOpen
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Open_SO_Entries.csv';
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

  onDownloadRow(row: any) {
    if (!row.cnoteId) return;
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
      error: (err: any) => {
        console.error('Failed to download PDF:', err);
        this.toastService.error('Failed to download C-Note PDF');
      }
    });
  }

  onAdd() {
    this.onUploadClick();
  }

  onUploadClick() {
    this.bulkUploadModalVisible = true;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log('File selection change event fired. Files list:', input.files);
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.toastService.error('Only CSV files are allowed');
        input.value = '';
        return;
      }
      this.selectedFile = file;
      this.selectedFileName = this.selectedFile.name;
      console.log('Successfully selected file:', this.selectedFileName);
    }
  }

  submitBulkUpload() {
    if (!this.selectedFile) {
      this.toastService.warning('Please select a file');
      return;
    }

    this.cicService.bulkUploadSoEntries(this.selectedFile).subscribe({
      next: (res: any) => {
        this.toastService.success('Bulk upload successful!');
        this.loadOpenSoEntries();
        this.closeBulkUpload();
      },
      error: (err: any) => {
        console.error('Error bulk uploading:', err);
        this.toastService.error('Bulk upload failed: ' + (err.error || err.message));
        this.closeBulkUpload();
      }
    });
  }

  closeBulkUpload() {
    this.bulkUploadModalVisible = false;
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  onSubmit() {
    const updates = this.rows
      .filter(row => row.soNumber && row.soNumber.trim() !== '')
      .map(row => ({
        cnoteId: parseInt(row.cnoteId),
        soNumber: row.soNumber.trim()
      }));

    if (updates.length === 0) {
      this.toastService.warning('No SO Numbers entered to submit');
      return;
    }

    this.cicService.updateSoNumbers(updates).subscribe({
      next: (res: any) => {
        this.toastService.success('SO Numbers updated successfully!');
        this.loadOpenSoEntries();
      },
      error: (err: any) => {
        console.error('Error updating SO numbers:', err);
        this.toastService.error('Failed to update SO numbers');
      }
    });
  }

  onImport(): void {
    console.log('Import clicked');
  }

  onEdit(row: any): void {
    console.log('Edit clicked:', row);
  }

  onDelete(row: any): void {
    console.log('Delete clicked:', row);
  }

  onUpload(): void {
    this.onUploadClick();
  }

  onCellChange(evt: any): void {
    if (evt.field === 'soNumber') {
      evt.row.soNumber = evt.value;
      console.log('Updated locally:', evt.row);
    }
  }
}
