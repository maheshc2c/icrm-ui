import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { ReportService } from '../../../../service/report.service';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';

@Component({
  selector: 'app-cnote-margin-report',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader, DataTable, Header, Sidebar],
  templateUrl: './cnote-margin-report.html',
  styleUrls: ['./cnote-margin-report.css']
})
export class CNoteMarginReportComponent implements OnInit {
  title = 'C-Note Margin Analysis Report';
  breadcrumbs: Breadcrumb[] = [];

  // Filter models
  selectedRegionId: number | null = null;
  selectedUserId: number | null = null;
  fromDate = '';
  toDate = '';
  selectedSegmentId: number | null = null;
  selectedProductId: number | null = null;
  customerName = '';

  lastSegmentId: number | null = null;

  // Dropdown option arrays
  regions: any[] = [];
  users: any[] = [];
  segments: any[] = [];
  products: any[] = [];

  // DataTable filter field configurations
  searchFields: SearchFieldConfig[] = [
    { key: 'regionId', label: '', type: 'select', placeholder: 'All Regions', options: [] },
    { key: 'userId', label: '', type: 'select', placeholder: 'All Users', options: [] },
    { key: 'fromDate', label: '', type: 'date', placeholder: 'From Date' },
    { key: 'toDate', label: '', type: 'date', placeholder: 'To Date' },
    { key: 'segmentId', label: '', type: 'select', placeholder: 'Select Segment', options: [] },
    { key: 'productId', label: '', type: 'select', placeholder: 'Select Product', options: [] }
  ];

  // DataTable column configurations
  columns = [
    { header: 'C-Note ID', field: 'cnoteId', type: 'text' },
    { header: 'Type', field: 'cnoteTypeLabel' },
    { header: 'Customer Name', field: 'customerName' },
    { header: 'Sales Engineer', field: 'salesEngineer' },
    { header: 'SO Number', field: 'soNumber' },
    { header: 'C-Note Date', field: 'cnoteCreatedTime' },
    { header: 'Product Details', field: 'productDetails', type: 'html' }
  ];

  // Table rows and summary
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
  sortBy = 'cnoteId';
  sortOrder = 'DESC';

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.setDynamicHomeRoute();
    this.loadDropdowns();
    this.loadReportData();
  }

  setDynamicHomeRoute(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const role = localStorage.getItem('role');
      let homeRoute = '/dashboard';

      if (role === 'SUPERADMIN') {
        homeRoute = '/superadmindashboard';
      } else if (role === 'Admin') {
        homeRoute = '/admindashboard';
      } else if (role === 'Regional Branch Head') {
        homeRoute = '/regional-branch-head-dashboard';
      } else if (role === 'Regional Sales Manager') {
        homeRoute = '/regional-sales-manager-dashboard';
      } else if (role === 'Country Head') {
        homeRoute = '/country-head';
      } else if (role === 'Sales Engineer' || role === 'SALES_MANAGER' || role === 'SALESMANAGER' || role === 'Sales Manager') {
        homeRoute = '/sales-manager-dashboard';
      } else if (role === 'ADMINMARKETING' || role === 'ADMIN MARKETING') {
        homeRoute = '/adminmarketingdashboard';
      }

      this.breadcrumbs = [
        { label: 'Home', route: homeRoute },
        { label: 'C-Note Margin Analysis Report' }
      ];
    }
  }

  loadDropdowns(): void {
    this.reportService.getRegionsForDropdown().subscribe({
      next: (data) => {
        this.regions = data;
        const regionField = this.searchFields.find(f => f.key === 'regionId');
        if (regionField) {
          regionField.options = [{ label: 'All Regions', value: null }, ...data.map(r => ({ label: r.label, value: r.id }))];
        }
      },
      error: (err) => console.error('Error loading regions', err)
    });

    this.reportService.getUsersForDropdown().subscribe({
      next: (data) => {
        this.users = data;
        const userField = this.searchFields.find(f => f.key === 'userId');
        if (userField) {
          userField.options = [{ label: 'All Users', value: null }, ...data.map(u => ({ label: u.label, value: u.id }))];
        }
      },
      error: (err) => console.error('Error loading users', err)
    });

    this.reportService.getSegmentsForDropdown().subscribe({
      next: (data) => {
        this.segments = data;
        const segmentField = this.searchFields.find(f => f.key === 'segmentId');
        if (segmentField) {
          segmentField.options = [{ label: 'Select Segment', value: null }, ...data.map(s => ({ label: s.label, value: s.id }))];
        }
      },
      error: (err) => console.error('Error loading segments', err)
    });

    this.loadProducts();
  }

  loadProducts(groupId?: number | null): void {
    this.reportService.getProductsForDropdown(groupId).subscribe({
      next: (data) => {
        this.products = data;
        const productField = this.searchFields.find(f => f.key === 'productId');
        if (productField) {
          productField.options = [{ label: 'Select Product', value: null }, ...data.map(p => ({ label: p.label, value: p.id }))];
        }
      },
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
        sortBy: this.sortBy,
        sortOrder: this.sortOrder
      }
    };

    this.reportService.getCNoteMarginAnalysisReport(filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.status && res.data) {
          const data = res.data;
          this.items = (data.results || []).map((item: any) => ({
            ...item,
            orderValue: item.marginMetrics?.orderValue,
            netSellingPrice: item.marginMetrics?.netSellingPrice,
            basicPrice: item.marginMetrics?.basicPrice,
            discountPercentage: item.marginMetrics?.discountPercentage,
            costOfWarranty: item.marginMetrics?.costOfWarranty,
            costOfFinance: item.marginMetrics?.costOfFinance,
            costOfDealerCommission: item.marginMetrics?.costOfDealerCommission,
            costOfFreeSupply: item.marginMetrics?.costOfFreeSupply,
            grossMargin: item.marginMetrics?.grossMargin,
            grossMarginPercentage: item.marginMetrics?.grossMarginPercentage,
            netMargin: item.marginMetrics?.netMargin,
            netMarginPercentage: item.marginMetrics?.netMarginPercentage
          }));

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

  onSearchChange(event: any): void {
    if (!event) return;
    this.selectedRegionId = event.regionId ? Number(event.regionId) : null;
    this.selectedSegmentId = event.segmentId ? Number(event.segmentId) : null;
    this.selectedProductId = event.productId ? Number(event.productId) : null;
    this.selectedUserId = event.userId ? Number(event.userId) : null;
    this.customerName = '';
    this.fromDate = event.fromDate || '';
    this.toDate = event.toDate || '';

    // Handle dependent loading for segments to products
    if (event.segmentId !== this.lastSegmentId) {
      this.lastSegmentId = event.segmentId;
      this.selectedProductId = null;
      const productField = this.searchFields.find(f => f.key === 'productId');
      if (productField) productField.options = [];
      this.loadProducts(this.selectedSegmentId);
    }

    this.currentPage = 1;
    this.loadReportData();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadReportData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
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

  get summaryData() {
    return {
      totalOrderValue: this.totalOrderValue,
      totalNetSellingPrice: this.totalNetSellingPrice,
      totalGrossMargin: this.totalGrossMargin,
      totalNetMargin: this.totalNetMargin
    };
  }
}
