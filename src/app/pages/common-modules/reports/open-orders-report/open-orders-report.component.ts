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
  selector: 'app-open-orders-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportsLayoutComponent,
    NgApexchartsModule
  ],
  templateUrl: './open-orders-report.component.html',
  styleUrls: ['./open-orders-report.component.css']
})
export class OpenOrdersReportComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  title = 'Open Orders Report';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Open Order Report' }
  ];

  filterForm!: FormGroup;
  timelineOptions = ['Week', 'Month', 'Quarter', 'Year'];
  categories = ['ERP', 'BU1', 'BU2', 'BU3', 'Test1'];
  dateOptions: string[] = [];

  constructor(private fb: FormBuilder) {
    this.initChart();
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      region: [''],
      user: [''],
      date: [''],
      timeline: ['Month']
    });

    this.updateDateOptions(this.filterForm.value.timeline);
    this.updateMockData(this.filterForm.value.timeline);

    this.filterForm.get('timeline')?.valueChanges.subscribe(timeline => {
      this.updateDateOptions(timeline);
      this.updateMockData(timeline);
    });
  }

  updateDateOptions(timeline: string): void {
    if (timeline === 'Week') {
      this.dateOptions = ['Week1 (2026-07-25 to 2026-07-31)', 'Week2 (2026-08-01 to 2026-08-07)'];
      this.filterForm.get('date')?.setValue(this.dateOptions[1]);
    } else if (timeline === 'Month') {
      this.dateOptions = ['Jul-26', 'Aug-26', 'Sep-26'];
      this.filterForm.get('date')?.setValue(this.dateOptions[1]);
    } else if (timeline === 'Quarter') {
      this.dateOptions = ['Quarter1', 'Quarter2', 'Quarter3'];
      this.filterForm.get('date')?.setValue(this.dateOptions[1]);
    } else {
      this.dateOptions = [];
      this.filterForm.get('date')?.setValue('');
    }
  }

  initChart(): void {
    this.chartOptions = {
      series: [],
      chart: {
        type: 'bar',
        height: 400,
        stacked: true,
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
        locales: [{
          name: 'en',
          options: {
            toolbar: {
              menu: 'Chart context menu',
              exportToSVG: 'Download SVG vector image',
              exportToPNG: 'Download PNG image',
              exportToCSV: 'Download CSV document'
            }
          }
        }],
        defaultLocale: 'en'
      },
      title: {
        text: 'Open Orders Report',
        align: 'center',
        style: {
          fontSize:  '16px',
          fontWeight:  '500',
          color:  '#3f4254'
        }
      },
      colors: ['#395bb2', '#fc8f00', '#ff5b5b', '#099a9a'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '25%',
          dataLabels: {
            position: 'top', // top, center, bottom
          },
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          colors: ['#000']
        },
        formatter: function (val: number) {
          if (val === 0) return '0';
          return val.toString();
        }
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        categories: this.categories,
        title: {
          text: 'Categories',
          style: { color: '#6b7280', fontWeight: '500' }
        },
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px'
          }
        },
        axisBorder: { show: true, color: '#dfe6ef' },
        axisTicks: { show: true, color: '#dfe6ef' }
      },
      yaxis: {
        title: {
          text: 'Value In Lacs',
          style: { color: '#6b7280', fontWeight: '500' }
        },
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px'
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + ' L';
          }
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        markers: { size: 6 },
        itemMargin: { horizontal: 10, vertical: 5 }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 0,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } }
      }
    };
  }

  updateMockData(timeline: string): void {
    let seriesData: any = [];
    let colorsData: string[] = [];

    // Simulate different data for Week, Month, Quarter, Year based on images
    if (timeline === 'Week') {
      seriesData = [
        { name: 'Fresh not cleared', data: [0, 0, 0, 0, 0] },
        { name: 'Fresh open orders cleared', data: [0, 0, 0, 0, 0] }
      ];
      colorsData = ['#ff5b5b', '#099a9a'];
    } else if (timeline === 'Month') {
      seriesData = [
        { name: 'Old not cleared', data: [0, 0, 0, 0, 0] },
        { name: 'Old open orders cleared', data: [17.44, 0, 0, 0, 0] },
        { name: 'Fresh not cleared', data: [0, 0, 0, 0, 0] },
        { name: 'Fresh open orders cleared', data: [0, 0, 0, 0, 0] }
      ];
      colorsData = ['#395bb2', '#fc8f00', '#ff5b5b', '#099a9a'];
    } else if (timeline === 'Quarter') {
      seriesData = [
        { name: 'Old not cleared', data: [0, 0, 0, 0, 0] },
        { name: 'Old open orders cleared', data: [10.24, 0, 0, 0, 0] },
        { name: 'Fresh not cleared', data: [0, 0, 0, 0, 0] },
        { name: 'Fresh open orders cleared', data: [7.20, 0, 0, 0, 0] }
      ];
      colorsData = ['#395bb2', '#fc8f00', '#ff5b5b', '#099a9a'];
    } else if (timeline === 'Year') {
      seriesData = [
        { name: 'Fresh not cleared', data: [0, 0, 0, 0, 0] },
        { name: 'Fresh open orders cleared', data: [9.94, 0, 0, 0, 0] }
      ];
      colorsData = ['#ff5b5b', '#099a9a'];
    }

    
    if (this.chartOptions) {
      this.chartOptions.colors = colorsData;
      this.chartOptions.series = seriesData.map((series: any) => {
        const total = series.data.reduce((a: number, b: number) => a + b, 0);
        let updatedName = series.name;
        if (total > 0) {
          updatedName = `${series.name} (${total.toFixed(2)} L)`;
        } else {
          updatedName = `${series.name} ()`;
        }
        return {
          ...series,
          name: updatedName
        };
      });

      this.chartOptions.title = {
        ...this.chartOptions.title,
        text: this.getChartTitle()
      };
    }
  }

  getChartTitle(): string {
    const timeline = this.filterForm?.get('timeline')?.value || '';
    if (timeline === 'Year') {
      return 'Open Orders 2026-27';
    }
    const val = timeline === 'Month' ? 'Aug-26' : (timeline === 'Quarter' ? 'Quarter2' : 'Week2');
    return `Open Orders ( ${val} )`;
  }
}
