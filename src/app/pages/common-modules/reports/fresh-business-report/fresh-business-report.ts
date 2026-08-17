import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import { ReportsLayoutComponent } from '../reports-layout/reports-layout';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { AuthService } from '../../../../service/auth-service';

export type ChartOptions = {
  series: ApexOptions['series'];
  chart: ApexOptions['chart'];
  xaxis: ApexOptions['xaxis'];
  yaxis: ApexOptions['yaxis'];
  plotOptions: ApexOptions['plotOptions'];
  dataLabels: ApexOptions['dataLabels'];
  stroke: ApexOptions['stroke'];
  colors: ApexOptions['colors'];
  legend: ApexOptions['legend'];
  grid: ApexOptions['grid'];
  tooltip: ApexOptions['tooltip'];
  title: ApexOptions['title'];
};

@Component({
  selector: 'app-fresh-business-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportsLayoutComponent,
    NgApexchartsModule,
    HttpClientModule
  ],
  templateUrl: './fresh-business-report.html',
  styleUrls: ['./fresh-business-report.css']
})
export class FreshBusinessReportComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  title = 'Fresh Business Report';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Fresh Business Report' }
  ];

  filterForm!: FormGroup;
  timelineOptions = ['Week', 'Month', 'Quarter', 'Year'];
  dateOptions: string[] = [];

  isDrilldownMode = false;
  rawCategories: string[] = [];
  customers: any[] = [];
  regions: any[] = [];
  users: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private auth: AuthService) {
    this.initChart();
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      reportType: ['product'],
      region: [''],
      user: [''],
      date: [''],
      timeline: ['Week']
    });

    this.fetchDropdowns();
    this.updateDateOptions(this.filterForm.value.timeline);
    this.updateChartData();

    this.filterForm.valueChanges.subscribe(() => {
      this.updateDateOptions(this.filterForm.value.timeline);
      this.updateChartData();
    });
  }

  fetchDropdowns(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    // Regions dropdown
    this.http.get<any[]>('http://localhost:8080/location/locations?territoryLevelId=4', { headers }).subscribe({
      next: (res) => {
        if (Array.isArray(res)) this.regions = res;
      },
      error: (err) => console.error('Error loading regions:', err)
    });

    // Users dropdown
    this.http.get<any[]>('http://localhost:8080/user/active-users-dropdown', { headers }).subscribe({
      next: (res) => {
        if (Array.isArray(res)) this.users = res;
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  updateDateOptions(timeline: string): void {
    const currentDate = this.filterForm?.get('date')?.value;
    if (timeline === 'Week') {
      this.dateOptions = ['Week1 (2026-07-25 to 2026-07-31)', 'Week4 (2026-08-08 to 2026-08-14)'];
      if (!currentDate || !this.dateOptions.includes(currentDate)) {
        this.filterForm?.get('date')?.setValue(this.dateOptions[1], { emitEvent: false });
      }
    } else if (timeline === 'Month') {
      this.dateOptions = ['Jul-26', 'Aug-26', 'Sep-26'];
      if (!currentDate || !this.dateOptions.includes(currentDate)) {
        this.filterForm?.get('date')?.setValue(this.dateOptions[1], { emitEvent: false });
      }
    } else if (timeline === 'Quarter') {
      this.dateOptions = ['Quarter1', 'Quarter2', 'Quarter3', 'Quarter4'];
      if (!currentDate || !this.dateOptions.includes(currentDate)) {
        this.filterForm?.get('date')?.setValue(this.dateOptions[1], { emitEvent: false });
      }
    } else {
      this.dateOptions = [];
      this.filterForm?.get('date')?.setValue('', { emitEvent: false });
    }
  }

  initChart(): void {
    this.chartOptions = {
      series: [],
      chart: {
        type: 'bar',
        height: 420,
        stacked: false,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          }
        },
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            const seriesIndex = config.seriesIndex;
            const dataPointIndex = config.dataPointIndex;
            if (seriesIndex !== undefined && dataPointIndex !== undefined && seriesIndex !== -1 && dataPointIndex !== -1) {
               this.handleChartClick(seriesIndex, dataPointIndex);
            }
          }
        }
      },
      title: {
        text: '',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: '500',
          color: '#3f4254'
        }
      },
      colors: ['#e53935', '#5e35b1'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '40%',
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '11px',
          colors: ['#666']
        },
        formatter: function (val: number) {
          if (val === 0) return '0';
          return val.toString();
        },
        offsetY: -20
      },
      stroke: {
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: [],
        title: {
          text: '',
        },
        labels: {
          style: { colors: '#6b7280', fontSize: '12px' },
          // Multi-line labels rendered via formatter
          formatter: (val: string) => val
        },
        axisBorder: { show: true, color: '#dfe6ef' },
        axisTicks: { show: true, color: '#dfe6ef' }
      },
      yaxis: {
        title: {
          text: 'Value in Lakhs',
          style: { color: '#6b7280', fontWeight: '500' }
        },
        labels: {
          style: { colors: '#6b7280', fontSize: '12px' }
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number, opts: any) => {
            const seriesName: string = opts?.w?.globals?.seriesNames?.[opts?.seriesIndex] ?? '';
            return `${seriesName}: ${val} Lacs`;
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        markers: { size: 8 },
        itemMargin: { horizontal: 10, vertical: 0 }
      },
      grid: {
        borderColor: '#f1f5f9',
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } }
      }
    };
  }

  getDateRange(timeline: string, dateStr: string): { startDate: string | null, endDate: string | null } {
    if (timeline === 'Year') {
      return { startDate: '2026-04-01', endDate: '2027-03-31' };
    }
    if (timeline === 'Month') {
      const monthMap: any = { 'Jul-26': ['2026-07-01', '2026-07-31'], 'Aug-26': ['2026-08-01', '2026-08-31'], 'Sep-26': ['2026-09-01', '2026-09-30'] };
      if (monthMap[dateStr]) return { startDate: monthMap[dateStr][0], endDate: monthMap[dateStr][1] };
    }
    if (timeline === 'Week' && dateStr) {
      const match = dateStr.match(/\((.*?)\s+to\s+(.*?)\)/);
      if (match && match.length === 3) return { startDate: match[1], endDate: match[2] };
    }
    if (timeline === 'Quarter') {
      if (dateStr === 'Quarter1') return { startDate: '2026-04-01', endDate: '2026-06-30' };
      if (dateStr === 'Quarter2') return { startDate: '2026-07-01', endDate: '2026-09-30' };
      if (dateStr === 'Quarter3') return { startDate: '2026-10-01', endDate: '2026-12-31' };
      if (dateStr === 'Quarter4') return { startDate: '2027-01-01', endDate: '2027-03-31' };
    }
    return { startDate: '2026-04-01', endDate: '2027-03-31' }; // Fallback
  }

  handleChartClick(seriesIndex: number, dataPointIndex: number): void {
    if (this.isDrilldownMode) return;

    const seriesItem = this.chartOptions.series![seriesIndex] as any;
    const seriesName = seriesItem?.name;
    let category = this.rawCategories[dataPointIndex];
    if (category && category.includes('<br>')) {
      category = category.split('<br>')[0].trim();
    }

    this.fetchDrilldownData(category, seriesName as string);
  }

  fetchDrilldownData(category: string, seriesName: string): void {
    const reportType = this.filterForm?.get('reportType')?.value || 'product';
    const timeline = this.filterForm?.get('timeline')?.value || 'Week';
    const dateStr = this.filterForm?.get('date')?.value || '';
    const regionId = this.filterForm?.get('region')?.value;
    const userId = this.filterForm?.get('user')?.value;

    const measure = reportType === 'product' ? 1 : 2;
    const viewTime = timeline === 'Year' ? 'y' : timeline === 'Month' ? 'm' : timeline === 'Week' ? 'w' : 'q';
    const { startDate, endDate } = this.getDateRange(timeline, dateStr);

    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    const body = {
      measure: measure,
      viewTime: viewTime,
      regionId: regionId ? Number(regionId) : null,
      userId: userId ? Number(userId) : null,
      startDate: startDate,
      endDate: endDate,
      category: category,
      seriesName: seriesName
    };

    this.http.post<any>('http://localhost:8080/reports/fresh-business/drilldown', body, { headers }).subscribe({
      next: (response) => {
        if (response && response.status && response.data) {
          this.isDrilldownMode = true;
          this.customers = response.data.customers || [];
          this.processApiResponse(response.data);
        }
      },
      error: (err) => console.error('Error fetching drilldown data:', err)
    });
  }

  goBack(): void {
    this.isDrilldownMode = false;
    this.customers = [];
    this.updateChartData();
  }

  updateChartData(): void {
    if (this.isDrilldownMode) {
       this.isDrilldownMode = false;
       this.customers = [];
    }
    const reportType = this.filterForm?.get('reportType')?.value || 'product';
    const timeline = this.filterForm?.get('timeline')?.value || 'Week';
    const dateStr = this.filterForm?.get('date')?.value || '';
    const regionId = this.filterForm?.get('region')?.value;
    const userId = this.filterForm?.get('user')?.value;

    const measure = reportType === 'product' ? 1 : 2;
    const viewTime = timeline === 'Year' ? 'y' : timeline === 'Month' ? 'm' : timeline === 'Week' ? 'w' : 'q';
    const { startDate, endDate } = this.getDateRange(timeline, dateStr);

    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    const body = {
      measure: measure,
      viewTime: viewTime,
      regionId: regionId ? Number(regionId) : null,
      userId: userId ? Number(userId) : null,
      startDate: startDate,
      endDate: endDate
    };

    this.http.post<any>('http://localhost:8080/reports/fresh-business', body, { headers }).subscribe({
      next: (response) => {
        if (response && response.status && response.data) {
          this.processApiResponse(response.data);
        }
      },
      error: (err) => console.error('Error fetching fresh business report:', err)
    });
  }

  processApiResponse(data: any): void {
    this.rawCategories = data.xaxisCategories || [];
    let categories: any[] = [];
    if (data.xaxisCategories && Array.isArray(data.xaxisCategories)) {
      categories = data.xaxisCategories.map((cat: string) => {
        if (typeof cat === 'string' && cat.includes('<br>')) {
          return cat.split('<br>').map(s => s.trim());
        }
        return cat;
      });
    }

    const series = data.series || [];
    const title = data.chartTitle || this.getChartTitle();

    if (this.chartOptions) {
      this.chartOptions = {
        ...this.chartOptions,
        series: series,
        colors: ['#e53935', '#5e35b1'],
        xaxis: {
          ...this.chartOptions.xaxis,
          categories: categories
        },
        title: {
          ...this.chartOptions.title,
          text: title
        }
      };
    }
  }

  getChartTitle(): string {
    const reportType = this.filterForm?.get('reportType')?.value || 'product';
    const timeline = this.filterForm?.get('timeline')?.value || 'Week';
    const groupLabel = reportType === 'product' ? 'By Segment' : 'By Region';

    if (timeline === 'Year') {
      return `Fresh & Repeat Business report ${groupLabel} 2026-27`;
    }

    let val = this.filterForm?.get('date')?.value || '';

    // For Week, strip the date range and keep only "Week4" etc.
    if (timeline === 'Week' && val.includes('(')) {
      val = val.split('(')[0].trim();
    }

    return `Fresh & Repeat Business report ${groupLabel} ( ${val} )`;
  }
}
