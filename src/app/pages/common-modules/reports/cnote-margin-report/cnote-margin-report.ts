import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { ReportService } from '../../../../service/report.service';

@Component({
  selector: 'app-cnote-margin-report',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader],
  templateUrl: './cnote-margin-report.html',
  styleUrls: ['./cnote-margin-report.css']
})
export class CNoteMarginReportComponent implements OnInit {

  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'C-Note Margin Analysis Report' }
  ];

  // Filter models
  selectedRegionId: number | null = null;
  selectedUserId: number | null = null;
  fromDate = '';
  toDate = '';
  selectedSegmentId: number | null = null;
  selectedProductId: number | null = null;
  customerName = '';

  // Dropdown options
  regions: { id: number; label: string }[] = [];
  users: { id: number; label: string }[] = [];
  segments: { id: number; label: string }[] = [];
  products: { id: number; label: string }[] = [];

  // Table state
  items: any[] = [];
  totalOrderValue = 0;
  totalNetSellingPrice = 0;
  totalGrossMargin = 0;
  totalNetMargin = 0;

  isLoading = false;
  isDownloading = false;

  // Pagination state
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadReportData();
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

  loadReportData(): void {
    this.isLoading = true;

    const filter = {
      regionId: this.selectedRegionId ? Number(this.selectedRegionId) : null,
      userId: this.selectedUserId !== null && this.selectedUserId !== undefined ? Number(this.selectedUserId) : null,
      fromDate: this.fromDate || null,
      toDate: this.toDate || null,
      segmentId: this.selectedSegmentId ? Number(this.selectedSegmentId) : null,
      productId: this.selectedProductId ? Number(this.selectedProductId) : null,
      customerName: this.customerName || null,
      pagination: {
        pageNumber: this.currentPage - 1,
        pageSize: this.pageSize,
        sortBy: 'cnoteId',
        sortOrder: 'DESC'
      }
    };

    this.reportService.getCNoteMarginAnalysisReport(filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.status && res.data) {
          const data = res.data;
          this.items = data.results || [];
          this.totalOrderValue = data.totalOrderValue || 0;
          this.totalNetSellingPrice = data.totalNetSellingPrice || 0;
          this.totalGrossMargin = data.totalGrossMargin || 0;
          this.totalNetMargin = data.totalNetMargin || 0;
          this.totalRecords = res.totalElements || 0;
          this.totalPages = res.totalPages || Math.ceil(this.totalRecords / this.pageSize);
        } else {
          this.resetTableData();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching C-Note margin analysis report', err);
        this.resetTableData();
      }
    });
  }

  resetTableData(): void {
    this.items = [];
    this.totalOrderValue = 0;
    this.totalNetSellingPrice = 0;
    this.totalGrossMargin = 0;
    this.totalNetMargin = 0;
    this.totalRecords = 0;
    this.totalPages = 0;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadReportData();
  }

  resetFilters(): void {
    this.selectedRegionId = null;
    this.selectedUserId = null;
    this.fromDate = '';
    this.toDate = '';
    this.selectedSegmentId = null;
    this.selectedProductId = null;
    this.customerName = '';
    this.currentPage = 1;
    this.loadReportData();
  }

  onDownload(): void {
    this.isDownloading = true;

    const filter = {
      regionId: this.selectedRegionId ? Number(this.selectedRegionId) : null,
      userId: this.selectedUserId !== null && this.selectedUserId !== undefined ? Number(this.selectedUserId) : null,
      fromDate: this.fromDate || null,
      toDate: this.toDate || null,
      segmentId: this.selectedSegmentId ? Number(this.selectedSegmentId) : null,
      productId: this.selectedProductId ? Number(this.selectedProductId) : null,
      customerName: this.customerName || null
    };

    this.reportService.downloadCNoteMarginAnalysisReport(filter).subscribe({
      next: (blob: Blob) => {
        this.isDownloading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CNote_Margin_Analysis_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.isDownloading = false;
        console.error('Error downloading C-Note margin analysis report', err);
      }
    });
  }

  // Pagination Controls
  get startRecord(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadReportData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadReportData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadReportData();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadReportData();
  }
}
