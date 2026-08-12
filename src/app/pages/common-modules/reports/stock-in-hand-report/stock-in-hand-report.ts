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
    { label: 'Stock In Hand' }
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

    // Re-fetch cascading products if category changes
    this.reportService.getProductsForDropdown(id).subscribe({
      next: (res) => (this.products = res),
      error: (err) => console.error('Error fetching products:', err)
    });

    this.fetchReportData();
  }

  selectGroup(id: number | null) {
    this.selectedGroupId = id;
    this.selectedProductId = null;
    this.groupDropdownOpen = false;
    this.groupSearchQuery = '';
    this.fetchReportData();
  }

  selectProduct(id: number | null) {
    this.selectedProductId = id;
    this.productDropdownOpen = false;
    this.productSearchQuery = '';
    this.fetchReportData();
  }

  resetFilters() {
    this.selectedCategoryId = null;
    this.selectedGroupId = null;
    this.selectedProductId = null;
    this.categorySearchQuery = '';
    this.groupSearchQuery = '';
    this.productSearchQuery = '';
    this.fetchReportData();
  }

  fetchReportData() {
    this.isLoading = true;
    const filter = {
      categoryId: this.selectedCategoryId,
      segmentId: this.selectedGroupId,
      productId: this.selectedProductId
    };

    this.reportService.getStockInHandReport(filter).subscribe({
      next: (data) => {
        this.reportData = data;
        this.isLoading = false;

        // Auto-expand all category and segment nodes by default for smooth UX
        if (data && data.categories) {
          data.categories.forEach((cat: any) => {
            this.expandedCategories.add(cat.categoryId);
            if (cat.segments) {
              cat.segments.forEach((seg: any) => {
                this.expandedSegments.add(seg.groupId);
              });
            }
          });
        }
      },
      error: (err) => {
        console.error('Error fetching Stock In Hand report:', err);
        this.isLoading = false;
      }
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
}
