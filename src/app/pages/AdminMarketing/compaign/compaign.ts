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
  private loadCampaigns(): void {
    // We use getCampaigns as the primary source for the Manage Campaign page
    this.adminMarketingservice.getCampaigns().subscribe({
      next: (response: any) => {
        console.log('RAW API RESPONSE =>', response);

        // ✅ Handle paginated response (response.content) or direct array
        const campaignList = Array.isArray(response) ? response : (response?.content || (response ? [response] : []));
        this.fullRows = campaignList;
        this.rows = campaignList.map((c: any, index: number) => this.mapCampaignToRow(c, index));

        console.log('TABLE ROWS =>', this.rows);
      },
      error: (err) => {
        console.error('Campaign API failed', err);
        this.rows = [];
      }
    });
  }

  // Helper to map campaign object to table row
  private mapCampaignToRow(c: any, index: number) {
    const specialityName: string = (
      c.specialityName ||
      c.speciality?.specialityName ||
      (Array.isArray(c.specialities)
        ? c.specialities.map((s: any) => s?.specialityName || s?.name || '').filter(Boolean).join(', ')
        : '') ||
      (Array.isArray(c.role)
        ? c.role.map((r: any) => r?.roleName || '').filter(Boolean).join(', ')
        : '') ||
      ''
    );

    const locationArray: any =
      c.geoNames ||
      c.cityNames ||
      c.districtNames ||
      c.stateNames ||
      c.regionNames ||
      c.countryNames ||
      c.locationNames ||
      c.locations ||
      [];

    let locationParts: string[] = Array.isArray(locationArray)
      ? locationArray
      : (typeof locationArray === 'string' && locationArray
          ? [locationArray]
          : []);

    if (!locationParts.length && Array.isArray(c.locationInfo)) {
      locationParts = c.locationInfo
        .map((loc: any) => loc?.locationName || '')
        .filter((n: string) => !!n);
    }

    // Match speciality.ts style: use explicit status check
    const statusVal = c.campaignStatus !== undefined ? c.campaignStatus : 
                     (c.campaignDocstatus !== undefined ? c.campaignDocstatus : 
                     (c.isActive ? 1 : 0));

    return {
      campaignId: c.campaignId ?? c.campaignDocumentId ?? c.id, // Keep specific ID
      id: c.campaignId ?? c.campaignDocumentId ?? c.id,
      type: c.campaignType === 1 ? 'Mass Mailing' : (c.campaignType === 0 ? 'Offline' : 'Document'),
      name: c.campaignDocName ?? c.campaignName ?? '',
      date: c.campaignDoccreatedTime ?? c.campaignDate ?? '',
      speciality: specialityName,
      locations: Array.isArray(locationParts) ? locationParts.join(', ') : '',
      description: c.campaignDocdescription ?? c.campaignDescription ?? '',
      subject: c.campaignSubject ?? '',
      mailContent: c.campaignMailContent ?? '',
      specialityStatus: Number(statusVal), // Ensure it's a number for DataTable
      statusText: Number(statusVal) === 1 ? 'Active' : 'Inactive',
    };
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

      const apiCall = isActive
        ? this.adminMarketingservice.deactivateCampaign(id)
        : this.adminMarketingservice.activateCampaign(id);

      apiCall.subscribe({
        next: () => {
          row.specialityStatus = isActive ? 2 : 1;
          this.rows = [...this.rows];
          this.fullRows = [...this.fullRows];
          this.toastService.success(`Campaign ${isActive ? 'deactivated' : 'activated'} successfully`);
        },
        error: (err) => {
          console.error('Status update failed', err);
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
    
    const name = this.searchValues?.name?.trim()?.toLowerCase() || '';
    const fromDate = this.searchValues?.fromDate;
    const toDate = this.searchValues?.toDate;

    // If all filters are empty, reload all
    if (!name && !fromDate && !toDate) {
      this.loadCampaigns();
      return;
    }

    // Filter locally from fullRows
    let filtered = [...this.fullRows];

    // Filter by name
    if (name) {
      filtered = filtered.filter((c: any) => {
        const campaignName = (c.campaignName || c.campaignDocName || '').toLowerCase();
        return campaignName.includes(name);
      });
    }

    // Filter by date range
    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter((c: any) => {
        const campaignDate = new Date(c.campaignDate || c.campaignDoccreatedTime);
        return campaignDate >= from;
      });
    }

    if (toDate) {
      const to = new Date(toDate);
      filtered = filtered.filter((c: any) => {
        const campaignDate = new Date(c.campaignDate || c.campaignDoccreatedTime);
        return campaignDate <= to;
      });
    }

    console.log('Filtered count:', filtered.length);

    // Map filtered results to display rows
    this.rows = filtered.map((c: any, index: number) => this.mapCampaignToRow(c, index));
  }

  // Download
  onDownload() {
    if (!this.rows || this.rows.length === 0) {
      this.toastService.warning('No data available to download');
      return;
    }

    const exportData = this.rows.map(row => ({
      'Campaign Type': row.type,
      'Campaign Name': row.name,
      'Campaign Date': row.date,
      'Specialities': row.speciality,
      'Locations': row.locations,
      'Description': row.description || '',
      'Subject': row.subject || '',
      'Mail Content': row.mailContent || ''
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaigns');
    XLSX.writeFile(workbook, 'Campaigns_' + new Date().toISOString().slice(0, 10) + '.xlsx');
  }

  // View Campaign (Modal)
  onView(row: any) {
    this.openModal(row);
  }

  // Modal
  openModal(row: any) {
    this.selected = row;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selected = undefined;
  }
}
