import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  OpenOrdersService,
  OpenOrderFilter,
  OpenOrderChartResponseDto,
  OpenOrderDrillDownRequest,
  OpenOrderDrillDownResponseDto,
  CustomerRow,
  ProductRow
} from './open-orders-service';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Header } from '../../../../layout/header/header';
import { Breadcrumb } from '../../../../models/breadcrumb';


// Highcharts is loaded from CDN via index.html
declare var Highcharts: any;

// ─── Period option type ───────────────────────────────────────────────────────

interface PeriodOption {
  id?:       number;   // Optional id for database-backed periods (weeks/months)
  label:    string;
  value:    number;   // Keep as number for month/quarter compatibility
  weekNo?:  number;   // Week number for weeks (1-based counter)
  monthNo?: number;   // Month number for months (financial year month_no)
  yearNo?:  number;    // Year number for months
  phpValue?: string;  // PHP format value for weeks: "YYYY-MM-DDtoYYYY-MM-DD"
  monthValue?: string; // PHP format value for months: "month_notoyear_no"
  fromDate: string;
  toDate:   string;
}

// ─── Bar-click context (passed from Highcharts click handler) ─────────────────

interface Chart1ClickContext {
  categoryName: string;   // x-axis label (product category)
  seriesName:   string;   // series name (status label from backend)
}

interface Chart2ClickContext {
  segmentName: string;    // x-axis label clicked in chart2
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-open-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader, Sidebar, Header],
  templateUrl: './open-orders.html',
  styleUrls: ['./open-orders.css']
})
export class OpenOrders implements OnInit, AfterViewInit, OnDestroy {

