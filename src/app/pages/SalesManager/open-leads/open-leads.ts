import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Leadservice } from '../../../service/leadservice';
import { LeadSummary } from '../../../models/lead-model';

@Component({
  selector: 'app-open-leads',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule, Pageheader, Header, Sidebar],
  templateUrl: './open-leads.html',
  styleUrls: ['./open-leads.css']
})
export class OpenLeads implements OnInit {

  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Open Leads' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'leadId', label: 'Lead ID', type: 'text', placeholder: 'Lead ID' },
    { key: 'customer', label: 'Customer', type: 'select', placeholder: 'Select Customer', options: [] },
    { key: 'status', label: 'Status', type: 'select', placeholder: 'Select Status', options: [
      { value: 'Lead', label: 'Lead' },
      { value: 'Approved', label: 'Approved' }
    ]},
    { key: 'startDate', label: 'Start Date', type: 'date', placeholder: 'Start Date' },
    { key: 'endDate', label: 'End Date', type: 'date', placeholder: 'End Date' }
  ];

  columns = [
    { header: 'Lead ID', field: 'leadId' },
    { header: 'Customer', field: 'customer' },
    { header: 'Contact Person', field: 'contactPerson' },
    { header: 'Owner', field: 'owner' },
    { header: 'Life Time(Days)', field: 'lifeTime' },
    { header: 'Status', field: 'status' }
  ];

  originalLeads: LeadSummary[] = [];
  rows: any[] = [];

  constructor(
    private router: Router,
    private leadService: Leadservice
  ) { }

  ngOnInit(): void {
    this.loadLeads();
    this.loadCustomers();
  }


  loadCustomers(): void {
    this.leadService.getCustomers().subscribe({
      next: (data: any[]) => {
        const customerField = this.searchFields.find(f => f.key === 'customer');
        if (customerField) {
          // ✅ Use unique customer names only
          const uniqueNames = [...new Set(data.map(c => c.customerName))];
          customerField.options = uniqueNames.map(name => ({ 
            value: name, 
            label: name 
          }));
        }
      },
      error: (err) => console.error('Error loading customers:', err)
    });
  }

  loadLeads(): void {
    this.leadService.getOpenLeads().subscribe({
      next: (data: LeadSummary[]) => {
        this.rows = data.map(item => ({
          leadId: item.leadId,
          customer: item.customerName,
          contactPerson: item.contactFirstName,
          owner: item.username,
          lifeTime: item.lifeTimeDays,
          status: item.leadStatus,
          leadStatus: item.leadStatus,
          hasOpportunity: item.hasOpportunity,
          hasQuote: item.hasQuote,
          hasCNote: item.hasCNote
        }));
        this.originalLeads = data;
      },
      error: (err) => {
        console.error('Error loading leads:', err);
      }
    });
  }

  onSearch(filters: any): void {
    console.log('Search filters:', filters);
    const searchParams = {
      leadId: filters.leadId,
      customerName: filters.customer,
      status: filters.status === 'Lead' ? '1' : (filters.status === 'Approved' ? '2' : filters.status),
      startDate: filters.startDate,
      endDate: filters.endDate
    };

    this.leadService.searchLeads(searchParams).subscribe({
      next: (data: LeadSummary[]) => {
        this.rows = data.map(item => ({
          leadId: item.leadId,
          customer: item.customerName,
          contactPerson: item.contactFirstName,
          owner: item.username,
          lifeTime: item.lifeTimeDays,
          status: item.leadStatus,
          leadStatus: item.leadStatus,
          hasOpportunity: item.hasOpportunity,
          hasQuote: item.hasQuote,
          hasCNote: item.hasCNote
        }));
        this.originalLeads = data;
      },
      error: (err) => {
        console.error('Error searching leads:', err);
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/salesmanager/leads/add']);
  }

  onEdit(row: any): void {
    console.log('Edit lead:', row);
    this.router.navigate(['salesmanager/leads/edit', row.leadId]);
  }

  onDownload(): void {
    console.log('Downloading open leads as Excel...');
    
    if (this.originalLeads.length === 0) {
      alert('No data to download');
      return;
    }

    this.leadService.downloadLeadsExcel(this.originalLeads).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `open_leads_${new Date().getTime()}.xlsx`;
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
}
