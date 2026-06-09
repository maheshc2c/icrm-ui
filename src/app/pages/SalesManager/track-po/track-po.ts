import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-track-po',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule],
  templateUrl: './track-po.html',
  styleUrls: ['./track-po.css']
})
export class TrackPOComponent implements OnInit {
  
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Track Purchase Orders' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'poId', label: 'PO ID', type: 'text', placeholder: 'PO ID' },
    { key: 'productDetails', label: 'Product Details', type: 'text', placeholder: 'Product Details' },
    { key: 'distributor', label: 'Distributor', type: 'text', placeholder: 'Distributor' },
    { key: 'poStatus', label: 'PO Status', type: 'select', placeholder: 'PO Status', options: [
      { value: '', label: 'Select Status' },
      { value: 'Pending', label: 'Pending' },
      { value: 'Approved', label: 'Approved' },
      { value: 'Completed', label: 'Completed' }
    ]}
  ];

  columns = [
    { header: 'PO ID', field: 'poId' },
    { header: 'Distributor', field: 'distributor' },
    { header: 'Product Details', field: 'productDetails' },
    { header: 'Discount', field: 'discount' },
    { header: 'Current Stage', field: 'currentStage' },
    { header: 'Status', field: 'status' },
    { header: 'Final Approver', field: 'finalApprover' },
    { header: 'PO documents', field: 'poDocuments' }
  ];

  rows: any[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {
    // Data will be loaded from API
    this.rows = [];
  }

  onSearch(filters: any): void {
    console.log('Search filters:', filters);
  }

  onEdit(row: any): void {
    console.log('Edit PO:', row);
  }

  onRefresh(): void {
    console.log('Refreshing purchase orders');
    this.loadPurchaseOrders();
  }
}
