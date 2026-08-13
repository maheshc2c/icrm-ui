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
  dataLabels: ApexOptions['dataLabels'];
  stroke: ApexOptions['stroke'];
  colors: ApexOptions['colors'];
  legend: ApexOptions['legend'];
  grid: ApexOptions['grid'];
  tooltip: ApexOptions['tooltip'];
  title: ApexOptions['title'];
  markers: ApexOptions['markers'];
};

@Component({
  selector: 'app-runrate-projection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ReportsLayoutComponent,
    NgApexchartsModule
  ],
  templateUrl: './runrate-projection.html',
  styleUrls: ['./runrate-projection.css']
})
export class RunrateProjectionComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  title = 'Run Rate Projection';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Run Rate Projection' }
  ];

  filterForm!: FormGroup;
  viewMode: 'graph' | 'table' = 'graph';

  // Financial year months Apr to Mar
  months = ['Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26',
            'Oct-26', 'Nov-26', 'Dec-26', 'Jan-27', 'Feb-27', 'Mar-27'];

  // ---------- Rich mock data keyed by filter value ----------
  mockDatasets: Record<string, {
    closedWon: number[];
    minConversion: number[];
    maxConversion: number[];
    openOpps: number[];
    percentages: number[];
  }> = {
    // Default (no filter)
    default: {
      closedWon:     [9.93, 0,    0,    8.68, 7.5,  0,    0,    0,    0,    0,    0,    0],
      minConversion: [9.93, 0,    0,    8.68, 7.5,  0,    0,    0,    0,    0,    0,    0],
      maxConversion: [0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0],
      openOpps:      [0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0],
      percentages:   [0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0]
    },
    // Regions
    north: {
      closedWon:     [5.2,  3.1,  0,    6.4,  4.8,  2.1,  0,    0,    1.5,  0,    0,    0],
      minConversion: [4.8,  2.9,  0,    6.0,  4.5,  2.0,  0,    0,    1.4,  0,    0,    0],
      maxConversion: [6.0,  3.5,  0.5,  7.2,  5.5,  2.5,  0.3,  0,    1.8,  0,    0,    0],
      openOpps:      [2.0,  1.5,  3.0,  1.0,  2.2,  4.0,  3.5,  2.8,  2.0,  3.1,  2.5,  1.8],
      percentages:   [52,   31,   0,    64,   48,   21,   0,    0,    15,   0,    0,    0]
    },
    south: {
      closedWon:     [9.93, 0,    0,    8.68, 7.5,  0,    0,    0,    0,    0,    0,    0],
      minConversion: [9.93, 0,    0,    8.68, 7.5,  0,    0,    0,    0,    0,    0,    0],
      maxConversion: [11.2, 1.0,  0.5,  9.5,  8.2,  0,    0,    0,    0,    0,    0,    0],
      openOpps:      [0,    3.0,  5.0,  0,    0,    4.5,  6.0,  5.2,  4.8,  3.5,  2.1,  1.0],
      percentages:   [0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0]
    },
    east: {
      closedWon:     [3.5,  4.2,  2.8,  5.1,  3.9,  4.5,  2.1,  0,    1.8,  2.5,  0,    0],
      minConversion: [3.2,  3.9,  2.6,  4.8,  3.6,  4.2,  2.0,  0,    1.7,  2.3,  0,    0],
      maxConversion: [4.0,  4.8,  3.2,  5.8,  4.4,  5.1,  2.5,  0.5,  2.1,  2.9,  0.3,  0],
      openOpps:      [1.5,  0.8,  2.0,  1.2,  1.8,  0.9,  2.5,  3.0,  2.2,  1.4,  3.5,  2.8],
      percentages:   [35,   42,   28,   51,   39,   45,   21,   0,    18,   25,   0,    0]
    },
    west: {
      closedWon:     [7.1,  5.5,  4.2,  6.8,  5.0,  3.3,  2.9,  1.5,  0,    0,    0,    0],
      minConversion: [6.8,  5.2,  4.0,  6.5,  4.8,  3.1,  2.7,  1.4,  0,    0,    0,    0],
      maxConversion: [8.0,  6.2,  4.8,  7.5,  5.6,  3.8,  3.3,  1.8,  0.5,  0.3,  0,    0],
      openOpps:      [0.5,  1.0,  1.5,  0.8,  1.2,  2.0,  1.8,  2.5,  3.5,  4.0,  3.2,  2.8],
      percentages:   [71,   55,   42,   68,   50,   33,   29,   15,   0,    0,    0,    0]
    },
    // Products
    oracle: {
      closedWon:     [6.84, 0,    0,    12.0, 5.0,  0,    3.2,  0,    0,    0,    0,    0],
      minConversion: [6.5,  0,    0,    11.5, 4.8,  0,    3.0,  0,    0,    0,    0,    0],
      maxConversion: [7.5,  0.5,  0,    13.0, 5.5,  0.3,  3.8,  0,    0,    0,    0,    0],
      openOpps:      [0,    2.5,  4.0,  0,    1.5,  3.0,  0,    2.8,  3.5,  2.0,  1.8,  1.2],
      percentages:   [36,   0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0]
    },
    sap: {
      closedWon:     [0,    0,    0,    7.21, 0,    2.5,  4.1,  3.8,  0,    0,    0,    0],
      minConversion: [0,    0,    0,    7.0,  0,    2.3,  3.9,  3.6,  0,    0,    0,    0],
      maxConversion: [0,    0.3,  0,    8.0,  0.5,  2.8,  4.5,  4.2,  0.5,  0,    0,    0],
      openOpps:      [3.0,  2.5,  4.0,  0,    3.5,  0,    0,    0,    2.8,  3.5,  2.2,  1.8],
      percentages:   [0,    0,    0,    100,  0,    25,   41,   38,   0,    0,    0,    0]
    },
    // Categories
    cat1: {
      closedWon:     [4.5,  3.2,  2.1,  5.8,  4.0,  3.5,  2.8,  1.2,  0,    0,    0,    0],
      minConversion: [4.2,  3.0,  2.0,  5.5,  3.8,  3.3,  2.6,  1.1,  0,    0,    0,    0],
      maxConversion: [5.0,  3.6,  2.4,  6.5,  4.5,  4.0,  3.2,  1.5,  0.4,  0.2,  0,    0],
      openOpps:      [1.0,  2.0,  3.5,  1.5,  2.5,  1.8,  2.0,  3.0,  4.0,  3.5,  2.8,  2.0],
      percentages:   [45,   32,   21,   58,   40,   35,   28,   12,   0,    0,    0,    0]
    },
    cat2: {
      closedWon:     [8.2,  6.5,  0,    10.5, 7.8,  0,    4.5,  2.1,  0,    0,    0,    0],
      minConversion: [7.9,  6.2,  0,    10.0, 7.5,  0,    4.2,  2.0,  0,    0,    0,    0],
      maxConversion: [9.0,  7.2,  0.5,  11.5, 8.5,  0.8,  5.0,  2.5,  0.3,  0,    0,    0],
      openOpps:      [0,    1.5,  4.5,  0,    0,    5.0,  0,    2.8,  4.5,  3.8,  2.5,  1.5],
      percentages:   [82,   65,   0,    0,    78,   0,    45,   21,   0,    0,    0,    0]
    }
  };

  tableRows: any[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      category: [''],
      product: [''],
      region: [''],
      user: [''],
      customRate: ['']
    });

    this.buildTableRows();
    this.initChart();

    // React to any filter change
    this.filterForm.valueChanges.subscribe(() => {
      this.updateChart();
    });
  }

  getActiveDataset(): typeof this.mockDatasets['default'] {
    const { region, product, category } = this.filterForm.value;
    if (region && this.mockDatasets[region]) return this.mockDatasets[region];
    if (product && this.mockDatasets[product]) return this.mockDatasets[product];
    if (category && this.mockDatasets[category]) return this.mockDatasets[category];
    return this.mockDatasets['default'];
  }

  getChartTitle(): string {
    const { region, product, category } = this.filterForm?.value ?? {};
    const regionMap: Record<string, string> = { north: 'North', south: 'South', east: 'East', west: 'West' };
    const productMap: Record<string, string> = { oracle: 'Oracle', sap: 'SAP' };
    const categoryMap: Record<string, string> = { cat1: 'Category 1', cat2: 'Category 2' };

    if (region && regionMap[region]) return `${regionMap[region]} Wise Run Rate Projection 2026-27`;
    if (product && productMap[product]) return `${productMap[product]} Run Rate Projection 2026-27`;
    if (category && categoryMap[category]) return `${categoryMap[category]} Run Rate Projection 2026-27`;
    return 'Run Rate Projection 2026-27';
  }

  updateChart(): void {
    const ds = this.getActiveDataset();
    const categories = this.months.map((m, i) => [m, `(${ds.percentages[i]}%)`]);

    this.chartOptions = {
      ...this.chartOptions,
      series: [
        { name: `Max Conversion Rate(${this.filterForm.value.customRate || 0}%)`, data: ds.maxConversion },
        { name: 'Open Opportunities', data: ds.openOpps },
        { name: 'Closed Won',         data: ds.closedWon },
        { name: `Min Conversion Rate(${this.filterForm.value.customRate || 0}%)`, data: ds.minConversion }
      ],
      xaxis: { ...this.chartOptions.xaxis, categories },
      title: { ...this.chartOptions.title, text: this.getChartTitle() }
    };

    this.buildTableRows(ds);
  }

  buildTableRows(ds?: typeof this.mockDatasets['default']): void {
    const dataset = ds ?? this.mockDatasets['default'];
    this.tableRows = this.months.map((month, i) => ({
      month,
      openOpportunities: dataset.openOpps[i],
      closedWon: dataset.closedWon[i],
      minConversion: dataset.minConversion[i],
      maxConversion: dataset.maxConversion[i]
    }));
  }

  getTotalFor(field: string): number {
    return +this.tableRows.reduce((sum, row) => sum + (row[field] || 0), 0).toFixed(2);
  }

  getXCategories(): string[][] {
    const ds = this.getActiveDataset();
    return this.months.map((m, i) => [m, `(${ds.percentages[i]}%)`]);
  }

  initChart(): void {
    const ds = this.mockDatasets['default'];
    this.chartOptions = {
      series: [
        { name: 'Max Conversion Rate(0%)', data: ds.maxConversion },
        { name: 'Open Opportunities',      data: ds.openOpps },
        { name: 'Closed Won',              data: ds.closedWon },
        { name: 'Min Conversion Rate(0%)', data: ds.minConversion }
      ],
      chart: {
        type: 'line',
        height: 420,
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
        text: this.getChartTitle(),
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: '500',
          color: '#3f4254'
        }
      },
      // Green, Blue, Orange, Yellow
      colors: ['#2e7d32', '#1565c0', '#e65100', '#f9a825'],
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      markers: {
        size: 5,
        strokeWidth: 0,
        hover: { size: 7 }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: this.getXCategories(),
        labels: {
          style: { colors: '#6b7280', fontSize: '11px' }
        },
        axisBorder: { show: true, color: '#dfe6ef' },
        axisTicks: { show: true, color: '#dfe6ef' }
      },
      yaxis: {
        title: {
          text: 'Value In Lakhs',
          style: { color: '#6b7280', fontWeight: '500' }
        },
        labels: {
          style: { colors: '#6b7280', fontSize: '12px' }
        },
        min: 0
      },
      tooltip: {
        shared: true,
        intersect: false,
        x: {
          formatter: (val: any, opts: any) => {
            // Show only month name in tooltip
            const idx = opts?.dataPointIndex ?? 0;
            return this.months[idx] ?? val;
          }
        },
        y: {
          formatter: (val: number) => `${val} Lacs`
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        markers: { size: 8 },
        itemMargin: { horizontal: 12, vertical: 5 }
      },
      grid: {
        borderColor: '#f1f5f9',
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } }
      }
    };
  }
}
