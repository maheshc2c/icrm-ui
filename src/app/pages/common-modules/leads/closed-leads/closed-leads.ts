import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Leadservice } from '../../../../service/leadservice';

@Component({
  selector: 'app-closed-leads',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule, Pageheader, Header, Sidebar],
  templateUrl: './closed-leads.html',
  styleUrls: ['./closed-leads.css']
})
export class ClosedLeadsComponent implements OnInit {
  /* ================= HEADER ================= */
  private getHomeRoute(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const role = localStorage.getItem('role')?.trim();
      if (role) {
        const normalizedRole = role.replace(/[\s_]+/g, '').toUpperCase();
        switch (normalizedRole) {
          case 'SUPERADMIN':
            return '/superadmindashboard';
          case 'ADMIN':
            return '/admindashboard';
          case 'ADMINMARKETING':
            return '/adminmarketingdashboard';
          case 'SALESDIRECTOR':
            return '/sddashboard';
          case 'REGIONALBRANCHHEAD':
            return '/regional-branch-head-dashboard';
          case 'REGIONALSALESMANAGER':
            return '/regional-sales-manager-dashboard';
          case 'NATIONALSALESMANAGER':
            return '/national-sales-manager-dashboard';
          case 'GLOBALHEAD':
            return '/globalhead-dashboard';
          case 'COUNTRYHEAD':
            return '/country-head';
          case 'CUSTOMERINTERACTIONCENTER':
            return '/Approve-Leads';
          case 'OTR':
            return '/Cnotedownload';
          case 'SALESENGINEER':
          case 'SALESMANAGER':
          default:
            return '/sales-manager-dashboard';
        }
      }
    }
    return '/sales-manager-dashboard';
  }

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: this.getHomeRoute() },
    { label: 'Leads', route: '/openleads' },
    { label: 'Closed Leads' }
  ];

  /* ================= DATA ================= */
  closedLeads: any[] = [];
  filteredLeads: any[] = [];
  
  /* ================= SEARCH CONFIGURATION ================= */
  searchFields: SearchFieldConfig[] = [
    {
      key: 'leadId',
      label: 'Lead ID',
      placeholder: 'Enter Lead ID',
      type: 'text'
    },
    {
      key: 'customer',
      label: 'Select Customer',
      placeholder: 'Enter Customer Name',
      type: 'text'
    },
    {
      key: 'closedStatus',
      label: 'Select Closed Status',
      placeholder: 'Select Closed Status',
      type: 'select',
      options: [
        { label: 'Lead Dropped', value: 'Lead Dropped' },
        { label: 'Lost', value: 'Lost' },
        { label: 'Converted', value: 'Converted' },
        { label: 'Won', value: 'Won' }
      ]
    }
  ];

  /* ================= TABLE COLUMNS (for app-data-table) ================= */
  columns = [
    { header: 'Lead ID', field: 'leadId' },
    { header: 'Source of Lead', field: 'sourceOfLead' },
    { header: 'Customer', field: 'customerName' },
    { header: 'Contact Person', field: 'contactPerson' },
    { header: 'Created Time', field: 'createdTime' },
    { header: 'Status', field: 'status', type: 'text' },
    { header: 'Life Time(Days)', field: 'lifetimeDays' }
  ];

  constructor(
    private router: Router,
    private leadService: Leadservice
  ) { }

  private getHomeRoute(): string {
    const role = localStorage.getItem('role') || '';
    const upper = role.toUpperCase();

    if (upper.includes('COUNTRY')) return '/country-head';
    if (upper.includes('GLOBAL')) return '/globalhead-dashboard';
    if (upper.includes('NATIONAL')) return '/national-sales-manager-dashboard';
    if (upper.includes('REGIONAL')) return '/regional-sales-manager-dashboard';
    if (upper.includes('DIRECTOR')) return '/sddashboard';
    if (upper.includes('SUPERADMIN') || upper.includes('SUPER ADMIN')) return '/superadmindashboard';
    if (upper.includes('ADMIN')) return '/admindashboard';
    return '/sales-manager-dashboard';
  }

  ngOnInit(): void {
    this.headerBreadcrumbs = [
      { label: 'Home', route: this.getHomeRoute() },
      { label: 'Leads', route: '/openleads' },
      { label: 'Closed Leads' }
    ];
    this.loadClosedLeads();
  }

  /* ================= LOAD CLOSED LEADS ================= */
  loadClosedLeads(): void {
    console.log('Loading closed leads from API...');
    this.leadService.getClosedLeads().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.closedLeads = data.map((item: any) => {
          let statusLabel = 'Lead Dropped';
          const st = item.leadStatus !== undefined ? item.leadStatus : item.status;
          if (st === 20) statusLabel = 'Lead Rejected';
          else if (st === 0 || st === 21) statusLabel = 'Lead Dropped';
          else if (st === 22) statusLabel = 'Lead Closed';
          else if (st === 2) statusLabel = 'Won';
          else if (st === 3) statusLabel = 'Opportunity';
          else if (st === 4) statusLabel = 'Converted';
          else if (typeof item.status === 'string' && item.status) statusLabel = item.status;
          else if (typeof item.leadStatusName === 'string' && item.leadStatusName) statusLabel = item.leadStatusName;

          const contactStr = item.contactPerson
            ? item.contactPerson
            : (item.contactFirstName 
              ? (item.contactFirstName + (item.contactLastName ? ' ' + item.contactLastName : '') + (item.mobileNo ? ` (${item.mobileNo})` : ''))
              : 'N/A');

          let formattedDate = 'N/A';
          const rawDate = item.leadCreatedTime || item.createdTime;
          if (rawDate) {
            try {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
                  ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              } else {
                formattedDate = rawDate;
              }
            } catch (e) {
              formattedDate = rawDate;
            }
          }

          const currentUserId = Number(localStorage.getItem('userId') || 0);
          const ownerId = item.userId || item.ownerId || item.createdBy || item.user_id;
          const isRejected = (st === 20);
          const isOwner = !currentUserId || !ownerId || Number(ownerId) === currentUserId;
          const canEdit = isRejected && isOwner;

          return {
            leadId: item.leadId,
            sourceOfLead: item.sourceOfLead || item.leadSource || 'N/A',
            customerName: item.customerName || 'N/A',
            contactPerson: contactStr,
            createdTime: formattedDate,
            status: statusLabel,
            leadStatus: st,
            canEdit: canEdit,
            lifetimeDays: item.lifeTimeDays !== undefined ? item.lifeTimeDays : (item.lifetimeDays || 0)
          };
        });
        this.filteredLeads = [...this.closedLeads];
        console.log('Closed leads loaded:', this.closedLeads.length);
      },
      error: (err: any) => {
        console.error('Failed to load closed leads:', err);
      }
    });
  }

  /* ================= SEARCH ================= */
  onSearchChange(searchValues: any): void {
    this.filteredLeads = this.closedLeads.filter(lead => {
      const matchesLeadId = !searchValues.leadId || 
        lead.leadId?.toString().includes(searchValues.leadId);
      
      const matchesCustomer = !searchValues.customer || 
        lead.customerName?.toLowerCase().includes(searchValues.customer.toLowerCase());
      
      const matchesStatus = !searchValues.closedStatus || 
        lead.status?.toLowerCase() === searchValues.closedStatus.toLowerCase();
      
      return matchesLeadId && matchesCustomer && matchesStatus;
    });
  }

  /* ================= NAVIGATION ================= */
  viewLead(leadId: number): void {
    if (leadId) {
      this.router.navigate(['/leads/edit', leadId], { queryParams: { readOnly: true } });
    }
  }

  editLead(row: any): void {
    const leadId = row?.leadId || row?.id || (typeof row === 'number' ? row : null);
    if (leadId) {
      this.router.navigate(['/leads/edit-rejected', leadId]);
    }
  }

  /* ================= DOWNLOAD ================= */
  downloadExcel(): void {
    console.log('Downloading closed leads as Excel...');
    
    if (this.filteredLeads.length === 0) {
      alert('No data to download');
      return;
    }

    this.leadService.downloadLeadsExcel(this.filteredLeads).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `closed_leads_${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log('Excel downloaded successfully');
      },
      error: (err: any) => {
        console.error('Download failed:', err);
        alert('Failed to download Excel file');
      }
    });
  }

  /* ================= STATUS CLASS ================= */
  getStatusClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('dropped')) return 'status-dropped';
    if (statusLower.includes('lost')) return 'status-lost';
    if (statusLower.includes('converted')) return 'status-converted';
    if (statusLower.includes('won')) return 'status-won';
    return 'status-default';
  }
}
