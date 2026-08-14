import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../service/report.service';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Pageheader } from '../../../../shared/pageheader/pageheader';

declare var Highcharts: any;

@Component({
  selector: 'app-fresh-business-report',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader],
  templateUrl: './fresh-business-report.html',
  styleUrls: ['./fresh-business-report.css']
})
export class FreshBusinessReportComponent implements OnInit, AfterViewInit, OnDestroy {

  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Fresh Business Report' }
  ];

  // Filter state
  measure: number = 1;               // 1 = By Product, 2 = By Region
  selectedViewTime: string = 'y';    // w | m | q | y
  selectedUserId: number | null = null;
  selectedRegionId: number | null = null;

  // Dropdowns data
  users: { id: number; label: string }[] = [];
  regions: { id: number; label: string }[] = [];

  dropdownOpen = false;
  searchQuery = '';
  regionDropdownOpen = false;
  regionSearchQuery = '';

  loading = false;
  currentLevel = 1; // 1 = Main, 2 = Drilldown
  selectedCategory: string = '';
  customersList: any[] = [];

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
      this.dropdownOpen = false;
      this.regionDropdownOpen = false;
    }
  }

  loadDropdowns() {
    this.reportService.getUsersForDropdown().subscribe({
      next: (res) => (this.users = res),
      error: (err) => console.error('Error fetching users:', err)
    });

    this.reportService.getRegionsForDropdown().subscribe({
      next: (res) => (this.regions = res),
      error: (err) => console.error('Error fetching regions:', err)
    });
  }

  get filteredUsers() {
    if (!this.searchQuery) return this.users;
    return this.users.filter(u => u.label.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  get selectedUserLabel() {
    if (!this.selectedUserId) return 'Select User';
    const u = this.users.find(u => u.id === this.selectedUserId);
    return u ? u.label : 'Select User';
  }

  get filteredRegions() {
    if (!this.regionSearchQuery) return this.regions;
    return this.regions.filter(r => r.label.toLowerCase().includes(this.regionSearchQuery.toLowerCase()));
  }

  get selectedRegionLabel() {
    if (!this.selectedRegionId) return 'Select Region';
    const r = this.regions.find(r => r.id === this.selectedRegionId);
    return r ? r.label : 'Select Region';
  }

  toggleDropdown() {
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
    this.onFilterChange();
  }

  toggleRegionDropdown() {
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
    this.onFilterChange();
  }

  setViewTime(time: string) {
    this.selectedViewTime = time;
    this.onFilterChange();
  }

  onFilterChange() {
    this.currentLevel = 1;
    this.customersList = [];
    this.fetchReportData();
  }

  resetDrilldown() {
    this.currentLevel = 1;
    this.customersList = [];
    this.fetchReportData();
  }

  fetchReportData() {
    this.loading = true;
    const filter = {
      measure: this.measure,
      viewTime: this.selectedViewTime,
      userId: this.selectedUserId,
      regionId: this.selectedRegionId
    };

    this.reportService.getFreshBusinessReport(filter).subscribe({
      next: (data) => {
        this.loading = false;
        this.renderChart(data);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading fresh business report:', err);
      }
    });
  }

  fetchDrilldownData(categoryName: string) {
    this.loading = true;
    this.selectedCategory = categoryName;

    const filter = {
      measure: this.measure,
      viewTime: this.selectedViewTime,
      userId: this.selectedUserId,
      regionId: this.selectedRegionId,
      category: categoryName
    };

    this.reportService.getFreshBusinessDrillDown(filter).subscribe({
      next: (data) => {
        this.loading = false;
        this.currentLevel = 2;
        this.customersList = data.customers || [];
        this.renderChart(data);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading fresh business drilldown:', err);
      }
    });
  }

  renderChart(data: any) {
    if (typeof Highcharts === 'undefined') {
      console.warn('Highcharts script is not loaded');
      return;
    }

    const categories = data.xAxisCategories || data.xaxisCategories || [];
    const yTitle = data.yAxisTitle || data.yaxisTitle || 'Value in Lakhs';

    const seriesData = (data.series || []).map((s: any) => {
      const color = s.name === 'Fresh Business' ? '#D23641' : '#663399';
      return {
        name: s.name,
        data: s.data,
        color: color
      };
    });

    const options: any = {
      chart: {
        type: 'column',
        backgroundColor: 'transparent'
      },
      title: {
        text: data.chartTitle || 'Fresh & Repeat Business report',
        style: { fontSize: '18px', fontWeight: 'bold', color: '#333333' }
      },
      xAxis: {
        categories: categories,
        labels: {
          useHTML: true,
          style: {
            fontSize: '12px',
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
        align: 'right',
        verticalAlign: 'top',
        layout: 'horizontal',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadow: false
      },
      tooltip: {
        useHTML: true,
        headerFormat: '<span style="font-size:12px;font-weight:bold">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                     '<td style="padding:0"><b>{point.y:.2f} Lakhs</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useMutationObserver: true
      },
      plotOptions: {
        column: {
          grouping: true,
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            formatter: function(this: any) {
              return this.y > 0 ? this.y : null;
            },
            style: {
              fontWeight: 'bold',
              color: '#333333'
            }
          },
          cursor: 'pointer',
          point: {
            events: {
              click: (event: any) => {
                if (this.currentLevel === 1) {
                  let category = event.point.category;
                  if (category && category.includes('<br>')) {
                    category = category.split('<br>')[0].trim();
                  }
                  this.fetchDrilldownData(category);
                }
              }
            }
          }
        }
      },
      series: seriesData,
      credits: { enabled: false }
    };

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = Highcharts.chart('freshBusinessChart', options);
  }
}
