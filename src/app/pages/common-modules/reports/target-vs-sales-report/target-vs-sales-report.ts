import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../service/report.service';
import { PageheaderComponent } from '../../../../shared/pageheader/pageheader';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-target-vs-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PageheaderComponent],
  templateUrl: './target-vs-sales-report.html',
  styleUrls: ['./target-vs-sales-report.css']
})
export class TargetVsSalesReportComponent implements OnInit, OnDestroy {
  breadcrumbs = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Target Vs Sales' }
  ];

  // Filters
  selectedRegionId: number | null = null;
  selectedUserId: number | null = null;
  selectedVtime: string = 'y'; // 'w', 'm', 'q', 'y'
  viewMode: 'graph' | 'table' = 'graph';

  // Dropdown lists
  regions: { id: number; label: string }[] = [];
  users: { id: number; label: string }[] = [];

  // Dropdown state
  regionDropdownOpen = false;
  userDropdownOpen = false;

  regionSearchQuery = '';
  userSearchQuery = '';

  // Data
  isLoading = false;
  chartData: any = null;
  tableRows: any[] = [];
  highchartsInstance: Highcharts.Chart | null = null;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.fetchReportData();
  }

  ngOnDestroy(): void {
    if (this.highchartsInstance) {
      this.highchartsInstance.destroy();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.closeAllDropdowns();
    }
  }

  loadDropdowns() {
    this.reportService.getRegionsForDropdown().subscribe({
      next: (res) => (this.regions = res),
      error: (err) => console.error('Error fetching regions:', err)
    });

    this.reportService.getUsersForDropdown().subscribe({
      next: (res) => (this.users = res),
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  get selectedRegionLabel(): string {
    if (this.selectedRegionId === null) return 'Select Region';
    const found = this.regions.find(r => r.id === this.selectedRegionId);
    return found ? found.label : 'Select Region';
  }

  get selectedUserLabel(): string {
    if (this.selectedUserId === null) return 'Select Users';
    const found = this.users.find(u => u.id === this.selectedUserId);
    return found ? found.label : 'Select Users';
  }

  get filteredRegions() {
    if (!this.regionSearchQuery) return this.regions;
    return this.regions.filter(r => r.label.toLowerCase().includes(this.regionSearchQuery.toLowerCase()));
  }

  get filteredUsers() {
    if (!this.userSearchQuery) return this.users;
    return this.users.filter(u => u.label.toLowerCase().includes(this.userSearchQuery.toLowerCase()));
  }

  closeAllDropdowns() {
    this.regionDropdownOpen = false;
    this.userDropdownOpen = false;
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

  selectRegion(id: number | null) {
    this.selectedRegionId = id;
    this.regionDropdownOpen = false;
    this.regionSearchQuery = '';
    this.fetchReportData();
  }

  selectUser(id: number | null) {
    this.selectedUserId = id;
    this.userDropdownOpen = false;
    this.userSearchQuery = '';
    this.fetchReportData();
  }

  setVtime(vtime: string) {
    if (this.selectedVtime !== vtime) {
      this.selectedVtime = vtime;
      this.fetchReportData();
    }
  }

  onViewModeChange() {
    if (this.viewMode === 'graph') {
      setTimeout(() => this.renderChart(), 100);
    }
  }

  fetchReportData() {
    this.isLoading = true;
    const filter = {
      vtime: this.selectedVtime,
      regionId: this.selectedRegionId,
      userId: this.selectedUserId
    };

    this.reportService.getTargetVsSales(filter).subscribe({
      next: (data) => {
        this.chartData = data;
        this.tableRows = data.tableRows || [];
        this.isLoading = false;
        if (this.viewMode === 'graph') {
          setTimeout(() => this.renderChart(), 100);
        }
      },
      error: (err) => {
        console.error('Error fetching Target Vs Sales report:', err);
        this.isLoading = false;
      }
    });
  }

  renderChart() {
    if (!this.chartData) return;

    const seriesData = (this.chartData.chartSeries || []).map((s: any) => ({
      name: s.name,
      data: s.data,
      color: s.color,
      stack: s.stack
    }));

    const options: Highcharts.Options = {
      chart: {
        type: 'column',
        backgroundColor: '#ffffff',
        style: {
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }
      },
      title: {
        text: 'Target Vs Sales',
        style: {
          color: '#212529',
          fontSize: '18px',
          fontWeight: '700'
        }
      },
      xAxis: {
        categories: this.chartData.xAxisCategory || ['Target', 'Acheived', 'Backlog', 'Funnel'],
        labels: {
          style: {
            color: '#495057',
            fontSize: '13px',
            fontWeight: '600'
          }
        },
        lineColor: '#e9ecef'
      },
      yAxis: {
        min: 0,
        title: {
          text: this.chartData.yAxisCategory || 'Value In Lakhs',
          style: {
            color: '#6c757d',
            fontSize: '13px',
            fontWeight: '600'
          }
        },
        gridLineColor: '#f1f5f9',
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: '#333333'
          }
        }
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        itemStyle: {
          color: '#495057',
          fontSize: '12.5px',
          fontWeight: '500'
        }
      },
      tooltip: {
        shared: true,
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: <b>{point.y} Lakhs</b><br/>'
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
            color: '#ffffff',
            formatter: function() {
              return this.y && this.y > 0 ? this.y : '';
            },
            style: {
              textOutline: 'none',
              fontSize: '11px',
              fontWeight: '600'
            }
          }
        }
      },
      credits: {
        enabled: false
      },
      series: seriesData
    };

    this.highchartsInstance = Highcharts.chart('targetVsSalesChart', options);
  }
}
