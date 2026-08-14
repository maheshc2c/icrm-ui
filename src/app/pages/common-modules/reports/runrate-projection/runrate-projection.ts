import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
    NgApexchartsModule,
    HttpClientModule
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

  categories: any[] = [];
  products: any[] = [];
  regions: any[] = [];
  users: any[] = [];

  fullMonthNames: Record<string, string> = {
    'Apr-26': 'April', 'May-26': 'May', 'Jun-26': 'June',
    'Jul-26': 'July', 'Aug-26': 'August', 'Sep-26': 'September',
    'Oct-26': 'October', 'Nov-26': 'November', 'Dec-26': 'December',
    'Jan-27': 'January', 'Feb-27': 'February', 'Mar-27': 'March'
  };

  tableRows: any[] = [];
  currentTitle = 'Run Rate Projection 2026-27';
  minRateLabel = 'Min Conversion (0%)(Lacs)';
  maxRateLabel = 'Max Conversion (0%)(Lacs)';

  constructor(private fb: FormBuilder, private http: HttpClient, private auth: AuthService) {
    this.initChart();
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      category: [null],
      product: [null],
      region: [null],
      user: [null],
      customRate: [null]
    });

    this.fetchDropdowns();
    this.fetchRunrateProjection();

    // React to any filter change
    this.filterForm.valueChanges.subscribe(() => {
      this.fetchRunrateProjection();
    });
  }

  fetchDropdowns(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    // Categories dropdown
    this.http.get<any>('http://localhost:8080/product/category', { headers }).subscribe({
      next: (res) => {
        if (Array.isArray(res)) this.categories = res;
        else if (res && Array.isArray(res.data)) this.categories = res.data;
        else if (res && Array.isArray(res.content)) this.categories = res.content;
      },
      error: (err) => console.error('Error loading categories:', err)
    });

    // Products dropdown
    this.http.post<any>('http://localhost:8080/product', {}, { headers }).subscribe({
      next: (res) => {
        if (Array.isArray(res)) this.products = res;
        else if (res && Array.isArray(res.data)) this.products = res.data;
        else if (res && Array.isArray(res.content)) this.products = res.content;
      },
      error: (err) => console.error('Error loading products:', err)
    });

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

  fetchRunrateProjection(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    const { category, product, region, user, customRate } = this.filterForm.value;

    const body = {
      categoryId: category !== null && category !== '' && category !== undefined ? Number(category) : null,
      productId: product !== null && product !== '' && product !== undefined ? Number(product) : null,
      regionId: region !== null && region !== '' && region !== undefined ? Number(region) : null,
      userId: user !== null && user !== '' && user !== undefined ? Number(user) : null,
      customRate: customRate !== null && customRate !== '' && customRate !== undefined ? parseFloat(customRate) : null,
      startDate: "2026-04-01",
      endDate: "2027-03-31"
    };

    this.http.post<any>('http://localhost:8080/reports/runrate-projection', body, { headers }).subscribe({
      next: (response) => {
        if (response && response.status && response.data) {
          this.processApiResponse(response.data);
        }
      },
      error: (err) => {
        console.error('Error fetching runrate projection report:', err);
      }
    });
  }

  processApiResponse(data: any): void {
    if (data.xaxisLabel) {
      this.currentTitle = data.xaxisLabel;
    }

    // 1. Categories for x-axis
    let categories: any[] = [];
    if (data.xaxisCategory && Array.isArray(data.xaxisCategory)) {
      categories = data.xaxisCategory.map((cat: string) => {
        if (typeof cat === 'string' && cat.includes('<br>')) {
          return cat.split('<br>');
        }
        return cat;
      });
    }

    // 2. Series & Colors
    let series: any[] = [];
    let colors: string[] = [];

    if (data.chartSeries && Array.isArray(data.chartSeries)) {
      series = data.chartSeries.map((s: any) => ({
        name: s.name,
        data: s.data ? s.data.map((val: any) => val === null ? null : val) : []
      }));
      colors = data.chartSeries.map((s: any) => s.color || '#2e7d32');

      // Update rate labels for table headers from series names if available
      const minSeries = data.chartSeries.find((s: any) => s.name && s.name.includes('Min Conversion'));
      const maxSeries = data.chartSeries.find((s: any) => s.name && s.name.includes('Max Conversion'));

      if (minSeries) {
        this.minRateLabel = `${minSeries.name}(Lacs)`;
      }
      if (maxSeries) {
        this.maxRateLabel = `${maxSeries.name}(Lacs)`;
      }
    }

    // 3. Update Chart Options
    if (this.chartOptions) {
      this.chartOptions = {
        ...this.chartOptions,
        series: series,
        colors: colors.length > 0 ? colors : ['#097054', '#6599FF', '#FF9900', '#FFDE00'],
        xaxis: {
          ...this.chartOptions.xaxis,
          categories: categories
        },
        title: {
          ...this.chartOptions.title,
          text: this.currentTitle
        }
      };
    }

    // 4. Update Table Rows
    if (data.tableRows && Array.isArray(data.tableRows)) {
      this.tableRows = data.tableRows.map((row: any, i: number) => {
        const fullMonth = this.fullMonthNames[row.monthName] || row.monthName;
        return {
          sno: i + 1,
          month: fullMonth,
          funnel: row.newOppVal ?? 0,
          closedWon: row.newSaleVal ?? 0,
          conversionRate: row.conversionRate ?? 0,
          minConversion: (row.minConVal !== null && row.minConVal !== undefined && row.minConVal !== 0) ? row.minConVal : '--',
          maxConversion: (row.maxConVal !== null && row.maxConVal !== undefined && row.maxConVal !== 0) ? row.maxConVal : ((row.cusConVal !== null && row.cusConVal !== undefined && row.cusConVal !== 0) ? row.cusConVal : '--'),
          rawMinConversion: row.minConVal || 0,
          rawMaxConversion: row.maxConVal || row.cusConVal || 0
        };
      });
    }
  }

  initChart(): void {
    this.chartOptions = {
      series: [],
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
        text: this.currentTitle,
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: '500',
          color: '#3f4254'
        }
      },
      colors: ['#097054', '#6599FF', '#FF9900', '#FFDE00'],
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
        categories: [],
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
        y: {
          formatter: (val: number) => val !== null && val !== undefined ? `${val} Lacs` : '--'
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

  getTotalFor(field: string): number {
    return +this.tableRows.reduce((sum, row) => sum + (Number(row[field]) || 0), 0).toFixed(2);
  }

  onDownloadTable(): void {
    const headers = [
      'Sno',
      'Month',
      'Funnel (Lacs)',
      'Closed Won(Lacs)',
      'Conversion Rate %',
      `"${this.minRateLabel}"`,
      `"${this.maxRateLabel}"`
    ];

    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';

    this.tableRows.forEach(row => {
      const rowData = [
        row.sno,
        `"${row.month}"`,
        row.funnel,
        row.closedWon,
        row.conversionRate,
        `"${row.minConversion}"`,
        `"${row.maxConversion}"`
      ];
      csvContent += rowData.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${this.currentTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
