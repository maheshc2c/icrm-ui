import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportService } from '../../../service/report.service';
import { LostGroupDto, LostRegionDto, LostProductDto } from '../../../models/opportunity-lost.model';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Segment } from '../../../models/segment';

@Component({
  selector: 'app-opportunity-lost-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    NgApexchartsModule,
    Pageheader
  ],
  templateUrl: './opportunity-lost-report.html',
  styleUrl: './opportunity-lost-report.css',
})
export class OpportunityLostReport implements OnInit {

  headerTitle = 'Opportunity Lost Report';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Opportunity Lost' }
  ];

  selectedColor = '#6366f1';

  title = 'Opportunity Lost Report';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/salesmanager-dashboard' },
    { label: 'Opportunity Lost' }
  ];

  // Flow State
  currentLevel: 1 | 2 | 3 = 1;
  isLoading = false;

  // Filters
  startDate: string = '';
  endDate: string = '';
  selectedUserId: number | null = null;
  usersList: any[] = [];
  selectedTimeline: 'w' | 'm' | 'q' | 'y' | 'all' = 'all';
  selectedSegmentId: number | null = null;
  segmentsList: Segment[] = [];
  selectedRegionFilterId: number | null = null;
  selectedRegionFilterName: string = 'All Regions';
  regionsList: any[] = [];

  // Searchable Dropdowns State
  showSalespersonDropdown = false;
  salespersonSearchQuery = '';
  selectedSalespersonName = 'All Users';

  showSegmentDropdown = false;
  segmentSearchQuery = '';
  selectedSegmentName = 'All Segments';

  showRegionDropdown = false;
  regionSearchQuery = '';

  private salespersonSearchTimeout: any;
  private segmentSearchTimeout: any;
  private regionSearchTimeout: any;

  // Level 1 Data (Pie Charts)
  reasonsData: LostGroupDto[] = [];
  competitorsData: LostGroupDto[] = [];
  reasonsChartOptions: any;
  competitorsChartOptions: any;

  // Level 2 Data (Region Breakdown)
  selectedType: 'Reason' | 'Competitor' = 'Reason';
  selectedId: number = 0;
  selectedName: string = '';
  regionData: LostRegionDto[] = [];
  regionChartOptions: any;

  // Level 3 Data (Product List)
  selectedRegionId: number = 0;
  selectedRegionName: string = '';
  productData: LostProductDto[] = [];

  constructor(
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.setDynamicHomeRoute();
    this.setTimeline('all');
    this.loadActiveUsers();
    this.loadSegments();
    this.loadRegions();
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

      this.headerBreadcrumbs = [
        { label: 'Home', route: homeRoute },
        { label: 'Opportunity Lost' }
      ];
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.closeDropdowns();
  }

  closeDropdowns(): void {
    this.showSalespersonDropdown = false;
    this.showSegmentDropdown = false;
    this.showRegionDropdown = false;
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  loadActiveUsers(search?: string): void {
    this.reportService.getActiveUsersDropdown(search).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.usersList = res.data || [];
        }
      },
      error: (err) => console.error('Error loading active users', err)
    });
  }

  setTimeline(timeline: 'w' | 'm' | 'q' | 'y' | 'all'): void {
    this.selectedTimeline = timeline;
    if (timeline === 'all') {
      this.startDate = '';
      this.endDate = '';
    } else {
      const now = new Date();
      const start = new Date();
      if (timeline === 'w') {
        start.setDate(now.getDate() - 7);
      } else if (timeline === 'm') {
        start.setMonth(now.getMonth() - 1);
      } else if (timeline === 'q') {
        start.setMonth(now.getMonth() - 3);
      } else if (timeline === 'y') {
        start.setFullYear(now.getFullYear() - 1);
      }
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(now);
    }
    
    if (this.currentLevel === 1) {
      this.fetchLevel1Data();
    } else if (this.currentLevel === 2) {
      this.fetchLevel2Data();
    } else if (this.currentLevel === 3) {
      this.fetchLevel3Data();
    }
  }

  loadSegments(search?: string): void {
    this.reportService.getSegmentsDropdown(search).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.segmentsList = res.data || [];
        }
      },
      error: (err) => console.error('Error loading segments', err)
    });
  }

  loadRegions(search?: string): void {
    this.reportService.getRegionsDropdown(search).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.regionsList = res.data || [];
        }
      },
      error: (err) => console.error('Error loading regions', err)
    });
  }

  onSalespersonSearchChange(query: string): void {
    this.salespersonSearchQuery = query;
    clearTimeout(this.salespersonSearchTimeout);
    this.salespersonSearchTimeout = setTimeout(() => {
      this.loadActiveUsers(query);
    }, 300);
  }

  onSegmentSearchChange(query: string): void {
    this.segmentSearchQuery = query;
    clearTimeout(this.segmentSearchTimeout);
    this.segmentSearchTimeout = setTimeout(() => {
      this.loadSegments(query);
    }, 300);
  }

  onRegionSearchChange(query: string): void {
    this.regionSearchQuery = query;
    clearTimeout(this.regionSearchTimeout);
    this.regionSearchTimeout = setTimeout(() => {
      this.loadRegions(query);
    }, 300);
  }

  toggleSalespersonDropdown(event: Event): void {
    event.stopPropagation();
    this.showSalespersonDropdown = !this.showSalespersonDropdown;
    this.showSegmentDropdown = false;
    this.showRegionDropdown = false;
    if (this.showSalespersonDropdown) {
      this.salespersonSearchQuery = '';
      this.loadActiveUsers();
    }
  }

  toggleSegmentDropdown(event: Event): void {
    event.stopPropagation();
    this.showSegmentDropdown = !this.showSegmentDropdown;
    this.showSalespersonDropdown = false;
    this.showRegionDropdown = false;
    if (this.showSegmentDropdown) {
      this.segmentSearchQuery = '';
      this.loadSegments();
    }
  }

  toggleRegionDropdown(event: Event): void {
    event.stopPropagation();
    this.showRegionDropdown = !this.showRegionDropdown;
    this.showSalespersonDropdown = false;
    this.showSegmentDropdown = false;
    if (this.showRegionDropdown) {
      this.regionSearchQuery = '';
      this.loadRegions();
    }
  }

  selectSalesperson(user: any): void {
    if (user === null) {
      this.selectedUserId = null;
      this.selectedSalespersonName = 'All Users';
    } else {
      this.selectedUserId = user.id;
      this.selectedSalespersonName = user.name;
    }
    this.showSalespersonDropdown = false;
    this.applyFilters();
  }

  selectSegment(seg: any): void {
    if (seg === null) {
      this.selectedSegmentId = null;
      this.selectedSegmentName = 'All Segments';
    } else {
      this.selectedSegmentId = seg.groupId;
      this.selectedSegmentName = seg.groupName;
    }
    this.showSegmentDropdown = false;
    this.applyFilters();
  }

  selectRegionFilter(region: any): void {
    if (region === null) {
      this.selectedRegionFilterId = null;
      this.selectedRegionFilterName = 'All Regions';
    } else {
      this.selectedRegionFilterId = region.id;
      this.selectedRegionFilterName = region.name;
    }
    this.showRegionDropdown = false;
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.currentLevel === 1) {
      this.fetchLevel1Data();
    } else if (this.currentLevel === 2) {
      this.fetchLevel2Data();
    } else if (this.currentLevel === 3) {
      this.fetchLevel3Data();
    }
  }

  resetFilters(): void {
    this.selectedUserId = null;
    this.selectedSalespersonName = 'All Users';
    this.selectedSegmentId = null;
    this.selectedSegmentName = 'All Segments';
    this.selectedRegionFilterId = null;
    this.selectedRegionFilterName = 'All Regions';
    this.setTimeline('all');
  }

  fetchLevel1Data(): void {
    this.isLoading = true;
    this.reportService.getLostDealsLevel1(
      this.startDate, 
      this.endDate, 
      this.selectedUserId || undefined,
      this.selectedSegmentId || undefined,
      this.selectedRegionFilterId || undefined
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status && res.data) {
          this.reasonsData = res.data.byReason || [];
          this.competitorsData = res.data.byCompetitor || [];
          this.buildReasonsChart();
          this.buildCompetitorsChart();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading level 1 data', err);
      }
    });
  }

  buildReasonsChart(): void {
    const seriesValues = this.reasonsData.map(r => r.totalValueLakhs);
    const labelNames = this.reasonsData.map(r => `${r.name} (${r.percentage}%)`);

    this.reasonsChartOptions = {
      series: seriesValues,
      chart: {
        type: 'donut',
        height: 380,
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            const index = config.dataPointIndex;
            const clickedItem = this.reasonsData[index];
            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444', '#14b8a6'];
            const color = colors[index % colors.length];
            if (clickedItem) {
              this.onPieSliceClick(clickedItem.id, clickedItem.name, 'Reason', color);
            }
          }
        }
      },
      labels: labelNames,
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444', '#14b8a6'],
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Lost',
                formatter: (w: any) => {
                  const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return `${sum.toFixed(2)} Lakhs`;
                }
              }
            }
          }
        }
      },
      legend: {
        position: 'bottom',
        fontSize: '13px'
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(2)} Lakhs`
        }
      }
    };
  }

  buildCompetitorsChart(): void {
    const seriesValues = this.competitorsData.map(c => c.totalValueLakhs);
    const labelNames = this.competitorsData.map(c => `${c.name} (${c.percentage}%)`);

    this.competitorsChartOptions = {
      series: seriesValues,
      chart: {
        type: 'donut',
        height: 380,
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            const index = config.dataPointIndex;
            const clickedItem = this.competitorsData[index];
            const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#6366f1', '#ef4444', '#14b8a6'];
            const color = colors[index % colors.length];
            if (clickedItem) {
              this.onPieSliceClick(clickedItem.id, clickedItem.name, 'Competitor', color);
            }
          }
        }
      },
      labels: labelNames,
      colors: ['#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#6366f1', '#ef4444', '#14b8a6'],
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Lost',
                formatter: (w: any) => {
                  const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return `${sum.toFixed(2)} Lakhs`;
                }
              }
            }
          }
        }
      },
      legend: {
        position: 'bottom',
        fontSize: '13px'
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(2)} Lakhs`
        }
      }
    };
  }

  onPieSliceClick(id: number, name: string, type: 'Reason' | 'Competitor', color: string): void {
    this.selectedId = id;
    this.selectedName = name;
    this.selectedType = type;
    this.selectedColor = color;
    this.fetchLevel2Data();
  }

  fetchLevel2Data(): void {
    this.isLoading = true;
    const rId = this.selectedType === 'Reason' ? this.selectedId : undefined;
    const cId = this.selectedType === 'Competitor' ? this.selectedId : undefined;

    this.reportService.getLostDealsLevel2(
      rId, 
      cId, 
      this.startDate, 
      this.endDate,
      this.selectedSegmentId || undefined,
      this.selectedRegionFilterId || undefined
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status && res.data) {
          this.regionData = res.data;
          this.buildRegionChart();
          this.currentLevel = 2;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching level 2 region data', err);
      }
    });
  }

  buildRegionChart(): void {
    const seriesValues = this.regionData.map(r => r.totalValueLakhs);
    const categoryLabels = this.regionData.map(r => r.regionName);

    this.regionChartOptions = {
      series: [
        {
          name: 'Lost Deals (Lakhs)',
          data: seriesValues
        }
      ],
      chart: {
        type: 'bar',
        height: 380,
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            const index = config.dataPointIndex;
            const clickedRegion = this.regionData[index];
            if (clickedRegion) {
              this.onRegionClick(clickedRegion.regionId, clickedRegion.regionName);
            }
          }
        }
      },
      colors: [this.selectedColor],
      plotOptions: {
        bar: {
          columnWidth: '45%',
          distributed: false,
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(2)} L`,
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#303030']
        }
      },
      xaxis: {
        categories: categoryLabels,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: 500
          }
        }
      },
      yaxis: {
        title: {
          text: 'Lost Value (Lakhs)',
          style: {
            fontSize: '13px'
          }
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(2)} Lakhs`
        }
      }
    };
  }

  onRegionClick(regionId: number, regionName: string): void {
    this.selectedRegionId = regionId;
    this.selectedRegionName = regionName;
    this.fetchLevel3Data();
  }

  fetchLevel3Data(): void {
    this.isLoading = true;
    const rId = this.selectedType === 'Reason' ? this.selectedId : undefined;
    const cId = this.selectedType === 'Competitor' ? this.selectedId : undefined;

    this.reportService.getLostDealsLevel3(
      this.selectedRegionId, 
      rId, 
      cId, 
      this.startDate, 
      this.endDate,
      this.selectedSegmentId || undefined
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status && res.data) {
          this.productData = res.data;
          this.currentLevel = 3;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching level 3 product list', err);
      }
    });
  }

  navigateToLevel(level: 1 | 2): void {
    if (level === 1) {
      this.currentLevel = 1;
    } else if (level === 2) {
      this.currentLevel = 2;
    }
  }
}
