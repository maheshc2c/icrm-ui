import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  selector: 'app-fresh-business-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportsLayoutComponent,
    NgApexchartsModule
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

  // Mock data per timeline — each entry: { name, freshBusiness, repeatBusiness, freshPct, repeatPct }
  mockData: Record<string, Record<string, any[]>> = {
    product: {
      Week: [
        { name: 'Oracle', freshBusiness: 0, repeatBusiness: 7.5, freshPct: 0, repeatPct: 100 }
      ],
      Month: [
        { name: 'Oracle', freshBusiness: 0, repeatBusiness: 7.5, freshPct: 0, repeatPct: 100 }
      ],
      Quarter: [
        { name: 'Oracle', freshBusiness: 0, repeatBusiness: 9, freshPct: 0, repeatPct: 100 },
        { name: 'SAP',    freshBusiness: 0, repeatBusiness: 7.2, freshPct: 0, repeatPct: 100 }
      ],
      Year: [
        { name: 'Oracle', freshBusiness: 6.84, repeatBusiness: 12,  freshPct: 36.31, repeatPct: 63.69 },
        { name: 'SAP',    freshBusiness: 0,    repeatBusiness: 7.21, freshPct: 0,     repeatPct: 100 }
      ]
    },
    region: {
      Week: [
        { name: 'South2', freshBusiness: 0, repeatBusiness: 7.5, freshPct: 0, repeatPct: 100 }
      ],
      Month: [
        { name: 'South2', freshBusiness: 0, repeatBusiness: 7.5, freshPct: 0, repeatPct: 100 }
      ],
      Quarter: [
        { name: 'South2', freshBusiness: 0, repeatBusiness: 16.2, freshPct: 0, repeatPct: 100 }
      ],
      Year: [
        { name: 'South2', freshBusiness: 6.84, repeatBusiness: 19.21, freshPct: 26.26, repeatPct: 73.74 }
      ]
    }
  };

  constructor(private fb: FormBuilder) {
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

    this.updateDateOptions(this.filterForm.value.timeline);
    this.updateChartData();

    this.filterForm.valueChanges.subscribe(() => {
      this.updateDateOptions(this.filterForm.value.timeline);
      this.updateChartData();
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

  updateChartData(): void {
    const reportType = this.filterForm?.get('reportType')?.value || 'product';
    const timeline = this.filterForm?.get('timeline')?.value || 'Week';

    // Pick dataset based on reportType and current timeline
    const data: any[] = this.mockData[reportType]?.[timeline] ?? [];

    // Build x-axis categories as multi-line arrays for apexcharts
    const categories = data.map(d => [
      d.name,
      `F-(${d.freshPct} %)`,
      `R-(${d.repeatPct} %)`
    ]);

    const freshSeries = data.map(d => d.freshBusiness);
    const repeatSeries = data.map(d => d.repeatBusiness);

    if (this.chartOptions) {
      this.chartOptions = {
        ...this.chartOptions,
        series: [
          { name: 'Fresh Business', data: freshSeries },
          { name: 'Repeat Business', data: repeatSeries }
        ],
        colors: ['#e53935', '#5e35b1'],
        xaxis: {
          ...this.chartOptions.xaxis,
          categories: categories
        },
        title: {
          ...this.chartOptions.title,
          text: this.getChartTitle()
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
