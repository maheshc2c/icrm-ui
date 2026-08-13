import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import { ReportsLayoutComponent } from '../reports-layout/reports-layout';
import { Breadcrumb } from '../../../../models/breadcrumb';

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
  selector: 'app-target-vs-sales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ReportsLayoutComponent,
    NgApexchartsModule
  ],
  templateUrl: './target-vs-sales.html',
  styleUrls: ['./target-vs-sales.css']
})
export class TargetVsSalesComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  title = 'Target Vs Sales Report';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Target Vs Sales' }
  ];

  filterForm!: FormGroup;
  viewMode: 'graph' | 'table' = 'graph';
  reportType: 'product' | 'region' = 'product';
  dateOptions: string[] = [];

  // X-axis categories for the bar chart
  xCategories = ['Target', 'Achieved', 'Backlog', 'Funnel'];

  // 8 series colors matching screenshot legend
  seriesColors = ['#e53935', '#fb8c00', '#1e88e5', '#43a047', '#8e24aa', '#6d4c41', '#fdd835', '#a5d6a7'];

  // Mock data per timeline
  mockData: Record<string, any[]> = {
    Week: [
      { name: 'Hot',            data: [0, 0, 0, 0] },
      { name: 'Warm',           data: [0, 0, 0, 0] },
      { name: 'Cold',           data: [0, 0, 0, 0] },
      { name: 'Backlog',        data: [0, 0, 0, 0] },
      { name: 'Current Sales',  data: [0, 0, 0, 0] },
      { name: 'Open Orders',    data: [0, 7.5, 0, 0] },
      { name: 'Current Target', data: [0, 0, 0, 0] },
      { name: 'BackLog',        data: [0, 0, 0, 0] }
    ],
    Month: [
      { name: 'Hot',            data: [0,    0,   0, 0] },
      { name: 'Warm',           data: [0,    0,   0, 0] },
      { name: 'Cold',           data: [0,    0,   0, 0] },
      { name: 'Backlog',        data: [0,    0,   0, 0] },
      { name: 'Current Sales',  data: [0,    0,   0, 0] },
      { name: 'Open Orders',    data: [0,    7.5, 0, 0] },
      { name: 'Current Target', data: [0,    0,   0, 0] },
      { name: 'BackLog',        data: [0,    0,   0, 0] }
    ],
    Quarter: [
      { name: 'Hot',            data: [2.5,  4.0, 1.0, 3.0] },
      { name: 'Warm',           data: [1.5,  2.0, 0.5, 1.5] },
      { name: 'Cold',           data: [0.5,  1.0, 0,   0.5] },
      { name: 'Backlog',        data: [0,    0.5, 2.0, 0]   },
      { name: 'Current Sales',  data: [0,    0,   0,   0]   },
      { name: 'Open Orders',    data: [0,   10.5, 0,   0]   },
      { name: 'Current Target', data: [5.0, 0,   0,   0]    },
      { name: 'BackLog',        data: [0,    0,   3.0, 0]   }
    ],
    Year: [
      { name: 'Hot',            data: [5.0,  8.0,  2.0, 6.0] },
      { name: 'Warm',           data: [3.0,  4.5,  1.0, 3.5] },
      { name: 'Cold',           data: [1.5,  2.0,  0.5, 1.0] },
      { name: 'Backlog',        data: [0,    1.0,  4.0, 0]   },
      { name: 'Current Sales',  data: [0,    0.5,  0,   0]   },
      { name: 'Open Orders',    data: [0,   17.44, 0,   0]   },
      { name: 'Current Target', data: [12.0, 0,    0,   0]   },
      { name: 'BackLog',        data: [0,    0,    6.0, 0]   }
    ]
  };

  // Table data
  tableRows: any[] = [
    { category: 'Oracle',  backlog: 0, currentTarget: 0, cummTarget: 0, currentSales: 0, openOrders: 7.5, pending: 0, funnelOpp: 0 },
    { category: 'SAP',     backlog: 0, currentTarget: 0, cummTarget: 0, currentSales: 0, openOrders: 0,   pending: 0, funnelOpp: 0 },
    { category: 'Fortify', backlog: 0, currentTarget: 0, cummTarget: 0, currentSales: 0, openOrders: 0,   pending: 0, funnelOpp: 0 }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      region: [''],
      user: [''],
      date: [''],
      timeline: ['Month']
    });

    this.updateDateOptions('Month');
    this.initChart('Month');

    this.filterForm.get('timeline')?.valueChanges.subscribe(timeline => {
      this.updateDateOptions(timeline);
      this.initChart(timeline);
    });
  }

  updateDateOptions(timeline: string): void {
    if (timeline === 'Week') {
      this.dateOptions = ['Week1 (2026-07-25 to 2026-07-31)', 'Week4 (2026-08-08 to 2026-08-14)'];
      this.filterForm.get('date')?.setValue(this.dateOptions[1], { emitEvent: false });
    } else if (timeline === 'Month') {
      this.dateOptions = ['Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26',
                          'Oct-26', 'Nov-26', 'Dec-26', 'Jan-27', 'Feb-27', 'Mar-27'];
      this.filterForm.get('date')?.setValue('Aug-26', { emitEvent: false });
    } else if (timeline === 'Quarter') {
      this.dateOptions = ['Quarter1', 'Quarter2', 'Quarter3', 'Quarter4'];
      this.filterForm.get('date')?.setValue('Quarter2', { emitEvent: false });
    } else {
      this.dateOptions = [];
      this.filterForm.get('date')?.setValue('', { emitEvent: false });
    }
  }

  getDateLabel(): string {
    const timeline = this.filterForm?.get('timeline')?.value;
    const date = this.filterForm?.get('date')?.value || '';
    if (timeline === 'Week' && date.includes('(')) {
      return date.split('(')[0].trim();
    }
    return date;
  }

  getChartTitle(): string {
    const timeline = this.filterForm?.get('timeline')?.value || '';
    if (timeline === 'Year') return 'Target Vs Sales 2026-27';
    return `Target Vs Sales ( ${this.getDateLabel()} )`;
  }

  initChart(timeline: string): void {
    const series = this.mockData[timeline] ?? this.mockData['Month'];

    this.chartOptions = {
      series,
      chart: {
        type: 'bar',
        height: 420,
        stacked: true,
        toolbar: {
          show: true,
          tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false }
        }
      },
      title: {
        text: this.getChartTitle(),
        align: 'center',
        style: { fontSize: '16px', fontWeight: '500', color: '#3f4254' }
      },
      colors: this.seriesColors,
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '35%',
          dataLabels: { position: 'center' }
        }
      },
      dataLabels: {
        enabled: true,
        style: { fontSize: '11px', colors: ['#fff'] },
        formatter: (val: number) => val === 0 ? '0' : val.toString()
      },
      stroke: { width: 1, colors: ['#fff'] },
      xaxis: {
        categories: this.xCategories,
        labels: { style: { colors: '#6b7280', fontSize: '13px' } },
        axisBorder: { show: true, color: '#dfe6ef' },
        axisTicks: { show: true, color: '#dfe6ef' }
      },
      yaxis: {
        title: { text: 'Value In Lacs', style: { color: '#6b7280', fontWeight: '500' } },
        labels: { style: { colors: '#6b7280', fontSize: '12px' } }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (val: number) => `${val} Lacs` }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        markers: { size: 8 },
        itemMargin: { horizontal: 10, vertical: 5 }
      },
      grid: {
        borderColor: '#f1f5f9',
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } }
      }
    };
  }

  getTotalFor(field: string): number {
    return +this.tableRows.reduce((sum, row) => sum + (row[field] || 0), 0).toFixed(2);
  }
}
