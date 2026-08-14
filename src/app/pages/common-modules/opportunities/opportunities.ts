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
  isEditMode = false;
  editOppId: number | null = null;

  /* ================= SEARCH FIELDS ================= */
  searchFields: SearchFieldConfig[] = [
    { key: 'oppId', label: 'Opp ID', type: 'text', placeholder: 'Opp ID' },
    { key: 'customer', label: 'Customer', type: 'select', placeholder: 'Select Customer', options: [] },
    { key: 'productCategory', label: 'Product Category', type: 'select', placeholder: 'Select Product Category', options: [] },
    { key: 'stage', label: 'Stage', type: 'select', placeholder: 'Select Stage', options: [] },
    { key: 'category', label: 'Category', type: 'select', placeholder: 'Select Category', options: [
      { value: 1, label: 'Hot' },
      { value: 2, label: 'Warm' },
      { value: 3, label: 'Cold' }
    ]},
    { key: 'region', label: 'Region', type: 'select', placeholder: 'Select Region', options: [] },
    { key: 'sourceOfLead', label: 'Source of Lead', type: 'select', placeholder: 'Select Source of Lead', options: [] },
    { key: 'oppCreatedStartDate', label: 'Opp Created Start Date', type: 'date', placeholder: 'Start Date' },
    { key: 'oppCreatedEndDate', label: 'Opp Created End Date', type: 'date', placeholder: 'End Date' },
    { key: 'orderConclusionStartDate', label: 'Order Conclusion Start Date', type: 'date', placeholder: 'Start Date' },
    { key: 'orderConclusionEndDate', label: 'Order Conclusion End Date', type: 'date', placeholder: 'End Date' },
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
    { name: 'competitors', label: 'Competitors', type: 'select', options: [], isSearchable: true }
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

  resetOppModel(): void {
    this.oppModel = {
      leadId: '', decisionMaker1: '', productCategoryId: '', decisionMaker2: '',
      productGroupId: '', decisionMaker3: '', productId: '', decisionMaker4: '',
      quantity: null, decisionMaker5: '', fundSourceId: '', relationshipId: '',
      expectedOrderConclusion: '', status: '', expectedInvoicingDate: '', competitors: ''
    };
  }

  /* ================= DATA ================= */
  opportunities: OpportunityTableModel[] = [];
  filteredOpportunities: OpportunityTableModel[] = [];
  currentFilters: any = {};

  totalElements = 0;
  currentPage = 1;
  pageSize = 10;

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

  allContactsData: any[] = [];
  allLeadsData: any[] = [];

  loadDropdownData(): void {
    // Load leads for dropdown
    this.leadService.getOpenLeads().subscribe((data: any) => {
      const leadField = this.oppFields.find(f => f.name === 'leadId');
      if (leadField) {
        const leadsArray = data.content || data || [];
        this.allLeadsData = leadsArray;
        leadField.options = leadsArray.map((l: any) => ({ label: l.customerName || `Lead ${l.leadId}`, value: l.leadId, raw: l }));
      }
    });

    // Load contacts for decision makers
    this.leadService.getContacts().subscribe(data => {
      this.allContactsData = data || [];
      this.updateDecisionMakerOptions(this.allContactsData);
    });

    // Load relationships
    this.leadService.getRelationships().subscribe(data => {
      const field = this.oppFields.find(f => f.name === 'relationshipId');
      if (field && data) {
        field.options = data.map(r => ({ label: r.relationshipName, value: r.relationshipId }));
      }
    });

    // Load product categories
    this.leadService.getCategories().subscribe(data => {
      const field = this.oppFields.find(f => f.name === 'productCategoryId');
      if (field && data) {
        field.options = data.map(c => ({ label: c.categoryName, value: c.categoryId }));
      }
    });

    // Load Funds
    this.leadService.getFunds().subscribe(data => {
      const field = this.oppFields.find(f => f.name === 'fundSourceId');
      if (field && data) {
        field.options = data.map(f => ({ label: f.fundSourceName || f.FundSourceName, value: f.fundSourceID || f.FundSourceID }));
      }
    });

    // Load Status
    this.leadService.getStatus().subscribe(data => {
      const field = this.oppFields.find(f => f.name === 'status');
      if (field && data) {
        field.options = data.map(s => {
          const weight = s.oppWeight != null ? ` (${s.oppWeight}%)` : '';
          return { label: (s.oppName || s.OppName || 'Status') + weight, value: s.oppStatusId || s.OppStatusId };
        });
      }
    });
  }

  private updateDecisionMakerOptions(contacts: any[]): void {
    const dmFields = ['decisionMaker1', 'decisionMaker2', 'decisionMaker3', 'decisionMaker4', 'decisionMaker5'];
    dmFields.forEach(fieldName => {
      const field = this.oppFields.find(f => f.name === fieldName);
      if (field) {
        field.options = contacts.map(c => ({
          label: `${c.contactFirstName || ''} ${c.contactLastName || ''}`.trim() || c.name || 'Unknown',
          value: c.contactId || c.id
        }));
      }
    });
    this.oppFields = [...this.oppFields];
  }

  /* ================= DYNAMIC FIELD CHANGE ================= */
  onFieldChange(fieldName: string, value: any): void {
    if (fieldName === 'leadId' && value) {
      const selectedLead = this.allLeadsData.find((l: any) => (l.leadId || l.id) == value);
      const customerId = selectedLead ? (selectedLead.customerId || selectedLead.customer?.customerId) : null;
      if (customerId && this.allContactsData.length > 0) {
        const filtered = this.allContactsData.filter((c: any) => 
          (c.customer && (c.customer.customerId == customerId || c.customer.id == customerId)) || 
          c.customerId == customerId
        );
        this.updateDecisionMakerOptions(filtered.length > 0 ? filtered : this.allContactsData);
      } else {
        this.updateDecisionMakerOptions(this.allContactsData);
      }
    }

    if (fieldName === 'productCategoryId' && value) {
      // Clear out segment and product
      this.oppModel.productGroupId = '';
      this.oppModel.productId = '';

      // Fetch new segments
      this.leadService.getSegmentsByCategory(value).subscribe(data => {
        const field = this.oppFields.find(f => f.name === 'productGroupId');
        if (field && data) {
          field.options = data.map(s => ({ label: s.groupName || s.GroupName, value: s.groupId || s.GroupId }));
        }
      });
    }

    if (fieldName === 'productGroupId' && value) {
      // Clear out the previous product selection
      this.oppModel.productId = '';
      
      // Fetch new products for this segment
      this.leadService.getProductsBySegment(value).subscribe(data => {
        const field = this.oppFields.find(f => f.name === 'productId');
        if (field && data) {
          field.options = data.map(p => ({ label: p.productName || p.ProductName || 'Unnamed Product', value: p.productId || p.ProductId }));
        }
      });
    }
  }

  /* ================= LOAD OPPORTUNITIES ================= */
  loadOpportunities(): void {
    this.leadService.getOpportunityTable(this.currentPage - 1, this.pageSize).subscribe({
      next: (data: any) => {
        const opps = data.content || data; // handle both Page object and raw array just in case
        this.opportunities = opps.map((opp: any) => ({
          ...opp,
          product: opp.productAndCategory,
          lifeTime: opp.lifeTimeDays,
          value: (opp.mrp && opp.qty) ? (opp.qty * opp.mrp) : (opp.value || (opp.qty ? opp.qty * 125000 : 0)),
          probability: typeof opp.probability === 'number' ? opp.probability : (parseFloat(opp.probability) || 50)
        }));
        this.filteredOpportunities = [...this.opportunities];
        this.totalElements = data.totalElements !== undefined ? data.totalElements : opps.length;
        this.populateSearchDropdowns();
      },
      error: (err) => {
        console.error('Error loading opportunities:', err);
        this.opportunities = [];
        this.filteredOpportunities = [];
        this.totalElements = 0;
      }
    });
  }

  populateSearchDropdowns(): void {
    // 1. Load customer names from leadService
    this.leadService.getCustomers().subscribe(data => {
      const field = this.searchFields.find(f => f.key === 'customer');
      if (field && data) {
        field.options = data.map(c => ({ value: c.customerId, label: c.customerName }));
      }
    });

    // 2. Load product categories from backend
    this.leadService.getCategories().subscribe(data => {
      const field = this.searchFields.find(f => f.key === 'productCategory');
      if (field && data) {
        field.options = data.map(c => ({ value: c.categoryId, label: c.categoryName }));
      }
    });

    // 3. Load regions from backend
    this.leadService.getRegions().subscribe(data => {
      const field = this.searchFields.find(f => f.key === 'region');
      if (field && data) {
        field.options = data.map(r => ({ value: r.locationId, label: r.locationName }));
      }
    });

    // 4. Load source of lead from leadService
    this.leadService.getSources().subscribe(data => {
      const field = this.searchFields.find(f => f.key === 'sourceOfLead');
      if (field && data) {
        field.options = data.map(s => ({ value: s.sourceId, label: s.sourceName }));
      }
    });

    // 5. Load Stages from backend
    this.leadService.getStages().subscribe(data => {
      const field = this.searchFields.find(f => f.key === 'stage');
      if (field && data) {
        field.options = data.map(s => ({ value: s.stageId, label: s.stageName }));
      }
    });

    // 6. Load Competitors from backend for Opp Form
    this.leadService.getCompetitors().subscribe(data => {
      const field = this.oppFields.find(f => f.name === 'competitors');
      if (field && data) {
        field.options = data.map(c => ({ value: c.competitorId || c.id, label: c.competitorName || c.name || 'Unknown' }));
      }
    });
  }

  onSearchChange(filters: any): void {
    this.currentFilters = filters;
  }

  onSearch(): void {
    const backendParams: any = {};

    if (this.currentFilters.searchBy) backendParams.text = this.currentFilters.searchBy;
    if (this.currentFilters.oppId) backendParams.opportunityId = this.currentFilters.oppId; 
    if (this.currentFilters.customer) backendParams.customerId = this.currentFilters.customer;
    if (this.currentFilters.productCategory) backendParams.productCategory = this.currentFilters.productCategory;
    if (this.currentFilters.stage) backendParams.stage = this.currentFilters.stage;
    if (this.currentFilters.category) backendParams.category = this.currentFilters.category;
    if (this.currentFilters.sourceOfLead) backendParams.leadSource = this.currentFilters.sourceOfLead;
    if (this.currentFilters.region) backendParams.region = this.currentFilters.region;
    if (this.currentFilters.oppCreatedStartDate) backendParams.startDate = this.currentFilters.oppCreatedStartDate;
    if (this.currentFilters.oppCreatedEndDate) backendParams.endDate = this.currentFilters.oppCreatedEndDate;
    if (this.currentFilters.orderConclusionStartDate) backendParams.startOrder = this.currentFilters.orderConclusionStartDate;
    if (this.currentFilters.orderConclusionEndDate) backendParams.endOrder = this.currentFilters.orderConclusionEndDate;

    this.leadService.searchOpportunitiesTable(backendParams, this.currentPage - 1, this.pageSize).subscribe({
      next: (data) => {
        const opps = data.content || data;
        this.filteredOpportunities = opps.map((opp: any) => ({
          ...opp,
          product: opp.productAndCategory,
          lifeTime: opp.lifeTimeDays,
          value: opp.value || (opp.qty ? opp.qty * 125000 : 0)
        }));
        this.totalElements = data.totalElements !== undefined ? data.totalElements : opps.length;
      },
      error: (err) => {
        console.error('Search failed:', err);
        this.filteredOpportunities = [];
        this.totalElements = 0;
      }
    });
  }

  onReset(): void {
    this.currentFilters = {};
    this.currentPage = 1;
    this.loadOpportunities();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    if (Object.keys(this.currentFilters).length > 0) {
      // If there's an active search, re-run search. 
      // Note: Backend search doesn't support pagination yet, but we trigger it just in case.
      this.onSearch();
    } else {
      this.loadOpportunities();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    if (Object.keys(this.currentFilters).length > 0) {
      this.onSearch();
    } else {
      this.loadOpportunities();
    }
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
    this.isEditMode = false;
    this.editOppId = null;
    this.resetOppModel();
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.isEditMode = false;
    this.editOppId = null;
    this.resetOppModel();
  }

  onSubmitOpp(formData: any): void {
    if (!this.oppModel.leadId) {
      alert('Please select a Lead first.');
      return;
    }
    if (!this.oppModel.productCategoryId || !this.oppModel.productGroupId || !this.oppModel.productId) {
      alert('Please select Category, Segment, and Product Name.');
      return;
    }
    if (!this.oppModel.fundSourceId) {
      alert('Please select a Source of Funding.');
      return;
    }
    if (!this.oppModel.status) {
      alert('Please select a Status.');
      return;
    }
    if (!this.oppModel.relationshipId) {
      alert('Please select a Relationship with Decision Maker.');
      return;
    }

    // Helper to convert empty strings to null for backend Long/Integer fields
    const toNullIfEmpty = (val: any) => (val === '' || val === undefined) ? null : val;

    // Helper to extract the label (name) for dropdown fields
    const getOptionLabel = (fieldName: string, value: any) => {
      if (!value) return null;
      const field = this.oppFields.find(f => f.name === fieldName);
      if (field && field.options) {
        const opt = field.options.find((o: any) => o.value == value);
        return opt ? opt.label : null;
      }
      return null;
    };

    const payload = {
      leadId: toNullIfEmpty(this.oppModel.leadId) ? Number(toNullIfEmpty(this.oppModel.leadId)) : null,
      productId: toNullIfEmpty(this.oppModel.productId) ? Number(toNullIfEmpty(this.oppModel.productId)) : null,
      status: toNullIfEmpty(this.oppModel.status) ? Number(toNullIfEmpty(this.oppModel.status)) : null,
      requiredQuantity: toNullIfEmpty(this.oppModel.quantity) ? Number(toNullIfEmpty(this.oppModel.quantity)) : null,
      fundSourceId: toNullIfEmpty(this.oppModel.fundSourceId) ? Number(toNullIfEmpty(this.oppModel.fundSourceId)) : null,
      fundingStatus: null,
      expectedOrderConclusion: toNullIfEmpty(this.oppModel.expectedOrderConclusion),
      expectedInvoicingDate: toNullIfEmpty(this.oppModel.expectedInvoicingDate),
      decisionMaker1: toNullIfEmpty(this.oppModel.decisionMaker1) ? Number(toNullIfEmpty(this.oppModel.decisionMaker1)) : null,
      decisionMaker2: toNullIfEmpty(this.oppModel.decisionMaker2) ? Number(toNullIfEmpty(this.oppModel.decisionMaker2)) : null,
      decisionMaker3: toNullIfEmpty(this.oppModel.decisionMaker3) ? Number(toNullIfEmpty(this.oppModel.decisionMaker3)) : null,
      decisionMaker4: toNullIfEmpty(this.oppModel.decisionMaker4) ? Number(toNullIfEmpty(this.oppModel.decisionMaker4)) : null,
      decisionMaker5: toNullIfEmpty(this.oppModel.decisionMaker5) ? Number(toNullIfEmpty(this.oppModel.decisionMaker5)) : null,
      relationshipId: toNullIfEmpty(this.oppModel.relationshipId) ? Number(toNullIfEmpty(this.oppModel.relationshipId)) : null,
      demoRequirement: false,
      technicallyCleared: false,
      stageId: null,
      competitorIds: toNullIfEmpty(this.oppModel.competitors) ? [Number(toNullIfEmpty(this.oppModel.competitors))] : [],
      remarks1: null,
      remarks2: null
    };

    if (this.isEditMode && this.editOppId) {
      this.leadService.updateOpportunity(this.editOppId, payload).subscribe({
        next: (res) => {
          alert('Opportunity successfully updated!');
          this.closeModal();
          this.loadOpportunities();
        },
        error: (err) => {
          console.error('Error updating opportunity:', err);
          const errorMessage = err.error ? (typeof err.error === 'string' ? err.error : err.error.message || JSON.stringify(err.error)) : 'Unknown error';
          alert(`Failed to update Opportunity:\n\n${errorMessage}`);
        }
      });
    } else {
      this.leadService.createOpportunity(this.oppModel.leadId, payload).subscribe({
        next: (res) => {
          alert('Opportunity successfully saved to the database!');
          this.closeModal();
          // Refresh the table
          this.loadOpportunities();
        },
        error: (err) => {
          console.error('Error saving opportunity:', err);
          const errorMessage = err.error ? (typeof err.error === 'string' ? err.error : err.error.message || JSON.stringify(err.error)) : 'Unknown error';
          alert(`Failed to save Opportunity:\n\n${errorMessage}`);
        }
      });
    }
  }

  onEdit(row: any): void {
    console.log('Edit opportunity:', row);
    this.isEditMode = true;
    this.editOppId = row.id;

    // Fetch opportunity details
    this.leadService.getOpportunityById(row.id).subscribe({
      next: (data) => {
          const extractId = (val: any) => {
            if (!val || val === '0' || val === 0) return '';
            if (typeof val === 'object') return val.contactId || val.id || val.value || val.contact_id || val.fundSourceID || val.fundSourceId || val.relationshipId || val.categoryId || val.groupId || val.productId || val.oppStatusId || val.stageId || '';
            return val;
          };

          const oppProd = data.opportunityProducts && data.opportunityProducts.length > 0 ? data.opportunityProducts[0].product : null;

          const formatDate = (dateVal: any) => {
            if (!dateVal) return '';
            if (typeof dateVal === 'string') return dateVal;
            if (Array.isArray(dateVal) && dateVal.length >= 3) {
              const pad = (n: number) => n < 10 ? '0'+n : n;
              return `${dateVal[0]}-${pad(dateVal[1])}-${pad(dateVal[2])}`;
            }
            try { return new Date(dateVal).toISOString().split('T')[0]; } catch(e) { return ''; }
          };



          // Pre-fill model
          this.oppModel.leadId = extractId(data.lead || data.oppLeadId || '');
          this.oppModel.productCategoryId = extractId(data.productCategoryId || data.ProductCategoryId || data.categoryId || data.CategoryId || (oppProd && oppProd.group ? oppProd.group.productCategoryId : null));
          this.oppModel.productGroupId = extractId(data.productGroupId || data.ProductGroupId || data.groupId || data.GroupId || (oppProd && oppProd.group ? oppProd.group.groupId : null));
          this.oppModel.productId = extractId(data.productId || data.ProductId || (oppProd ? oppProd.productId || oppProd : null));
          this.oppModel.quantity = data.requiredQuantity || data.oppRequiredQuantity || data.OppRequiredQuantity || data.qty || data.quantity || null;
          this.oppModel.fundSourceId = extractId(data.fundSource || data.oppFundSourceId || data.OppFundSourceId || data.fundSourceId || data.FundSourceId);
          
          this.oppModel.expectedOrderConclusion = formatDate(data.expectedOrderConclusion || data.oppExpectedOrderConclusion);
          this.oppModel.expectedInvoicingDate = formatDate(data.expectedInvoicingDate || data.oppExpectedInvoicingDate);
          
          this.oppModel.decisionMaker1 = extractId(data.oppDecisionMaker1 || data.oppDecisionMaker1Id || data.decisionMaker1Id || data.DecisionMaker1Id || data.OppDecisionMaker1 || data.decisionMaker1 || data.DecisionMaker1 || data.contact1);
          this.oppModel.decisionMaker2 = extractId(data.oppDecisionMaker2 || data.oppDecisionMaker2Id || data.decisionMaker2Id || data.DecisionMaker2Id || data.OppDecisionMaker2 || data.decisionMaker2 || data.DecisionMaker2 || data.contact2);
          this.oppModel.decisionMaker3 = extractId(data.oppDecisionMaker3 || data.oppDecisionMaker3Id || data.decisionMaker3Id || data.DecisionMaker3Id || data.OppDecisionMaker3 || data.decisionMaker3 || data.DecisionMaker3 || data.contact3);
          this.oppModel.decisionMaker4 = extractId(data.oppDecisionMaker4 || data.oppDecisionMaker4Id || data.decisionMaker4Id || data.DecisionMaker4Id || data.OppDecisionMaker4 || data.decisionMaker4 || data.DecisionMaker4 || data.contact4);
          this.oppModel.decisionMaker5 = extractId(data.oppDecisionMaker5 || data.oppDecisionMaker5Id || data.decisionMaker5Id || data.DecisionMaker5Id || data.OppDecisionMaker5 || data.decisionMaker5 || data.DecisionMaker5 || data.contact5);
          this.oppModel.relationshipId = extractId(data.relationship || data.oppRelationshipId || data.OppRelationshipId || data.relationshipId || data.RelationshipId);
          this.oppModel.status = extractId(data.status || data.oppStatus || data.OppStatus || data.Status);
          this.oppModel.competitors = (() => {
            if (data.competitors && Array.isArray(data.competitors) && data.competitors.length > 0) {
              return String(data.competitors[0].competitorId || data.competitors[0].id || '');
            }
            if (data.competitorIds && Array.isArray(data.competitorIds) && data.competitorIds.length > 0) {
              return String(data.competitorIds[0]);
            }
            if (data.remarks1 && !isNaN(Number(data.remarks1))) {
              return String(data.remarks1);
            }
            return '';
          })();

        // Load segments and products for the selected category/group
        if (this.oppModel.productCategoryId) {
          this.leadService.getSegmentsByCategory(this.oppModel.productCategoryId).subscribe(segData => {
            const field = this.oppFields.find(f => f.name === 'productGroupId');
            if (field && segData) {
              field.options = segData.map((s:any) => ({ label: s.groupName || s.GroupName, value: s.groupId || s.GroupId }));
            }
          });
        }
        if (this.oppModel.productGroupId) {
          this.leadService.getProductsBySegment(this.oppModel.productGroupId).subscribe(prodData => {
            const field = this.oppFields.find(f => f.name === 'productId');
            if (field && prodData) {
              field.options = prodData.map((p:any) => ({ label: p.productName || p.ProductName || 'Unnamed Product', value: p.productId || p.ProductId }));
            }
          });
        }

        this.showAddModal = true;
      },
      error: (err) => {
        console.error('Error fetching opportunity:', err);
        alert('Failed to fetch Opportunity details.');
      }
    });
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
