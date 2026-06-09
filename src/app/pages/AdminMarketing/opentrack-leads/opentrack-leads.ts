import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import { TrackLeadApiRow } from '../../../models/track-leads.model';
import { adminMarketingservice } from '../../../service/adminmarketingservice';

type LeadStage = 'Lead' | 'Approved' | 'Opportunity' | 'Quote' | 'C Note';

interface TrackOpenLeadRow {
  leadId: string;
  customer: string;
  contactPerson: string;
  owner: string;
  lifeTimeDays: string;
  /** ISO date (yyyy-mm-dd) used by date filters */
  date?: string;
  /** HTML rendered in the Status column */
  status: string;
  /** Plain text used for filtering */
  statusText: string;
}

@Component({
  selector: 'app-track-open-leads',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, Header, Sidebar, Pageheader],
  templateUrl: './opentrack-leads.html',
  styleUrl: './opentrack-leads.css',
})
export class TrackOpenLeads implements OnInit {

  constructor(
    private router: Router,
    private adminMarketingservice: adminMarketingservice
  ) {}

  headerTitle = 'Open Leads';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/adminmarketingdashboard' },
    { label: 'Track Leads', route: '/adminmarketing/track-leads' },
    { label: 'Open Leads' }
  ];

  rows: TrackOpenLeadRow[] = [];

  filterForm = {
    leadId: '',
    customer: '',
    owner: '',
    status: '',
    campaign: '',
    startDate: '',
    endDate: ''
  };

  customerOptions: { label: string; value: string }[] = [];
  ownerOptions: { label: string; value: string }[] = [];
  statusOptions: { label: string; value: string }[] = [];
  campaignOptions: { label: string; value: string }[] = [];

  ngOnInit(): void {
    this.loadCampaignDropdown();
    this.loadTrackLeads();
    this.initializeStatusOptions();
  }

  private loadCampaignDropdown(): void {
    this.adminMarketingservice.getCampaignDropdownOptions().subscribe({
      next: (options: any[]) => {
        this.campaignOptions = [{ label: 'Select Campaign', value: '' }, ...options];
      },
      error: () => {
        this.campaignOptions = [{ label: 'Select Campaign', value: '' }];
      }
    });
  }

  private loadTrackLeads(): void {
    this.adminMarketingservice.getTrackLeads().subscribe({
      next: (apiRows: TrackLeadApiRow[]) => {
        // In a real scenario, we might want to filter for 'Open' leads here if the API doesn't.
        // For now, we mirror the logic of track-leads.
        this.rows = (apiRows ?? []).map((r: TrackLeadApiRow) => this.mapApiRowToUiRow(r));
        this.populateDropdownOptions();
      },
      error: (err: any) => {
        console.error('[TrackOpenLeads] Failed to load track leads', err);
        this.rows = [];
      }
    });
  }

  private mapApiRowToUiRow(r: TrackLeadApiRow): TrackOpenLeadRow {
    return this.makeRow({
      leadId: String(r?.leadId ?? ''),
      customer: r?.customerName ?? '',
      contactPerson: r?.contactFirstName ?? '',
      owner: r?.username ?? '',
      lifeTimeDays: this.calculateLifeTimeDays(r),
      date: undefined,
      completedUpto: this.mapLeadStatusToStage(r?.leadStatus),
    });
  }

  private calculateLifeTimeDays(row: any): string {
    const createdDate = row?.createdDate || row?.created_at || row?.leadDate;
    if (createdDate) {
      const created = new Date(createdDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      return String(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    return '30';
  }

  private mapLeadStatusToStage(leadStatus: number | null | undefined): LeadStage {
    switch (leadStatus) {
      case 1: return 'Lead';
      case 2: return 'Approved';
      case 3: return 'Opportunity';
      case 4: return 'Quote';
      case 5: return 'C Note';
      default: return 'Lead';
    }
  }

  private makeRow(input: Omit<TrackOpenLeadRow, 'status' | 'statusText'> & { completedUpto: LeadStage }): TrackOpenLeadRow {
    const status = this.buildStatusHtml(input.completedUpto);
    const statusText = this.extractTextFromHtml(status);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { completedUpto, ...rest } = input as any;
    return {
      ...(rest as Omit<TrackOpenLeadRow, 'status' | 'statusText'>),
      status,
      statusText,
    };
  }

  private buildStatusHtml(completedUpto: LeadStage): string {
    const stages: LeadStage[] = ['Lead', 'Approved', 'Opportunity', 'Quote', 'C Note'];
    const completedIdx = Math.max(0, stages.indexOf(completedUpto));
    const widths = ['19%', '19%', '19%', '19%', '20%'];

    const segments = stages
      .map((s, idx) => {
        const cls = idx <= completedIdx ? 'status-complete' : 'status-pending';
        return `<div class="progress-segment ${cls}" style="width: ${widths[idx]};">${s}</div>`;
      })
      .join('<div class="progress-segment status-divider" style="width: 1%;"></div>');

    return `<div class="status-progress-wrapper">${segments}</div>`;
  }

  private populateDropdownOptions(): void {
    const customers = this.uniqueValues(this.rows, 'customer');
    const owners = this.uniqueValues(this.rows, 'owner');

    this.customerOptions = [
      { label: 'Select Customer', value: '' },
      ...customers.map((v) => ({ label: v, value: v }))
    ];

    this.ownerOptions = [
      { label: 'Select Owner', value: '' },
      ...owners.map((v) => ({ label: v, value: v }))
    ];
  }

  private initializeStatusOptions(): void {
    this.statusOptions = [
      { label: 'Select Status', value: '' },
      { label: 'Waiting for Approval', value: '1' },
      { label: 'Lead Approved', value: '2' },
      { label: 'Opportunity Created', value: '3' },
      { label: 'All Opportunities Dropped', value: '4' }
    ];
  }

  private uniqueValues(rows: any[], key: string): string[] {
    const set = new Set<string>();
    for (const r of rows || []) {
      const v = (r?.[key] ?? '').toString().trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  private extractTextFromHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  onSearch(): void {
    console.log('Search clicked with filters:', this.filterForm);
  }

  onImport(): void {
    console.log('Import clicked');
  }

  onAdd(): void {
    console.log('Add clicked');
  }

  onEdit(row: any): void {
    this.router.navigate(['/adminmarketing/track-leads/open-leads'], { queryParams: { leadId: row.leadId } });
  }

  onDelete(row: any): void {
    console.log('Delete lead:', row);
  }
}
