import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Shared components
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Header } from '../../../../layout/header/header';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';
import { ModalComponent } from '../../../../shared/modal/modal';

// Services
import { Leadservice } from '../../../../service/leadservice';
import { AuthService } from '../../../../service/auth-service';
import { Customerservice } from '../../../../service/customerservice';
import { LeadPayload } from '../../../../models/lead-model';

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
  imports: [CommonModule, FormsModule, Sidebar, Header, Pageheader, Form, ModalComponent],
  templateUrl: './addlead.html'
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
  
  tabs = ['Lead Details', 'Opportunities', 'Quote', 'Contract Note'];

  /* ================= DROPDOWN DATA ================= */
  customersData: any[] = [];
  contactPersonsData: any[] = [];
  filteredContactPersons: any[] = [];

  leadForm = {
    source: '',
    // campaign: '', // Commented out
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
    /* {
      name: 'campaign',
      label: 'Campaign',
      type: 'select',
      required: true,
      options: []
    }, */
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private leadservice: Leadservice,
    private auth: AuthService,
    private customerService: Customerservice
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
      }
    });

    this.loadDropdowns();
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
      next: (data) => this.setFieldOptions('source', data, 'sourceName'),
      error: (err) => console.error('Failed to load lead sources:', err)
    });

    // 2. Customer
    this.leadservice.getCustomers().subscribe({
      next: (data) => {
        this.customersData = data;
        this.setFieldOptions('customer', data, 'customerName', 'customerId');
      },
      error: (err) => console.error('Failed to load customers:', err)
    });

    // 3. Rapport (Relationship)
    this.leadservice.getRelationships().subscribe({
      next: (data) => this.setFieldOptions('rapportWithCustomer', data, 'relationshipName'),
      error: (err) => console.error('Failed to load rapport:', err)
    });

    // 4. Site Readiness
    this.leadservice.getSiteReadiness().subscribe({
      next: (data) => this.setFieldOptions('siteReadiness', data, 'siteReadinessName'),
      error: (err) => console.error('Failed to load site readiness:', err)
    });

    // 5. Distributors
    this.leadservice.getDistributors().subscribe({
      next: (data) => this.setFieldOptions('distributor', data, 'distributorName'),
      error: (err) => console.error('Failed to load distributors:', err)
    });

    // 6. Contact Persons
    this.leadservice.getContacts().subscribe({
      next: (data) => {
        this.contactPersonsData = data;
        this.updateContactOptions('contact1', data);
        this.updateContactOptions('contact2', data);
      },
      error: (err) => console.error('Failed to load contacts:', err)
    });

    // 7. Campaigns (Silent load for background default)
    this.leadservice.getCampaigns().subscribe({
      next: (data) => this.setFieldOptions('campaign', data, 'campaignName'),
      error: (err) => console.warn('Failed to load campaigns:', err)
    });
  }

  private loadLeadData(id: number): void {
    this.leadservice.getLeadById(id).subscribe({
      next: (data: LeadPayload) => {
        console.log('Loaded Lead Data:', data);
        this.originalLeadData = data;
        
        // Auto-detect closed/dropped leads and force read-only
        if (data.leadStatus === 2 || data.leadStatus === 3) {
          this.isReadOnly = true;
          this.breadcrumbs = [
            { label: 'Home', route: '/sales-manager-dashboard' },
            { label: 'Closed Leads', route: '/salesmanager/closed-leads' },
            { label: 'Lead ID - ' + this.leadId }
          ];
        }

        this.leadForm = {
          source: data.sourceName || '',
          customer: data.customerId || '',
          rapportWithCustomer: data.relationshipName || '',
          contact1: data.contactId || '',
          contact2: data.contact2Id || '',
          purchasePotentialRs: data.leadPurchasePotential ? data.leadPurchasePotential.toString() : '',
          purchasePotential: data.leadCmdLine3 || '',
          siteReadiness: data.siteReadinessName || '',
          visitRequirement: data.leadVisitRequirement === 1 ? 'Yes' : 'No',
          resourceRequirement: data.leadResourceRequirement === 1 ? 'Yes' : 'No',
          distributor: data.distributorName || '',
          commentLine1: data.leadCmdLine1 || '',
          commentLine2: data.leadCmdLine2 || ''
        };
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
      { label: '-- Select --', value: '' },
      ...data.map((item: any) => {
        if (typeof item === 'string') return { label: item, value: item };
        const label = item[labelKey] || item.name || 'Unknown';
        const value = (valueKey && item[valueKey]) || item.id || label;
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
        { label: '-- Select --', value: '' },
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
    if (event.name === 'customer') {
      // Future filter logic can go here
    }
  }

  onSubmit(formData: any) {
    console.log('========== LEAD FORM SUBMITTED ==========');
    
    // Removed formData.campaign from mandatory check
    if (!formData.source || !formData.customer || !formData.contact1) {
      alert('Please fill in all required fields (Source, Customer, Contact)');
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

    const payload: LeadPayload = {
      customerId: Number(formData.customer),
      contactId: Number(formData.contact1),
      contact2Id: formData.contact2 ? Number(formData.contact2) : null,
      customerName: getCustomerName(formData.customer),
      contactFirstName: getContactFirstName(formData.contact1),
      sourceName: getLabel('source', formData.source),
      campaignName: getLabel('campaign', formData.campaign),
      siteReadinessName: getLabel('siteReadiness', formData.siteReadiness),
      distributorName: getLabel('distributor', formData.distributor),
      relationshipName: getLabel('rapportWithCustomer', formData.rapportWithCustomer),
      username: this.getUsernameFromToken(),
      leadPurchasePotential: Number(formData.purchasePotentialRs) || 0,
      leadVisitRequirement: formData.visitRequirement === 'Yes' ? 1 : 0,
      leadResourceRequirement: formData.resourceRequirement === 'Yes' ? 1 : 0,
      leadCmdLine1: formData.commentLine1 || '',
      leadCmdLine2: formData.commentLine2 || '',
      leadCmdLine3: formData.purchasePotential || '',
      leadStatus: 1,
      leadId: this.leadId || undefined
    };

    console.log('📦 FINAL PAYLOAD:', payload);

    if (this.isEditMode && this.leadId) {
      this.leadservice.updateLead(this.leadId, payload).subscribe({
        next: (response) => {
          alert('Lead updated successfully!');
          this.router.navigate(['/openleads']);
        },
        error: (err) => {
          console.error('Lead update failed:', err);
          const errorMsg = err.error?.message || err.message || 'Unknown error';
          alert('Failed to update lead: ' + errorMsg);
        }
      });
    } else {
      this.leadservice.createLead(payload).subscribe({
        next: (response) => {
          alert('Lead created successfully!');
          this.router.navigate(['/openleads']);
        },
        error: (err) => {
          console.error('Lead creation failed:', err);
          const errorMsg = err.error?.message || err.message || err.statusText || 'Unknown error';
          alert('Failed to create lead: ' + errorMsg);
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
      this.fetchOpportunities(this.leadId);
    }
  }

  fetchOpportunities(id: number): void {
    this.leadservice.getOpportunitiesByLeadId(id).subscribe({
      next: (data) => {
        console.log('Fetched Opportunities:', data);
        this.opportunities = data;
      },
      error: (err) => console.error('Failed to fetch opportunities:', err)
    });
  }

  onAddOpportunity(): void {
    console.log('Navigating to Add Opportunity for Lead:', this.leadId);
    // Future: this.router.navigate(['/salesmanager/opportunity/add'], { queryParams: { leadId: this.leadId } });
    alert('Add Opportunity functionality will be implemented in the next step.');
  }

  onDetails(): void {
    console.log('Details button clicked for Lead ID:', this.leadId);
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
  }

  onDropLead(): void {
    if (confirm('Are you sure you want to drop this lead?')) {
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
    
    // Find the customer details in our pre-loaded customersData
    const customer = this.customersData.find(c => (c.customerId || c.id) == customerId);
    if (customer) {
      this.selectedCustomer = customer;
      this.showCustomerDetailsModal = true;
      console.log('Opening Customer Details Modal for:', customer);
    } else {
      alert('Customer details not found locally');
    }
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
        console.log('Loaded customer installation base for details popup:', this.installationBaseDetails);
      },
      error: (err) => {
        console.error('Failed to load customer installation base details:', err);
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
}
