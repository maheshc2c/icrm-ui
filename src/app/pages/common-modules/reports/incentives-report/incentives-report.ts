import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ReportsLayoutComponent } from '../reports-layout/reports-layout';
import { AuthService } from '../../../../service/auth-service';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

export type ChartOptions = Partial<ApexOptions>;

@Component({
  selector: 'app-incentives-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportsLayoutComponent, HttpClientModule, NgApexchartsModule],
  templateUrl: './incentives-report.html',
  styleUrl: './incentives-report.css'
})
export class IncentivesReportComponent implements OnInit {
  title = 'Incentives Report';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Incentives Report' }
  ];

  // Role detection
  currentRole = '';
  isSalesManager = false;
  isHigherRole = false;

  // View state: 'chart' | 'table'
  viewMode: 'chart' | 'table' = 'table';

  // Drilldown
  drilldownDetails: any[] = []; // stores all details from API
  drilldownData: any[] | null = null; // stores filtered details for clicked bar

  // Filters
  selectedUser: any = null;
  quarter: string | null = null;
  financialYear: string | null = null;

  users: any[] = [];
  financialYears: any[] = [];
  regions: any[] = [];
  selectedRegion: number | null = null;
  filteredUsers: any[] = [];
  searchTerm = '';
  isDropdownOpen = false;

  // Raw API response items
  rawReports: any[] = [];

  // Table mode (Sales Manager)
  reports: any[] = [];

  // Pagination state
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  isLoading = false;

  // ApexCharts options for chart mode
  chartOptions: ChartOptions = {};
  chartCategories: string[] = []; // x-axis names
  chartDataMap: any[] = []; // parallel to chartCategories
  allZero = false; // true when all incentive values are 0

  constructor(private http: HttpClient, private auth: AuthService, private eRef: ElementRef) {}

  ngOnInit(): void {
    this.currentRole = localStorage.getItem('role') || '';
    this.isSalesManager = this.currentRole === 'Sales Manager';
    this.isHigherRole = ['Regional Sales Manager', 'Regional Branch Head', 'National Sales Manager', 'Country Head']
      .includes(this.currentRole);

    this.fetchUsers();
    this.fetchFinancialYears();
    if (this.isHigherRole) {
      this.fetchRegions();
    }
    this.fetchIncentives();
  }

  // ─── Dropdowns ─────────────────────────────────────────────────────────────

  fetchUsers(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<any[]>('http://localhost:8080/user/active-users-dropdown', { headers }).subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  fetchFinancialYears(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<any>('http://localhost:8080/user/incentives/financialyears', { headers }).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.financialYears = response.data;
        }
      },
      error: (err) => console.error('Error fetching financial years:', err)
    });
  }

  fetchRegions(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<any[]>('http://localhost:8080/location/locations?territoryLevelId=4', { headers }).subscribe({
      next: (data) => {
        this.regions = Array.isArray(data) ? data : [];
      },
      error: (err) => console.error('Error fetching regions:', err)
    });
  }

  // ─── Search / Reset ────────────────────────────────────────────────────────

  onSearch(): void {
    this.currentPage = 0;
    this.drilldownData = null;
    this.viewMode = this.isHigherRole ? 'chart' : 'table';
    this.fetchIncentives();
  }

  resetFilters(): void {
    this.selectedUser = null;
    this.selectedRegion = null;
    this.quarter = null;
    this.financialYear = null;
    this.currentPage = 0;
    this.drilldownData = null;
    this.viewMode = this.isHigherRole ? 'chart' : 'table';
    this.fetchIncentives();
  }

  goBack(): void {
    this.drilldownData = null;
    this.viewMode = 'chart';
  }

  // ─── API Call ─────────────────────────────────────────────────────────────

  fetchIncentives(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    const fyObj = this.financialYears.find(fy => fy.fyName === this.financialYear);
    const financialYearId = fyObj ? fyObj.fyId : null;

    const quarterMap: { [key: string]: string } = {
      'Quarter1': 'Q1', 'Quarter2': 'Q2', 'Quarter3': 'Q3', 'Quarter4': 'Q4'
    };
    const apiQuarter = this.quarter ? (quarterMap[this.quarter] || 'Q1') : 'Q1';

    const sizeToFetch = this.isHigherRole ? 1000 : this.pageSize;

    const body = {
      financialYearId: financialYearId,
      regionId: this.selectedRegion ? Number(this.selectedRegion) : null,
      userId: this.selectedUser ? this.selectedUser.id : null,
      roleId: null,
      quarter: apiQuarter,
      pagination: {
        pageNumber: this.isHigherRole ? 0 : this.currentPage,
        pageSize: sizeToFetch,
        sortBy: 'id',
        sortOrder: 'ASC'
      }
    };

    this.isLoading = true;
    this.http.post<any>('http://localhost:8080/reports/incentives/filter', body, { headers }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status && response.data) {
          const detailsData = response.data.details || [];
          const graphData = response.data.graph || [];
          
          this.rawReports = detailsData;
          this.totalElements = response.totalElements || detailsData.length;
          this.totalPages = response.totalPages || 1;

          if (this.isSalesManager) {
            // Table view for Sales Manager
            this.reports = detailsData.map((item: any) => this.mapToTableRow(item));
            this.viewMode = 'table';
          } else if (this.isHigherRole) {
            // Chart view for higher roles
            // We use the graph data for plotting
            this.buildChart(graphData);
            this.viewMode = 'chart';
            
            // Store details data for drilldown (we will filter it later when clicked)
            this.drilldownDetails = detailsData.map((item: any) => this.mapToTableRow(item));
          } else {
            // Fallback
            this.reports = detailsData.map((item: any) => this.mapToTableRow(item));
            this.viewMode = 'table';
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching incentives:', err);
      }
    });
  }

  private mapToTableRow(item: any): any {
    const metrics = item.categoryMetrics || {};
    const row: any = {
      id: item.userId,
      role: item.role,
      user: item.name,
      erpTarget: metrics['ERP']?.currentTarget ?? item.totalTarget ?? 0,
      erpSales: metrics['ERP']?.currentSales ?? item.totalSales ?? 0,
      bu1Target: metrics['BU1']?.currentTarget ?? 0,
      bu1Sales: metrics['BU1']?.currentSales ?? 0,
      bu2Target: metrics['BU2']?.currentTarget ?? 0,
      bu2Sales: metrics['BU2']?.currentSales ?? 0,
      bu3Target: metrics['BU3']?.currentTarget ?? 0,
      bu3Sales: metrics['BU3']?.currentSales ?? 0,
      incentiveAmount: item.incentiveAmount
    };
    return row;
  }

  // ─── Chart Building ────────────────────────────────────────────────────────

  buildChart(data: any[]): void {
    const categories = data.map(d => d.name || d.role);
    this.chartCategories = categories;
    this.chartDataMap = data;

    const getVal = (d: any) => +(d?.y ?? d?.incentiveAmount ?? d?.value ?? 0);

    // When all values are 0, we still want ApexCharts to render the flat line
    this.allZero = data.every(d => getVal(d) === 0);

    // If allZero, provide a tiny value (0.05) so the bars render with enough physical height to click.
    const incentiveData = data.map(d => {
      const actual = getVal(d);
      return this.allZero ? 0.05 : actual;
    });

    this.chartOptions = {
      series: [{ name: 'Incentives', data: incentiveData }],
      chart: {
        type: 'bar',
        height: 380,
        toolbar: { show: true, tools: { download: true, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false, selection: false } },
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            const index = config.dataPointIndex;
            if (index !== undefined && index !== -1) {
              this.onChartBarClick(index);
            }
          },
          click: (event: any, chartContext: any, config: any) => {
            const index = config.dataPointIndex;
            if (index !== undefined && index !== -1) {
              this.onChartBarClick(index);
            }
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '45%',
          borderRadius: 4,
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: { fontSize: '11px', colors: ['#444'] },
        formatter: (val: number, opts: any) => {
          // Show real value from chartDataMap, not the display value
          const realVal = getVal(this.chartDataMap[opts?.dataPointIndex]);
          return `${realVal} L`;
        }
      },
      colors: ['#4a90d9'],
      states: {
        hover: { filter: { type: 'lighten' } as any },
        active: { filter: { type: 'darken' } as any }
      },
      xaxis: {
        categories: categories,
        labels: { style: { fontSize: '12px', colors: '#555' } },
        axisBorder: { show: true },
        axisTicks: { show: true }
      },
      yaxis: {
        title: { text: 'value In Lakhs', style: { color: '#555', fontWeight: '500' } },
        labels: {
          style: { colors: '#555' },
          formatter: (val: number) => {
            if (this.allZero) return val === 0 ? '0' : '';
            return val.toFixed(0);
          }
        },
        min: this.allZero ? -1 : 0,
        max: this.allZero ? 1 : undefined,
        tickAmount: this.allZero ? 2 : undefined
      },
      tooltip: {
        y: {
          formatter: (val: number, opts: any) => {
            // Show real value from chartDataMap
            const realVal = getVal(this.chartDataMap[opts?.dataPointIndex]);
            return `${realVal} L`;
          }
        }
      },
      legend: { show: false },
      grid: { borderColor: '#f1f5f9', yaxis: { lines: { show: true } } }
    };
  }

  getRoleFullName(abbreviation: string): string {
    if (!abbreviation) return '';
    const map: any = {
      'SE': 'Sales Manager',
      'RSM': 'Regional Sales Manager',
      'RBH': 'Regional Branch Head',
      'NSM': 'National Sales Manager'
    };
    return map[abbreviation] || abbreviation;
  }

  onChartBarClick(index: number): void {
    const clickedBar = this.chartDataMap[index];
    if (!clickedBar) return;

    const roleCode = (clickedBar.name || clickedBar.role || '').toUpperCase();
    const fullRoleName = this.getRoleFullName(roleCode);
    
    // Filter the details array to show users matching the clicked role
    let filtered = this.drilldownDetails.filter(d => {
      const r = (d.role || '').toLowerCase();
      if (roleCode === 'SE') {
        return r.includes('sales manager') || r.includes('sales engineer') || r === 'se';
      } else if (roleCode === 'RSM') {
        return r.includes('regional sales manager') || r === 'rsm';
      } else if (roleCode === 'RBH') {
        return r.includes('regional branch head') || r === 'rbh';
      } else if (roleCode === 'NSM') {
        return r.includes('national sales manager') || r === 'nsm';
      }
      return d.role === fullRoleName;
    });

    this.drilldownData = filtered;
    this.viewMode = 'table';
  }

  // ─── Drilldown table categories ──────────────────────────────────────────

  getDrilldownCategories(): string[] {
    if (!this.drilldownData || this.drilldownData.length === 0) return [];
    return ['ERP', 'BU1', 'BU2', 'BU3'];
  }

  getDrilldownTotal(): number {
    if (!this.drilldownData || this.drilldownData.length === 0) return 0;
    return this.drilldownData.reduce((sum, row) => sum + +(row.incentiveAmount || 0), 0);
  }

  // ─── Pagination ───────────────────────────────────────────────────────────

  changePage(delta: number): void {
    const newPage = this.currentPage + delta;
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.fetchIncentives();
    }
  }

  // ─── Summary helpers ─────────────────────────────────────────────────────

  getTotalIncentives(): number {
    return this.reports.reduce((sum, item) => sum + (item.incentiveAmount || 0), 0);
  }

  // ─── Download ────────────────────────────────────────────────────────────

  downloadIncentives(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    const fyObj = this.financialYears.find(fy => fy.fyName === this.financialYear);
    const financialYearId = fyObj ? fyObj.fyId : null;
    const fyStartDate = fyObj ? fyObj.fyStartDate : null;
    const fyEndDate = fyObj ? fyObj.fyEndDate : null;

    let startYear = 2026, endYear = 2027;
    if (fyStartDate) startYear = new Date(fyStartDate).getFullYear();
    if (fyEndDate) endYear = new Date(fyEndDate).getFullYear();

    const quarterMap: { [key: string]: string } = {
      'Quarter1': 'Q1', 'Quarter2': 'Q2', 'Quarter3': 'Q3', 'Quarter4': 'Q4'
    };
    const apiQuarter = this.quarter ? (quarterMap[this.quarter] || 'Q1') : 'Q1';

    let fromDate = `${startYear}-04-01`, toDate = `${startYear}-06-30`;
    if (apiQuarter === 'Q2') { fromDate = `${startYear}-07-01`; toDate = `${startYear}-09-30`; }
    else if (apiQuarter === 'Q3') { fromDate = `${startYear}-10-01`; toDate = `${startYear}-12-31`; }
    else if (apiQuarter === 'Q4') { fromDate = `${endYear}-01-01`; toDate = `${endYear}-03-31`; }

    const body = {
      financialYearId, quarter: apiQuarter,
      userId: this.selectedUser ? this.selectedUser.id : null,
      roleId: null, regionId: null, fromDate, toDate,
      pagination: { pageNumber: 0, pageSize: 100, sortBy: 'id', sortOrder: 'ASC' }
    };

    this.http.post('http://localhost:8080/reports/incentives/download', body, {
      headers, responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Incentives_Report_${this.financialYear || 'FY'}_${apiQuarter}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading incentives report:', err);
        alert('Download failed');
      }
    });
  }

  // ─── Dropdown Helpers ─────────────────────────────────────────────────────

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.searchTerm = '';
      this.filteredUsers = this.users;
    }
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u => u.name.toLowerCase().includes(term));
  }

  selectUser(user: any): void {
    this.selectedUser = user;
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
