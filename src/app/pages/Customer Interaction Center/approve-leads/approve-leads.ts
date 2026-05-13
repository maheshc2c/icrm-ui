import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-approve-leads',
  standalone: true,
  imports: [Header, Sidebar, Pageheader, DataTable, FormsModule, CommonModule],
  templateUrl: './approve-leads.html',
  styleUrl: './approve-leads.css',
})
export class ApproveLeads {

  constructor(private router: Router) {}

  headerTitle = 'Approve Leads';

  headerBreadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Approve Leads', route: '/customer-interaction-center/approve-leads' },
  ];

  /* TABLE COLUMNS */
  columns = [
    { header: 'Lead ID', field: 'leadId' },
    { header: 'Customer', field: 'customer' },
    { header: 'Contact Person', field: 'contactPerson' },
    { header: 'Created By', field: 'createdBy' },
    { header: 'Lead Source', field: 'sourceOfLead' },
    { header: 'Created Time', field: 'createdTime' }
  ];

  /* SEARCH FIELDS (NO MODEL) */
  searchFields: SearchFieldConfig[] = [
    { key: 'leadId', label: 'Lead ID', placeholder: 'Lead ID', type: 'text' },
    {
      key: 'customer',
      label: 'Customer',
      type: 'select',
      options: [
        { label: 'Select Customer', value: '' },
        { label: 'Miot Hospitals', value: 'Miot Hospitals' }
      ]
    },
    {
      key: 'createdBy',
      label: 'Owner',
      type: 'select',
      options: [
        { label: 'Select Owner', value: '' },
        { label: 'Chetan Kumar', value: 'Chetan Kumar' }
      ]
    }
  ];

  /* STATIC TABLE DATA */
  rows = [
    {
      leadId: 1,
      customer: 'Miot Hospitals',
      contactPerson: 'Shakthi',
      createdBy: 'Chetan Kumar',
      sourceOfLead: 'Visit',
      createdTime: '2025-09-17',
      leadStatus: 1
    },
    {
      leadId: 2,
      customer: 'Apollo Hospitals',
      contactPerson: 'Ravi',
      createdBy: 'Admin',
      sourceOfLead: 'Call',
      createdTime: '2025-09-18',
      leadStatus: 1
    }
  ];

  /* EVENTS (UI ONLY) */

  onSearch() {
    console.log('Search triggered');
  }

  onEdit(row: any) {
    console.log('Edit:', row);
  }

  onApprove(row: any) {
    console.log('Approved:', row);
    alert('Approved (UI only)');
  }

  onReject(row: any) {
    console.log('Rejected:', row);
    alert('Rejected (UI only)');
  }
}