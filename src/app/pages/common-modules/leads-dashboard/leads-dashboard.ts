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
    this.activeMenu = null;
    const svgEl = el.querySelector('svg');
    let svgData = '';

    if (svgEl) {
      const clonedSvg = svgEl.cloneNode(true) as SVGElement;
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('style', 'background-color: #ffffff;');
      svgData = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + new XMLSerializer().serializeToString(clonedSvg);
    } else {
      const width = el.clientWidth || 600;
      const height = el.clientHeight || 320;

      if (chartId === 'funnel-chart' || el.querySelector('.funnel-container') || el.querySelector('.funnel-diagram')) {
        const coldText = el.querySelector('.cold-stage .stage-label')?.textContent?.trim() 
                      || el.querySelector('.cold-stage')?.textContent?.trim()
                      || el.querySelector('.funnel-cold')?.textContent?.trim()
                      || `Cold (${(this as any).funnelStages?.[0]?.value || 0})`;
        const warmText = el.querySelector('.warm-stage .stage-label')?.textContent?.trim() 
                      || el.querySelector('.warm-stage')?.textContent?.trim()
                      || el.querySelector('.funnel-warm')?.textContent?.trim()
                      || `Warm (${(this as any).funnelStages?.[1]?.value || 0})`;
        const hotText  = el.querySelector('.hot-stage .stage-label')?.textContent?.trim() 
                      || el.querySelector('.hot-stage')?.textContent?.trim()
                      || el.querySelector('.funnel-hot')?.textContent?.trim()
                      || `Hot (${(this as any).funnelStages?.[2]?.value || 0})`;

        svgData = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#ffffff; font-family: system-ui, -apple-system, sans-serif;">
  <text x="30" y="35" font-size="16" font-weight="bold" fill="#333333">Lead Conversion Funnel</text>
  
  <!-- Cold Segment -->
  <polygon points="50,60 ${width - 50},60 ${width * 0.85},120 ${width * 0.15},120" fill="#4154f1" />
  <text x="${width / 2}" y="95" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">${coldText}</text>

  <!-- Warm Segment -->
  <polygon points="${width * 0.16},126 ${width * 0.84},126 ${width * 0.75},180 ${width * 0.25},180" fill="#ff9f43" />
  <text x="${width / 2}" y="158" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">${warmText}</text>

  <!-- Hot Segment -->
  <polygon points="${width * 0.26},186 ${width * 0.74},186 ${width * 0.65},235 ${width * 0.35},235" fill="#ea5455" />
  <text x="${width / 2}" y="216" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">${hotText}</text>
</svg>`;
      } else {
        const clone = el.cloneNode(true) as HTMLElement;
        const menu = clone.querySelector('.chart-menu-container');
        if (menu) menu.remove();
        svgData = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <style>
    .chart-card { background: #ffffff; padding: 20px; font-family: system-ui, sans-serif; box-sizing: border-box; }
    .chart-header h3 { margin: 0 0 15px 0; font-size: 15px; color: #333; }
    .funnel-container { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 0; }
    .funnel-segment { display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 12px; }
    .funnel-cold { width: 100%; height: 45px; background: #4154f1; clip-path: polygon(0 0, 100% 0, 85% 100%, 15% 100%); }
    .funnel-warm { width: 70%; height: 40px; background: #ff9f43; clip-path: polygon(0 0, 100% 0, 80% 100%, 20% 100%); }
    .funnel-hot { width: 40%; height: 35px; background: #ea5455; clip-path: polygon(0 0, 100% 0, 70% 100%, 30% 100%); }
  </style>
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">${clone.outerHTML}</div>
  </foreignObject>
</svg>`;
      }
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
    this.activeMenu = null;

    const menuEl = el.querySelector('.chart-menu-container') as HTMLElement;
    if (menuEl) menuEl.style.visibility = 'hidden';

    import('html2canvas').then((html2canvasModule) => {
      const html2canvas = html2canvasModule.default || html2canvasModule;
      html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      }).then((canvas: HTMLCanvasElement) => {
        if (menuEl) menuEl.style.visibility = 'visible';
        const a = document.createElement('a');
        a.href = canvas.toDataURL(format, 0.95);
        a.download = `${filename}.${format === 'image/png' ? 'png' : 'jpg'}`;
        a.click();
      }).catch((err: any) => {
        if (menuEl) menuEl.style.visibility = 'visible';
        console.error('Canvas export error:', err);
      });
    }).catch((err: any) => {
      if (menuEl) menuEl.style.visibility = 'visible';
      console.error('html2canvas load error:', err);
    });
  }

  downloadPdf(chartId: string, filename: string): void {
    const el = document.getElementById(chartId);
    if (!el) return;
    this.activeMenu = null;

    const menuEl = el.querySelector('.chart-menu-container') as HTMLElement;
    if (menuEl) menuEl.style.visibility = 'hidden';

    import('html2canvas').then((html2canvasModule) => {
      const html2canvas = html2canvasModule.default || html2canvasModule;
      html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      }).then((canvas: HTMLCanvasElement) => {
        if (menuEl) menuEl.style.visibility = 'visible';

        const imageBase64 = canvas.toDataURL('image/png');
        const token = localStorage.getItem('token');

        fetch('http://localhost:8080/leads/export-chart-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ imageBase64, filename })
        })
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch(err => {
          console.error('Backend PDF export error:', err);
        });
      }).catch((err: any) => {
        if (menuEl) menuEl.style.visibility = 'visible';
        console.error('PDF export error:', err);
      });
    }).catch((err: any) => {
      if (menuEl) menuEl.style.visibility = 'visible';
      console.error('html2canvas load error:', err);
    });
  }
}
