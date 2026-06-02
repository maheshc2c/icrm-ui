import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../../shared/search/search';

@Component({
  selector: 'app-stock-in-hand',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule],
  templateUrl: './stock-in-hand.html',
  styleUrls: ['./stock-in-hand.css']
})
export class StockInHandComponent implements OnInit {
  
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Stock In Hand Report' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'category', label: 'Category', type: 'select', placeholder: 'Select Category', options: [
      { value: '', label: 'Select Category' },
      { value: 'ERP', label: 'ERP' },
      { value: 'CRM', label: 'CRM' }
    ]},
    { key: 'segment', label: 'Segment', type: 'select', placeholder: 'Select Segment', options: [
      { value: '', label: 'Select Segment' },
      { value: 'Enterprise', label: 'Enterprise' },
      { value: 'SMB', label: 'SMB' }
    ]},
    { key: 'product', label: 'Product', type: 'select', placeholder: 'Select Product', options: [
      { value: '', label: 'Select Product' },
      { value: 'Product A', label: 'Product A' },
      { value: 'Product B', label: 'Product B' }
    ]}
  ];

  columns = [
    { header: 'Category', field: 'category' },
    { header: 'Quantity', field: 'quantity' }
  ];

  rows: any[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadStockData();
  }

  loadStockData(): void {
    this.rows = [
      {
        category: 'ERP',
        quantity: 0
      }
    ];
  }

  onSearch(filters: any): void {
    console.log('Search filters:', filters);
  }

  onDownload(): void {
    console.log('Download stock report as Excel');
    alert('Download functionality will be implemented');
  }
}
