import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../service/report.service';
import { Pageheader } from '../../../../shared/pageheader/pageheader';

@Component({
  selector: 'app-stock-in-hand-report',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader],
  templateUrl: './stock-in-hand-report.html',
  styleUrls: ['./stock-in-hand-report.css']
})
export class StockInHandReportComponent implements OnInit {
  breadcrumbs = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Stock In Hand Report' }
  ];

  // Filter IDs
  selectedCategoryId: number | null = null;
  selectedGroupId: number | null = null;
  selectedProductId: number | null = null;

  // Dropdown lists
  categories: { id: number; label: string }[] = [];
  groups: { id: number; label: string }[] = [];
  products: { id: number; label: string }[] = [];

  // Search queries
  categorySearchQuery = '';
  groupSearchQuery = '';
  productSearchQuery = '';

  // Dropdown open states
  categoryDropdownOpen = false;
  groupDropdownOpen = false;
  productDropdownOpen = false;

  // Pagination & Sorting State (Using PaginationDTO fields)
  pageNumber = 0;
  pageSize = 10;
  sortBy = 'categoryName';
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  totalElements = 0;
  totalPages = 0;

  // Accordion Expand States
  expandedCategories = new Set<number>();
  expandedSegments = new Set<number>();

  // Data
  isLoading = false;
  reportData: any = null;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.fetchReportData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.closeAllDropdowns();
    }
  }

  loadDropdowns() {
    this.reportService.getCategoriesForDropdown().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error('Error fetching categories:', err)
    });

    this.reportService.getProductsForDropdown().subscribe({
      next: (res) => (this.products = res),
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  get selectedCategoryLabel(): string {
    if (this.selectedCategoryId === null) return 'Select Category';
    const found = this.categories.find(c => c.id === this.selectedCategoryId);
    return found ? found.label : 'Select Category';
  }

  get selectedGroupLabel(): string {
    if (this.selectedGroupId === null) return 'Select Segment';
    const found = this.groups.find(g => g.id === this.selectedGroupId);
    return found ? found.label : 'Select Segment';
  }

  get selectedProductLabel(): string {
    if (this.selectedProductId === null) return 'Select Product';
    const found = this.products.find(p => p.id === this.selectedProductId);
    return found ? found.label : 'Select Product';
  }

  get filteredCategories() {
    if (!this.categorySearchQuery) return this.categories;
    return this.categories.filter(c => c.label.toLowerCase().includes(this.categorySearchQuery.toLowerCase()));
  }

  get filteredGroups() {
    if (!this.groupSearchQuery) return this.groups;
    return this.groups.filter(g => g.label.toLowerCase().includes(this.groupSearchQuery.toLowerCase()));
  }

  get filteredProducts() {
    if (!this.productSearchQuery) return this.products;
    return this.products.filter(p => p.label.toLowerCase().includes(this.productSearchQuery.toLowerCase()));
  }

  closeAllDropdowns() {
    this.categoryDropdownOpen = false;
    this.groupDropdownOpen = false;
    this.productDropdownOpen = false;
  }

  toggleCategoryDropdown() {
    const nextState = !this.categoryDropdownOpen;
    this.closeAllDropdowns();
    this.categoryDropdownOpen = nextState;
  }

  toggleGroupDropdown() {
    const nextState = !this.groupDropdownOpen;
    this.closeAllDropdowns();
    this.groupDropdownOpen = nextState;
  }

  toggleProductDropdown() {
    const nextState = !this.productDropdownOpen;
    this.closeAllDropdowns();
    this.productDropdownOpen = nextState;
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId = id;
    this.selectedGroupId = null;
    this.selectedProductId = null;
    this.categoryDropdownOpen = false;
    this.categorySearchQuery = '';

    // Re-fetch products for category
    this.reportService.getProductsForDropdown(id).subscribe({
      next: (res) => (this.products = res),
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  selectGroup(id: number | null) {
    this.selectedGroupId = id;
    this.selectedProductId = null;
    this.groupDropdownOpen = false;
    this.groupSearchQuery = '';
  }

  selectProduct(id: number | null) {
    this.selectedProductId = id;
    this.productDropdownOpen = false;
    this.productSearchQuery = '';
  }

  applySearch() {
    this.pageNumber = 0;
    this.fetchReportData();
  }

  resetFilters() {
    this.selectedCategoryId = null;
    this.selectedGroupId = null;
    this.selectedProductId = null;
    this.categorySearchQuery = '';
    this.groupSearchQuery = '';
    this.productSearchQuery = '';
    this.pageNumber = 0;
    this.fetchReportData();
  }

  toggleSort(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = column;
      this.sortOrder = 'ASC';
    }
    this.fetchReportData();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return 'fa-sort text-muted';
    return this.sortOrder === 'ASC' ? 'fa-sort-up text-primary' : 'fa-sort-down text-primary';
  }

  fetchReportData() {
    this.isLoading = true;
    const filter = {
      categoryId: this.selectedCategoryId,
      segmentId: this.selectedGroupId,
      productId: this.selectedProductId,
      pagination: {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder
      }
    };

    this.reportService.getStockInHandReport(filter).subscribe({
      next: (response) => {
        if (response && response.status) {
          this.reportData = response.data;
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;

          // Auto-expand category and segment nodes for optimal UX
          if (this.reportData && this.reportData.categories) {
            this.reportData.categories.forEach((cat: any) => {
              this.expandedCategories.add(cat.categoryId);
              if (cat.segments) {
                cat.segments.forEach((seg: any) => {
                  this.expandedSegments.add(seg.groupId);
                });
              }
            });
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching Stock In Hand report:', err);
        this.isLoading = false;
      }
    });
  }

  downloadExcel() {
    const filter = {
      categoryId: this.selectedCategoryId,
      segmentId: this.selectedGroupId,
      productId: this.selectedProductId
    };

    this.reportService.downloadStockInHandReport(filter).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Stock_In_Hand_Report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error downloading Stock in Hand Excel:', err)
    });
  }

  toggleCategoryExpand(catId: number) {
    if (this.expandedCategories.has(catId)) {
      this.expandedCategories.delete(catId);
    } else {
      this.expandedCategories.add(catId);
    }
  }

  isCategoryExpanded(catId: number): boolean {
    return this.expandedCategories.has(catId);
  }

  toggleSegmentExpand(groupId: number) {
    if (this.expandedSegments.has(groupId)) {
      this.expandedSegments.delete(groupId);
    } else {
      this.expandedSegments.add(groupId);
    }
  }

  isSegmentExpanded(groupId: number): boolean {
    return this.expandedSegments.has(groupId);
  }

  // Pagination Helper Methods
  getFromIndex(): number {
    if (this.totalElements === 0) return 0;
    return this.pageNumber * this.pageSize + 1;
  }

  getToIndex(): number {
    return Math.min((this.pageNumber + 1) * this.pageSize, this.totalElements);
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.pageNumber) {
      this.pageNumber = page;
      this.fetchReportData();
    }
  }

  onPageSizeChange() {
    this.pageNumber = 0;
    this.fetchReportData();
  }
}
