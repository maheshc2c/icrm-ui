import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Search, SearchFieldConfig } from '../../../shared/search/search';
import { Button } from '../../../shared/button/button';
import { Breadcrumb } from '../../../models/breadcrumb';

@Component({
  selector: 'app-closed-opportunities',
  standalone: true,
  imports: [Header, Sidebar, Pageheader, Search, Button, CommonModule, FormsModule],
  templateUrl: './closed-opportunities.html',
  styleUrls: ['./closed-opportunities.css']
})
export class ClosedOpportunitiesComponent implements OnInit {
  /* ================= HEADER ================= */
  headerTitle: string = 'Closed Opportunities';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Closed Opportunities' }
  ];

  /* ================= SEARCH FIELDS ================= */
  searchFields: SearchFieldConfig[] = [
    { key: 'oppId', label: 'Opp ID', type: 'text', placeholder: 'Opp ID' },
    { key: 'customer', label: 'Customer', type: 'select', placeholder: 'Select Customer', options: [
      { value: '', label: 'Select Customer' },
      { value: 'ABC Corp', label: 'ABC Corp' },
      { value: 'XYZ Ltd', label: 'XYZ Ltd' }
    ]},
    { key: 'productCategory', label: 'Product Category', type: 'select', placeholder: 'Select Product Category', options: [
      { value: '', label: 'Select Product Category' },
      { value: 'Category A', label: 'Category A' },
      { value: 'Category B', label: 'Category B' }
    ]},
    { key: 'stage', label: 'Stage', type: 'select', placeholder: 'Select Stage', options: [
      { value: '', label: 'Select Stage' },
      { value: 'Won', label: 'Won' },
      { value: 'Lost', label: 'Lost' }
    ]},
    { key: 'region', label: 'Region', type: 'select', placeholder: 'Select Region', options: [
      { value: '', label: 'Select Region' },
      { value: 'South', label: 'South' },
      { value: 'North', label: 'North' }
    ]},
    { key: 'sourceOfLead', label: 'Source of Lead', type: 'select', placeholder: 'Select Source of Lead', options: [
      { value: '', label: 'Select Source of Lead' },
      { value: 'Website', label: 'Website' },
      { value: 'Referral', label: 'Referral' }
    ]},
    { key: 'oppCreatedStartDate', label: 'Opp Created Start Date', type: 'date', placeholder: 'Start Date' },
    { key: 'oppCreatedEndDate', label: 'Opp Created End Date', type: 'date', placeholder: 'End Date' },
    { key: 'orderConclusionStartDate', label: 'Order Conclusion Start Date', type: 'date', placeholder: 'Start Date' },
    { key: 'orderConclusionEndDate', label: 'Order Conclusion End Date', type: 'date', placeholder: 'End Date' },
    { key: 'searchIn', label: 'Search In', type: 'select', placeholder: 'Search in All', options: [
      { value: 'All', label: 'Search in All' },
      { value: 'Active', label: 'Active Only' }
    ]},
    { key: 'searchBy', label: 'Search By', type: 'text', placeholder: 'Search by text' }
  ];

  /* ================= DATA ================= */
  closedOpportunities: any[] = [];
  filteredOpportunities: any[] = [];
  currentFilters: any = {};

  /* ================= TABLE COLUMNS ================= */
  displayedColumns = [
    { key: 'id', label: 'ID' },
    { key: 'leadDetails', label: 'Lead Details' },
    { key: 'product', label: 'Product' },
    { key: 'qty', label: 'Qty' },
    { key: 'value', label: 'Value (Rs)' },
    { key: 'stage', label: 'Stage' },
    { key: 'lifeTime', label: 'Life Time(Days)' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadClosedOpportunities();
  }

  /* ================= LOAD CLOSED OPPORTUNITIES ================= */
  loadClosedOpportunities(): void {
    // Dummy data for UI testing
    this.closedOpportunities = [
      {
        id: 1,
        leadDetails: 'Closed Lead - ABC Corp',
        product: 'Product A',
        qty: 15,
        value: 6.0,
        stage: 'Won',
        lifeTime: 45
      },
      {
        id: 2,
        leadDetails: 'Lost Lead - XYZ Ltd',
        product: 'Product B',
        qty: 10,
        value: 4.5,
        stage: 'Lost',
        lifeTime: 30
      }
    ];
    this.filteredOpportunities = [...this.closedOpportunities];
  }

  /* ================= SEARCH ================= */
  onSearchChange(filters: any): void {
    // Store filters but don't apply until Search button is clicked
    this.currentFilters = filters;
  }

  onSearch(): void {
    // Apply the stored filters when Search button is clicked
    this.filteredOpportunities = this.closedOpportunities.filter(opp => {
      const matchesId = !this.currentFilters.oppId || 
        opp.id?.toString().includes(this.currentFilters.oppId);
      
      const matchesCustomer = !this.currentFilters.customer || 
        opp.leadDetails?.toLowerCase().includes(this.currentFilters.customer.toLowerCase());
      
      return matchesId && matchesCustomer;
    });
  }

  /* ================= DOWNLOAD ================= */
  downloadExcel(): void {
    console.log('Download closed opportunities as Excel');
    alert('Download functionality will be implemented');
  }

  /* ================= REFRESH ================= */
  onRefresh(): void {
    console.log('Refresh closed opportunities');
    this.loadClosedOpportunities();
    this.currentFilters = {};
    alert('Data refreshed');
  }

  /* ================= NAVIGATION ================= */
  viewOpportunity(id: number): void {
    console.log('View closed opportunity:', id);
    // TODO: Navigate to view page
  }
}
