import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, FunnelReportFilter, FunnelSeriesDto } from '../../../../service/report.service';
import { Breadcrumb } from '../../../../models/breadcrumb';

// ── Highcharts (loaded from CDN via index.html if available, else gracefully skipped) ──
declare var Highcharts: any;

interface WeekOption {
  label: string;
  startDate: string;
  endDate: string;
}

import { Pageheader } from '../../../../shared/pageheader/pageheader';

@Component({
  selector: 'app-funnel-report',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader],
  templateUrl: './funnel-report.html',
  styleUrls: ['./funnel-report.css']
})
export class FunnelReportComponent implements OnInit, AfterViewInit, OnDestroy {

  // ─── Drill Down State ──────────────────────────────────────────────────────
  currentLevel: number = 1; // 1 = Main, 2 = Stage, 3 = Competitor, 4 = Table
  drillCategory: string = '';
  drillSeries: string = '';
  tableData: any[] = [];
  chartTitleLevel: string = '';


  // ─── Breadcrumbs ───────────────────────────────────────────────────────────
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Funnel Report' }
  ];

  // ─── Filter State ──────────────────────────────────────────────────────────
  selectedUserId: number | null = null;
  selectedViewTime: string = 'm';          // w | m | q | y
  measure: number = 2;                     // 1 = Qty, 2 = Lakhs

  // ─── User dropdown ─────────────────────────────────────────────────────────
  users: { id: number; label: string }[] = [];

  // ── Searchable Dropdown State ──
  dropdownOpen = false;
  searchQuery = '';

  get filteredUsers() {
    if (!this.searchQuery) return this.users;
    return this.users.filter(u => u.label.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  get selectedUserName() {
    if (!this.selectedUserId) return 'Select Users';
    const u = this.users.find(u => u.id === this.selectedUserId);
    return u ? u.label : 'Select Users';
  }

  toggleDropdown(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.regionDropdownOpen = false;
    } else {
      this.searchQuery = '';
    }
  }

  selectUser(id: number | null) {
    this.selectedUserId = id;
    this.dropdownOpen = false;
    this.searchQuery = '';
    this.onUserChange();
  }

  // ─── Region dropdown ───────────────────────────────────────────────────────
  selectedRegionId: number | null = null;
  regions: { id: number; label: string }[] = [];
  regionDropdownOpen = false;
  regionSearchQuery = '';

  get filteredRegions() {
    if (!this.regionSearchQuery) return this.regions;
    return this.regions.filter(r => r.label.toLowerCase().includes(this.regionSearchQuery.toLowerCase()));
  }

  get selectedRegionName() {
    if (!this.selectedRegionId) return 'Select Region';
    const r = this.regions.find(r => r.id === this.selectedRegionId);
    return r ? r.label : 'Select Region';
  }

  toggleRegionDropdown(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.regionDropdownOpen = !this.regionDropdownOpen;
    if (this.regionDropdownOpen) {
      this.dropdownOpen = false;
    } else {
      this.regionSearchQuery = '';
    }
  }

  selectRegion(id: number | null) {
    this.selectedRegionId = id;
    this.regionDropdownOpen = false;
    this.regionSearchQuery = '';
    this.loadReport();
  }

  // ─── Period dropdowns ──────────────────────────────────────────────────────
  weekOptions: WeekOption[] = [];
  selectedWeek: WeekOption | null = null;

  monthOptions: { label: string; year: number; month: number }[] = [];
  selectedMonth: { label: string; year: number; month: number } | null = null;

  quarterOptions: { label: string; startDate: string; endDate: string }[] = [];
  selectedQuarter: { label: string; startDate: string; endDate: string } | null = null;

  yearOptions: { label: string; fyStart: string; fyEnd: string }[] = [];
  selectedYear: { label: string; fyStart: string; fyEnd: string } | null = null;

  // ─── Chart state ──────────────────────────────────────────────────────────
  chartTitle: string = 'Funnel Report';
  chartInstance: any = null;
  isLoading: boolean = false;
  hasError: boolean = false;

  goBack() {
    if (this.currentLevel === 4) {
      if (this.drillSeries === 'Closed Lost') {
        this.currentLevel = 3;
        this.loadLevel3(this.drillCategory, this.drillSeries);
      } else if (this.drillSeries === 'New' || this.drillSeries === 'Closed') {
        this.currentLevel = 2;
        this.loadLevel2(this.drillCategory, this.drillSeries);
      } else {
        this.currentLevel = 1;
        this.loadReport();
      }
    } else if (this.currentLevel === 3) {
      this.currentLevel = 2;
      this.loadLevel2(this.drillCategory, 'Closed');
    } else if (this.currentLevel === 2) {
      this.currentLevel = 1;
      this.loadReport();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
      this.regionDropdownOpen = false;
    }
  }

  constructor(
    private reportService: ReportService,
    private elementRef: ElementRef
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildWeekOptions();
    this.buildMonthOptions();
    this.buildQuarterOptions();
    this.buildYearOptions();
    this.setDefaultSelections();
    this.loadUsers();
    this.loadRegions();
  }

  ngAfterViewInit(): void {
    // Small delay to ensure DOM is ready for Highcharts
    setTimeout(() => this.loadReport(), 100);
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Period builder helpers
  // ─────────────────────────────────────────────────────────────────────────

  /** Build week options for the CURRENT month only */
  private buildWeekOptions(): void {
    const today = new Date();
    // Start from the 1st of the current month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    // Move to Monday on or before monthStart
    const cursor = new Date(monthStart);
    const day = cursor.getDay(); // 0=Sun,1=Mon,...
    const diff = day === 0 ? -6 : 1 - day; // shift to Monday
    cursor.setDate(cursor.getDate() + diff);

    this.weekOptions = [];
    let weekNum = 1;
    while (cursor <= today) {
      const weekEnd = new Date(cursor);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const effectiveEnd = weekEnd > today ? today : weekEnd;
      this.weekOptions.push({
        label: `Week${weekNum} (${this.toIsoDate(cursor)} to ${this.toIsoDate(effectiveEnd)})`,
        startDate: this.toIsoDate(cursor),
        endDate: this.toIsoDate(effectiveEnd)
      });
      cursor.setDate(cursor.getDate() + 7);
      weekNum++;
    }
  }

  /** Build month options from FY start to current month */
  private buildMonthOptions(): void {
    const today = new Date();
    const fyStart = this.getFyStart();
    const cursor = new Date(fyStart);
    this.monthOptions = [];
    while (cursor.getFullYear() < today.getFullYear() ||
           (cursor.getFullYear() === today.getFullYear() && cursor.getMonth() <= today.getMonth())) {
      this.monthOptions.push({
        label: cursor.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
        year: cursor.getFullYear(),
        month: cursor.getMonth() + 1
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  /** Build quarter options for the current FY */
  private buildQuarterOptions(): void {
    const today = new Date();
    const fyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    // Q1=Apr-Jun, Q2=Jul-Sep, Q3=Oct-Dec, Q4=Jan-Mar
    const quarters = [
      { label: 'Quarter1', start: new Date(fyStartYear, 3, 1), end: new Date(fyStartYear, 5, 30) },
      { label: 'Quarter2', start: new Date(fyStartYear, 6, 1), end: new Date(fyStartYear, 8, 30) },
      { label: 'Quarter3', start: new Date(fyStartYear, 9, 1), end: new Date(fyStartYear, 11, 31) },
      { label: 'Quarter4', start: new Date(fyStartYear + 1, 0, 1), end: new Date(fyStartYear + 1, 2, 31) }
    ];
    this.quarterOptions = quarters
      .filter(q => q.start <= today)
      .map(q => ({
        label: q.label,
        startDate: this.toIsoDate(q.start),
        endDate: this.toIsoDate(q.end > today ? today : q.end)
      }));
  }

  /** Build year option for current FY */
  private buildYearOptions(): void {
    const today = new Date();
    const fyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const fyEndYear = fyStartYear + 1;
    this.yearOptions = [{
      label: `${fyStartYear}-${String(fyEndYear).slice(-2)}`,
      fyStart: `${fyStartYear}-04-01`,
      fyEnd: this.toIsoDate(today)
    }];
  }

  private setDefaultSelections(): void {
    // Default: current month view
    this.selectedViewTime = 'm';
    if (this.monthOptions.length > 0) {
      this.selectedMonth = this.monthOptions[this.monthOptions.length - 1];
    }
    if (this.weekOptions.length > 0) {
      this.selectedWeek = this.weekOptions[this.weekOptions.length - 1];
    }
    if (this.quarterOptions.length > 0) {
      this.selectedQuarter = this.quarterOptions[this.quarterOptions.length - 1];
    }
    if (this.yearOptions.length > 0) {
      this.selectedYear = this.yearOptions[0];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Users
  // ─────────────────────────────────────────────────────────────────────────

  loadUsers(): void {
    this.reportService.getUsersForDropdown().subscribe({
      next: (users: any) => {
        this.users = users;
      },
      error: () => {
        this.users = [];
      }
    });
  }

  loadRegions(): void {
    this.reportService.getRegionsForDropdown().subscribe({
      next: (regions: any) => {
        this.regions = regions;
      },
      error: () => {
        this.regions = [];
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // View-time tab change
  // ─────────────────────────────────────────────────────────────────────────

  selectViewTime(view: string): void {
    this.selectedViewTime = view;
    this.loadReport();
  }

  onPeriodChange(): void {
    this.loadReport();
  }

  onUserChange(): void {
    this.loadReport();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Build the filter from current UI state
  // ─────────────────────────────────────────────────────────────────────────

  private buildFilter(): FunnelReportFilter {
    const today = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (this.selectedViewTime === 'w' && this.selectedWeek) {
      startDate = this.selectedWeek.startDate;
      endDate   = this.selectedWeek.endDate;
    } else if (this.selectedViewTime === 'm' && this.selectedMonth) {
      startDate = `${this.selectedMonth.year}-${String(this.selectedMonth.month).padStart(2, '0')}-01`;
      // Last day of selected month
      const lastDay = new Date(this.selectedMonth.year, this.selectedMonth.month, 0);
      endDate = lastDay > today ? this.toIsoDate(today) : this.toIsoDate(lastDay);
    } else if (this.selectedViewTime === 'q' && this.selectedQuarter) {
      startDate = this.selectedQuarter.startDate;
      endDate   = this.selectedQuarter.endDate;
    } else if (this.selectedViewTime === 'y' && this.selectedYear) {
      startDate = this.selectedYear.fyStart;
      endDate   = this.selectedYear.fyEnd;
    }

    return {
      userId:    this.selectedUserId || null,
      regionId:  this.selectedRegionId || null,
      viewTime:  this.selectedViewTime,
      measure:   this.measure,
      startDate: startDate,
      endDate:   endDate
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Load Report
  // ─────────────────────────────────────────────────────────────────────────

  loadReport(): void {
    this.isLoading = true;
    this.hasError = false;
    this.currentLevel = 1;
    this.updateChartTitle();
    const filter = this.buildFilter();
    this.updateChartTitle();

    this.reportService.getFunnelReport(filter).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const data = response.data || response;
        this.renderChart(data.xAxisCategories || [], data.series || []);
      },
      error: (err: any) => {
        console.error('Funnel report error:', err);
        this.isLoading = false;
        this.hasError  = true;
        // Render empty chart placeholder
        this.renderChart([], []);
      }
    });
  }

  private updateChartTitle(): void {
    if (this.selectedViewTime === 'w' && this.selectedWeek) {
      // e.g. "Week16 (2026-07-22 to 2026-07-28)" → extract "Week16"
      const weekLabel = this.selectedWeek.label.split('(')[0].trim();
      this.chartTitle = `Funnel report ( ${weekLabel} )`;
    } else if (this.selectedViewTime === 'm' && this.selectedMonth) {
      this.chartTitle = `Funnel report ( ${this.selectedMonth.label} )`;
    } else if (this.selectedViewTime === 'q' && this.selectedQuarter) {
      this.chartTitle = `Funnel report ( ${this.selectedQuarter.label} )`;
    } else if (this.selectedViewTime === 'y' && this.selectedYear) {
      this.chartTitle = `Funnel report ( ${this.selectedYear.label} )`;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Highcharts rendering
  // ─────────────────────────────────────────────────────────────────────────

  private renderChart(categories: string[], series: FunnelSeriesDto[]): void {
    if (typeof Highcharts === 'undefined') {
      console.warn('Highcharts is not loaded');
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const colorMap: Record<string, string> = {
      Hot:    '#e74c3c',
      Warm:   '#e67e22',
      Cold:   '#3498db',
      New:    '#2c3e50',
      Closed: '#27ae60'
    };

    const self = this;
    const chartSeries = series.map(s => ({
      name: s.name,
      type: 'column',
      data: s.data,
      color: colorMap[s.name] || '#7f8c8d',
      borderWidth: 0,
      events: {
        click: (e: any) => {
          const seriesName = e.point.series.name;
          if (self.currentLevel === 1) {
            self.drillCategory = e.point.category;
            self.drillSeries = seriesName;
            if (seriesName === 'New' || seriesName === 'Closed') {
              self.currentLevel = 2;
              self.loadLevel2(self.drillCategory, self.drillSeries);
            } else {
              self.currentLevel = 4;
              self.loadLevel4(self.drillCategory, self.drillSeries);
            }
          } else if (self.currentLevel === 2) {
             self.drillCategory = e.point.category;
             const stageName = seriesName;
             if (stageName === 'Closed Lost') {
               self.currentLevel = 3;
               self.drillSeries = stageName;
               self.loadLevel3(self.drillCategory, stageName);
             } else {
               self.currentLevel = 4;
               self.drillSeries = stageName;
               self.loadLevel4(self.drillCategory, stageName);
             }
          } else if (self.currentLevel === 3) {
             self.drillCategory = e.point.category;
             self.drillSeries = seriesName;
             self.currentLevel = 4;
             self.loadLevel4(self.drillCategory, self.drillSeries);
          }
        }
      }
    }));

    this.chartInstance = Highcharts.chart('funnel-chart-container', {
      chart: {
        type: 'column',
        backgroundColor: '#ffffff',
        style: { fontFamily: "'Segoe UI', sans-serif" },
        marginBottom: 120,
        spacingBottom: 20,
        height: 420
      },
      title: { text: '' },
      xAxis: {
        categories: categories,
        labels: {
          useHTML: true,
          rotation: 0,
          align: 'center',
          formatter: function(this: any): string {
            const val = this.value;
            if (typeof val === 'string' && val.includes('Week')) {
              const match = val.match(/(Week\d+)\s*\((.*?)\s+to\s+(.*?)\)/);
              if (match && match.length === 4) {
                const weekLabel = match[1];
                const start = match[2];
                const end = match[3];
                const formatShortDate = (dStr: string) => {
                  const parts = dStr.split('-');
                  if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}`;
                  }
                  return dStr;
                };
                return `<div style="text-align: center; line-height: 1.2;"><b>${weekLabel}</b><br/><span style="font-size: 9px; color: #777;">${formatShortDate(start)} to ${formatShortDate(end)}</span></div>`;
              }
              return val.split('(')[0].trim();
            }
            return val;
          },
          style: { fontSize: '11px', color: '#555' }
        },
        crosshair: true,
        lineColor: '#ccc'
      },
      yAxis: {
        title: {
          text: this.measure === 2 ? 'Value in Lakhs' : 'Quantity',
          style: { color: '#555' }
        },
        gridLineColor: '#e8e8e8',
        min: 0
      },
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'top',
        itemStyle: { fontWeight: '500', fontSize: '12px' },
        symbolRadius: 4
      },
      exporting: {
        enabled: true
      },
      tooltip: {
        shared: true,
        valueSuffix: this.measure === 2 ? ' L' : ' units',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#ddd',
        shadow: true
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          minPointLength: 5,
          dataLabels: { enabled: true, color: '#ffffff' }
        },
        series: {
          cursor: 'pointer'
        }
      },
      credits: { enabled: false },
      series: chartSeries
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Drill-Down API Calls
  // ─────────────────────────────────────────────────────────────────────────
  
  private parseDrillDownFilter(category: string, seriesName: string): any {
    const f: any = this.buildFilter();
    f.category = category;
    f.seriesName = seriesName;
    return f;
  }

  loadLevel2(category: string, seriesName: string): void {
    this.isLoading = true;
    this.chartTitleLevel = `Level 2: ${seriesName} deals by Stage for ${category}`;
    this.reportService.getFunnelLevel2(this.parseDrillDownFilter(category, seriesName))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.renderChart(res.xAxisCategory2 || [category], res.chart2Series);
        },
        error: () => {
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }

  loadLevel3(category: string, seriesName: string): void {
    this.isLoading = true;
    this.chartTitleLevel = `Level 3: Closed Lost by Competitor for ${category}`;
    this.reportService.getFunnelLevel3(this.parseDrillDownFilter(category, seriesName))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.renderChart(res.xAxisCategory2 || [category], res.chart2Series);
        },
        error: () => {
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }

  loadLevel4(category: string, seriesName: string): void {
    this.isLoading = true;
    this.chartTitleLevel = `Data Table: ${seriesName} deals for ${category}`;
    this.reportService.getFunnelTable(this.parseDrillDownFilter(category, seriesName))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.tableData = res.results || [];
        },
        error: () => {
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters for template
  // ─────────────────────────────────────────────────────────────────────────

  get currentPeriodDropdownLabel(): string {
    if (this.selectedViewTime === 'w' && this.selectedWeek) return this.selectedWeek.label;
    if (this.selectedViewTime === 'm' && this.selectedMonth) return this.selectedMonth.label;
    if (this.selectedViewTime === 'q' && this.selectedQuarter) return this.selectedQuarter.label;
    if (this.selectedViewTime === 'y' && this.selectedYear) return this.selectedYear.label;
    return 'Select Period';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────────────────────────────────

  private getFyStart(): Date {
    const today = new Date();
    const fyYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    return new Date(fyYear, 3, 1); // 1st April
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private fmtDate(d: Date): string {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
