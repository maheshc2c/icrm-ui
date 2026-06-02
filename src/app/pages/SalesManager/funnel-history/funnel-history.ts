import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';

@Component({
  selector: 'app-funnel-history',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule, Header, Sidebar, Pageheader],
  templateUrl: './funnel-history.html',
  styleUrls: ['./funnel-history.css']
})
export class FunnelHistoryComponent implements OnInit {
  
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Opportunity Status' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'oppId', label: 'Opp ID', type: 'text', placeholder: 'Opp ID' },
    { key: 'searchDate', label: 'Search Date', type: 'text', placeholder: 'Search Date' }
  ];

  columns = [
    { header: 'Lead Details', field: 'leadDetails' },
    { header: 'Product', field: 'product' },
    { header: 'Qty', field: 'qty' },
    { header: 'Value (Lakhs)', field: 'value' },
    { header: 'Life Time(Days)', field: 'lifeTime' },
    { header: 'Stage', field: 'stage' },
    { header: 'Current Stage', field: 'currentStage' }
  ];

  rows: any[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadFunnelHistory();
  }

  loadFunnelHistory(): void {
    this.rows = [
      {
        leadDetails: 'Test Lead - ABC Corp',
        product: 'Product A',
        qty: 10,
        value: 5.0,
        lifeTime: 15,
        stage: 'Qualification',
        currentStage: 'In Progress'
      },
      {
        leadDetails: 'Sample Lead - XYZ Ltd',
        product: 'Product B',
        qty: 20,
        value: 7.5,
        lifeTime: 25,
        stage: 'Proposal',
        currentStage: 'Pending'
      }
    ];
  }

  onSearch(filters: any): void {
    console.log('Search filters:', filters);
  }

  onEdit(row: any): void {
    console.log('View opportunity:', row);
  }

  onDownload(): void {
    console.log('Download funnel history as Excel');
    alert('Download functionality will be implemented');
  }
}
