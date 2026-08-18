import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { ReportService } from '../../../../service/report.service';

@Component({
  selector: 'app-stock-in-hand',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader],
  templateUrl: './stock-in-hand.html',
  styleUrls: ['./stock-in-hand.css']
})
export class StockInHandComponent implements OnInit {
  title = 'Stock In Hand Report';
  breadcrumbs: any[] = [];

  // Filter IDs
  selectedCategoryId: number | null = null;
  selectedGroupId: number | null = null;
  selectedProductId: number | null = null;

  // Dropdown lists
  categories: { id: number; label: string }[] = [];
  groups: { id: number; label: string }[] = []; // Segments
  products: { id: number; label: string }[] = [];

  isLoading = false;
  isDownloading = false;

  reportData: any = null;
  expandedCategories = new Set<number>();
  expandedSegments = new Set<number>();

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.setDynamicHomeRoute();
    this.loadDropdowns();
    this.onSearch();
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
        { label: 'Stock In Hand Report' }
      ];
    } else {
      this.breadcrumbs = [
        { label: 'Home', route: '/dashboard' },
        { label: 'Stock In Hand Report' }
      ];
    }
  }

  loadDropdowns(): void {
    this.reportService.getCategoriesForDropdown().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error('Error fetching categories:', err)
    });

    this.reportService.getSegmentsForDropdown().subscribe({
      next: (res) => (this.groups = res),
      error: (err) => console.error('Error fetching segments:', err)
    });

    this.loadProducts();
  }

  onCategoryChange(): void {
    this.selectedProductId = null;
    this.loadProducts();
  }

  loadProducts(): void {
    this.reportService.getProductsForDropdown(this.selectedGroupId).subscribe({
      next: (res) => (this.products = res),
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  onSearch(): void {
    this.isLoading = true;
    const filter = {
      categoryId: this.selectedCategoryId ? Number(this.selectedCategoryId) : null,
      segmentId: this.selectedGroupId ? Number(this.selectedGroupId) : null,
      productId: this.selectedProductId ? Number(this.selectedProductId) : null,
      pagination: {
        pageNumber: 0,
        pageSize: 100,
        sortBy: 'categoryName',
        sortOrder: 'ASC'
      }
    };

    this.reportService.getStockInHandReport(filter).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.status && response.data) {
          this.reportData = response.data;
        } else {
          this.reportData = null;
        }
        this.expandedCategories.clear();
        this.expandedSegments.clear();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching Stock In Hand report:', err);
        this.reportData = null;
      }
    });
  }

  resetFilters(): void {
    this.selectedCategoryId = null;
    this.selectedGroupId = null;
    this.selectedProductId = null;
    this.onSearch();
  }

  onDownload(): void {
    this.isDownloading = true;
    const filter = {
      categoryId: this.selectedCategoryId ? Number(this.selectedCategoryId) : null,
      segmentId: this.selectedGroupId ? Number(this.selectedGroupId) : null,
      productId: this.selectedProductId ? Number(this.selectedProductId) : null
    };

    this.reportService.downloadStockInHandReport(filter).subscribe({
      next: (blob: Blob) => {
        this.isDownloading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Stock_In_Hand_Report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.isDownloading = false;
        console.error('Error downloading Stock in Hand Excel:', err);
      }
    });
  }

  toggleCategoryExpand(catId: number): void {
    if (this.expandedCategories.has(catId)) {
      this.expandedCategories.delete(catId);
    } else {
      this.expandedCategories.add(catId);
    }
  }

  isCategoryExpanded(catId: number): boolean {
    return this.expandedCategories.has(catId);
  }

  toggleSegmentExpand(groupId: number): void {
    if (this.expandedSegments.has(groupId)) {
      this.expandedSegments.delete(groupId);
    } else {
      this.expandedSegments.add(groupId);
    }
  }

  isSegmentExpanded(groupId: number): boolean {
    return this.expandedSegments.has(groupId);
  }

  // Get total quantity helper for summary row
  get grandTotalQuantity(): number {
    if (!this.reportData?.categories) return 0;
    return this.reportData.categories.reduce(
      (sum: number, cat: any) => sum + Number(cat.totalCategoryQuantity || 0),
      0
    );
  }
}
