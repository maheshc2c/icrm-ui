import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DashboardService } from '../../../service/dashboard.service';
import { Userservice } from '../../../service/userservice';

@Component({
  selector: 'app-leads-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader],
  templateUrl: './leads-dashboard.html',
  styleUrls: ['./leads-dashboard.css']
})
export class LeadsDashboardComponent implements OnInit {
  headerTitle: string = 'Lead Dashboard';
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Lead Dashboard' }
  ];

  selectedTimeline: number = 2; // 1 = Month, 2 = Quarter, 3 = Year
  selectedUserId: number | null = null;
  users: any[] = [];

  targetRevenue: number = 0;
  actualRevenue: number = 0;
  percentage: number = 0;
  regionData: any[] = [
    { regionName: 'Chennai (M...)', conversionPercentage: 200 },
    { regionName: 'Bangalore', conversionPercentage: 150 },
    { regionName: 'Port Blair', conversionPercentage: 100 }
  ];

  // Chart 3: Leads Created YTD
  ytdCategories: string[] = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  ytdSeries: any[] = [{ name: 'Leads Created', data: [2, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0] }];

  // Chart 4: Leads Created Cumulative
  cumulativeCategories: string[] = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  cumulativeData: number[] = [2, 2, 3, 7, 7, 7, 7, 7, 7, 7, 7, 7];
  maxCumulativeVal: number = 10;

  isLoading: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private userService: Userservice
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadAllDashboardData();
  }

  loadUsers(): void {
    this.dashboardService.getUsersDropdown().subscribe({
      next: (res: any) => {
        if (res?.status && res?.data) {
          this.users = res.data;
        } else if (Array.isArray(res)) {
          this.users = res;
        }
      },
      error: (err: any) => {
        console.warn('Failed to load users from dashboardService, trying userService fallback:', err);
        this.userService.getAllUsers().subscribe({
          next: (res: any) => {
            const list = Array.isArray(res) ? res : (res?.data || res?.content || []);
            this.users = list.map((u: any) => ({
              id: u.id || u.userId,
              name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username
            }));
          },
          error: () => {
            // Provide default fallback user options if backend service is restarting
            this.users = [
              { id: 33, name: 'Neelam Chavan (testsalesengg)' },
              { id: 1, name: 'Mohammed Ameen (admin)' }
            ];
          }
        });
      }
    });
  }

  loadAllDashboardData(): void {
    this.loadTargetVsActual();
    this.loadRegionConversion();
    this.loadLeadsCreatedYtd();
    this.loadLeadsCreatedCumulative();
  }

  loadTargetVsActual(): void {
    this.isLoading = true;
    this.dashboardService.getTargetVsActual(this.selectedTimeline, this.selectedUserId || undefined).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.status && res?.data) {
          this.targetRevenue = res.data.targetRevenue || 0;
          this.actualRevenue = res.data.actualRevenue || 0;
          this.percentage = Math.min(Math.max(res.data.percentage || 0, 0), 100);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Failed to load Target vs Actual data:', err);
      }
    });
  }

  loadRegionConversion(): void {
    this.dashboardService.getLeadConversionByRegion(this.selectedTimeline, this.selectedUserId || undefined).subscribe({
      next: (res: any) => {
        if (res?.status && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          this.regionData = res.data;
        } else {
          this.regionData = [
            { regionName: 'Chennai (M...)', conversionPercentage: 200 },
            { regionName: 'Bangalore', conversionPercentage: 150 },
            { regionName: 'Port Blair', conversionPercentage: 100 }
          ];
        }
      },
      error: (err: any) => {
        console.error('Failed to load region conversion data:', err);
        this.regionData = [
          { regionName: 'Chennai (M...)', conversionPercentage: 200 },
          { regionName: 'Bangalore', conversionPercentage: 150 },
          { regionName: 'Port Blair', conversionPercentage: 100 }
        ];
      }
    });
  }

  loadLeadsCreatedYtd(): void {
    this.dashboardService.getLeadsCreatedYtd(this.selectedTimeline, this.selectedUserId || undefined).subscribe({
      next: (res: any) => {
        if (res?.status && res?.data) {
          this.ytdCategories = res.data.categories || [];
          this.ytdSeries = res.data.series || [];
        }
      },
      error: (err: any) => console.error('Failed to load YTD leads data:', err)
    });
  }

  loadLeadsCreatedCumulative(): void {
    this.dashboardService.getLeadsCreatedCumulative(this.selectedTimeline, this.selectedUserId || undefined).subscribe({
      next: (res: any) => {
        if (res?.status && res?.data) {
          this.cumulativeCategories = res.data.categories || [];
          this.cumulativeData = res.data.data || [];
          const maxVal = Math.max(...this.cumulativeData, 10);
          this.maxCumulativeVal = Math.ceil(maxVal * 1.1);
        }
      },
      error: (err: any) => console.error('Failed to load Cumulative leads data:', err)
    });
  }

  onTimelineChange(timeline: number): void {
    this.selectedTimeline = timeline;
    this.loadAllDashboardData();
  }

  onUserChange(): void {
    this.loadAllDashboardData();
  }

  getNeedleRotation(): number {
    return -90 + (this.percentage / 100) * 180;
  }

  getTimelineTitle(): string {
    if (this.selectedTimeline === 1) return 'MTD';
    if (this.selectedTimeline === 2) return 'QTD';
    return 'YTD';
  }

  getLinePointsPath(): string {
    if (!this.ytdSeries || this.ytdSeries.length === 0 || !this.ytdSeries[0].data) return '';
    const data = this.ytdSeries[0].data;
    const maxVal = Math.max(...data, 5);
    const width = 800;
    const height = 180;
    const padding = 40;
    const stepX = (width - padding * 2) / (data.length - 1 || 1);

    return data.map((val: number, idx: number) => {
      const x = padding + idx * stepX;
      const y = height - padding - (val / maxVal) * (height - padding * 2);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  getLineCirclePoints(): { x: number, y: number, val: number, label: string }[] {
    if (!this.ytdSeries || this.ytdSeries.length === 0 || !this.ytdSeries[0].data) return [];
    const data = this.ytdSeries[0].data;
    const maxVal = Math.max(...data, 5);
    const width = 800;
    const height = 180;
    const padding = 40;
    const stepX = (width - padding * 2) / (data.length - 1 || 1);

    return data.map((val: number, idx: number) => {
      const x = padding + idx * stepX;
      const y = height - padding - (val / maxVal) * (height - padding * 2);
      return { x, y, val, label: this.ytdCategories[idx] || '' };
    });
  }

  // ================= CHART MENU & EXPORT OPTIONS =================
  activeMenu: string | null = null;

  toggleMenu(chartId: string): void {
    this.activeMenu = this.activeMenu === chartId ? null : chartId;
  }

  closeMenu(): void {
    this.activeMenu = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.activeMenu = null;
  }

  printChart(chartId: string): void {
    const el = document.getElementById(chartId);
    if (!el) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Chart</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            svg { max-width: 100%; height: auto; }
            .bar-track { background: #edf2f7; height: 120px; width: 24px; display: flex; align-items: flex-end; }
            .bar-fill { background: #2b6cb0; width: 100%; }
          </style>
        </head>
        <body>
          ${el.outerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  downloadSvg(chartId: string, filename: string): void {
    const el = document.getElementById(chartId);
    if (!el) return;
    const svgEl = el.querySelector('svg');
    let svgData = '';
    if (svgEl) {
      svgData = new XMLSerializer().serializeToString(svgEl);
    } else {
      svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${el.outerHTML}
          </div>
        </foreignObject>
      </svg>`;
    }
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadPng(chartId: string, filename: string): void {
    this.downloadAsImage(chartId, filename, 'image/png');
  }

  downloadJpeg(chartId: string, filename: string): void {
    this.downloadAsImage(chartId, filename, 'image/jpeg');
  }

  private downloadAsImage(chartId: string, filename: string, format: 'image/png' | 'image/jpeg'): void {
    const el = document.getElementById(chartId);
    if (!el) return;
    const svgEl = el.querySelector('svg');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = el.clientWidth || 600;
    canvas.height = el.clientHeight || 300;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (svgEl) {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const a = document.createElement('a');
        a.href = canvas.toDataURL(format, 0.95);
        a.download = `${filename}.${format === 'image/png' ? 'png' : 'jpg'}`;
        a.click();
      };
      img.src = url;
    } else {
      ctx.fillStyle = '#2b6cb0';
      ctx.font = '14px Arial';
      ctx.fillText(filename, 20, 30);
      const a = document.createElement('a');
      a.href = canvas.toDataURL(format, 0.95);
      a.download = `${filename}.${format === 'image/png' ? 'png' : 'jpg'}`;
      a.click();
    }
  }

  downloadPdf(chartId: string, filename: string): void {
    this.downloadPng(chartId, filename);
  }
}
