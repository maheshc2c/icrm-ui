import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Header } from '../../../../layout/header/header';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { ModalComponent } from '../../../../shared/modal/modal';
import { DataTable } from '../../../../shared/data-table/data-table';

// Services
import { Leadservice } from '../../../../service/leadservice';
import { AuthService } from '../../../../service/auth-service';
import { Customerservice } from '../../../../service/customerservice';
import { LeadPayload } from '../../../../models/lead-model';
import { ConfirmDialogService } from '../../../../service/confirm-dialog.service';
import { ToastService } from '../../../../service/toast.service';

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { label: string; value: any }[];
  placeholder?: string;
}

@Component({
  selector: 'app-addlead',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, Header, Pageheader, ModalComponent, DataTable],
  templateUrl: './addlead.html',
  styleUrl: './addlead.css'
})
export class AddleadComponent implements OnInit {
  
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Lead' }
  ];

  isEditMode = false;
  leadId: number | null = null;
  activeTab: string = 'Lead Details';
  showDetailsModal = false;
  originalLeadData: LeadPayload | null = null;
  opportunities: any[] = [];
  isReadOnly = false;
  showCustomerDetailsModal = false;
  selectedCustomer: any = null;
  showInstallationBaseDetailsModal = false;
  installationBaseDetails: any[] = [];
  showQuoteSuccessMessage = false;
  
  // Validation errors
  errors: { [key: string]: string } = {};
  
  tabs = ['Lead Details', 'Opportunities', 'Quote', 'Contract Note'];

  /* ================= OPPORTUNITIES DATA TABLE ================= */
  oppColumns = [
    { header: 'ID', field: 'id' },
    { header: 'Product', field: 'productAndCategory' },
    { header: 'Quantity', field: 'qty' },
    { header: 'Stage', field: 'stage' },
    { header: 'Category', field: 'category' },
    { header: 'Probability', field: 'probability' }
  ];

  /* ================= QUOTE DATA TABLE ================= */
  quoteColumns = [
    { header: 'Quote ID', field: 'quoteId' },
    { header: 'Opportunity Details', field: 'opportunityDetails' },
    { header: 'Discount', field: 'discount' },
    { header: 'Current Stage', field: 'currentStage' },
    { header: 'Status', field: 'quoteStatus' },
    { header: 'Final Approver', field: 'finalApprover' },
    { header: 'Revisions', field: 'revisions' }
  ];

  quotes: any[] = [
    {
      id: 1,
      quoteId: 'KAR 26 S Rev 2',
      opportunityDetails: '101 Defense (Qty 1)',
      discount: '1.06%',
      currentStage: 'CH',
      quoteStatus: 'Quote Approved',
      finalApprover: 'CH',
      revisions: 'Rev 2'
    }
  ];

  /* ================= QUOTE MODAL STATE ================= */
  showAddQuoteModal = false;
  showRevisionHistoryModal = false;
  showQuoteRevisionModal = false;

  /* ================= QUOTE MODAL FORM ================= */
  quoteForm: any = {
    opportunityId: '',
    billingInfoId: '',
    dealerCommission: '',
    companyId: ''
  };
  quoteOpportunities: any[] = [];
  quoteBillingOptions: any[] = [];
  quoteCompanyOptions: any[] = [];
  quoteDealerOptions: any[] = [];

  /* ================= CONTRACT NOTE DATA TABLE ================= */
  contractNoteColumns = [
    { header: 'C Note ID', field: 'cNoteId' },
    { header: 'Quote Ref ID', field: 'quoteRefId' },
    { header: 'Billing', field: 'billing' },
    { header: 'Discount', field: 'discount' },
    { header: 'PO Number', field: 'poNumber' },
    { header: 'PO Date', field: 'poDate' },
    { header: 'SO Number', field: 'soNumber' },
    { header: 'Stage', field: 'stage' }
  ];

  contractNotes: any[] = [
    {
      id: 1,
      cNoteId: 22,
      quoteRefId: 'KAR-26-26-Rev-1',
      billing: 'Company',
      discount: '0%',
      poNumber: '1234',
      poDate: '2026-06-19',
      soNumber: '',
      stage: 'Waiting at SO Entry'
    }
  ];

  /* ================= CONTRACT NOTE MODAL STATE ================= */
  showAddContractNoteModal = false;

  /* ================= OPPORTUNITY MODAL STATE ================= */
  showOppModal = false;
  openOppDropdown: string | null = null;
  oppSearchQueries: any = {};

  oppFields: any[] = [
    // Row 1
    { name: 'productCategoryId', label: 'Product Category', type: 'select', options: [], required: true },
    { name: 'decisionMaker1', label: 'Decision Maker1', type: 'select', options: [], required: true, isSearchable: true },
    // Row 2
    { name: 'productGroupId', label: 'Product Segment', type: 'select', options: [], required: true },
    { name: 'decisionMaker2', label: 'Decision Maker2', type: 'select', options: [], isSearchable: true },
    // Row 3
    { name: 'productId', label: 'Product Name', type: 'select', options: [], required: true, isSearchable: true },
    { name: 'decisionMaker3', label: 'Decision Maker3', type: 'select', options: [], isSearchable: true },
    // Row 4
    { name: 'expectedOrderConclusion', label: 'Expected Order Conclusion Date', type: 'date', required: true },
    { name: 'decisionMaker4', label: 'Decision Maker4', type: 'select', options: [], isSearchable: true },
    // Row 5
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'decisionMaker5', label: 'Decision Maker5', type: 'select', options: [], isSearchable: true },
    // Row 6
    { name: 'fundSourceId', label: 'Source of Funding', type: 'select', options: [], required: true },
    { name: 'relationshipId', label: 'Relationship with Decision Maker', type: 'select', options: [], required: true },
    // Row 7
    { name: 'expectedInvoicingDate', label: 'Expected Invoice Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: [], required: true },
    // Row 8
    { name: 'competitors', label: 'Competitors', type: 'text' }
  ];

  oppModel: any = {
    productCategoryId: '',
    decisionMaker1: '',
    productGroupId: '',
    decisionMaker2: '',
    productId: '',
    decisionMaker3: '',
    quantity: null,
    decisionMaker4: '',
    fundSourceId: '',
    decisionMaker5: '',
    relationshipId: '',
    status: '',
    expectedOrderConclusion: '',
    expectedInvoicingDate: '',
    competitors: ''
  };

  /* ================= DROPDOWN DATA ================= */
  customersData: any[] = [];
  contactPersonsData: any[] = [];
  filteredContactPersons: any[] = [];

  leadForm: any = {
    source: '',
    campaign: '',
    customer: '' as string | number,
    rapportWithCustomer: '',
    contact1: '' as string | number,
    contact2: '' as string | number,
    purchasePotentialRs: '',
    purchasePotential: '',
    siteReadiness: '',
    visitRequirement: '',
    resourceRequirement: '',
    distributor: '',
    commentLine1: '',
    commentLine2: ''
  };

  leadFields: FormField[] = [
    {
      name: 'source',
      label: 'Source of Lead',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'campaign',
      label: 'Campaign',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'customer',
      label: 'Customer',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'rapportWithCustomer',
      label: 'Rapport with Customer',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'contact1',
      label: 'Contact Person 1',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'contact2',
      label: 'Contact Person 2',
      type: 'select',
      options: []
    },
    {
      name: 'purchasePotentialRs',
      label: 'Purchase Potential (Rs)',
      type: 'number',
      required: true,
      placeholder: 'Enter amount in Rs'
    },
    {
      name: 'purchasePotential',
      label: 'Purchase Potential',
      type: 'text',
      placeholder: 'Enter purchase potential details'
    },
    {
      name: 'siteReadiness',
      label: 'Site Readiness',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'visitRequirement',
      label: 'Visit Requirement',
      type: 'radio',
      required: true,
      options: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
      ]
    },
    {
      name: 'resourceRequirement',
      label: 'Resource Requirement',
      type: 'radio',
      required: true,
      options: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
      ]
    },
    {
      name: 'distributor',
      label: 'Distributor',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'commentLine1',
      label: 'Comment Line 1',
      type: 'textarea'
    },
    {
      name: 'commentLine2',
      label: 'Comment Line 2',
      type: 'textarea'
    }
  ];

  openCustomerDropdown: boolean = false;
  filteredCustomerOptions: any[] = [];
  customerSearchTerm: string = '';

  openContact1Dropdown: boolean = false;
  filteredContact1Options: any[] = [];
  contact1SearchTerm: string = '';

  openContact2Dropdown: boolean = false;
  filteredContact2Options: any[] = [];
  contact2SearchTerm: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private leadservice: Leadservice,
    private auth: AuthService,
    private customerService: Customerservice,
    private confirmService: ConfirmDialogService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  /* ================= INIT ================= */
  ngOnInit(): void {
    console.log('AddLead component initialized');
    (window as any).debugLeads = this;
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.leadId = +params['id'];
        console.log('Edit mode enabled for Lead ID:', this.leadId);
        
        // Also check if readOnly query parameter is present
        this.isReadOnly = this.route.snapshot.queryParams['readOnly'] === 'true';

        this.route.queryParams.subscribe(q => {
          if (q['success'] === 'true') {
            this.showQuoteSuccessMessage = true;
            this.activeTab = 'Quote';
          }
        });
        
        // Update breadcrumbs for edit/view mode
        if (this.isReadOnly) {
          this.breadcrumbs = [
            { label: 'Home', route: '/sales-manager-dashboard' },
            { label: 'Closed Leads', route: '/salesmanager/closed-leads' },
            { label: 'Lead ID - ' + this.leadId }
          ];
        } else {
          this.breadcrumbs = [
            { label: 'Home', route: '/sales-manager-dashboard' },
            { label: 'Open Leads', route: '/openleads' },
            { label: 'Lead ID - ' + this.leadId }
          ];
        }

        // Load existing lead details immediately
        this.loadLeadData(this.leadId);
        this.loadQuotes();
      }
    });

    this.loadDropdowns();
    this.loadOppDropdowns();
  }

  /* ================= GET USERNAME FROM TOKEN ================= */
  private getUsernameFromToken(): string {
    const token = this.auth.getToken();
    const storedSub = localStorage.getItem('sub');
    
    if (storedSub) return storedSub; // Prefer 'sub' stored during login
    if (!token) return 'testsalesengg';
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.username || 'testsalesengg';
    } catch (e) {
      console.warn('Failed to parse token for username:', e);
      return 'testsalesengg';
    }
  }

  /* ================= LOAD ALL DROPDOWNS ================= */
  private loadDropdowns(): void {
    console.log('Loading dropdown data...');
    
    // 1. Source of Lead
    this.leadservice.getSources().subscribe({
      next: (data) => this.setFieldOptions('source', data, 'sourceName', 'sourceId'),
      error: (err) => console.error('Failed to load lead sources:', err)
    });

    // 2. Customer
    this.leadservice.getCustomers().subscribe({
      next: (data) => {
        this.customersData = data;
        this.setFieldOptions('customer', data, 'customerName', 'customerId');
        this.filteredCustomerOptions = this.leadFields.find(f => f.name === 'customer')?.options || [];
      },
      error: (err) => console.error('Failed to load customers:', err)
    });

    // 3. Rapport (Relationship)
    this.leadservice.getRelationships().subscribe({
      next: (data) => this.setFieldOptions('rapportWithCustomer', data, 'relationshipName', 'relationshipId'),
      error: (err) => console.error('Failed to load rapport:', err)
    });

    // 4. Site Readiness
    this.leadservice.getSiteReadiness().subscribe({
      next: (data) => this.setFieldOptions('siteReadiness', data, 'siteReadinessName', 'siteReadinessID'),
      error: (err) => console.error('Failed to load site readiness:', err)
    });

    // 5. Distributors
    this.leadservice.getDistributors().subscribe({
      next: (data) => this.setFieldOptions('distributor', data, 'distributorName', 'userId'),
      error: (err) => console.error('Failed to load distributors:', err)
    });

    // 6. Contact Persons
    this.leadservice.getContacts().subscribe({
      next: (data) => {
        this.contactPersonsData = data;
        
        let filteredContacts = data;
        if (this.leadForm.customer) {
          filteredContacts = data.filter((c: any) => 
            (c.customer && (c.customer.customerId == this.leadForm.customer || c.customer.id == this.leadForm.customer)) || 
            c.customerId == this.leadForm.customer
          );
        }
        
        this.updateContactOptions('contact1', filteredContacts);
        this.updateContactOptions('contact2', filteredContacts);
      },
      error: (err) => console.error('Failed to load contacts:', err)
    });

    // 7. Campaigns (Silent load for background default)
    this.leadservice.getCampaigns().subscribe({
      next: (data) => this.setFieldOptions('campaign', data, 'campaignName', 'campaignId'),
      error: (err) => console.warn('Failed to load campaigns:', err)
    });
  }

  private loadLeadData(id: number): void {
    this.leadservice.getLeadById(id).subscribe({
      next: (data: LeadPayload) => {
        console.log('Loaded Lead Data:', data);
        this.originalLeadData = data;

        // Auto-detect closed/dropped leads and force read-only
        if (data.leadStatus === 21 || data.leadStatus === 22 || data.leadStatus === 3) {
          this.isReadOnly = true;
          this.breadcrumbs = [
            { label: 'Home', route: '/sales-manager-dashboard' },
            { label: 'Closed Leads', route: '/salesmanager/closed-leads' },
            { label: 'Lead ID - ' + this.leadId }
          ];
        }

        this.leadForm = {
          source: data.sourceId ? data.sourceId.toString() : '',
          campaign: data.campaignId ? data.campaignId.toString() : '',
          customer: data.customerId ? data.customerId.toString() : '',
          rapportWithCustomer: data.relationshipId ? data.relationshipId.toString() : '',
          contact1: data.contactId ? data.contactId.toString() : '',
          contact2: data.contact2Id ? data.contact2Id.toString() : '',
          purchasePotentialRs: data.purchasePotential ? data.purchasePotential.toString() : (data.leadPurchasePotential ? data.leadPurchasePotential.toString() : ''),
          purchasePotential: data.leadCmdLine3 || '',
          siteReadiness: data.siteReadinessId ? data.siteReadinessId.toString() : '',
          visitRequirement: data.visitRequirement === true ? 'Yes' : (data.leadVisitRequirement === 1 ? 'Yes' : 'No'),
          resourceRequirement: data.resourceRequirement === true ? 'Yes' : (data.leadResourceRequirement === 1 ? 'Yes' : 'No'),
          distributor: data.distributorId ? data.distributorId.toString() : '',
          commentLine1: data.remarks1 || data.leadCmdLine1 || '',
          commentLine2: data.remarks2 || data.leadCmdLine2 || ''
        };
        
        // Filter contacts specifically for this loaded customer if contact data is already fetched
        if (this.contactPersonsData && this.contactPersonsData.length > 0) {
          const selectedCustomerId = data.customerId;
          const filteredContacts = this.contactPersonsData.filter((c: any) => 
            (c.customer && (c.customer.customerId == selectedCustomerId || c.customer.id == selectedCustomerId)) || 
            c.customerId == selectedCustomerId
          );
          this.updateContactOptions('contact1', filteredContacts);
          this.updateContactOptions('contact2', filteredContacts);
        }

        // Trigger field binding refresh
        this.leadFields = [...this.leadFields];
      },
      error: (err) => console.error('Failed to load lead details:', err)
    });
  }

  /* ================= GENERIC OPTION SETTER ================= */
  private setFieldOptions(fieldName: string, data: any[], labelKey: string, valueKey?: string): void {
    const field = this.leadFields.find(f => f.name === fieldName);
    if (!field) return;

    field.options = [
      ...data.map((item: any) => {
        if (typeof item === 'string') return { label: item, value: item };
        const label = item[labelKey] || item.name || 'Unknown';
        let value = (valueKey && item[valueKey]) || item.id || label;
        if (value !== null && value !== undefined) {
           value = value.toString();
        }
        return { label, value };
      })
    ];
    console.log(`Dropdown Options for field '${fieldName}':`, field.options);
    this.leadFields = [...this.leadFields];
  }

  /* ================= CONTACT SPECIFIC UPDATER ================= */
  private updateContactOptions(fieldName: string, data: any[]): void {
    const field = this.leadFields.find(f => f.name === fieldName);
    if (field) {
      field.options = [
        ...data.map((c: any) => ({
          label: `${c.contactFirstName || ''} ${c.contactLastName || ''}`.trim() || c.name || 'Unknown',
          value: c.contactId || c.id
        }))
      ];
      this.leadFields = [...this.leadFields];
    }
  }

  /* ================= HANDLE FIELD CHANGES ================= */
  onFieldChange(event: {name: string, value: any}): void {
    // Clear error on change
    delete this.errors[event.name];

    if (event.name === 'customer') {
      this.showInstallationBaseDetailsModal = false;
      this.installationBaseDetails = [];

      // Filter contacts based on selected customer
      const selectedCustomerId = event.value;
      let filteredContacts = this.contactPersonsData || [];
      if (selectedCustomerId) {
        filteredContacts = filteredContacts.filter((c: any) => 
          (c.customer && (c.customer.customerId == selectedCustomerId || c.customer.id == selectedCustomerId)) || 
          c.customerId == selectedCustomerId
        );
      }
      this.updateContactOptions('contact1', filteredContacts);
      this.updateContactOptions('contact2', filteredContacts);

      // Reset selected contacts since the list changed
      this.leadForm.contact1 = '';
      this.leadForm.contact2 = '';
    }
  }

  /* ================= CUSTOMER DROPDOWN LOGIC ================= */
  toggleCustomerDropdown(event: Event): void {
    event.stopPropagation();
    this.openCustomerDropdown = !this.openCustomerDropdown;
    this.openContact1Dropdown = false;
    this.openContact2Dropdown = false;
    if (this.openCustomerDropdown) {
      this.customerSearchTerm = '';
      this.filteredCustomerOptions = this.leadFields.find(f => f.name === 'customer')?.options || [];
    }
  }

  filterCustomerOptions(event: any): void {
    const term = (event.target.value || '').toLowerCase();
    this.customerSearchTerm = term;
    const baseOptions = this.leadFields.find(f => f.name === 'customer')?.options || [];
    
    if (term.length >= 1) {
      this.filteredCustomerOptions = baseOptions.filter((opt: any) =>
        (opt.label || '').toLowerCase().includes(term)
      );
    } else {
      this.filteredCustomerOptions = baseOptions;
    }
  }

  selectCustomerOption(value: any): void {
    this.leadForm.customer = value;
    this.openCustomerDropdown = false;
    this.onFieldChange({ name: 'customer', value: value });
  }

  getCustomerLabel(value: any): string {
    if (!value) return '';
    const field = this.leadFields.find(f => f.name === 'customer');
    const opt = field?.options?.find(o => o.value == value);
    return opt ? opt.label : '';
  }

  /* ================= CONTACT1 DROPDOWN LOGIC ================= */
  toggleContact1Dropdown(event: Event): void {
    event.stopPropagation();
    this.openContact1Dropdown = !this.openContact1Dropdown;
    this.openCustomerDropdown = false;
    this.openContact2Dropdown = false;
    if (this.openContact1Dropdown) {
      this.contact1SearchTerm = '';
      this.filteredContact1Options = this.leadFields.find(f => f.name === 'contact1')?.options || [];
    }
  }

  filterContact1Options(event: any): void {
    const term = (event.target.value || '').toLowerCase();
    this.contact1SearchTerm = term;
    const baseOptions = this.leadFields.find(f => f.name === 'contact1')?.options || [];
    
    if (term.length >= 1) {
      this.filteredContact1Options = baseOptions.filter((opt: any) =>
        (opt.label || '').toLowerCase().includes(term)
      );
    } else {
      this.filteredContact1Options = baseOptions;
    }
  }

  selectContact1Option(value: any): void {
    this.leadForm.contact1 = value;
    this.openContact1Dropdown = false;
    this.onFieldChange({ name: 'contact1', value: value });
  }

  getContact1Label(value: any): string {
    if (!value) return '';
    const field = this.leadFields.find(f => f.name === 'contact1');
    const opt = field?.options?.find(o => o.value == value);
    return opt ? opt.label : '';
  }

  /* ================= CONTACT2 DROPDOWN LOGIC ================= */
  toggleContact2Dropdown(event: Event): void {
    event.stopPropagation();
    this.openContact2Dropdown = !this.openContact2Dropdown;
    this.openCustomerDropdown = false;
    this.openContact1Dropdown = false;
    if (this.openContact2Dropdown) {
      this.contact2SearchTerm = '';
      this.filteredContact2Options = this.leadFields.find(f => f.name === 'contact2')?.options || [];
    }
  }

  filterContact2Options(event: any): void {
    const term = (event.target.value || '').toLowerCase();
    this.contact2SearchTerm = term;
    const baseOptions = this.leadFields.find(f => f.name === 'contact2')?.options || [];
    
    if (term.length >= 1) {
      this.filteredContact2Options = baseOptions.filter((opt: any) =>
        (opt.label || '').toLowerCase().includes(term)
      );
    } else {
      this.filteredContact2Options = baseOptions;
    }
  }

  selectContact2Option(value: any): void {
    this.leadForm.contact2 = value;
    this.openContact2Dropdown = false;
    this.onFieldChange({ name: 'contact2', value: value });
  }

  getContact2Label(value: any): string {
    if (!value) return '';
    const field = this.leadFields.find(f => f.name === 'contact2');
    const opt = field?.options?.find(o => o.value == value);
    return opt ? opt.label : '';
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.openCustomerDropdown = false;
    this.openContact1Dropdown = false;
    this.openContact2Dropdown = false;
    
    if (!(event.target as HTMLElement).closest('.custom-dropdown-container')) {
      this.openOppDropdown = null;
    }
  }

  toggleOppDropdown(key: string, event: Event) {
    event.stopPropagation();
    if (this.openOppDropdown === key) {
      this.openOppDropdown = null;
    } else {
      this.openOppDropdown = key;
    }
  }

  getOppFilteredOptions(field: any): any[] {
    const query = (this.oppSearchQueries[field.name] || '').toLowerCase();
    if (!query) return field.options;
    return field.options.filter((opt: any) => 
      (opt.label || '').toLowerCase().includes(query)
    );
  }

  selectOppOption(field: any, opt: any) {
    this.oppModel[field.name] = opt.value;
    this.openOppDropdown = null;
    this.oppSearchQueries[field.name] = ''; // clear search after selection
    this.onOppFieldChange({ name: field.name, value: opt.value });
  }

  getOppSelectedLabel(field: any): string {
    const value = this.oppModel[field.name];
    if (value === null || value === undefined || value === '') return '-- Select --';
    const opt = field.options.find((o: any) => String(o.value) === String(value));
    return opt ? opt.label : '-- Select --';
  }

  /* ================= VALIDATION ================= */
  validateField(field: any): string | null {
    const value = this.leadForm[field.name];
    if (field.required && (value === null || value === undefined || value === '')) {
      return `${field.label} is required`;
    }
    return null;
  }

  onSubmit(formData: any) {
    console.log('========== LEAD FORM SUBMITTED ==========');
    
    this.errors = {};
    let hasErrors = false;

    // Validate all fields
    this.leadFields.forEach(field => {
      const err = this.validateField(field);
      if (err) {
        this.errors[field.name] = err;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      return;
    }

    // Help function to get label from value in leadFields
    const getLabel = (fieldName: string, value: any) => {
      // For commented out fields like 'campaign', we need a way to find a default
      const field = this.leadFields.find(f => f.name === fieldName);
      if (field && field.options && field.options.length > 0) {
        // If not selected but options exist, use first non-empty option
        if (!value || value === '') {
           const firstRealOption = field.options.find(o => o.value !== '');
           return firstRealOption ? firstRealOption.label : '';
        }
        const option = field.options.find(o => o.value == value);
        return option ? option.label : value;
      }
      return value || '';
    };

    // Helper for contact first name
    const getContactFirstName = (contactId: any) => {
      const contact = this.contactPersonsData.find(c => (c.contactId || c.id) == contactId);
      return contact ? contact.contactFirstName : '';
    };

    // Helper for customer name
    const getCustomerName = (customerId: any) => {
      const customer = this.leadFields.find(f => f.name === 'customer')?.options?.find(o => o.value == customerId);
      return customer ? customer.label : '';
    };

    const toNullIfEmpty = (val: any) => (val === '' || val === null || val === undefined) ? null : val;
    const extractId = (val: any) => {
      if (!val || val === '0' || val === 0) return null;
      if (typeof val === 'object') return val.campaignId || val.contactId || val.id || val.value || val.contact_id || val.sourceId || val.locationId || val.categoryId || null;
      return val;
    };

    const payload: any = {
      sourceId: toNullIfEmpty(formData.source) ? Number(extractId(formData.source)) : null,
      customerId: toNullIfEmpty(formData.customer) ? Number(extractId(formData.customer)) : null,
      relationshipId: toNullIfEmpty(formData.rapportWithCustomer) ? Number(extractId(formData.rapportWithCustomer)) : null,
      contactId: toNullIfEmpty(formData.contact1) ? Number(extractId(formData.contact1)) : null,
      contact2Id: toNullIfEmpty(formData.contact2) ? Number(extractId(formData.contact2)) : null,
      purchasePotential: formData.purchasePotentialRs ? Number(formData.purchasePotentialRs) : 0,
      siteReadinessId: toNullIfEmpty(formData.siteReadiness) ? Number(extractId(formData.siteReadiness)) : null,
      siteLocationId: toNullIfEmpty(formData.siteLocation) ? Number(extractId(formData.siteLocation)) : null,
      visitRequirement: formData.visitRequirement === 'Yes',
      resourceRequirement: formData.resourceRequirement === 'Yes',
      distributorId: toNullIfEmpty(formData.distributor) ? Number(extractId(formData.distributor)) : null,
      campaignId: toNullIfEmpty(formData.campaign) ? Number(extractId(formData.campaign)) : null,
      remarks1: formData.commentLine1 || '',
      remarks2: formData.commentLine2 || '',
      assignToOthers: false,
      assignUserId: null,
      locationId: null
    };

    console.log('📦 FINAL PAYLOAD:', payload);

    if (this.isEditMode && this.leadId) {
      this.leadservice.updateLead(this.leadId, payload).subscribe({
        next: (response) => {
          this.toastService.success('Lead updated successfully!');
          this.router.navigate(['/openleads']);
        },
        error: (err) => {
          console.error('Lead update failed:', err);
          const errorMsg = err.error?.message || err.message || 'Unknown error';
          this.toastService.error('Failed to update lead: ' + errorMsg);
        }
      });
    } else {
      this.leadservice.createLead(payload).subscribe({
        next: (response) => {
          this.toastService.success('Lead created successfully!');
          this.router.navigate(['/openleads']);
        },
        error: (err) => {
          console.error('Lead creation failed:', err);
          const errorMsg = err.error?.message || err.message || err.statusText || 'Unknown error';
          this.toastService.error('Failed to create lead: ' + errorMsg);
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/sales-manager-dashboard']);
  }

  /* ================= TABS & ACTIONS ================= */
  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'Opportunities' && this.leadId) {
      this.fetchOpportunities(this.leadId!);
    }
  }

  fetchOpportunities(id: number): void {
    this.leadservice.getOpportunitiesByLeadId(id).subscribe({
      next: (data) => {
        console.log('Fetched Opportunities:', data);
        this.opportunities = data.map((opp: any) => ({
          ...opp,
          probabilityDisplay: opp.probability ? opp.probability + '%' : '0%'
        }));
      },
      error: (err) => console.error('Failed to fetch opportunities:', err)
    });
  }

  onEditOpp(row: any): void {
    console.log("Edit Opportunity clicked, row:", row);
    const oppId = row.id || row.Id || row.opportunityId || row.OpportunityId;
    if (!oppId) {
      alert("Invalid opportunity ID");
      return;
    }

    this.leadservice.getOpportunityById(oppId).subscribe({
      next: (fullOpp: any) => {
        console.log("Fetched full Opportunity data:", fullOpp);
        this.isEditOppMode = true;
        this.editOppId = oppId;
        
          // Map the full API data back to oppModel
          const extractId = (val: any) => {
            if (!val || val === '0' || val === 0) return '';
            if (typeof val === 'object') return val.contactId || val.id || val.value || val.contact_id || val.fundSourceID || val.fundSourceId || val.relationshipId || val.categoryId || val.groupId || val.productId || val.oppStatusId || val.stageId || '';
            return val;
          };

          const formatDate = (dateVal: any) => {
            if (!dateVal) return '';
            if (typeof dateVal === 'string') return dateVal;
            if (Array.isArray(dateVal) && dateVal.length >= 3) {
              const pad = (n: number) => n < 10 ? '0'+n : n;
              return `${dateVal[0]}-${pad(dateVal[1])}-${pad(dateVal[2])}`;
            }
            try { return new Date(dateVal).toISOString().split('T')[0]; } catch(e) { return ''; }
          };

        const oppProd = fullOpp.opportunityProducts && fullOpp.opportunityProducts.length > 0 ? fullOpp.opportunityProducts[0].product : null;

        this.oppModel = {
          productCategoryId: extractId(fullOpp.productCategoryId || fullOpp.ProductCategoryId || fullOpp.categoryId || fullOpp.CategoryId || (oppProd && oppProd.group ? oppProd.group.productCategoryId : null)),
          productGroupId: extractId(fullOpp.productGroupId || fullOpp.ProductGroupId || fullOpp.groupId || fullOpp.GroupId || (oppProd && oppProd.group ? oppProd.group.groupId : null)),
          productId: extractId(fullOpp.productId || fullOpp.ProductId || (oppProd ? oppProd.productId || oppProd : null)),
          quantity: fullOpp.requiredQuantity || fullOpp.oppRequiredQuantity || fullOpp.OppRequiredQuantity || fullOpp.qty || fullOpp.quantity || null,
          fundSourceId: extractId(fullOpp.fundSource || fullOpp.oppFundSourceId || fullOpp.OppFundSourceId || fullOpp.fundSourceId || fullOpp.FundSourceId),
          relationshipId: extractId(fullOpp.relationship || fullOpp.oppRelationshipId || fullOpp.OppRelationshipId || fullOpp.relationshipId || fullOpp.RelationshipId),
          expectedOrderConclusion: formatDate(fullOpp.expectedOrderConclusion || fullOpp.oppExpectedOrderConclusion),
          status: extractId(fullOpp.status || fullOpp.oppStatus || fullOpp.OppStatus || fullOpp.Status),
          expectedInvoicingDate: formatDate(fullOpp.expectedInvoicingDate || fullOpp.oppExpectedInvoicingDate),
          decisionMaker1: extractId(fullOpp.oppDecisionMaker1 || fullOpp.oppDecisionMaker1Id || fullOpp.decisionMaker1Id || fullOpp.DecisionMaker1Id || fullOpp.OppDecisionMaker1 || fullOpp.decisionMaker1 || fullOpp.DecisionMaker1 || fullOpp.contact1),
          decisionMaker2: extractId(fullOpp.oppDecisionMaker2 || fullOpp.oppDecisionMaker2Id || fullOpp.decisionMaker2Id || fullOpp.DecisionMaker2Id || fullOpp.OppDecisionMaker2 || fullOpp.decisionMaker2 || fullOpp.DecisionMaker2 || fullOpp.contact2),
          decisionMaker3: extractId(fullOpp.oppDecisionMaker3 || fullOpp.oppDecisionMaker3Id || fullOpp.decisionMaker3Id || fullOpp.DecisionMaker3Id || fullOpp.OppDecisionMaker3 || fullOpp.decisionMaker3 || fullOpp.DecisionMaker3 || fullOpp.contact3),
          decisionMaker4: extractId(fullOpp.oppDecisionMaker4 || fullOpp.oppDecisionMaker4Id || fullOpp.decisionMaker4Id || fullOpp.DecisionMaker4Id || fullOpp.OppDecisionMaker4 || fullOpp.decisionMaker4 || fullOpp.DecisionMaker4 || fullOpp.contact4),
          decisionMaker5: extractId(fullOpp.oppDecisionMaker5 || fullOpp.oppDecisionMaker5Id || fullOpp.decisionMaker5Id || fullOpp.DecisionMaker5Id || fullOpp.OppDecisionMaker5 || fullOpp.decisionMaker5 || fullOpp.DecisionMaker5 || fullOpp.contact5),
          competitors: fullOpp.oppRemarks1 || fullOpp.OppRemarks1 || fullOpp.competitors || fullOpp.Competitors || fullOpp.remarks || ''
        };

        if (this.oppModel.productCategoryId) {
          this.leadservice.getSegmentsByCategory(this.oppModel.productCategoryId).subscribe((data: any) => {
            const field = this.oppFields.find(f => f.name === 'productGroupId');
            if (field) field.options = data.map((d: any) => ({ label: d.groupName || d.GroupName, value: d.groupId || d.GroupId }));
          });
        }
        if (this.oppModel.productGroupId) {
          this.leadservice.getProductsBySegment(this.oppModel.productGroupId).subscribe((data: any) => {
            const field = this.oppFields.find(f => f.name === 'productId');
            if (field) field.options = data.map((d: any) => ({ label: d.productName || d.ProductName || 'Unnamed Product', value: d.productId || d.ProductId }));
          });
        }

        this.showOppModal = true;
      },
      error: (err) => {
        console.error("Failed to fetch opportunity details:", err);
        this.toastService.error("Failed to fetch full opportunity details.");
      }
    });
  }

  onViewOpp(row: any): void {
    console.log("View Opportunity:", row);
  }

  /* ================= OPPORTUNITY MODAL LOGIC ================= */
  loadOppDropdowns(): void {
    // Decision Makers (Contacts for this lead)
    this.leadservice.getContacts().subscribe({
      next: (data: any[]) => {
        const dmFields = ['decisionMaker1', 'decisionMaker2', 'decisionMaker3', 'decisionMaker4', 'decisionMaker5'];
        dmFields.forEach(fieldName => {
          const field = this.oppFields.find(f => f.name === fieldName);
          if (field) {
            field.options = data.map(c => ({
              label: `${c.contactFirstName || c.first_name || ''} ${c.contactLastName || c.last_name || ''}`.trim() || c.name || c.contactSalutation || 'Unknown',
              value: c.contactId || c.contact_id || c.id || c.ContactId
            }));
          }
        });
        // Force Angular to detect changes to oppFields array reference
        this.oppFields = [...this.oppFields];
      },
      error: (err) => console.error("Failed to fetch decision makers:", err)
    });

    // Product Category
    this.leadservice.getCategories().subscribe((data: any) => {
      const field = this.oppFields.find(f => f.name === 'productCategoryId');
      if (field) field.options = data.map((d: any) => ({ label: d.categoryName || d.CategoryName, value: d.categoryId || d.CategoryId }));
    });

    // Funding Source
    this.leadservice.getFunds().subscribe((data: any) => {
      const field = this.oppFields.find(f => f.name === 'fundSourceId');
      if (field) field.options = data.map((d: any) => ({ label: d.fundSourceName || d.FundSourceName, value: d.fundSourceID || d.FundSourceID }));
    });

    // Relationship
    this.leadservice.getRelationships().subscribe((data: any) => {
      const field = this.oppFields.find(f => f.name === 'relationshipId');
      if (field) field.options = data.map((d: any) => ({ label: d.relationshipName || d.RelationshipName, value: d.relationshipId || d.RelationshipId }));
    });

    // Status
    this.leadservice.getStatus().subscribe((data: any) => {
      const field = this.oppFields.find(f => f.name === 'status');
      if (field) field.options = data.map((d: any) => ({ label: d.oppName || d.OppName, value: d.oppStatusId || d.OppStatusId }));
    });
  }

  onOppFieldChange(event: any): void {
    delete this.oppErrors[event.name];
    if (event.name === 'productCategoryId') {
      const categoryId = event.value;
      if (categoryId) {
        this.leadservice.getSegmentsByCategory(categoryId).subscribe((data: any) => {
          const field = this.oppFields.find(f => f.name === 'productGroupId');
          if (field) field.options = data.map((d: any) => ({ label: d.groupName || d.GroupName, value: d.groupId || d.GroupId }));
        });
      } else {
        const field = this.oppFields.find(f => f.name === 'productGroupId');
        if (field) field.options = [];
      }
      this.oppModel.productGroupId = '';
      this.oppModel.productId = '';
      const prodField = this.oppFields.find(f => f.name === 'productId');
      if (prodField) prodField.options = [];
    }

    if (event.name === 'productGroupId') {
      const segmentId = event.value;
      if (segmentId) {
        this.leadservice.getProductsBySegment(segmentId).subscribe((data: any) => {
          const field = this.oppFields.find(f => f.name === 'productId');
          if (field) field.options = data.map((d: any) => ({ label: d.productName || d.ProductName || 'Unnamed Product', value: d.productId || d.ProductId }));
        });
      } else {
        const field = this.oppFields.find(f => f.name === 'productId');
        if (field) field.options = [];
      }
      this.oppModel.productId = '';
    }
  }

  isEditOppMode: boolean = false;
  editOppId: number | null = null;

  onAddOpportunity(): void {
    this.isEditOppMode = false;
    this.editOppId = null;
    this.oppModel = {
      productCategoryId: '',
      decisionMaker1: '',
      productGroupId: '',
      decisionMaker2: '',
      productId: '',
      decisionMaker3: '',
      quantity: null,
      decisionMaker4: '',
      fundSourceId: '',
      decisionMaker5: '',
      relationshipId: '',
      status: '',
      expectedOrderConclusion: '',
      expectedInvoicingDate: '',
      competitors: ''
    };
    this.showOppModal = true;
  }

  closeOppModal(): void {
    this.showOppModal = false;
  }

  oppErrors: any = {};

  onSubmitOpp(formData: any): void {
    let isValid = true;
    this.oppErrors = {};
    let firstInvalidField: string | null = null;

    this.oppFields.forEach(field => {
      let val = this.oppModel[field.name];
      if (typeof val === 'string') val = val.trim();
      
      const isSelectEmpty = field.type === 'select' && (val === 0 || val === '0' || val === 'null' || val === 'undefined');
      
      if (field.required && (val === '' || val === null || val === undefined || isSelectEmpty)) {
        this.oppErrors[field.name] = `${field.label} is required`;
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = field.name;
        }
      }
    });

    if (!isValid) {
      this.toastService.error("Please fill all required fields.");
      
      if (firstInvalidField) {
        setTimeout(() => {
          const element = document.getElementById(firstInvalidField!);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
              element.focus();
            }
          }
        }, 100);
      }
      return;
    }

    if (!this.leadId) {
      this.toastService.error("Lead ID is missing. Cannot add opportunity.");
      return;
    }

    const toNullIfEmpty = (val: any) => (val === '' || val === null || val === undefined) ? null : val;

    const payload = {
      leadId: this.leadId,
      productId: this.oppModel.productId ? Number(this.oppModel.productId) : null,
      status: toNullIfEmpty(this.oppModel.status) ? Number(toNullIfEmpty(this.oppModel.status)) : null,
      requiredQuantity: this.oppModel.quantity ? Number(this.oppModel.quantity) : null,
      fundSourceId: toNullIfEmpty(this.oppModel.fundSourceId) ? Number(toNullIfEmpty(this.oppModel.fundSourceId)) : null,
      fundingStatus: null,
      expectedOrderConclusion: this.oppModel.expectedOrderConclusion,
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
      competitorIds: [],
      remarks1: this.oppModel.competitors || null,
      remarks2: null
    };

    console.log("?? SENDING OPPORTUNITY PAYLOAD TO BACKEND:", payload);

    if (this.isEditOppMode && this.editOppId) {
      this.leadservice.updateOpportunity(this.editOppId, payload).subscribe({
        next: (res) => {
          this.toastService.success('Opportunity updated successfully!');
          this.closeOppModal();
          this.fetchOpportunities(this.leadId!); // Refresh table
        },
        error: (err) => {
          console.error('Error updating opportunity:', err);
          const errorMessage = err.error ? (typeof err.error === 'string' ? err.error : err.error.message || JSON.stringify(err.error)) : 'Unknown error';
          this.toastService.error(`Failed to update Opportunity: ${errorMessage}`);
        }
      });
    } else {
      this.leadservice.createOpportunity(this.leadId, payload).subscribe({
        next: (res) => {
          this.toastService.success('Opportunity created successfully!');
          this.closeOppModal();
          this.fetchOpportunities(this.leadId!); // Refresh table
        },
        error: (err) => {
          console.error('Error saving opportunity:', err);
          const errorMessage = err.error ? (typeof err.error === 'string' ? err.error : err.error.message || JSON.stringify(err.error)) : 'Unknown error';
          this.toastService.error(`Failed to save Opportunity: ${errorMessage}`);
        }
      });
    }
  }

  onDetails(): void {
    console.log('Details button clicked for Lead ID:', this.leadId);
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
  }

  onDropLead(): void {
    this.confirmService.confirm({
      title: 'Confirm Drop',
      message: 'Are you sure you want to drop this lead?'
    }).then((confirmed) => {
      if (confirmed) {
        if (this.leadId && this.leadForm) {
          
          // Helper to get labels
          const getLabel = (fieldName: string, value: any) => {
            const field = this.leadFields.find(f => f.name === fieldName);
            if (field && field.options) {
               if (!value || value === '') {
                  const firstRealOption = field.options.find(o => o.value !== '');
                  return firstRealOption ? firstRealOption.label : '';
               }
               const option = field.options.find(o => o.value == value);
               return option ? option.label : value;
            }
            return value || '';
          };

          const getContactFirstName = (contactId: any) => {
            const contact = this.contactPersonsData.find(c => (c.contactId || c.id) == contactId);
            return contact ? contact.contactFirstName : '';
          };

          const getCustomerName = (customerId: any) => {
            const customer = this.leadFields.find(f => f.name === 'customer')?.options?.find(o => o.value == customerId);
            return customer ? customer.label : '';
          };

          const payload: LeadPayload = {
            customerId: Number(this.leadForm.customer),
            contactId: Number(this.leadForm.contact1),
            contact2Id: this.leadForm.contact2 ? Number(this.leadForm.contact2) : null,
            customerName: getCustomerName(this.leadForm.customer),
            contactFirstName: getContactFirstName(this.leadForm.contact1),
            sourceName: getLabel('source', this.leadForm.source),
            campaignName: getLabel('campaign', (this.leadForm as any).campaign),
            siteReadinessName: getLabel('siteReadiness', this.leadForm.siteReadiness),
            distributorName: getLabel('distributor', this.leadForm.distributor),
            relationshipName: getLabel('rapportWithCustomer', this.leadForm.rapportWithCustomer),
            username: this.getUsernameFromToken(),
            leadPurchasePotential: Number(this.leadForm.purchasePotentialRs) || 0,
            leadVisitRequirement: this.leadForm.visitRequirement === 'Yes' ? 1 : 0,
            leadResourceRequirement: this.leadForm.resourceRequirement === 'Yes' ? 1 : 0,
            leadCmdLine1: this.leadForm.commentLine1 || '',
            leadCmdLine2: this.leadForm.commentLine2 || '',
            leadCmdLine3: this.leadForm.purchasePotential || '',
            leadStatus: 3 // 3 represents Dropped
          };

          this.leadservice.updateLead(this.leadId, payload).subscribe({
            next: () => {
              alert('Lead has been dropped successfully.');
              this.router.navigate(['/salesmanager/closed-leads']);
            },
            error: (err) => {
              console.error('Failed to drop lead:', err);
              alert('Failed to drop lead.');
            }
          });
        }
      }
    });
  }

  onAddCustomer() {
    this.router.navigate(['/salesmanager/customer/add']);
  }

  onAddContact() {
    this.router.navigate(['/salesmanager/contact/add']);
  }

  onCustomerDetails(customerId: any): void {
    console.log('Customer details clicked for customer ID:', customerId);
    if (!customerId) {
      alert('No customer selected');
      return;
    }

    this.customerService.getCustomerById(Number(customerId)).subscribe({
      next: (customer) => {
        this.selectedCustomer = customer;
        this.showCustomerDetailsModal = true;
        console.log('Opening Customer Details Modal for:', customer);
      },
      error: (err) => {
        console.error('Failed to load customer details:', err);
        alert('Failed to load customer details from server.');
      }
    });
  }

  onCustomerAction2(customerId: any): void {
    console.log('Customer action 2 clicked for customer ID:', customerId);
    if (!customerId) {
      alert('No customer selected');
      return;
    }
    
    this.customerService.getInstallationBase(Number(customerId)).subscribe({
      next: (records: any[]) => {
        this.installationBaseDetails = records;
        this.showInstallationBaseDetailsModal = true;
        console.log('Loaded customer installation base from backend:', this.installationBaseDetails);
      },
      error: (err) => {
        console.error('Failed to load customer installation base details from backend:', err);
        this.installationBaseDetails = [];
        this.showInstallationBaseDetailsModal = true;
      }
    });
  }

  closeInstallationBaseDetailsModal(): void {
    this.showInstallationBaseDetailsModal = false;
    this.installationBaseDetails = [];
  }

  closeCustomerDetailsModal(): void {
    this.showCustomerDetailsModal = false;
    this.selectedCustomer = null;
  }

  formatCustomerValue(val: any): string {
    if (val === null || val === undefined || val === 0 || val === '0' || val === 'null' || val === 'NULL') {
      return '';
    }
    return String(val).trim();
  }

  onQuoteRevisionInfo(row: any) {
    this.showRevisionHistoryModal = true;
  }

  onQuoteRevisionAdd(row: any) {
    const id = row.quoteId || row.id || this.leadId || '31';
    this.router.navigate(['/quoteRevision', id]);
  }

  /* ================= QUOTE METHODS ================= */
  loadQuotes(): void {
    if (this.leadId) {
      this.leadservice.getQuotesByLead(this.leadId).subscribe({
        next: (data) => {
          this.quotes = data || [];
        },
        error: (err) => console.error('Failed to load quotes:', err)
      });
    }
  }

  onDownloadQuote(quoteId: string | number): void {
    this.leadservice.downloadQuotePdf(quoteId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Quote_${quoteId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Failed to download quote PDF:', err)
    });
  }

  onViewQuote(quoteId: string | number): void {
    this.leadservice.downloadQuotePdf(quoteId).subscribe({
      next: (blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: (err) => console.error('Failed to view quote PDF:', err)
    });
  }

  openAddQuoteModal(): void {
    this.showAddQuoteModal = true;
    this.quoteForm = { opportunityId: '', billingInfoId: '', dealerCommission: '', companyId: '', dealerId: '' };
    
    if (this.leadId) {
      console.log('openAddQuoteModal: fetching opportunities for leadId:', this.leadId);
      this.leadservice.getOpportunitiesByLeadId(this.leadId).subscribe({
        next: (data) => {
          console.log('openAddQuoteModal: fetched opportunities:', data);
          this.quoteOpportunities = data || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load opportunities for quote:', err)
      });

      this.leadservice.getBillingOptions().subscribe({
        next: (data) => {
          this.quoteBillingOptions = data || [];
        },
        error: (err) => console.error('Failed to load billing options:', err)
      });

      this.leadservice.getCompanyOptions().subscribe({
        next: (data) => {
          this.quoteCompanyOptions = data ? data.map((c: any) => ({ id: c.companyId, name: c.companyName })) : [];
        },
        error: (err) => console.error('Failed to load company options:', err)
      });

      this.leadservice.getDealers().subscribe({
        next: (data) => {
          this.quoteDealerOptions = data || [];
        },
        error: (err) => console.error('Failed to load dealer options:', err)
      });
    }
  }

  submitQuote(): void {
    if (!this.quoteForm.opportunityId || !this.quoteForm.billingInfoId || !this.quoteForm.companyId) {
      this.toastService.error('Please fill required fields (Opportunity, Billing Name, Billing Through)');
      return;
    }
    
    const payload = {
      opportunityIds: [Number(this.quoteForm.opportunityId)],
      billingInfoId: Number(this.quoteForm.billingInfoId),
      dealerCommission: this.quoteForm.dealerCommission ? Number(this.quoteForm.dealerCommission) : 0,
      dealerId: Number(this.quoteForm.dealerId),
      companyId: Number(this.quoteForm.companyId)
    };

    this.leadservice.saveQuote(payload).subscribe({
      next: (res) => {
        this.toastService.success('Quote saved successfully!');
        this.showAddQuoteModal = false;
        this.loadQuotes();
      },
      error: (err) => {
        console.error('Failed to save quote:', err);
        this.toastService.error('Failed to save quote');
      }
    });
  }
}
