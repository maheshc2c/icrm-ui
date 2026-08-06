import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ReportsLayoutComponent } from '../reports-layout/reports-layout';

@Component({
  selector: 'app-margin-analysis-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportsLayoutComponent],
  templateUrl: './margin-analysis-report.html',
  styleUrl: './margin-analysis-report.css'
})
export class MarginAnalysisReportComponent {
  title = 'Margin Analysis Report';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Margin Analysis Report' }
  ];

  defaultFilters = {
    selectedRegion: 'All Regions',
    fromDate: '',
    toDate: '',
    selectedSegment: 'Select Segment',
    selectedProduct: 'Select Product',
    selectedUser: 'All Users',
    selectedCustomer: 'Customer',
    selectedDealer: 'Dealer'
  };

  selectedRegion = this.defaultFilters.selectedRegion;
  fromDate = this.defaultFilters.fromDate;
  toDate = this.defaultFilters.toDate;
  selectedSegment = this.defaultFilters.selectedSegment;
  selectedProduct = this.defaultFilters.selectedProduct;
  selectedUser = this.defaultFilters.selectedUser;
  selectedCustomer = this.defaultFilters.selectedCustomer;
  selectedDealer = this.defaultFilters.selectedDealer;

  allRows: any[] = [
    { 
      id: 1, 
      segment: 'Oracle', 
      revenue: 28, 
      margin: 17.22,
      expanded: false,
      details: [
        { sno: 1, desc: 'Parking E2E', code: '', revenue: 28, margin: 17.22, qty: 23, asp: 1.21, unitDp: 0, var: 0 }
      ]
    },
    { 
      id: 2, 
      segment: 'SAP', 
      revenue: 9, 
      margin: -98.68,
      expanded: false,
      details: [
        { sno: 1, desc: 'SAP Support..', code: '4545', revenue: 9, margin: -98.75, qty: 7, asp: 1.26, unitDp: 0, var: 0 },
        { sno: 2, desc: 'Defense', code: '101', revenue: 0, margin: -74.86, qty: 8, asp: 0, unitDp: 0, var: 0 }
      ]
    },
  ];

  rows = [...this.allRows];

  toggleRow(row: any): void {
    row.expanded = !row.expanded;
  }

  getSubTotalQty(row: any): number {
    if (!row.details) return 0;
    return row.details.reduce((sum: number, r: any) => sum + Number(r.qty || 0), 0);
  }

  getSubTotalVar(row: any): string {
    // Return mock static totals based on the image for now, or just static -10.74%
    if (row.segment === 'SAP') return '-10.74';
    return '-10.74'; 
  }

  get totalRevenue(): number {
    return this.rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
  }

  get totalMargin(): number {
    const total = this.rows.reduce((sum, row) => sum + Number(row.margin || 0), 0);
    return Number(total.toFixed(2));
  }

  onSearch(): void {
    const regionFilter = this.selectedRegion === 'All Regions' || !this.selectedRegion;
    const productFilter = this.selectedProduct === 'Select Product' || !this.selectedProduct;
    const segmentFilter = this.selectedSegment === 'Select Segment' || !this.selectedSegment;
    const userFilter = this.selectedUser === 'All Users' || !this.selectedUser;

    this.rows = this.allRows.filter((row) => {
      const matchesRegion = regionFilter || row.segment === this.selectedRegion;
      const matchesProduct = productFilter || row.segment === this.selectedProduct;
      const matchesSegment = segmentFilter || this.selectedSegment === 'Enterprise' || this.selectedSegment === 'Retail';
      const matchesUser = userFilter || this.selectedUser !== 'All Users';

      return matchesRegion && matchesProduct && matchesSegment && matchesUser;
    });

    if (this.rows.length === 0) {
      this.rows = [];
    }
  }

  resetFilters(): void {
    this.selectedRegion = this.defaultFilters.selectedRegion;
    this.fromDate = this.defaultFilters.fromDate;
    this.toDate = this.defaultFilters.toDate;
    this.selectedSegment = this.defaultFilters.selectedSegment;
    this.selectedProduct = this.defaultFilters.selectedProduct;
    this.selectedUser = this.defaultFilters.selectedUser;
    this.selectedCustomer = this.defaultFilters.selectedCustomer;
    this.selectedDealer = this.defaultFilters.selectedDealer;
    this.rows = [...this.allRows];
  }
}
