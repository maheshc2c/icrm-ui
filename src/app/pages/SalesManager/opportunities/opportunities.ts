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
import { OpportunityTableModel } from '../../../models/opportunity-table.model';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Pageheader } from '../../../shared/pageheader/pageheader';

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, Header, Sidebar, Pageheader, DataTable],
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
  opportunities: OpportunityTableModel[] = [];
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
        this.opportunities = data.map(opp => ({
          ...opp,
          product: opp.productAndCategory,
          lifeTime: opp.lifeTimeDays,
          value: opp.value || (opp.qty ? opp.qty * 125000 : 0)
        }));
        this.filteredOpportunities = [...this.opportunities];
        this.populateSearchDropdowns();
      },
      error: (err) => {
        console.error('Error loading opportunities:', err);
        this.opportunities = [];
        this.filteredOpportunities = [];
      }
    });
  }

  populateSearchDropdowns(): void {
    // 1. Load customer names from leadService
    this.leadService.getCustomers().subscribe(data => {
      const field = this.searchFields.find(f => f.key === 'customer');
      if (field && data) {
        const uniqueNames = [...new Set(data.map(c => c.customerName))].sort();
        field.options = uniqueNames.map(name => ({ value: name, label: name }));
      }
    });

    // 2. Extract product categories from loaded rows
    const categories = new Set<string>();
    this.opportunities.forEach(opp => {
      if (opp.productAndCategory) {
        const match = opp.productAndCategory.match(/\(([^)]+)\)/);
        if (match && match[1]) {
          categories.add(match[1]);
        } else {
          categories.add(opp.productAndCategory);
        }
      }
    });
    const pcField = this.searchFields.find(f => f.key === 'productCategory');
    if (pcField) {
      pcField.options = Array.from(categories).sort().map(c => ({ value: c, label: c }));
    }

    // 3. Extract regions from loaded rows
    const regions = new Set<string>();
    this.opportunities.forEach(opp => {
      if (opp.leadDetails) {
        const match = opp.leadDetails.match(/\(([^)]+)\)$/);
        if (match && match[1]) {
          regions.add(match[1]);
        }
      }
    });
    const regionField = this.searchFields.find(f => f.key === 'region');
    if (regionField) {
      regionField.options = Array.from(regions).sort().map(r => ({ value: r, label: r }));
    }

    // 4. Load source of lead from leadService
    this.leadService.getSources().subscribe(data => {
      const field = this.searchFields.find(f => f.key === 'sourceOfLead');
      if (field && data) {
        const uniqueSources = [...new Set(data.map(s => s.sourceName))].sort();
        field.options = uniqueSources.map(name => ({ value: name, label: name }));
      }
    });
  }

  onSearchChange(filters: any): void {
    this.currentFilters = filters;
  }

  onSearch(): void {
    this.filteredOpportunities = this.opportunities.filter(opp => {
      // 1) Opp ID
      if (this.currentFilters.oppId) {
        if (!opp.id?.toString().includes(this.currentFilters.oppId)) return false;
      }

      // 2) Customer
      if (this.currentFilters.customer) {
        const custName = this.extractCustomerName(opp.leadDetails);
        if (!custName.toLowerCase().includes(this.currentFilters.customer.toLowerCase())) return false;
      }

      // 3) Product Category
      if (this.currentFilters.productCategory) {
        const categoryName = this.extractCategoryName(opp.productAndCategory);
        if (categoryName.toLowerCase() !== this.currentFilters.productCategory.toLowerCase()) return false;
      }

      // 4) Stage
      if (this.currentFilters.stage) {
        if (opp.stage?.toLowerCase() !== this.currentFilters.stage.toLowerCase()) return false;
      }

      // 5) Category
      if (this.currentFilters.category) {
        if (opp.category?.toLowerCase() !== this.currentFilters.category.toLowerCase()) return false;
      }

      // 6) Region
      if (this.currentFilters.region) {
        const regionName = this.extractRegionName(opp.leadDetails);
        if (regionName.toLowerCase() !== this.currentFilters.region.toLowerCase()) return false;
      }

      // 7) Search By (Text Search)
      if (this.currentFilters.searchBy) {
        const search = this.currentFilters.searchBy.toLowerCase();
        const matchesId = opp.id?.toString().includes(search);
        const matchesLead = opp.leadDetails?.toLowerCase().includes(search);
        const matchesProduct = opp.product?.toLowerCase().includes(search);
        const matchesStage = opp.stage?.toLowerCase().includes(search);
        const matchesCategory = opp.category?.toLowerCase().includes(search);
        if (!(matchesId || matchesLead || matchesProduct || matchesStage || matchesCategory)) return false;
      }

      return true;
    });
  }

  private extractCustomerName(leadDetails: string | null | undefined): string {
    if (!leadDetails) return '';
    const match = leadDetails.match(/ID\s*:\s*\d+\s*-\s*(.*?)\s*\(/);
    return match && match[1] ? match[1].trim() : leadDetails;
  }

  private extractCategoryName(productAndCategory: string | null | undefined): string {
    if (!productAndCategory) return '';
    const match = productAndCategory.match(/\(([^)]+)\)/);
    return match && match[1] ? match[1].trim() : productAndCategory;
  }

  private extractRegionName(leadDetails: string | null | undefined): string {
    if (!leadDetails) return '';
    const match = leadDetails.match(/\(([^)]+)\)$/);
    return match && match[1] ? match[1].trim() : '';
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
    if (!this.filteredOpportunities || this.filteredOpportunities.length === 0) {
      alert('No data available to download');
      return;
    }

    const excelData = this.filteredOpportunities.map((row, index) => ({
      'S.NO': index + 1,
      'ID': row.id,
      'Lead Details': row.leadDetails,
      'Product': row.product,
      'Qty': row.qty,
      'Value (Rs)': row.value,
      'Stage': row.stage,
      'Category': row.category,
      'Probability (%)': row.probability,
      'Life Time (Days)': row.lifeTime
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Opportunities': worksheet },
      SheetNames: ['Opportunities']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    saveAs(data, `opportunities_export_${new Date().getTime()}.xlsx`);
  }
}
