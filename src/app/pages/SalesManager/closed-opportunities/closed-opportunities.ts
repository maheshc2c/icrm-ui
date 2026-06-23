import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Breadcrumb } from '../../../models/breadcrumb';
import { DataTable } from '../../../shared/data-table/data-table';
import { Leadservice } from '../../../service/leadservice';
import { OpportunityTableModel } from '../../../models/opportunity-table.model';

@Component({
  selector: 'app-closed-opportunities',
  standalone: true,
  imports: [Header, Sidebar, Pageheader, DataTable, CommonModule, FormsModule],
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
  closedOpportunities: OpportunityTableModel[] = [];
  filteredOpportunities: OpportunityTableModel[] = [];
  currentFilters: any = {};

  /* ================= TABLE COLUMNS ================= */
  columns = [
    { header: 'ID', field: 'id' },
    { header: 'Lead Details', field: 'leadDetails' },
    { header: 'Product', field: 'product' },
    { header: 'Qty', field: 'qty' },
    { header: 'Value (Rs)', field: 'value' },
    { header: 'Stage', field: 'stage' },
    { header: 'Life Time(Days)', field: 'lifeTime' }
  ];

  constructor(private router: Router, private leadService: Leadservice) { }

  ngOnInit(): void {
    this.loadClosedOpportunities();
  }

  /* ================= LOAD CLOSED OPPORTUNITIES ================= */
  loadClosedOpportunities(): void {
    this.leadService.getOpportunityTable().subscribe({
      next: (data: any) => {
        const opps = data.content || data;
        // Filter to only include opportunities where stage is Won or Lost
        const closedData = opps.filter((opp: any) => opp.stage === 'Won' || opp.stage === 'Lost' || opp.stage === 'Dropped');
        
        this.closedOpportunities = closedData.map((opp: any) => ({
          ...opp,
          product: opp.productAndCategory,
          lifeTime: opp.lifeTimeDays,
          value: opp.value || (opp.qty ? opp.qty * 125000 : 0)
        }));
        this.filteredOpportunities = [...this.closedOpportunities];
      },
      error: (err) => {
        console.error('Error fetching closed opportunities:', err);
      }
    });
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
      
      const customerName = opp.leadDetails ? this.extractCustomerName(opp.leadDetails) : '';
      const matchesCustomer = !this.currentFilters.customer || 
        customerName.toLowerCase().includes(this.currentFilters.customer.toLowerCase());
      
      const matchesStage = !this.currentFilters.stage ||
        opp.stage?.toLowerCase() === this.currentFilters.stage.toLowerCase();

      return matchesId && matchesCustomer && matchesStage;
    });
  }

  private extractCustomerName(leadDetails: string | null | undefined): string {
    if (!leadDetails) return '';
    const match = leadDetails.match(/ID\s*:\s*\d+\s*-\s*(.*?)\s*\(/);
    return match && match[1] ? match[1].trim() : leadDetails;
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
