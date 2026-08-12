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
    if (!arr || arr.length === 0) return 10;
    const max = Math.max(...arr, 1);
    return Math.ceil(max * 1.2);
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
    }
  }

  downloadPdf(chartId: string, filename: string): void {
    this.downloadPng(chartId, filename);
  }
}