  // ── Breadcrumbs ──────────────────────────────────────────────────────────
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Open Order Report' }
  ];

  // ── Chart 1 state ─────────────────────────────────────────────────────────
  isLoading    = false;
  hasError     = false;
  errorMessage = '';
  chartTitle   = 'Open Order Report';
  private chart1Instance: any = null;

  // ── Filter state ──────────────────────────────────────────────────────────
  selectedUserId:   number | null = null;
  selectedRegionId: number | null = null;  // NEW: region filter
  selectedViewTime: string        = 'y';   // w | m | q | y | a (default: year to match PHP)

  users: { id: number; label: string }[] = [];
  regions: { id: number; label: string }[] = [];  // NEW: regions dropdown
  showRegionDropdown = true;

  weeks:    PeriodOption[] = [];
  months:   PeriodOption[] = [];
  quarters: PeriodOption[] = [];
  years:    PeriodOption[] = [];

  selectedWeek:    PeriodOption | null = null;
  selectedMonth:   PeriodOption | null = null;
  selectedQuarter: PeriodOption | null = null;
  selectedYear:    PeriodOption | null = null;

  // Searchable user dropdown
  dropdownOpen = false;
  searchQuery  = '';

  // Region dropdown
  regionDropdownOpen = false;

  // ── Chart 2 state (segment drill-down) ────────────────────────────────────
  chart2Visible    = false;
  chart2Loading    = false;
  chart2Error      = false;
  chart2ErrorMsg   = '';
  chart2Title      = '';
  chart2Context: Chart1ClickContext | null = null;
  private chart2Instance: any = null;

  // ── Chart 3 state (customer / product tables) ─────────────────────────────
  chart3Visible   = false;
  chart3Loading   = false;
  chart3Error     = false;
  chart3ErrorMsg  = '';
  chart3Title     = '';
  chart3Context: Chart2ClickContext | null = null;
  chart3Customers: CustomerRow[] = [];
  chart3Products:  ProductRow[]  = [];

  // ─────────────────────────────────────────────────────────────────────────
  constructor(
    private openOrdersService: OpenOrdersService,
    private cdr: ChangeDetectorRef
  ) {}
  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadRegions();  // Load regions first
    this.loadWeeks();    // Load actual financial year weeks from database
    this.loadMonths();   // Load actual financial year months from database
    this.buildPeriodOptions();
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.loadChart(), 200);
  }

  ngOnDestroy(): void {
    this.destroyChart1();
    this.destroyChart2();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // User Dropdown
  // ─────────────────────────────────────────────────────────────────────────

  get filteredUsers() {
    if (!this.searchQuery) return this.users;
    return this.users.filter(u =>
      u.label.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get selectedUserName(): string {
    if (!this.selectedUserId) return 'Select User';
    const u = this.users.find(u => u.id === this.selectedUserId);
    return u ? u.label : 'Select User';
  }

  selectUser(user: { id: number; label: string }): void {
    this.selectedUserId = user.id;
    this.dropdownOpen   = false;
    this.searchQuery    = '';
    this.resetDrillDowns();
    this.loadChart();
  }

  clearUser(): void {
    this.selectedUserId = null;
    this.resetDrillDowns();
    this.loadChart();
  }

  private loadUsers(): void {
    this.users = [];
    this.openOrdersService.getUsersForDropdown(this.selectedRegionId).subscribe({
      next: users => {
        this.users = users.map(u => ({ id: Number(u.id), label: u.label }));
      },
      error: () => console.warn('Could not load users dropdown')
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Region Dropdown
  // ─────────────────────────────────────────────────────────────────────────

  get selectedRegionName(): string {
    if (!this.selectedRegionId) return 'Select Region';
    const r = this.regions.find(r => r.id === this.selectedRegionId);
    return r ? r.label : 'Select Region';
  }

  selectRegion(region: { id: number; label: string }): void {
    this.selectedRegionId = Number(region.id);
    this.regionDropdownOpen = false;
    this.selectedUserId = null;
    this.loadUsers();
    this.resetDrillDowns();
    this.loadChart();
  }

  clearRegion(): void {
    this.selectedRegionId = null;
    this.regionDropdownOpen = false;
    this.selectedUserId = null;  // Clear user selection
    this.loadUsers();  // Reload all users
    this.resetDrillDowns();
    this.loadChart();
  }

  private loadRegions(): void {
    this.openOrdersService.getRegionsForDropdown().subscribe({
      next: (regions) => {
        this.regions = regions.map(r => ({ id: Number(r.id), label: r.label }));
      },
      error: () => console.warn('Could not load regions dropdown')
    });
  }

  private loadWeeks(): void {
    console.log('=== Loading weeks from backend ===');
    this.openOrdersService.getWeeksForDropdown().subscribe({
      next: (weeks) => {
        console.log('Weeks received from backend:', weeks);
        this.weeks = weeks.map(w => ({ 
          id: Number(w.id), 
          label: w.label, 
          value: w.weekNo ?? Number(w.id), // Use weekNo for numeric value
          weekNo: w.weekNo, // Week number for display
          phpValue: w.value, // PHP format value: "YYYY-MM-DDtoYYYY-MM-DD"
          fromDate: w.fromDate,
          toDate: w.toDate
        })) as PeriodOption[];
        console.log('Processed weeks:', this.weeks);
        // Set default selected week to the current week (first week in list)
        if (this.weeks.length > 0) {
          this.selectedWeek = this.weeks[0];
          console.log('Selected week:', this.selectedWeek);
        }
      },
      error: (error) => {
        console.error('Error loading weeks from backend:', error);
        console.warn('Could not load weeks dropdown, falling back to programmatic calculation');
        // Fallback to programmatic calculation if API fails
        this.buildProgrammaticWeeks();
      }
    });
  }

  private loadMonths(): void {
    this.openOrdersService.getMonthsForDropdown().subscribe({
      next: (months) => {
        this.months = months.map(m => ({ 
          id: Number(m.id), 
          label: m.label, 
          value: m.monthNo ?? Number(m.id), // Use monthNo for numeric value
          monthNo: m.monthNo, // Month number for display
          yearNo: m.yearNo, // Year number
          monthValue: m.value, // PHP format value: "month_notoyear_no"
          fromDate: m.fromDate,
          toDate: m.toDate
        })) as PeriodOption[];
        // Set default selected month to the current month
        if (this.months.length > 0) {
          this.selectedMonth = this.months[this.months.length - 1]; // Select the last (current) month
        }
      },
      error: () => {
        console.warn('Could not load months dropdown, falling back to programmatic calculation');
        // Fallback to programmatic calculation if API fails
        this.buildProgrammaticMonths();
      }
    });
  }

  private buildProgrammaticWeeks(): void {
    console.log('=== Building programmatic weeks for current month ===');
    const today = new Date();
    console.log('Current date:', today);
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    console.log('Month start:', currentMonthStart, 'Month end:', currentMonthEnd);
    
    let weekNo = 1;
    let wStart = new Date(currentMonthStart);
    
    this.weeks = [] as PeriodOption[];
    while (wStart <= currentMonthEnd) {
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 6);
      
      this.weeks.push({
        label: `Week ${weekNo} (${this.fmtDate(wStart)})`,
        value: weekNo,
        weekNo: weekNo,
        phpValue: `${this.toIsoDate(wStart)}to${this.toIsoDate(wEnd > currentMonthEnd ? currentMonthEnd : wEnd)}`,
        fromDate: this.toIsoDate(wStart),
        toDate: this.toIsoDate(wEnd > currentMonthEnd ? currentMonthEnd : wEnd)
      });
      
      weekNo++;
      wStart.setDate(wStart.getDate() + 7);
    }
    
    console.log('Programmatic weeks built:', this.weeks);
    
    if (this.weeks.length > 0) {
      this.selectedWeek = this.weeks[0];
      console.log('Selected programmatic week:', this.selectedWeek);
    }
  }

  private buildProgrammaticMonths(): void {
    const today = new Date();
    const fyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const fyStart = new Date(fyStartYear, 3, 1);
    const fyEnd = new Date(fyStartYear + 1, 2, 31);
    
    const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const currentFyMonth = (today.getMonth() - 3 + 12) % 12;
    
    this.months = monthNames
      .slice(0, currentFyMonth + 1)
      .map((name, i) => {
        const mStart = new Date(fyStartYear + (i >= 9 ? 1 : 0), (3 + i) % 12, 1);
        const mEnd = new Date(fyStartYear + (i >= 9 ? 1 : 0), (3 + i) % 12 + 1, 0);
        const fyMonthNo = i + 1;
        const year = mStart.getFullYear();
        
        return {
          id: i + 1,
          label: `${name}-${year.toString().slice(-2)}`,
          value: fyMonthNo,
          monthNo: fyMonthNo,
          yearNo: year,
          monthValue: `${fyMonthNo}to${year}`,
          fromDate: this.toIsoDate(mStart),
          toDate: this.toIsoDate(mEnd)
        };
      });
    
    if (this.months.length > 0) {
      this.selectedMonth = this.months[this.months.length - 1]; // Select current month
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Period Options
  // ─────────────────────────────────────────────────────────────────────────

  private buildPeriodOptions(): void {
    const today       = new Date();
    const fyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const fyStart     = new Date(fyStartYear, 3, 1);
    const fyEnd       = new Date(fyStartYear + 1, 2, 31);

    // Months are now loaded from database via loadMonths() method
    // This ensures month boundaries match the actual financial year setup

    const qLabels = ['Q1 (Apr–Jun)', 'Q2 (Jul–Sep)', 'Q3 (Oct–Dec)', 'Q4 (Jan–Mar)'];
    const currentFyMonth = (today.getMonth() - 3 + 12) % 12;
    const currentQuarter = Math.floor(currentFyMonth / 3);
    
    this.quarters = qLabels
      .slice(0, currentQuarter + 1)
      .map((label, i) => {
        const qStart = new Date(fyStart); qStart.setMonth(3 + i * 3);
        const qEnd   = new Date(qStart);  qEnd.setMonth(qStart.getMonth() + 3); qEnd.setDate(qEnd.getDate() - 1);
        return { label, value: i + 1, fromDate: this.toIsoDate(qStart), toDate: this.toIsoDate(qEnd) };
      });

    this.years = [{
      label: `FY ${fyStartYear}-${String(fyStartYear + 1).slice(2)}`, value: 1,
      fromDate: this.toIsoDate(fyStart), toDate: this.toIsoDate(fyEnd)
    }];

    this.selectedQuarter = this.quarters[Math.floor(currentFyMonth / 3)] || this.quarters[0];
    this.selectedYear = this.years[0];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Period label getter
  // ─────────────────────────────────────────────────────────────────────────

  get currentPeriodLabel(): string {
    switch (this.selectedViewTime) {
      case 'w': return this.selectedWeek?.label    ?? 'Select Week';
      case 'm': return this.selectedMonth?.label   ?? 'Select Month';
      case 'q': return this.selectedQuarter?.label ?? 'Select Quarter';
      case 'y': return this.selectedYear?.label    ?? 'FY';
      default:  return 'All Time';
    }
  }


  getDynamicChartTitle(): string {
  const viewLabelMap: { [key: string]: string } = {
    w: 'Week',
    m: 'Month',
    q: 'Quarter',
    y: 'Year',
    a: 'All'
  };

  const viewLabel = viewLabelMap[this.selectedViewTime] || 'Week';

  if (this.selectedRegionId) {
    return `${this.selectedRegionName} Wise Open Orders (${viewLabel})`;
  }

  return `Open Orders (${viewLabel})`;
}

  // ─────────────────────────────────────────────────────────────────────────
  // Filter change handlers
  // ─────────────────────────────────────────────────────────────────────────

  onViewTimeChange(): void { this.resetDrillDowns(); this.loadChart(); }
  onPeriodChange():   void { this.resetDrillDowns(); this.loadChart(); }

  // ─────────────────────────────────────────────────────────────────────────
  // Build filter payloads
  // ─────────────────────────────────────────────────────────────────────────

  private buildFilter(): OpenOrderFilter {
    const vt = this.selectedViewTime;
    const f: OpenOrderFilter = { 
      userId: this.selectedUserId, 
      regionId: this.selectedRegionId,  // NEW: include regionId
      viewTime: vt 
    };
    switch (vt) {
      case 'w': 
        // Handle week value - use phpValue for date parsing, weekNo for duration
        let weekValue: string | null = this.selectedWeek?.phpValue ?? null;
        let weekDuration: number | null = this.selectedWeek?.weekNo ?? this.selectedWeek?.value ?? null;
        
        if (weekValue && weekValue.includes('to')) {
          // Parse PHP format: "YYYY-MM-DDtoYYYY-MM-DD"
          const dates = weekValue.split('to');
          if (dates.length === 2) {
            f.fromDate = dates[0];
            f.toDate = dates[1];
          }
        } else {
          // Fallback to fromDate/toDate from the option
          f.fromDate = this.selectedWeek?.fromDate ?? null;
          f.toDate = this.selectedWeek?.toDate ?? null;
        }
        
        f.duration = weekDuration; 
        f.durationText = this.selectedWeek?.label ?? null;
        break;
        
      case 'm': 
        // Handle month value - use monthValue for date parsing, monthNo for duration
        let monthValue: string | null = this.selectedMonth?.monthValue ?? null;
        let monthDuration: number | null = this.selectedMonth?.monthNo ?? this.selectedMonth?.value ?? null;
        
        if (monthValue && monthValue.includes('to')) {
          // Parse PHP format: "month_notoyear_no"
          const parts = monthValue.split('to');
          if (parts.length === 2) {
            const monthNo = parseInt(parts[0]);
            const yearNo = parseInt(parts[1]);
            // Convert financial year month_no to calendar month
            let calendarMonth: number;
            let calendarYear: number;
            if (monthNo >= 1 && monthNo <= 9) {
              calendarMonth = monthNo + 3; // April=1 => May=4
              calendarYear = yearNo;
            } else {
              calendarMonth = monthNo - 9; // Oct=10 => Jan=1
              calendarYear = yearNo + 1;
            }
            const mStart = new Date(calendarYear, calendarMonth - 1, 1);
            const mEnd = new Date(calendarYear, calendarMonth, 0);
            f.fromDate = this.toIsoDate(mStart);
            f.toDate = this.toIsoDate(mEnd);
          }
        } else {
          // Fallback to fromDate/toDate from the option
          f.fromDate = this.selectedMonth?.fromDate ?? null;
          f.toDate = this.selectedMonth?.toDate ?? null;
        }
        
        f.duration = monthDuration; 
        f.durationText = this.selectedMonth?.label ?? null;
        break;
        
      case 'q': f.duration = this.selectedQuarter?.value ?? null; f.durationText = this.selectedQuarter?.label ?? null;
                f.fromDate = this.selectedQuarter?.fromDate ?? null; f.toDate = this.selectedQuarter?.toDate ?? null; break;
      case 'y': f.duration = 1; f.durationText = this.selectedYear?.label ?? null;
                f.fromDate = this.selectedYear?.fromDate ?? null; f.toDate = this.selectedYear?.toDate ?? null; break;
      default:  f.fromDate = null; f.toDate = null; break;
    }
    return f;
  }

  /** Builds the common drill-down request base fields from current filter state. */
  private buildDrillDownBase(): Omit<OpenOrderDrillDownRequest, 'categoryName' | 'status'> {
    const f = this.buildFilter();
    return {
      userId:       f.userId,
      regionId:     f.regionId ?? null,
      viewTime:     f.viewTime,
      duration:     f.duration,
      durationText: f.durationText,
      fromDate:     f.fromDate,
      toDate:       f.toDate
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chart 1 – Load & Render
  // ─────────────────────────────────────────────────────────────────────────

  loadChart(): void {
    if (typeof Highcharts === 'undefined') { console.warn('Highcharts not loaded'); return; }
    this.isLoading = true;
    this.hasError  = false;

    this.openOrdersService.getOpenOrderChart1(this.buildFilter()).subscribe({
      next: data => {
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderChart1(data), 50);
      },
      error: (err) => {
        this.isLoading    = false;
        this.hasError     = true;
        this.errorMessage = err?.message ?? 'Failed to load chart';
      }
    });
  }

  private renderChart1(data: OpenOrderChartResponseDto): void {
    if (typeof Highcharts === 'undefined') {
      console.warn('Highcharts not loaded');
      return;
    }
    this.destroyChart1();
    // this.chartTitle = data.title ?? 'Open Order Report';
    this.chartTitle = this.getDynamicChartTitle();

    const categories = data.xAxisCategories ?? [];
    const self = this;
    const series = (data.series ?? []).map(s => ({
      type: 'column',
      name: s.name,
      data: s.data ?? [],
      color: s.color,
      stack: s.stack,
      borderWidth: 1,
      borderColor: '#ffffff',
      cursor: 'pointer',
      point: {
        events: {
          click(e: any) {
            const idx = (e.point ?? e.currentTarget)?.index ?? 0;
            const categoryName = categories[idx];
            self.onChart1BarClick({ categoryName, seriesName: s.name });
          }
        }
      }
    }));

    try {
      this.chart1Instance = Highcharts.chart('open-order-chart1-container', {
        chart: {
          type: 'column',
          backgroundColor: '#ffffff',
          style: { fontFamily: "'Segoe UI', sans-serif" },
          marginBottom: 120,
          spacingBottom: 20,
          height: 440
        },
        title: { text: this.chartTitle, style: { fontSize: '18px', fontWeight: '700', color: '#2c3e50' } },
        xAxis: {
          categories,
          title: { text: data.xAxisLabel, style: { color: '#333', fontWeight: '500' } },
          labels: { rotation: -35, align: 'right', style: { fontSize: '12px', color: '#333', fontWeight: '400' } },
          crosshair: true,
          lineColor: '#ccc'
        },
        yAxis: {
          title: { text: 'Value in Lakhs (₹)', style: { color: '#333', fontWeight: '500' } },
          gridLineColor: '#e8e8e8',
          min: 0,
          labels: { style: { color: '#333', fontWeight: '400' } }
        },
        legend: {
          enabled: true,
          align: 'center',
          verticalAlign: 'top',
          layout: 'horizontal',
          itemStyle: { fontWeight: '600', fontSize: '14px', color: '#333' },
          itemHoverStyle: { color: '#000' },
          symbolRadius: 5,
          symbolWidth: 15,
          symbolHeight: 15,
          margin: 20
        },
        tooltip: {
          shared: true,
          valueSuffix: ' L',
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderColor: '#ddd',
          shadow: true,
          valueDecimals: 2,
          style: { fontSize: '13px', fontWeight: '500' }
        },
        plotOptions: { 
          column: { 
            stacking: 'normal',
            borderWidth: 1,
            borderColor: '#ffffff',
            dataLabels: {
              enabled: true,
              style: { 
                fontSize: '12px', 
                fontWeight: '700',
                color: '#ffffff',
                textOutline: '1px #000000'
              },
              formatter: function(this: any): string {
                return this.y !== null && this.y > 0 ? this.y.toFixed(2) : '';
              }
            }
          } 
        },
        exporting: { enabled: true },
        credits: { enabled: false },
        series
      });
      this.chart1Instance?.reflow?.();
    } catch (err) {
      console.error('Failed to render open order chart', err);
      this.hasError = true;
      this.errorMessage = 'Failed to render chart';
    }
  }

  private destroyChart1(): void {
    if (this.chart1Instance) { this.chart1Instance.destroy(); this.chart1Instance = null; }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chart 2 – Segment drill-down (triggered by chart1 bar click)
  // ─────────────────────────────────────────────────────────────────────────

  onChart1BarClick(ctx: Chart1ClickContext): void {
    this.chart2Context  = ctx;
    this.chart2Visible  = true;
    this.chart2Loading  = true;
    this.chart2Error    = false;
    this.chart2Title    = '';
    // Reset chart3 when a new chart2 is loaded
    this.chart3Visible  = false;
    this.chart3Context  = null;
    this.chart3Customers = [];
    this.chart3Products  = [];

    const request: OpenOrderDrillDownRequest = {
      ...this.buildDrillDownBase(),
      categoryName: ctx.categoryName,
      status:       ctx.seriesName
    };

    this.openOrdersService.getOpenOrderChart2(request).subscribe({
      next: data => {
        this.chart2Loading = false;
        this.chart2Title   = data.title;
        setTimeout(() => this.renderChart2(data, ctx), 50);
      },
      error: (err) => {
        this.chart2Loading = false;
        this.chart2Error   = true;
        this.chart2ErrorMsg = err?.message ?? 'Failed to load segment chart';
      }
    });
  }

  private renderChart2(data: OpenOrderChartResponseDto, ctx: Chart1ClickContext): void {
    this.destroyChart2();

    const self = this;
    const COLORS = [
      '#FFD54F','#3F51B5','#7ABA7A','#FF9800','#F44336',
      '#4CAF50','#9C27B0','#795548','#FFEB3B','#42A5F5',
      '#CDDC39','#A1887F','#99b3ff','#CC1559','#6D929B',
      '#e87d7d','#bea7a7','#d9ff66','#717D8C','#66ff8c'
    ];

    // For w/y the backend returns a single series with plain numbers.
    // Apply individual bar colours by converting each value to a {y, color} point.
    const isSingleSeries = data.series.length === 1;
    const series = data.series.map((s, si) => {
      let seriesData: any[];
      if (isSingleSeries) {
        seriesData = s.data.map((val, idx) => ({
          y:     val,
          color: COLORS[idx % COLORS.length],
          events: {
            click(e: any) {
              const segName = data.xAxisCategories[(e.point ?? e.currentTarget).index];
              self.onChart2BarClick({ segmentName: segName }, ctx);
            }
          }
        }));
      } else {
        seriesData = s.data.map((val, idx) => ({
          y: val,
          events: {
            click(e: any) {
              const segName = data.xAxisCategories[(e.point ?? e.currentTarget).index];
              self.onChart2BarClick({ segmentName: segName }, ctx);
            }
          }
        }));
      }
      return {
        name: s.name, data: seriesData,
        color: isSingleSeries ? undefined : s.color,
        stack: s.stack || undefined,
        borderWidth: 0, cursor: 'pointer'
      };
    });

    this.chart2Instance = Highcharts.chart('open-order-chart2-container', {
      chart:  { type: 'column', backgroundColor: '#ffffff',
                style: { fontFamily: "'Segoe UI', sans-serif" },
                marginBottom: 120, spacingBottom: 20, height: 420 },
      title:  { text: data.title, style: { fontSize: '24px', fontWeight: '600', color: '#2c3e50' } },
      xAxis:  { categories: data.xAxisCategories,
                title: { text: data.xAxisLabel || 'Segment', style: { color: '#0c0c0c' } },
                labels: { rotation: -35, align: 'right', style: { fontSize: '20px', fontWeight: '600', color: '#0a0909' } },
                crosshair: true, lineColor: '#ccc' },
      yAxis:  { title: { text: 'Value in Lakhs (₹)', style: { color: '#111111' } },
                gridLineColor: '#e8e8e8', min: 0 },
      legend: { enabled: !isSingleSeries, align: 'center', verticalAlign: 'top',
                itemStyle: { fontWeight: '500', fontSize: '12px' } },
      tooltip: { shared: false, valueSuffix: ' L', backgroundColor: 'rgba(255,255,255,0.97)',
                 borderColor: '#ddd', shadow: true, valueDecimals: 2,
                 formatter(this: any) {
                   return `<b>${this.point.category}</b><br/>${this.series.name}: <b>${this.y?.toFixed(2)} L</b><br/><i style="font-size:10px;color:#888">Click for customer detail</i>`;
                 } },
      plotOptions: {
        column: {
          stacking: isSingleSeries ? undefined : 'normal',
          dataLabels: { enabled: false }
        }
      },
      exporting: { enabled: true },
      credits:   { enabled: false },
      series
    });
  }

  private destroyChart2(): void {
    if (this.chart2Instance) { this.chart2Instance.destroy(); this.chart2Instance = null; }
  }

  closeChart2(): void {
    this.chart2Visible = false;
    this.chart2Context = null;
    this.destroyChart2();
    this.chart3Visible = false;
    this.chart3Context = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chart 3 – Customer & product tables (triggered by chart2 bar click)
  // ─────────────────────────────────────────────────────────────────────────

  onChart2BarClick(ctx2: Chart2ClickContext, ctx1: Chart1ClickContext): void {
    if (!ctx1) return;
    this.chart3Context  = ctx2;
    this.chart3Visible  = true;
    this.chart3Loading  = true;
    this.chart3Error    = false;
    this.chart3Title    = `${ctx1.categoryName} › ${ctx2.segmentName}`;
    this.chart3Customers = [];
    this.chart3Products  = [];

    const request: OpenOrderDrillDownRequest = {
      ...this.buildDrillDownBase(),
      categoryName: ctx1.categoryName,
      status:       ctx1.seriesName,
      segmentName:  ctx2.segmentName === 'ALL' ? null : ctx2.segmentName
    };

    this.openOrdersService.getOpenOrderChart3(request).subscribe({
      next: data => {
        this.chart3Loading   = false;
        this.chart3Customers = data.customers;
        this.chart3Products  = data.products;
      },
      error: (err) => {
        this.chart3Loading  = false;
        this.chart3Error    = true;
        this.chart3ErrorMsg = err?.message ?? 'Failed to load customer/product data';
      }
    });
  }

  closeChart3(): void {
    this.chart3Visible  = false;
    this.chart3Context  = null;
    this.chart3Customers = [];
    this.chart3Products  = [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Reset all drill-downs (on filter change)
  // ─────────────────────────────────────────────────────────────────────────

  private resetDrillDowns(): void {
    this.destroyChart2();
    this.chart2Visible  = false;
    this.chart2Context  = null;
    this.chart3Visible  = false;
    this.chart3Context  = null;
    this.chart3Customers = [];
    this.chart3Products  = [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────────────────────────────────

  private toIsoDate(d: Date): string {
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private fmtDate(d: Date): string {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }
}
