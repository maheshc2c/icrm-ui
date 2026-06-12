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
    { key: 'stage', label: 'Stage', type: 'select', placeholder: 'Select Stage', options: [
      { value: 1, label: 'Qualification' },
      { value: 2, label: 'Proposal' },
      { value: 3, label: 'Negotiation' }
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
        field.options = data.map(s => ({ label: s.oppName || s.OppName, value: s.oppStatusId || s.OppStatusId }));
      }
    });
  }

  /* ================= DYNAMIC FIELD CHANGE ================= */
  onFieldChange(fieldName: string, value: any): void {
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
  }

  onSearchChange(filters: any): void {
    this.currentFilters = filters;
  }

  onSearch(): void {
    const backendParams: any = {};

    if (this.currentFilters.searchBy) backendParams.text = this.currentFilters.searchBy;
    if (this.currentFilters.oppId) backendParams.text = this.currentFilters.oppId; 
    if (this.currentFilters.customer) backendParams.customerId = this.currentFilters.customer;
    if (this.currentFilters.productCategory) backendParams.productCategory = this.currentFilters.productCategory;
    if (this.currentFilters.stage) backendParams.stage = this.currentFilters.stage;
    if (this.currentFilters.sourceOfLead) backendParams.leadSource = this.currentFilters.sourceOfLead;
    if (this.currentFilters.region) backendParams.region = this.currentFilters.region;
    if (this.currentFilters.oppCreatedStartDate) backendParams.startDate = this.currentFilters.oppCreatedStartDate;
    if (this.currentFilters.oppCreatedEndDate) backendParams.endDate = this.currentFilters.oppCreatedEndDate;
    if (this.currentFilters.orderConclusionStartDate) backendParams.startOrder = this.currentFilters.orderConclusionStartDate;
    if (this.currentFilters.orderConclusionEndDate) backendParams.endOrder = this.currentFilters.orderConclusionEndDate;

    this.leadService.searchOpportunitiesTable(backendParams).subscribe({
      next: (data) => {
        this.filteredOpportunities = data.map(opp => ({
          ...opp,
          product: opp.productAndCategory,
          lifeTime: opp.lifeTimeDays,
          value: opp.value || (opp.qty ? opp.qty * 125000 : 0)
        }));
      },
      error: (err) => {
        console.error('Search failed:', err);
        this.filteredOpportunities = [];
      }
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

    // Map frontend oppModel to backend OpportunityDto
    const payload = {
      oppLeadId: toNullIfEmpty(this.oppModel.leadId),
      productId: toNullIfEmpty(this.oppModel.productId),
      productName: getOptionLabel('productId', this.oppModel.productId),
      productCategoryId: toNullIfEmpty(this.oppModel.productCategoryId),
      categoryName: getOptionLabel('productCategoryId', this.oppModel.productCategoryId),
      productGroupId: toNullIfEmpty(this.oppModel.productGroupId),
      groupName: getOptionLabel('productGroupId', this.oppModel.productGroupId),
      oppRequiredQuantity: toNullIfEmpty(this.oppModel.quantity),
      oppFundSourceId: toNullIfEmpty(this.oppModel.fundSourceId),
      fundSourceName: getOptionLabel('fundSourceId', this.oppModel.fundSourceId),
      oppExpectedOrderConclusion: toNullIfEmpty(this.oppModel.expectedOrderConclusion),
      oppExpectedInvoicingDate: toNullIfEmpty(this.oppModel.expectedInvoicingDate),
      oppDecisionMaker1: toNullIfEmpty(this.oppModel.decisionMaker1),
      oppDecisionMaker2: toNullIfEmpty(this.oppModel.decisionMaker2),
      oppDecisionMaker3: toNullIfEmpty(this.oppModel.decisionMaker3),
      oppDecisionMaker4: toNullIfEmpty(this.oppModel.decisionMaker4),
      oppDecisionMaker5: toNullIfEmpty(this.oppModel.decisionMaker5),
      oppRelationshipId: toNullIfEmpty(this.oppModel.relationshipId),
      relationshipName: getOptionLabel('relationshipId', this.oppModel.relationshipId),
      oppStatus: toNullIfEmpty(this.oppModel.status),
      oppName: getOptionLabel('status', this.oppModel.status),
      oppRemarks1: this.oppModel.competitors || null
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
        // Pre-fill model
        this.oppModel.leadId = data.oppLeadId;
        this.oppModel.productCategoryId = data.productCategoryId;
        this.oppModel.productGroupId = data.productGroupId;
        this.oppModel.productId = data.productId;
        this.oppModel.quantity = data.oppRequiredQuantity;
        this.oppModel.fundSourceId = data.oppFundSourceId;
        
        // Dates format
        const formatDate = (dateArr: number[]) => {
           if (!dateArr || dateArr.length < 3) return '';
           const pad = (n: number) => n < 10 ? '0'+n : n;
           return `${dateArr[0]}-${pad(dateArr[1])}-${pad(dateArr[2])}`;
        };
        this.oppModel.expectedOrderConclusion = typeof data.oppExpectedOrderConclusion === 'string' ? data.oppExpectedOrderConclusion : (Array.isArray(data.oppExpectedOrderConclusion) ? formatDate(data.oppExpectedOrderConclusion) : '');
        this.oppModel.expectedInvoicingDate = typeof data.oppExpectedInvoicingDate === 'string' ? data.oppExpectedInvoicingDate : (Array.isArray(data.oppExpectedInvoicingDate) ? formatDate(data.oppExpectedInvoicingDate) : '');
        
        this.oppModel.decisionMaker1 = data.oppDecisionMaker1;
        this.oppModel.decisionMaker2 = data.oppDecisionMaker2;
        this.oppModel.decisionMaker3 = data.oppDecisionMaker3;
        this.oppModel.decisionMaker4 = data.oppDecisionMaker4;
        this.oppModel.decisionMaker5 = data.oppDecisionMaker5;
        this.oppModel.relationshipId = data.oppRelationshipId;
        this.oppModel.status = data.oppStatus;
        this.oppModel.competitors = data.oppRemarks1;

        // Load segments and products for the selected category/group
        if (data.productCategoryId) {
          this.leadService.getSegmentsByCategory(data.productCategoryId).subscribe(segData => {
            const field = this.oppFields.find(f => f.name === 'productGroupId');
            if (field && segData) {
              field.options = segData.map((s:any) => ({ label: s.groupName || s.GroupName, value: s.groupId || s.GroupId }));
            }
          });
        }
        if (data.productGroupId) {
          this.leadService.getProductsBySegment(data.productGroupId).subscribe(prodData => {
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
