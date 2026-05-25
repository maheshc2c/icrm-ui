import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Breadcrumb } from '../../../models/breadcrumb';
import { ModalComponent } from '../../../shared/modal/modal';
import { Form } from '../../../shared/form/form';
import { Leadservice } from '../../../service/leadservice';

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule, ModalComponent, Form],
  templateUrl: './opportunities.html',
  styleUrls: ['./opportunities.css']
})
export class OpportunitiesComponent implements OnInit {
  /* ================= HEADER ================= */
  headerTitle: string = 'Opportunities';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Opportunities' }
  ];

  /* ================= MODAL STATE ================= */
  showAddModal = false;

  /* ================= SEARCH FIELDS ================= */
  searchFields: SearchFieldConfig[] = [
    { key: 'oppId', label: 'Opp ID', type: 'text', placeholder: 'Opp ID' },
    { key: 'customer', label: 'Customer', type: 'select', placeholder: 'Select Customer', options: [] },
    { key: 'productCategory', label: 'Product Category', type: 'select', placeholder: 'Select Product Category', options: [] },
    { key: 'stage', label: 'Stage', type: 'select', placeholder: 'Select Stage', options: [
      { value: 'Qualification', label: 'Qualification' },
      { value: 'Proposal', label: 'Proposal' },
      { value: 'Negotiation', label: 'Negotiation' }
    ]},
    { key: 'category', label: 'Category', type: 'select', placeholder: 'Select Category', options: [
      { value: 'New Business', label: 'New Business' },
      { value: 'Existing', label: 'Existing' }
    ]},
    { key: 'region', label: 'Region', type: 'select', placeholder: 'Select Region', options: [] },
    { key: 'sourceOfLead', label: 'Source of Lead', type: 'select', placeholder: 'Select Source of Lead', options: [] },
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

  /* ================= POPUP FORM FIELDS ================= */
  // We'll define these specifically for the two-column popup
  oppFields: any[] = [
    { name: 'leadId', label: 'Select Lead', type: 'select', options: [], required: true },
    { name: 'decisionMaker1', label: 'Decision Maker1', type: 'select', options: [], required: true },
    { name: 'productCategoryId', label: 'Product Category', type: 'select', options: [], required: true },
    { name: 'decisionMaker2', label: 'Decision Maker2', type: 'select', options: [] },
    { name: 'productGroupId', label: 'Product Segment', type: 'select', options: [], required: true },
    { name: 'decisionMaker3', label: 'Decision Maker3', type: 'select', options: [] },
    { name: 'productId', label: 'Product Name', type: 'select', options: [], required: true },
    { name: 'decisionMaker4', label: 'Decision Maker4', type: 'select', options: [] },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'decisionMaker5', label: 'Decision Maker5', type: 'select', options: [] },
    { name: 'fundSourceId', label: 'Source of Funding', type: 'select', options: [], required: true },
    { name: 'relationshipId', label: 'Relationship with Decision Maker', type: 'select', options: [], required: true },
    { name: 'expectedOrderConclusion', label: 'Expected Order Conclusion Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', options: [], required: true },
    { name: 'expectedInvoicingDate', label: 'Expected Invoice Date', type: 'date' },
    { name: 'competitors', label: 'Competitors', type: 'text' }
  ];

  oppModel: any = {
    leadId: '',
    decisionMaker1: '',
    productCategoryId: '',
    decisionMaker2: '',
    productGroupId: '',
    decisionMaker3: '',
    productId: '',
    decisionMaker4: '',
    quantity: null,
    decisionMaker5: '',
    fundSourceId: '',
    relationshipId: '',
    expectedOrderConclusion: '',
    status: '',
    expectedInvoicingDate: '',
    competitors: ''
  };

  /* ================= DATA ================= */
  opportunities: any[] = [];
  filteredOpportunities: any[] = [];
  currentFilters: any = {};

  /* ================= TABLE COLUMNS ================= */
  columns = [
    { header: 'ID', field: 'id' },
    { header: 'Lead Details', field: 'leadDetails' },
    { header: 'Product', field: 'product' },
    { header: 'Qty', field: 'qty' },
    { header: 'Value (Rs)', field: 'value' },
    { header: 'Stage', field: 'stage' },
    { header: 'Category', field: 'category' },
    { header: 'Probability', field: 'probability' },
    { header: 'Life Time(Days)', field: 'lifeTime' }
  ];

  constructor(
    private router: Router,
    private leadService: Leadservice
  ) { }

  ngOnInit(): void {
    this.loadOpportunities();
    this.loadDropdownData();
  }

  loadDropdownData(): void {
    // Load leads for dropdown
    this.leadService.getOpenLeads().subscribe(data => {
      const leadField = this.oppFields.find(f => f.name === 'leadId');
      if (leadField) {
        leadField.options = data.map(l => ({ label: l.customerName, value: l.leadId }));
      }
    });

    // Load contacts for decision makers
    this.leadService.getContacts().subscribe(data => {
      const dmFields = ['decisionMaker1', 'decisionMaker2', 'decisionMaker3', 'decisionMaker4', 'decisionMaker5'];
      dmFields.forEach(fieldName => {
        const field = this.oppFields.find(f => f.name === fieldName);
        if (field) {
          field.options = data.map(c => ({ label: `${c.contactFirstName} ${c.contactLastName || ''}`, value: c.contactId }));
        }
      });
    });

    // Load relationships
    this.leadService.getRelationships().subscribe(data => {
      const field = this.oppFields.find(f => f.name === 'relationshipId');
      if (field) {
        field.options = data.map(r => ({ label: r.relationshipName, value: r.relationshipId }));
      }
    });
  }

  /* ================= LOAD OPPORTUNITIES ================= */
  loadOpportunities(): void {
    this.leadService.getOpportunityTable().subscribe({
      next: (data) => {
        this.opportunities = data;
        this.filteredOpportunities = [...this.opportunities];
      },
      error: (err) => {
        console.error('Error loading opportunities:', err);
        // Fallback to empty or dummy if needed for testing
        this.opportunities = [];
        this.filteredOpportunities = [];
      }
    });
  }

  onSearchChange(filters: any): void {
    this.currentFilters = filters;
  }

  onSearch(): void {
    this.filteredOpportunities = this.opportunities.filter(opp => {
      const matchesId = !this.currentFilters.oppId || opp.id?.toString().includes(this.currentFilters.oppId);
      const matchesCustomer = !this.currentFilters.customer || opp.leadDetails?.toLowerCase().includes(this.currentFilters.customer.toLowerCase());
      return matchesId && matchesCustomer;
    });
  }

  /* ================= MODAL ACTIONS ================= */
  onAdd(): void {
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
  }

  onSubmitOpp(formData: any): void {
    console.log('Submitting Opportunity:', formData);
    this.closeModal();
    alert('Opportunity added successfully! (Simulation)');
  }

  onEdit(row: any): void {
    console.log('Edit opportunity:', row);
  }

  downloadExcel(): void {
    alert('Download functionality will be implemented');
  }
}
