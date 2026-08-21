import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { CountryHeadService } from '../../../../service/country-head.service';
import { QuoteTrackingModel } from '../../../../models/quote-tracking.model';

@Component({
  selector: 'app-quote-tracking',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './quote-tracking.html',
  styleUrls: ['./quote-tracking.css'],
})
export class QuoteTracking implements OnInit {
  private platformId = inject(PLATFORM_ID);

  headerTitle = 'Quote Tracking';

  headerBreadcrumbs: any[] = [];

  searchModel = {
    quoteId: '',
    customerName: '',
    opportunityDetails: ''
  };

  rows: QuoteTrackingModel[] = [];

  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  columns = [
    { header: 'Quote ID', field: 'quoteId' },
    { header: 'Customer', field: 'customer' },
    { header: 'Opportunity Details', field: 'opportunityDetails' },
    { header: 'Discount', field: 'discount' },
    { header: 'Current Stage', field: 'currentStage' },
    { header: 'Status', field: 'quoteTrackingStatus' },
    { header: 'Final Approver', field: 'finalApprover' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'quoteId', label: 'Quote ID', placeholder: 'Search Quote ID', type: 'text' },
    { key: 'customerName', label: 'Customer Name', placeholder: 'Search Customer', type: 'text' },
    { key: 'opportunityDetails', label: 'Opportunity Details', placeholder: 'Search Opportunity', type: 'text' }
  ];

  constructor(private countryHeadService: CountryHeadService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateBreadcrumbs();
      this.loadQuotes();
    }
  }

  updateBreadcrumbs(): void {
    const role = localStorage.getItem('role');
    let homeRoute = '/';
    switch (role) {
      case 'Country Head':
        homeRoute = '/country-head';
        break;
      case 'Sales Engineer':
      case 'Sales Manager':
      case 'SALES_MANAGER':
      case 'SALESMANAGER':
        homeRoute = '/sales-manager-dashboard';
        break;
      case 'Global Head':
        homeRoute = '/globalhead-dashboard';
        break;
      case 'National Sales Manager':
        homeRoute = '/national-sales-manager-dashboard';
        break;
      case 'Regional Branch Head':
        homeRoute = '/regional-branch-head-dashboard';
        break;
      case 'Regional Sales Manager':
        homeRoute = '/regional-sales-manager-dashboard';
        break;
      case 'Sales Director':
        homeRoute = '/sddashboard';
        break;
    }
    this.headerBreadcrumbs = [
      { label: 'Home', route: homeRoute },
      { label: 'Quote Tracking' }
    ];
  }

  loadQuotes(): void {
    console.log('[QuoteTracking] loadQuotes called. Fetching list...');
    this.countryHeadService.getQuoteListPaginated(
      this.currentPage - 1,
      this.pageSize,
      this.searchModel.quoteId || undefined,
      this.searchModel.customerName || undefined,
      this.searchModel.opportunityDetails || undefined
    ).subscribe({
      next: (res: any) => {
        console.log('[QuoteTracking] Successfully loaded quotes data:', res);
        const data = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;

        this.rows = data.map((q: any) => {
          return {
            ...q,
            finalApprover: q.approver ? String(q.approver) : '',
            currentStage: this.mapStage(q.currentStage),
            status: this.mapStatus(q.status),
            quoteTrackingStatus: this.mapStatus(q.status)
          };
        });
        console.log('[QuoteTracking] Mapped rows:', this.rows);
      },
      error: (err) => {
        console.error('[QuoteTracking] Failed to load quotes:', err);
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
      case 2: return 'Quote Approved';
      case 3: return 'Rejected';
      case 4: return 'Converted to Contract Note';
      case 5: return 'Previous Quote';
      default: return String(status);
    }
  }

  get filteredRows(): QuoteTrackingModel[] {
    return this.rows;
  }

  onSearchChange(event: { quoteId: string; customerName: string; opportunityDetails: string; }): void {
    this.searchModel = {
      quoteId: event.quoteId,
      customerName: event.customerName,
      opportunityDetails: event.opportunityDetails
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
      quoteId: '',
      customerName: '',
      opportunityDetails: ''
    };
    this.currentPage = 1;
    this.loadQuotes();
  }
}
