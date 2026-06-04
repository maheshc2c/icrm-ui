import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-track-quotes',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule],
  templateUrl: './track-quotes.html',
  styleUrls: ['./track-quotes.css']
})
export class TrackQuotesComponent implements OnInit {
  
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Quote Tracking' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'quoteId', label: 'Quote ID', type: 'text', placeholder: 'Quote ID' },
    { key: 'customer', label: 'Customer', type: 'text', placeholder: 'Customer Name' },
    { key: 'opportunity', label: 'Opportunity', type: 'text', placeholder: 'Opportunity Details' }
  ];

  columns = [
    { header: 'Quote ID', field: 'quoteId' },
    { header: 'Customer', field: 'customer' },
    { header: 'Opportunity Details', field: 'opportunityDetails' },
    { header: 'Discount', field: 'discount' },
    { header: 'Current Stage', field: 'currentStage' },
    { header: 'Status', field: 'status' },
    { header: 'Final Approver', field: 'finalApprover' }
  ];

  rows: any[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    // Data will be loaded from API
    this.rows = [];
  }

  onSearch(filters: any): void {
    console.log('Search filters:', filters);
  }

  onAdd(): void {
    console.log('Add new quote');
  }

  onEdit(row: any): void {
    console.log('Edit quote:', row);
  }

  onDelete(row: any): void {
    console.log('Delete quote:', row);
  }

  onDownload(): void {
    console.log('Download quotes as Excel');
    alert('Download functionality will be implemented');
  }
}
