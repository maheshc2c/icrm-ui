import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-plan-demo',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule],
  templateUrl: './plan-demo.html',
  styleUrls: ['./plan-demo.css']
})
export class PlanDemoComponent implements OnInit {
  
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Manage Demo' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'opportunityId', label: 'Opportunity ID', type: 'text', placeholder: 'Opportunity ID' },
    { key: 'customer', label: 'Customer', type: 'select', placeholder: 'Select Customer', options: [
      { value: '', label: 'Select Customer' },
      { value: 'ABC Corp', label: 'ABC Corp' },
      { value: 'XYZ Ltd', label: 'XYZ Ltd' }
    ]},
    { key: 'startTime', label: 'Start Time', type: 'date', placeholder: 'Start Time' },
    { key: 'endTime', label: 'End Time', type: 'date', placeholder: 'End Time' }
  ];

  columns = [
    { header: 'Customer Name', field: 'customerName' },
    { header: 'Opportunity', field: 'opportunity' },
    { header: 'Demo Machine', field: 'demoMachine' },
    { header: 'Start Date', field: 'startDate' },
    { header: 'End Date', field: 'endDate' }
  ];

  rows: any[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadDemos();
  }

  loadDemos(): void {
    this.rows = [
      {
        customerName: 'ABC Corp',
        opportunity: 'Product Demo - Q1',
        demoMachine: 'Machine A',
        startDate: '2026-02-25',
        endDate: '2026-02-25'
      },
      {
        customerName: 'XYZ Ltd',
        opportunity: 'Software Demo',
        demoMachine: 'Machine B',
        startDate: '2026-02-28',
        endDate: '2026-02-28'
      }
    ];
  }

  onSearch(filters: any): void {
    console.log('Search filters:', filters);
  }

  onAdd(): void {
    console.log('Add demo');
  }

  onEdit(row: any): void {
    console.log('Edit demo:', row);
  }

  onDownload(): void {
    console.log('Download demos as Excel');
    alert('Download functionality will be implemented');
  }
}
