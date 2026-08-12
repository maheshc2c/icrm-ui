import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../service/report.service';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Pageheader } from '../../../../shared/pageheader/pageheader';

declare var Highcharts: any;

@Component({
  selector: 'app-runrate-projection-report',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader],
  templateUrl: './runrate-projection-report.html',
  styleUrls: ['./runrate-projection-report.css']
})
export class RunrateProjectionReportComponent implements OnInit, AfterViewInit, OnDestroy {

  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Run Rate Projection' }
  ];

  // Filters
  selectedCategoryId: number | null = null;
  selectedProductId: number | null = null;
  selectedRegionId: number | null = null;
  selectedUserId: number | null = null;
  customRate: number | null = null;
  viewMode: 'graph' | 'table' = 'graph';

  // Dropdown datasets
  categories: { id: number; label: string }[] = [];
  products: { id: number; label: string }[] = [];
  regions: { id: number; label: string }[] = [];
  users: { id: number; label: string }[] = [];

  // Dropdown open states & search queries
  categoryDropdownOpen = false;
  categorySearchQuery = '';

  productDropdownOpen = false;
  productSearchQuery = '';

  regionDropdownOpen = false;
  regionSearchQuery = '';

  userDropdownOpen = false;
  userSearchQuery = '';

  loading = false;
  reportData: any = null;
  tableRows: any[] = [];

  private chart: any = null;

  constructor(private reportService: ReportService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  ngAfterViewInit(): void {
    this.fetchReportData();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
    }
  }

  closeAllDropdowns() {
    this.categoryDropdownOpen = false;
    this.productDropdownOpen = false;
    this.regionDropdownOpen = false;
    this.userDropdownOpen = false;
  }

  loadDropdowns(): void {
    this.reportService.getCategoriesForDropdown().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error('Error fetching categories for dropdown', err)
    });

    this.reportService.getProductsForDropdown().subscribe({
      next: (res) => (this.products = res),
      error: (err) => console.error('Error fetching products for dropdown', err)
    });

    this.reportService.getRegionsForDropdown().subscribe({
      next: (res) => (this.regions = res),
      error: (err) => console.error('Error fetching regions for dropdown', err)
    });

    this.reportService.getUsersForDropdown().subscribe({
      next: (res) => (this.users = res),
      error: (err) => console.error('Error fetching users for dropdown', err)
    });
  }

  // Getters for selected labels
  get selectedCategoryName() {
    if (!this.selectedCategoryId) return 'Select Category';
    const c = this.categories.find(c => c.id === this.selectedCategoryId);
    return c ? c.label : 'Select Category';
  }

  get selectedProductName() {
    if (!this.selectedProductId) return 'Select Product';
    const p = this.products.find(p => p.id === this.selectedProductId);
    return p ? p.label : 'Select Product';
  }

  get selectedRegionName() {
    if (!this.selectedRegionId) return 'Select Region';
    const r = this.regions.find(r => r.id === this.selectedRegionId);
    return r ? r.label : 'Select Region';
  }

  get selectedUserName() {
    if (!this.selectedUserId) return 'Select Users';
    const u = this.users.find(u => u.id === this.selectedUserId);
    return u ? u.label : 'Select Users';
  }

  // Filtered lists
  get filteredCategories() {
    if (!this.categorySearchQuery) return this.categories;
    return this.categories.filter(c => c.label.toLowerCase().includes(this.categorySearchQuery.toLowerCase()));
  }

  get filteredProducts() {
    if (!this.productSearchQuery) return this.products;
    return this.products.filter(p => p.label.toLowerCase().includes(this.productSearchQuery.toLowerCase()));
  }

  get filteredRegions() {
    if (!this.regionSearchQuery) return this.regions;
    return this.regions.filter(r => r.label.toLowerCase().includes(this.regionSearchQuery.toLowerCase()));
  }

  get filteredUsers() {
    if (!this.userSearchQuery) return this.users;
    return this.users.filter(u => u.label.toLowerCase().includes(this.userSearchQuery.toLowerCase()));
  }

  // Toggle handlers
  toggleCategoryDropdown() {
    const nextState = !this.categoryDropdownOpen;
    this.closeAllDropdowns();
    this.categoryDropdownOpen = nextState;
  }

  toggleProductDropdown() {
    const nextState = !this.productDropdownOpen;
    this.closeAllDropdowns();
    this.productDropdownOpen = nextState;
  }

  toggleRegionDropdown() {
    const nextState = !this.regionDropdownOpen;
    this.closeAllDropdowns();
    this.regionDropdownOpen = nextState;
  }

  toggleUserDropdown() {
    const nextState = !this.userDropdownOpen;
    this.closeAllDropdowns();
    this.userDropdownOpen = nextState;
  }

  // Select handlers
  selectCategory(id: number | null) {
    this.selectedCategoryId = id;
    this.selectedProductId = null;
    this.categoryDropdownOpen = false;
    this.categorySearchQuery = '';
    // Re-fetch products for selected category
    this.reportService.getProductsForDropdown(id).subscribe({
      next: (res) => (this.products = res)
    });
    this.onFilterChange();
  }

  selectProduct(id: number | null) {
    this.selectedProductId = id;
    this.productDropdownOpen = false;
    this.productSearchQuery = '';
    this.onFilterChange();
  }

  selectRegion(id: number | null) {
    this.selectedRegionId = id;
    this.regionDropdownOpen = false;
    this.regionSearchQuery = '';
    this.onFilterChange();
  }

  selectUser(id: number | null) {
    this.selectedUserId = id;
    this.userDropdownOpen = false;
    this.userSearchQuery = '';
    this.onFilterChange();
  }

  onCustomRateChange() {
    this.onFilterChange();
  }

  onViewModeChange(mode: 'graph' | 'table') {
    this.viewMode = mode;
    if (mode === 'graph') {
      setTimeout(() => this.renderChart(this.reportData), 50);
    }
  }

  onFilterChange() {
    this.fetchReportData();
  }

  fetchReportData() {
    this.loading = true;
    const filter = {
      categoryId: this.selectedCategoryId,
      productId: this.selectedProductId,
      regionId: this.selectedRegionId,
      userId: this.selectedUserId,
      customRate: this.customRate && this.customRate > 0 ? this.customRate : null
    };

    this.reportService.getRunRateProjection(filter).subscribe({
      next: (data) => {
        this.loading = false;
        this.reportData = data;
        this.tableRows = data.tableRows || [];
        if (this.viewMode === 'graph') {
          setTimeout(() => this.renderChart(data), 50);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching run rate projection report:', err);
      }
    });
  }

  renderChart(data: any) {
    if (!data || typeof Highcharts === 'undefined') return;

    const categories = data.xAxisCategory || data.xaxisCategory || [];
    const yTitle = data.yAxisCategory || 'Value In Lakhs';
    const chartTitle = data.xAxisLabel || 'Run Rate Projection';

    const seriesData = (data.chartSeries || []).map((s: any) => {
      let markerSymbol = 'circle';
      if (s.name.includes('Open Opportunities')) {
        markerSymbol = 'diamond';
      } else if (s.name.includes('Closed Won')) {
        markerSymbol = 'square';
      }

      return {
        name: s.name,
        data: s.data,
        color: s.color,
        dashStyle: s.dashStyle || 'Solid',
        marker: {
          symbol: markerSymbol,
          radius: 5
        }
      };
    });

    const options: any = {
      chart: {
        type: 'spline',
        backgroundColor: 'transparent'
      },
      title: {
        text: chartTitle,
        style: { fontSize: '18px', fontWeight: 'bold', color: '#333333' }
      },
      xAxis: {
        categories: categories,
        labels: {
          useHTML: true,
          style: {
            fontSize: '11px',
            color: '#666666',
            textAlign: 'center'
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: yTitle,
          style: { color: '#666666', fontWeight: '600' }
        },
        labels: {
          style: { color: '#666666' }
        }
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        backgroundColor: '#ffffff',
        borderWidth: 0,
        itemStyle: { fontSize: '12px', fontWeight: 'bold', color: '#444' }
      },
      tooltip: {
        useHTML: true,
        headerFormat: '<span style="font-size:12px;font-weight:bold">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                     '<td style="padding:0"><b>{point.y:.2f} Lakhs</b></td></tr>',
        footerFormat: '</table>',
        shared: true
      },
      plotOptions: {
        spline: {
          dataLabels: {
            enabled: true,
            formatter: function(this: any) {
              return this.y !== null && this.y !== undefined && this.y > 0 ? this.y : null;
            },
            style: { fontWeight: 'bold', fontSize: '10px' }
          }
        }
      },
      series: seriesData,
      credits: { enabled: false }
    };

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = Highcharts.chart('runRateChart', options);
  }
}
