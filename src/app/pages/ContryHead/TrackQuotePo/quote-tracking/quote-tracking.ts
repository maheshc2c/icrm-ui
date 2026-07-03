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

  headerBreadcrumbs = [
    { label: 'Home', route: '/country-head' },
    { label: 'Quote Tracking' }
  ];

  searchModel = {
    quoteId: '',
    customerName: '',
    opportunityDetails: ''
  };

  rows: QuoteTrackingModel[] = [];
  allRows: QuoteTrackingModel[] = [];

  columns = [
    { header: 'Quote ID', field: 'quoteId' },
    { header: 'Customer', field: 'customer' },
    { header: 'Opportunity Details', field: 'opportunityDetails' },
    { header: 'Discount', field: 'discount' },
    { header: 'Current Stage', field: 'currentStage' },
    { header: 'Status', field: 'status' },
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
      this.loadQuotes();
    }
  }

  loadQuotes(): void {
    console.log('[QuoteTracking] loadQuotes called. Fetching list...');
    this.countryHeadService.getQuoteList().subscribe({
      next: (data) => {
        console.log('[QuoteTracking] Successfully loaded quotes data:', data);
        this.allRows = data.map(q => {
          return {
            ...q,
            finalApprover: q.approver ? String(q.approver) : '',
            currentStage: this.mapStage(q.currentStage),
            status: this.mapStatus(q.status)
          };
        });
        this.rows = [...this.allRows];
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
      case 1: return 'Pending Approval';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      case 4: return 'Converted to Contract Note';
      case 5: return 'Previous Quote';
      default: return String(status);
    }
  }

  get filteredRows(): QuoteTrackingModel[] {
    const quoteId = this.searchModel.quoteId?.trim().toLowerCase();
    const customerName = this.searchModel.customerName?.trim().toLowerCase();
    const opportunityDetails = this.searchModel.opportunityDetails?.trim().toLowerCase();

    return this.rows.filter(row => {
      const rowQuoteId = row.quoteId ? String(row.quoteId).toLowerCase() : '';
      const rowCustomer = row.customer ? row.customer.toLowerCase() : '';
      const rowOppDetails = row.opportunityDetails ? row.opportunityDetails.toLowerCase() : '';

      const matchesQuoteId = !quoteId || rowQuoteId.includes(quoteId);
      const matchesCustomer = !customerName || rowCustomer.includes(customerName);
      const matchesOpportunity = !opportunityDetails || rowOppDetails.includes(opportunityDetails);
      return matchesQuoteId && matchesCustomer && matchesOpportunity;
    });
  }

  onSearchChange(event: { quoteId: string; customerName: string; opportunityDetails: string; }): void {
    this.searchModel = {
      quoteId: event.quoteId,
      customerName: event.customerName,
      opportunityDetails: event.opportunityDetails
    };
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
    // Handle page change logic
  }

  onPageSizeChange(event: number): void {
    // Handle page size change logic
  }

  onReset(): void {
    this.searchModel = {
      quoteId: '',
      customerName: '',
      opportunityDetails: ''
    };
  }
}
