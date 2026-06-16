import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';
import { CustomerInteractionCenterService } from '../../../service/customer-interaction-center.service';
import { TrackLead, PaginationRequest } from '../../../models/track-lead-cic.model';
import { ToastService } from '../../../service/toast.service';
import { Popup } from '../../../shared/popup/popup';

@Component({
  selector: 'app-approve-leads',
  standalone: true,
  imports: [Header, Sidebar, Pageheader, DataTable, FormsModule, CommonModule, Popup],
  templateUrl: './approve-leads.html',
  styleUrl: './approve-leads.css',
})
export class ApproveLeads implements OnInit {

  constructor(
    private router: Router,
    private cicService: CustomerInteractionCenterService,
    private toastService: ToastService
  ) {}

  headerTitle = 'Approve Leads';

  headerBreadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Approve Leads', route: '/customer-interaction-center/approve-leads' },
  ];

  /* POPUP STATE */
  isPopupVisible = false;
  popupTitle = '';
  popupMessage = '';
  popupType: 'approve' | 'reject' | 'info' = 'info';
  confirmBtnText = '';
  selectedLeadId: number | null = null;

  /* TABLE COLUMNS */
  columns = [
    { header: 'Lead ID', field: 'leadId' },
    { header: 'Source of Lead', field: 'leadSource' },
    { header: 'Customer', field: 'customerName' },
    { header: 'Contact Person', field: 'contactFirstName' },
    { header: 'Created By', field: 'createdBy' },
    { header: 'Created Time', field: 'createdTime' }
  ];

  /* SEARCH FIELDS */
  searchFields: SearchFieldConfig[] = [];

  loadDropdownCustomers(search: string) {
    return this.cicService.getDropdownCustomers(search);
  }

  loadDropdownOwners(search: string) {
    return this.cicService.getDropdownOwners(search);
  }

  /* TABLE DATA */
  rows: any[] = [];
  allRows: any[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;

  searchValues: any = {};

  ngOnInit(): void {
    this.searchFields = [
      { key: 'leadId', label: 'Lead ID', placeholder: 'Lead ID', type: 'text' },
      {
        key: 'customer',
        label: 'Customer',
        type: 'select',
        options: [
          { label: 'Select Customer', value: '' }
        ],
        dynamicLoad: this.loadDropdownCustomers.bind(this)
      },
      {
        key: 'createdBy',
        label: 'Owner',
        type: 'select',
        options: [
          { label: 'Select Owner', value: '' }
        ],
        dynamicLoad: this.loadDropdownOwners.bind(this)
      }
    ];
    this.loadTrackLeads();
    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.cicService.getDropdownOwners().subscribe({
      next: (owners) => {
        const ownerField = this.searchFields.find(f => f.key === 'createdBy');
        if (ownerField && ownerField.options) {
          ownerField.options = [
            { label: 'Select Owner', value: '' },
            ...owners
          ];
        }
      },
      error: (err) => {
        console.error('Failed to load owners:', err);
      }
    });

    this.cicService.getDropdownCustomers().subscribe({
      next: (customers) => {
        const customerField = this.searchFields.find(f => f.key === 'customer');
        if (customerField && customerField.options) {
          customerField.options = [
            { label: 'Select Customer', value: '' },
            ...customers
          ];
        }
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
      }
    });
  }

  private loadTrackLeads(): void {
    const pagination: PaginationRequest = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      sortBy: 'leadId',
      sortOrder: 'asc'
    };

    this.cicService.getTrackLeads(pagination).subscribe({
      next: (response) => {
        this.allRows = response.content.map((lead: TrackLead) => ({
          leadId: lead.leadId,
          customerName: lead.customerName,
          contactFirstName: lead.contactFirstName,
          createdBy: lead.createdBy,
          leadSource: lead.leadSource,
          createdTime: lead.createdTime,
          leadStatus: lead.leadStatus
        }));
        this.rows = [...this.allRows];
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
      },
      error: (err) => {
        console.error('Failed to load track leads:', err);
        this.toastService.error('Failed to load leads');
      }
    });
  }

  onSearchChange(values: any): void {
    this.searchValues = values || {};
    this.onSearch();
  }

  onSearch(): void {
    const searchTerm = this.searchValues?.leadId?.toLowerCase() || '';
    const customerFilter = this.searchValues?.customer || '';
    const ownerFilter = this.searchValues?.createdBy || '';

    if (!searchTerm && !customerFilter && !ownerFilter) {
      this.rows = [...this.allRows];
    } else {
      this.rows = this.allRows.filter(row => {
        const matchesId = !searchTerm || row.leadId.toString().includes(searchTerm);
        const matchesCustomer = !customerFilter || row.customerName === customerFilter;
        const matchesOwner = !ownerFilter || row.createdBy.includes(ownerFilter);
        return matchesId && matchesCustomer && matchesOwner;
      });
    }
  }

  onEdit(row: any): void {
    this.router.navigate(['/Approve-Leads/edit', row.leadId]);
  }

  onApprove(row: any): void {
    this.selectedLeadId = row.leadId;
    this.popupTitle = 'Approve Lead?';
    this.popupMessage = `Are you sure you want to approve Lead #${row.leadId}?`;
    this.popupType = 'approve';
    this.confirmBtnText = 'Yes, Approve';
    this.isPopupVisible = true;
  }

  onReject(row: any): void {
    this.selectedLeadId = row.leadId;
    this.popupTitle = 'Reject Lead?';
    this.popupMessage = `Are you sure you want to reject Lead #${row.leadId}?`;
    this.popupType = 'reject';
    this.confirmBtnText = 'Yes, Reject';
    this.isPopupVisible = true;
  }

  handleConfirm(): void {
    if (this.selectedLeadId === null) return;

    const request$ = this.popupType === 'approve' 
      ? this.cicService.approveLead(this.selectedLeadId)
      : this.cicService.rejectLead(this.selectedLeadId);

    request$.subscribe({
      next: () => {
        this.toastService.success(`Lead ${this.popupType === 'approve' ? 'approved' : 'rejected'} successfully`);
        this.isPopupVisible = false;
        this.loadTrackLeads();
      },
      error: (err) => {
        console.error(`Failed to ${this.popupType} lead:`, err);
        this.toastService.error(`Failed to ${this.popupType} lead`);
        this.isPopupVisible = false;
      }
    });
  }

  handleCancel(): void {
    this.isPopupVisible = false;
    this.selectedLeadId = null;
  }
}
