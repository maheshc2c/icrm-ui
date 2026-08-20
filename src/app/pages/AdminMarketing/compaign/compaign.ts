import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { DataTable } from '../../../shared/data-table/data-table';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { adminMarketingservice } from '../../../service/adminmarketingservice';
import { ToastService } from '../../../service/toast.service';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-manage-compaign',
  standalone: true,
  imports: [CommonModule, Pageheader, Header, DataTable, Sidebar],
  templateUrl: './compaign.html',
  styleUrl: './compaign.css',
})
export class ManageCompaign implements OnInit {

  constructor(
    private adminMarketingservice: adminMarketingservice,
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmDialogService
  ) {}

  headerTitle = 'Manage Campaign';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/adminmarketingdashboard' },
    { label: 'Admin Marketing', route: '/adminmarketingdashboard' },
    { label: 'Manage Campaign' }
  ];

  // Table Columns
  columns = [
    { header: 'Campaign Type', field: 'type' },
    { header: 'Campaign Name', field: 'name' },
    { header: 'Campaign Date', field: 'date' },
    { header: 'Specialities', field: 'speciality' },
    { header: 'Locations', field: 'locations' },
  ];

  rows: any[] = [];
  fullRows: any[] = [];

  // Search Fields
  searchFields: SearchFieldConfig[] = [
    { key: 'name', label: 'Name', type: 'text', placeholder: 'Campaign Name' },
    { key: 'fromDate', label: 'Campaign Date', type: 'date' },
    { key: 'toDate', label: '', type: 'date' },
  ];

  // UI State
  showModal = false;
  selected?: any;
  searchValues: any = {};  // Store search values

  ngOnInit(): void {
    this.loadCampaigns();
  }

  // Load Campaigns
  private loadCampaigns(name: string = '', fromDate: string | null = null, toDate: string | null = null): void {
    const payload = {
      campaignName: name,
      fromDate: fromDate || null,
      toDate: toDate || null,
      pagination: {
        pageNumber: 0,
        pageSize: 100000,
        sortBy: 'campaignDate',
        sortOrder: 'DESC'
      }
    };

    this.adminMarketingservice.searchCampaignsPaged(payload).subscribe({
      next: (response: any) => {
        console.log('Campaign Search API Response =>', response);

        const campaignList = response?.content || [];
        this.fullRows = campaignList;
        this.rows = campaignList.map((c: any) => {
          const campaignId = c.campaignId ?? c.id;
          
          // Retrieve status from localStorage; default to 1 (Active) if not stored.
          const storedStatus = localStorage.getItem(`campaign_status_${campaignId}`);
          const statusVal = storedStatus !== null ? Number(storedStatus) : 1;

          return {
            campaignId: campaignId,
            id: campaignId,
            type: c.campaignType || '',
            name: c.campaignName || '',
            date: c.campaignDate || '',
            speciality: c.specialities || '',
            locations: c.locations || '',
            specialityStatus: statusVal,  // Correctly maps to status value (1 or 2)
            statusText: statusVal === 1 ? 'Active' : 'Inactive'
          };
        });

        console.log('Mapped Rows =>', this.rows);
      },
      error: (err: any) => {
        console.error('Campaign Search API failed', err);
        this.rows = [];
      }
    });
  }

  // Add Campaign
  onAdd() {
    this.router.navigate(['/adminmarketing/compaign/add']);
  }

  // Edit Campaign (Now handles View)
  onEdit(row: any) {
    this.openModal(row);
  }

  // Activate/Deactivate Campaign
  onDelete(row: any) {
    const id = row.campaignId || row.id;
    if (!id && id !== 0) {
      return;
    }
    const status = Number(row.specialityStatus);
    const isActive = status === 1;

    this.confirmService.confirm({
      title: 'Confirm',
      message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this campaign?`,
      confirmText: isActive ? 'Deactivate' : 'Activate'
    }).then((confirmed) => {
      if (!confirmed) return;

      this.adminMarketingservice.toggleCampaignStatus(id).subscribe({
        next: () => {
          // Store new status in localStorage to persist client-side
          const newStatus = isActive ? 2 : 1;
          localStorage.setItem(`campaign_status_${id}`, String(newStatus));

          this.toastService.success(`Campaign ${isActive ? 'deactivated' : 'activated'} successfully`);
          // Reload from server to reflect updated status
          const name = this.searchValues?.name?.trim() || '';
          const fromDate = this.searchValues?.fromDate || null;
          const toDate = this.searchValues?.toDate || null;
          this.loadCampaigns(name, fromDate, toDate);
        },
        error: (err: any) => {
          console.error('Status toggle failed', err);
          this.toastService.error('Failed to update status');
        }
      });
    });
  }

  // Store search values when changed
  onSearchChange(values: any) {
    this.searchValues = values || {};
    console.log('Search values stored:', this.searchValues);
  }

  // Search - Only triggered on Search button click
  onSearch() {
    console.log('Search button clicked, values:', this.searchValues);
    
    const name = this.searchValues?.name?.trim() || '';
    const fromDate = this.searchValues?.fromDate || null;
    const toDate = this.searchValues?.toDate || null;

    this.loadCampaigns(name, fromDate, toDate);
  }

  // Download
  onDownload() {
    const name = this.searchValues?.name?.trim() || '';
    const fromDate = this.searchValues?.fromDate || null;
    const toDate = this.searchValues?.toDate || null;

    const payload = {
      campaignName: name,
      fromDate: fromDate || null,
      toDate: toDate || null,
      pagination: {
        pageNumber: 0,
        pageSize: 100000,
        sortBy: 'campaignDate',
        sortOrder: 'DESC'
      }
    };

    this.adminMarketingservice.downloadCampaignsReport(payload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Campaign_Report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastService.success('Report downloaded successfully');
      },
      error: (err: any) => {
        console.error('Failed to download report', err);
        this.toastService.error('Failed to download report');
      }
    });
  }

  // Reset
  onReset() {
    this.searchValues = {};
    this.loadCampaigns();
  }

  // View Campaign (Modal)
  onView(row: any) {
    this.openModal(row);
  }

  // Modal - loads full details dynamically from backend
  openModal(row: any) {
    const id = row.campaignId || row.id;
    this.adminMarketingservice.getCampaignById(id).subscribe({
      next: (res: any) => {
        const campaign = res?.data || res;
        if (campaign) {
          this.selected = {
            ...row,
            type: (campaign.type === 1 || campaign.campaignType === 'Mass Mailing') ? 'Mass Mailing' : 'Offline',
            speciality: campaign.specialities 
              ? (Array.isArray(campaign.specialities) ? campaign.specialities.join(', ') : campaign.specialities)
              : row.speciality,
            locations: campaign.locations
              ? (Array.isArray(campaign.locations) ? campaign.locations.join(', ') : campaign.locations)
              : row.locations,
            name: campaign.name || campaign.campaignName || row.name,
            description: campaign.description || campaign.campaignDescription || '',
            date: campaign.campaignDate || row.date,
            subject: campaign.subject || '',
            mailContent: campaign.mailContent || ''
          };
          this.showModal = true;
        } else {
          this.toastService.error('Failed to load campaign details');
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch campaign details', err);
        this.toastService.error('Failed to fetch campaign details');
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selected = undefined;
  }
}
