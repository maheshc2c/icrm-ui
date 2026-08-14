import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ReportsLayoutComponent } from '../reports-layout/reports-layout';
import { ReportService } from '../../../../service/report.service';

@Component({
  selector: 'app-margin-analysis-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportsLayoutComponent],
  templateUrl: './margin-analysis-report.html',
  styleUrl: './margin-analysis-report.css'
})
export class MarginAnalysisReportComponent implements OnInit {
  title = 'Margin Analysis Report';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Margin Analysis Report' }
  ];

  selectedRegionId: number | null = null;
  fromDate = '';
  toDate = '';
  selectedSegmentId: number | null = null;
  selectedProductId: number | null = null;
  selectedUserId: number | null = null;
  selectedCustomer = '';
  selectedDealer = '';

  regions: { id: number; label: string }[] = [];
  users: { id: number; label: string }[] = [];
  segments: { id: number; label: string }[] = [];
  products: { id: number; label: string }[] = [];
  isLoading = false;

  rows: any[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.onSearch();
  }

  loadDropdowns(): void {
    this.reportService.getRegionsForDropdown().subscribe({
      next: (data) => (this.regions = data),
      error: (err) => console.error('Error loading regions', err)
    });

    this.reportService.getUsersForDropdown().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('Error loading users', err)
    });

    this.reportService.getSegmentsForDropdown().subscribe({
      next: (data) => (this.segments = data),
      error: (err) => console.error('Error loading segments', err)
    });

    this.loadProducts();
  }

  onSegmentChange(): void {
    this.selectedProductId = null;
    this.loadProducts(this.selectedSegmentId);
  }

  loadProducts(groupId?: number | null): void {
    this.reportService.getProductsForDropdown(groupId).subscribe({
      next: (data) => (this.products = data),
      error: (err) => console.error('Error loading products', err)
    });
  }

  onSearch(): void {
    this.isLoading = true;
    const filter = {
      fromDate: this.fromDate || null,
      toDate: this.toDate || null,
      regionId: this.selectedRegionId ? Number(this.selectedRegionId) : null,
      userId: this.selectedUserId !== null && this.selectedUserId !== undefined ? Number(this.selectedUserId) : null,
      segmentId: this.selectedSegmentId ? Number(this.selectedSegmentId) : null,
      productId: this.selectedProductId ? Number(this.selectedProductId) : null,
      customerId: this.selectedCustomer ? Number(this.selectedCustomer) : null,
      dealerId: this.selectedDealer ? Number(this.selectedDealer) : null,
      pagination: {
        pageNumber: 0,
        pageSize: 100,
        sortBy: 'groupId',
        sortOrder: 'ASC'
      }
    };

    this.reportService.getMarginAnalysisReport(filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.status && Array.isArray(res.data)) {
          this.rows = res.data.map((item: any, idx: number) => ({
            id: item.groupId || idx + 1,
            segment: item.segmentName || 'N/A',
            revenue: item.totalRevenue ?? 0,
            margin: item.grossMarginPercentage ?? 0,
            totalQuantity: item.totalQuantity ?? 0,
            totalCost: item.totalCost ?? 0,
            expanded: false,
            details: [
              {
                sno: 1,
                desc: item.segmentName + ' General',
                code: 'SEG-' + (item.groupId || idx + 1),
                revenue: item.totalRevenue ?? 0,
                margin: item.grossMarginPercentage ?? 0,
                qty: item.totalQuantity ?? 0,
                asp: item.totalQuantity > 0 ? (item.totalRevenue / item.totalQuantity).toFixed(2) : 0,
                unitDp: 0,
                var: 0
              }
            ]
          }));
        } else {
          this.rows = [];
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching margin report', err);
        this.rows = [];
      }
    });
  }

   toggleRow(row: any): void {
    const isCurrentlyExpanded = row.expanded;
    // Collapse all rows first
    this.rows.forEach(r => r.expanded = false);
    // Expand the clicked row only if it wasn't already expanded
    row.expanded = !isCurrentlyExpanded;
  }

  getSubTotalQty(row: any): number {
    return row.totalQuantity || 0;
  }

  getSubTotalVar(row: any): string {
    return row.margin != null ? row.margin.toString() : '0';
  }

  get totalRevenue(): number {
    const total = this.rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
    return Number(total.toFixed(2));
  }

  get totalMargin(): number {
    if (this.rows.length === 0) return 0;
    const avg = this.rows.reduce((sum, row) => sum + Number(row.margin || 0), 0) / this.rows.length;
    return Number(avg.toFixed(2));
  }

  isDownloading = false;

  onDownload(): void {
    this.isDownloading = true;
    const filter = {
      fromDate: this.fromDate || null,
      toDate: this.toDate || null,
      regionId: this.selectedRegionId ? Number(this.selectedRegionId) : null,
      userId: this.selectedUserId !== null && this.selectedUserId !== undefined ? Number(this.selectedUserId) : null,
      segmentId: this.selectedSegmentId ? Number(this.selectedSegmentId) : null,
      productId: this.selectedProductId ? Number(this.selectedProductId) : null,
      customerId: this.selectedCustomer ? Number(this.selectedCustomer) : null,
      dealerId: this.selectedDealer ? Number(this.selectedDealer) : null
    };

    this.reportService.downloadMarginAnalysisReport(filter).subscribe({
      next: (blob: Blob) => {
        this.isDownloading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Margin_Analysis_Report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.isDownloading = false;
        console.error('Error downloading margin report', err);
      }
    });
  }

  resetFilters(): void {
    this.selectedRegionId = null;
    this.fromDate = '';
    this.toDate = '';
    this.selectedSegmentId = null;
    this.selectedProductId = null;
    this.selectedUserId = null;
    this.selectedCustomer = '';
    this.selectedDealer = '';
    this.onSearch();
  }
}
