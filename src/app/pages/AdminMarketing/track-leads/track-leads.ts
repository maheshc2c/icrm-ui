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

interface TrackLeadRow {
  leadId: string;
  customer: string;
  contactPerson: string;
  owner: string;
  campaign?: string;
  date?: string;
  status: string;
}

@Component({
  selector: 'app-track-leads',
  imports: [CommonModule, HttpClientModule, FormsModule, Header, Sidebar, Pageheader],
  templateUrl: './track-leads.html',
  styleUrl: './track-leads.css',
})
export class TrackLeads implements OnInit {

  constructor(
    private router: Router,
    private adminMarketingservice: adminMarketingservice
  ) {}

  headerTitle = 'Track Leads';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/adminmarketingdashboard' },
    { label: 'Track Leads' }
  ];

  rows: TrackLeadRow[] = [];

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
    this.loadCustomerDropdown();
    this.loadUserDropdown();
    this.loadTrackLeads();
    this.initializeStatusOptions();
  }

  private loadCampaignDropdown(): void {
    this.adminMarketingservice.getCampaignDropdownOptions().subscribe({
      next: (campaigns: any[]) => {
        this.campaignOptions = campaigns.map((c: any) => ({
          label: c.campaignName || c.name,
          value: c.campaignName || c.name
        }));
        this.campaignOptions.unshift({ label: 'Select Campaign', value: '' });
      },
      error: () => {
        this.campaignOptions = [{ label: 'Select Campaign', value: '' }];
      }
    });
  }

  private loadCustomerDropdown(): void {
    this.adminMarketingservice.getCustomerDropdown().subscribe({
      next: (options: any[]) => {
        this.customerOptions = options;
      },
      error: () => {
        this.customerOptions = [{ label: 'Select Customer', value: '' }];
      }
    });
  }

  private loadUserDropdown(): void {
    this.adminMarketingservice.getUsernamesDropdown().subscribe({
      next: (options: any[]) => {
        this.ownerOptions = options;
      },
      error: () => {
        this.ownerOptions = [{ label: 'Select Owner', value: '' }];
      }
    });
  }

  private loadTrackLeads(): void {
    this.adminMarketingservice.getTrackLeads().subscribe({
      next: (apiRows: any[]) => {
        this.rows = (apiRows ?? []).map((r: any) => ({
          leadId: String(r?.leadId ?? ''),
          customer: r?.customerName ?? '',
          contactPerson: r?.contactFirstName ?? '',
          owner: r?.username ?? '',
          campaign: r?.campaign?.campaignName || r?.campaignName || '',
          date: r?.leadCreatedTime?.split('T')[0] || r?.createdTime?.split('T')[0] || '',
          status: this.getStatusText(r?.leadStatus)
        }));
      },
      error: (err: any) => {
        console.error('[TrackLeads] Failed to load track leads', err);
        this.rows = [];
      }
    });
  }

  private getStatusText(status: number | null | undefined): string {
    switch (status) {
      case 1: return 'Waiting for Approval';
      case 2: return 'Lead Approved';
      case 3: return 'Opportunity Created';
      case 4: return 'All Opportunities Dropped';
      case 5: return 'C Note';
      default: return 'Lead';
    }
  }

  private initializeStatusOptions(): void {
    this.statusOptions = [
      { label: 'Select Status', value: '' },
      { label: 'Waiting for Approval', value: '1' },
      { label: 'Lead Approved', value: '2' },
      { label: 'Opportunity Created', value: '3' },
      { label: 'All Opportunities Dropped', value: '4' },
      { label: 'C Note', value: '5' }
    ];
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
