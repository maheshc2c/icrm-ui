import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Form } from '../../../shared/form/form';
import { SalesDirectorService } from '../../../service/sales-director.service';
import { AuthService } from '../../../service/auth-service';
import { LeadPayload } from '../../../models/lead-model';
import { Leadservice } from '../../../service/leadservice';

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
  imports: [CommonModule, FormsModule, Sidebar, Header, Pageheader, Form],
  templateUrl: './new.html',
  styleUrls: ['./new.css']
})
export class New implements OnInit {

  breadcrumbs = [
    { label: 'Home', route: '/sddashboard' },
    { label: 'Lead' }
  ];

  isEditMode = false;
  leadId: number | null = null;

  /* ================= DROPDOWN DATA ================= */
  customersData: any[] = [];
  contactPersonsData: any[] = [];
  filteredContactPersons: any[] = [];
  campaignsData: any[] = [];
  defaultCampaignName = '';

  leadForm = {
    source: '',
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
    private leadservice: SalesDirectorService,
    private auth: AuthService
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
      }
    });

    this.loadDropdowns();
  }

  /* ================= GET USERNAME FROM TOKEN ================= */
  private getUsernameFromToken(): string {
    const token = this.auth.getToken();
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

    this.leadservice.getSources().subscribe({
      next: (data: any) => this.setFieldOptions('source', data, 'sourceName'),
      error: (err: any) => console.error('Failed to load lead sources:', err)
    });

    this.leadservice.getCustomers().subscribe({
      next: (data: any) => {
        this.customersData = data || [];
        this.setFieldOptions('customer', this.customersData, 'customerName', 'customerId');
      },
      error: (err: any) => console.error('Failed to load customers:', err)
    });

    this.leadservice.getRelationships().subscribe({
      next: (data: any) => this.setFieldOptions('rapportWithCustomer', data, 'relationshipName'),
      error: (err: any) => console.error('Failed to load rapport:', err)
    });

    this.leadservice.getSiteReadiness().subscribe({
      next: (data: any) => this.setFieldOptions('siteReadiness', data, 'siteReadinessName'),
      error: (err: any) => console.error('Failed to load site readiness:', err)
    });

    this.leadservice.getDistributors().subscribe({
      next: (data: any) => this.setFieldOptions('distributor', data, 'distributorName'),
      error: (err: any) => console.error('Failed to load distributors:', err)
    });

    this.leadservice.getContacts().subscribe({
      next: (data: any) => {
        this.contactPersonsData = data || [];
        this.updateContactOptions('contact1', this.contactPersonsData);
        this.updateContactOptions('contact2', this.contactPersonsData);
      },
      error: (err: any) => console.error('Failed to load contacts:', err)
    });

    this.leadservice.getCampaigns().subscribe({
      next: (data: any) => {
        this.campaignsData = data || [];
        this.defaultCampaignName = this.campaignsData.length > 0
          ? (this.campaignsData[0].campaignName || '').trim()
          : '';

        if (this.isEditMode && this.leadId) {
          this.loadLeadData(this.leadId);
        }
      },
      error: (err: any) => {
        console.warn('Failed to load campaigns:', err);
        this.defaultCampaignName = '';

        if (this.isEditMode && this.leadId) {
          this.loadLeadData(this.leadId);
        }
      }
    });
  }

  private loadLeadData(id: number): void {
    this.leadservice.getLeadById(id).subscribe({
      next: (data: LeadPayload) => {
        console.log('Loaded Lead Data:', data);

        this.leadForm = {
          source: data.sourceName || '',
          customer: data.customerId || '',
          rapportWithCustomer: data.relationshipName || '',
          contact1: data.contactId ? data.contactId.toString() : '',
          contact2: data.contact2Id ? data.contact2Id.toString() : '',
          purchasePotentialRs: data.leadPurchasePotential ? data.leadPurchasePotential.toString() : '',
          purchasePotential: data.leadCmdLine3 || '',
          siteReadiness: data.siteReadinessName || '',
          visitRequirement: data.leadVisitRequirement === 1 ? 'Yes' : 'No',
          resourceRequirement: data.leadResourceRequirement === 1 ? 'Yes' : 'No',
          distributor: data.distributorName || '',
          commentLine1: data.leadCmdLine1 || '',
          commentLine2: data.leadCmdLine2 || ''
        };

        this.leadFields = [...this.leadFields];
      },
      error: (err: any) => console.error('Failed to load lead details:', err)
    });
  }

  /* ================= GENERIC OPTION SETTER ================= */
  private setFieldOptions(fieldName: string, data: any[], labelKey: string, valueKey?: string): void {
    const field = this.leadFields.find(f => f.name === fieldName);
    if (!field) return;

    field.options = [
      { label: '-- Select --', value: '' },
      ...data.map((item: any) => {
        if (typeof item === 'string') {
          return { label: item, value: item };
        }
        const label = item[labelKey] || item.name || 'Unknown';
        const value = (valueKey && item[valueKey]) || item.id || label;
        return { label, value };
      })
    ];

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
  onFieldChange(event: { fieldName: string, value: any }): void {
    if (event.fieldName === 'customer') {
      // Future filter logic can go here
    }
  }

  onSubmit(formData: any) {
    console.log('========== LEAD FORM SUBMITTED ==========');

    if (!formData.source || !formData.customer || !formData.contact1) {
      alert('Please fill in all required fields (Source, Customer, Contact)');
      return;
    }

    const safe = (v: any) => (v ?? '').toString().trim();

    const getLabel = (fieldName: string, value: any) => {
      const field = this.leadFields.find(f => f.name === fieldName);
      if (field && field.options && field.options.length > 0) {
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
      customerId: Number(formData.customer),
      contactId: Number(formData.contact1),
      contact2Id: formData.contact2 ? Number(formData.contact2) : null,
      customerName: safe(getCustomerName(formData.customer)),
      contactFirstName: safe(getContactFirstName(formData.contact1)),
      sourceName: safe(getLabel('source', formData.source)),
      campaignName: safe(this.defaultCampaignName || ''),
      siteReadinessName: safe(getLabel('siteReadiness', formData.siteReadiness)),
      distributorName: safe(getLabel('distributor', formData.distributor)),
      relationshipName: safe(getLabel('rapportWithCustomer', formData.rapportWithCustomer)),
      username: safe(this.getUsernameFromToken()),
      leadPurchasePotential: Number(formData.purchasePotentialRs) || 0,
      leadVisitRequirement: formData.visitRequirement === 'Yes' ? 1 : 0,
      leadResourceRequirement: formData.resourceRequirement === 'Yes' ? 1 : 0,
      leadCmdLine1: safe(formData.commentLine1),
      leadCmdLine2: safe(formData.commentLine2),
      leadCmdLine3: safe(formData.purchasePotential),
      leadStatus: 1
    };

    console.log('📦 FINAL PAYLOAD:', payload);

    if (this.isEditMode && this.leadId) {
      this.leadservice.updateLead(this.leadId, payload).subscribe({
        next: (response: any) => {
          alert('Lead updated successfully!');
          this.router.navigate(['/sddashboard']);
        },
        error: (err: any) => {
          console.error('Lead update failed:', err);
          alert('Failed to update lead.');
        }
      });
    } else {
      this.leadservice.createLead(payload).subscribe({
        next: (response: any) => {
          alert('Lead created successfully!');
          this.router.navigate(['/sddashboard']);
        },
        error: (err: any) => {
          console.error('Lead creation failed:', err);
          alert('Failed to create lead. Please check the console.');
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/sddashboard']);
  }

  onAddCustomer() {
    this.router.navigate(['/salesdirector/addleads/addcustomer']);
  }

  onAddContact() {
    this.router.navigate(['/salesdirector/addleads/addcontact']);
  }
}