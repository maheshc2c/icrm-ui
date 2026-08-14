import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DashboardService } from '../../../service/dashboard.service';
import { Userservice } from '../../../service/userservice';

@Component({
  selector: 'app-opportunity-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader],
  templateUrl: './opportunity-dashboard.html',
  styleUrls: ['./opportunity-dashboard.css']
})
export class OpportunityDashboardComponent implements OnInit {
  headerTitle: string = 'Opportunity Dashboard';
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Opportunity Dashboard' }
  ];

  selectedPcRegion: number = 1; // 1 = Product Category, 2 = Region
  selectedTimeline: number = 3; // 1 = Month, 2 = Quarter, 3 = Year
  selectedUserId: number | null = null;
  users: any[] = [];
  isLoading: boolean = false;
  activeMenu: string | null = null;

  // Chart 1: Funnel Opportunities
  funnelStages: any[] = [
    { stage: 'Cold', value: 0 },
    { stage: 'Warm', value: 0 },
    { stage: 'Hot', value: 0 }
  ];

  // Chart 2: Pipeline by Group
  pipelineCategories: string[] = [];
  pipelineHot: number[] = [];
  pipelineWarm: number[] = [];
  pipelineCold: number[] = [];

  // Chart 3: Top Hot Opportunities
  topHotCustomers: string[] = [];
  topHotPrices: number[] = [];

  // Chart 4: Closed Opportunities (Won vs Lost)
  closedCategories: string[] = [];
  closedWon: number[] = [];
  closedLost: number[] = [];

  // Chart 5: Closure Success %
  closureSuccessData: any[] = [];

  // Chart 6: Top Closed Opportunities
  topClosedCustomers: string[] = [];
  topClosedPrices: number[] = [];

  showPcRegionToggle: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private userService: Userservice
  ) {}

  ngOnInit(): void {
    const role = (localStorage.getItem('role') || '').toUpperCase();
    // In Old PHP: role_id != 4 && role_id != 5 && role_id != 6 && role_id != 7
    // Hides for Sales Engineer, Sales Manager, Regional Sales Manager, Regional Branch Head
    const isExecutive = role.includes('ADMIN') || role.includes('SUPERADMIN') || role.includes('DIRECTOR') || role.includes('COUNTRY') || role.includes('GLOBAL');
    this.showPcRegionToggle = isExecutive;

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
      error: () => {
        this.userService.getAllUsers().subscribe({
          next: (res: any) => {
            const list = Array.isArray(res) ? res : (res?.data || res?.content || []);
            this.users = list.map((u: any) => ({
              id: u.id || u.userId,
              name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username
            }));
          }
        });
      }
    });
  }

  loadAllDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getOpportunityDashboard(
      this.selectedPcRegion,
      this.selectedTimeline,
      this.selectedUserId || undefined
    ).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.status && res?.data) {
          const data = res.data;

          // 1. Funnel
          if (data.funnelData) {
            this.funnelStages = data.funnelData;
          }

          // 2. Pipeline by Group
          if (data.pipelineData) {
            this.pipelineCategories = data.pipelineData.categories || [];
            this.pipelineHot = data.pipelineData.hotSeries || [];
            this.pipelineWarm = data.pipelineData.warmSeries || [];
            this.pipelineCold = data.pipelineData.coldSeries || [];
          }

          // 3. Top Hot
          if (data.topHotOpportunities) {
            this.topHotCustomers = data.topHotOpportunities.customers || [];
            this.topHotPrices = data.topHotOpportunities.prices || [];
          }

          // 4. Closed Won vs Lost
          if (data.closedData) {
            this.closedCategories = data.closedData.categories || [];
            this.closedWon = data.closedData.wonSeries || [];
            this.closedLost = data.closedData.lostSeries || [];
          }

          // 5. Closure Success
          if (data.closureSuccessData) {
            this.closureSuccessData = data.closureSuccessData;
          }

          // 6. Top Closed
          if (data.topClosedOpportunities) {
            this.topClosedCustomers = data.topClosedOpportunities.customers || [];
            this.topClosedPrices = data.topClosedOpportunities.prices || [];
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Failed to load Opportunity Dashboard:', err);
      }
    });
  }

  onPcRegionChange(value: number): void {
    this.selectedPcRegion = value;
    this.loadAllDashboardData();
  }

  onTimelineChange(value: number): void {
    this.selectedTimeline = value;
    this.loadAllDashboardData();
  }

  onUserChange(): void {
    this.loadAllDashboardData();
  }

  getGroupLabel(): string {
    return this.selectedPcRegion === 1 ? 'Product Category' : 'Region';
  }

  getTimelineLabel(): string {
    return this.selectedTimeline === 1 ? 'MTD' : (this.selectedTimeline === 2 ? 'QTD' : 'YTD');
  }

  getMaxValue(arr: number[]): number {
    if (!arr || arr.length === 0) return 1;
    const max = Math.max(...arr, 0.0001);
    return max;
  }

  toggleMenu(chartId: string): void {
    this.activeMenu = this.activeMenu === chartId ? null : chartId;
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

  getHotValue(): string | number {
    if (!this.funnelStages) return 0;
    const stage = this.funnelStages.find((s: any) => s.name?.toLowerCase() === 'hot');
    return stage ? stage.value : (this.funnelStages[2]?.value ?? 0);
  }

  getWarmValue(): string | number {
    if (!this.funnelStages) return 0;
    const stage = this.funnelStages.find((s: any) => s.name?.toLowerCase() === 'warm');
    return stage ? stage.value : (this.funnelStages[1]?.value ?? 0);
  }

  getColdValue(): string | number {
    if (!this.funnelStages) return 0;
    const stage = this.funnelStages.find((s: any) => s.name?.toLowerCase() === 'cold');
    return stage ? stage.value : (this.funnelStages[0]?.value ?? 0);
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

      if (chartId === 'opp-chart-1') {
        const hotText  = el.querySelector('.hot-stage .stage-label')?.textContent?.trim() 
                      || el.querySelector('.hot-stage')?.textContent?.trim()
                      || `Hot (${this.getHotValue()})`;
        const warmText = el.querySelector('.warm-stage .stage-label')?.textContent?.trim() 
                      || el.querySelector('.warm-stage')?.textContent?.trim()
                      || `Warm (${this.getWarmValue()})`;
        const coldText = el.querySelector('.cold-stage .stage-label')?.textContent?.trim() 
                      || el.querySelector('.cold-stage')?.textContent?.trim()
                      || `Cold (${this.getColdValue()})`;

        svgData = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#ffffff; font-family: system-ui, -apple-system, sans-serif;">
  <text x="30" y="35" font-size="16" font-weight="bold" fill="#333333">Pipeline Opportunities (In Lakhs)</text>
  
  <!-- Hot Segment (Red Top) -->
  <polygon points="50,60 ${width - 50},60 ${width * 0.82},115 ${width * 0.18},115" fill="#e54b4b" />
  <text x="${width / 2}" y="92" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">${hotText}</text>

  <!-- Warm Segment (Yellow Middle) -->
  <polygon points="${width * 0.185},118 ${width * 0.815},118 ${width * 0.715},170 ${width * 0.285},170" fill="#e5a638" />
  <text x="${width / 2}" y="148" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">${warmText}</text>

  <!-- Cold Segment (Blue Bottom) -->
  <polygon points="${width * 0.29},173 ${width * 0.71},173 ${width * 0.63},225 ${width * 0.37},225" fill="#4c8bf5" />
  <text x="${width / 2}" y="203" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">${coldText}</text>
</svg>`;
      } else if (chartId === 'opp-chart-3') {
        const rows = Array.from(el.querySelectorAll('.hbar-row'));
        let barsSvg = '';
        let startY = 70;

        rows.forEach((row) => {
          const label = row.querySelector('.cust-label')?.textContent?.trim() || '';
          const val = row.querySelector('.hbar-value')?.textContent?.trim() || '0';
          const fillWidth = (row.querySelector('.hbar-fill') as HTMLElement)?.style?.width || '0%';
          const percent = parseFloat(fillWidth) || 0;
          const trackW = width - 220;
          const barW = (trackW * percent) / 100;

          barsSvg += `
            <text x="30" y="${startY + 11}" font-size="13" fill="#444444">${label}</text>
            <rect x="180" y="${startY}" width="${trackW}" height="14" rx="7" fill="#f0f2f5" />
            <rect x="180" y="${startY}" width="${barW}" height="14" rx="7" fill="#4154f1" />
            <text x="${width - 30}" y="${startY + 11}" font-size="13" font-weight="bold" fill="#333333" text-anchor="end">${val}</text>
          `;
          startY += 32;
        });

        svgData = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${Math.max(height, startY + 40)}" viewBox="0 0 ${width} ${Math.max(height, startY + 40)}" style="background:#ffffff; font-family: system-ui, -apple-system, sans-serif;">
  <text x="30" y="35" font-size="16" font-weight="bold" fill="#333333">Top Hot Opportunities</text>
  ${barsSvg}
  <text x="${width - 30}" y="${startY + 20}" font-size="11" fill="#888888" text-anchor="end">Values (Lakhs)</text>
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

    // Hide hamburger menu during capture
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

        fetch('http://localhost:8080/opportunity/export-chart-pdf', {
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
