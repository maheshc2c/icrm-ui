import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Leadservice } from '../../../service/leadservice';

@Component({
  selector: 'app-closed-leads',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule, Pageheader, Header, Sidebar],
  templateUrl: './closed-leads.html',
  styleUrls: ['./closed-leads.css']
})
export class ClosedLeadsComponent implements OnInit {
  /* ================= HEADER ================= */
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sales-manager-dashboard' },
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
    { header: 'Status', field: 'status' },
    { header: 'Life Time(Days)', field: 'lifetimeDays' }
  ];

  constructor(
    private router: Router,
    private leadService: Leadservice
  ) { }

  ngOnInit(): void {
    this.loadClosedLeads();
  }

  /* ================= LOAD CLOSED LEADS ================= */
  loadClosedLeads(): void {
    console.log('Loading closed leads from API...');
    this.leadService.getClosedLeads().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.closedLeads = data.map((item: any) => {
          let statusLabel = 'Lead';
          if (item.leadStatus === 2) statusLabel = 'Won';
          else if (item.leadStatus === 3) statusLabel = 'Lead Dropped';
          
          return {
            leadId: item.leadId,
            sourceOfLead: item.leadSource,
            customerName: item.customerName,
            contactPerson: item.contactFirstName,
            createdTime: item.leadCreatedTime,
            status: statusLabel,
            lifetimeDays: item.lifeTimeDays
          };
        });
        this.filteredLeads = [...this.closedLeads];
        console.log('Closed leads loaded:', this.closedLeads.length);
      },
      error: (err: any) => {
        console.error('Failed to load closed leads:', err);
        console.error('Error details:', err.error);
        
        // Fallback to dummy data for testing UI
        console.log('Using dummy data for testing...');
        this.closedLeads = [
          {
            leadId: 17,
            sourceOfLead: 'Visit',
            customerName: 'C2C Advanced Systems (Chittoor)',
            contactPerson: 'Test - Test (91-9988997700)',
            createdTime: '31 Jul 2025 11:17 AM',
            status: 'Lead Dropped',
            lifetimeDays: 43
          }
        ];
        this.filteredLeads = [...this.closedLeads];
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
      this.router.navigate(['/salesmanager/leads/edit', leadId]);
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
