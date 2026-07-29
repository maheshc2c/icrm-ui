import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { CountryHeadService } from '../../../../service/country-head.service';
import { PurchaseOrderTrackingModel } from '../../../../models/purchase-order-tracking.model';

@Component({
  selector: 'app-purchase-order-tracking',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './purchase-order-tracking.html',
  styleUrls: ['./purchase-order-tracking.css'],
})
export class PurchaseOrderTracking implements OnInit {
  private platformId = inject(PLATFORM_ID);

  headerTitle = 'Purchase Order Tracking';

  headerBreadcrumbs = [
    { label: 'Home', route: '/country-head' },
    { label: 'Purchase Order Tracking' }
  ];

  searchModel = {
    poId: '',
    distributorName: '',
    productDetails: '',
    poStatus: ''
  };

  rows: PurchaseOrderTrackingModel[] = [];

  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  columns = [
    { header: 'PO ID', field: 'poId' },
    { header: 'Distributor', field: 'distributor' },
    { header: 'Product Details', field: 'productDetails' },
    { header: 'Discount', field: 'discount' },
    { header: 'Current Stage', field: 'currentStage' },
    { header: 'Status', field: 'status' },
    { header: 'Final Approver', field: 'finalApprover' },
    { header: 'PO Documents', field: 'documents' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'poId', label: 'PO ID', placeholder: 'PO ID', type: 'text' },
    { key: 'productDetails', label: 'Product Details', placeholder: 'Product Details', type: 'text' },
    { key: 'distributorName', label: 'Distributor', placeholder: 'Distributor', type: 'text' },
    { key: 'poStatus', label: 'PO Status', placeholder: 'PO Status', type: 'select', options: [
      { label: 'Pending', value: '1' },
      { label: 'Approved - Waiting for Invoice', value: '2' },
      { label: 'Rejected', value: '3' },
      { label: 'Converted to C-Note', value: '4' }
    ] }
  ];

  constructor(private countryHeadService: CountryHeadService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadQuotes();
    }
  }

  loadQuotes(): void {
    console.log('[PurchaseOrderTracking] loadQuotes called. Fetching list...');
    this.countryHeadService.getPOTrackingListPaginated(
      this.currentPage - 1,
      this.pageSize,
      this.searchModel.poId ? Number(this.searchModel.poId) : undefined,
      this.searchModel.poStatus ? Number(this.searchModel.poStatus) : undefined,
      this.searchModel.distributorName || undefined,
      this.searchModel.productDetails || undefined
    ).subscribe({
      next: (res: any) => {
        console.log('[PurchaseOrderTracking] Successfully loaded data:', res);
        const data = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;

        this.rows = data.map((q: any, i: number) => {
          const globalSno = (this.currentPage - 1) * this.pageSize + i + 1;
          return {
            ...q,
            sno: globalSno,
            discount: q.discount !== null && q.discount !== undefined ? q.discount + '%' : '0%',
            documents: q.poDocuments ? String(q.poDocuments) : '',
            finalApprover: q.finalApprover ? String(q.finalApprover) : '',
            currentStage: this.mapStage(q.currentStage),
            status: this.mapStatus(q.status)
          };
        });
        console.log('[PurchaseOrderTracking] Mapped rows:', this.rows);
      },
      error: (err) => {
        console.error('[PurchaseOrderTracking] Failed to load data:', err);
      }
    });
  }

  // Maps backend stage numbers to readable labels
  private mapStage(stage: any): string {
    if (stage === null || stage === undefined || stage === '') return '';
    switch (Number(stage)) {
      case 1: return 'Draft';
      case 2: return 'Pending Review';
      case 3: return 'NSM';
      case 4: return 'CH';
      case 5: return 'Approved';
      case 6: return 'Rejected';
      default: return String(stage);
    }
  }

  // Maps backend status numbers to readable status labels
  private mapStatus(status: any): string {
    if (status === null || status === undefined || status === '') return '';
    switch (Number(status)) {
      case 1: return 'Pending';
      case 2: return 'Approved - Waiting for Invoice';
      case 3: return 'Rejected';
      case 4: return 'Converted to C-Note';
      default: return String(status);
    }
  }

  get filteredRows(): any[] {
    return this.rows;
  }

  onSearchChange(event: { poId?: string; distributorName?: string; productDetails?: string; poStatus?: string }): void {
    this.searchModel = {
      poId: event.poId || '',
      distributorName: event.distributorName || '',
      productDetails: event.productDetails || '',
      poStatus: event.poStatus || ''
    };
    this.currentPage = 1;
    this.loadQuotes();
  }

  onAdd(): void {
    // Handle add logic
  }

  onEdit(event: { customerId: string; }): void {
    // Handle edit logic
  }

  onDelete(event: { customerId: string; }): void {
    // Handle delete logic
  }

  onPageChange(event: number): void {
    this.currentPage = event;
    this.loadQuotes();
  }

  onPageSizeChange(event: number): void {
    this.pageSize = event;
    this.currentPage = 1;
    this.loadQuotes();
  }

  onReset(): void {
    this.searchModel = {
      poId: '',
      distributorName: '',
      productDetails: '',
      poStatus: ''
    };
    this.currentPage = 1;
    this.loadQuotes();
  }
}
