import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';
import { Search } from '../../../../shared/search/search';

import { Breadcrumb } from '../../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../../shared/search/search';

type LeadStage = 'Lead' | 'Approved' | 'Opportunity' | 'Quote' | 'C Note';
type UxModalType = 'timeline' | 'reroute' | 'drop' | 'customerDetails' | 'installationBase' | 'opportunityDetails' | 'quoteRevisions' | null;

interface OpenLeadRow {
  leadId: string;
  customer: string;
  contactPerson: string;
  owner: string;
  campaign?: string;
  /** ISO date (yyyy-mm-dd) */
  date?: string;
  /** HTML for Status column */
  status: string;
  /** Plain text used for filtering */
  statusText: string;
}

@Component({
  selector: 'app-open-leads',
  imports: [CommonModule, HttpClientModule, Header, Sidebar, Pageheader, Form, Search, FormsModule],
  templateUrl: './open-leads.html',
  styleUrl: './open-leads.css',
})
export class OpenLeads implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) {}

  activeTab: 'leadDetails' | 'opportunities' | 'quote' | 'contractNote' = 'leadDetails';

  opportunities = [
    {
      id: 6,
      product: '4545 (sap suppror test12)',
      quantity: 1,
      stage: 'Closed Won',
      category: '',
      probability: 100,
    },
    {
      id: 7,
      product: '4545 (sap suppror test12)',
      quantity: 1,
      stage: 'closure',
      category: 'Hot',
      probability: 74,
    },
  ];

  quoteCustomerName = 'BEML';
  quotes = [
    {
      quoteId: 'KAR-25-4-Rev-2',
      opportunityDetails: '4545 - sap suppror test12 (Qty -1)',
      discount: '4%',
      currentStage: 'NSM',
      status: 'Quote Approved',
      finalApprover: 'NSM',
      revisionKey: 'KAR-25-4',
    },
    {
      quoteId: 'KAR-25-3-Rev-1',
      opportunityDetails: '4545 - sap suppror test12 (Qty -1)',
      discount: '0%',
      currentStage: '',
      status: 'Converted to Contract Note',
      finalApprover: '',
      revisionKey: 'KAR-25-3',
    },
  ];

  contractNotes = [
    {
      cNoteId: 3,
      quoteRefId: 'KAR-25-3-Rev-1',
      billing: 'Company',
      discount: '0%',
      poNumber: 'Sample PO number',
      poDate: '2024-10-17',
      soNumber: 'Sample 454545',
      stage: 'Completed',
    },
  ];

  headerTitle = 'Open Leads';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/adminmarketingdashboard' },
    { label: 'Open Leads' }
  ];

  rows: OpenLeadRow[] = [
    this.makeRow({
      leadId: '35',
      customer: 'C2C Advanced Systems (Chittoor)',
      contactPerson: 'Test - Test (91-9988997700)',
      owner: 'Country Head - C2CAS202 (Country Head)',
      campaign: 'Campaign A',
      date: '2026-02-01',
      completedUpto: 'Approved',
    }),
    this.makeRow({
      leadId: '34',
      customer: 'C2C Advanced Systems (Chittoor)',
      contactPerson: 'Test - Test (91-9988997700)',
      owner: 'NSM - C2CAS209 (National Sales Manager)',
      campaign: 'Campaign A',
      date: '2026-02-02',
      completedUpto: 'Approved',
    }),
    this.makeRow({
      leadId: '31',
      customer: 'Larson & Toubro Limited (Bangalore)',
      contactPerson: 'Ameen LSS - Test (91-9538905212)',
      owner: 'Country Head - C2CAS202 (Country Head)',
      campaign: 'Campaign B',
      date: '2026-02-03',
      completedUpto: 'Approved',
    }),
    this.makeRow({
      leadId: '23',
      customer: 'Test1 (Bangalore)',
      contactPerson: 'sam k - Test (91-6666666666)',
      owner: 'Arun B S - C2CAS110 (Sales Manager)',
      campaign: 'Campaign B',
      date: '2026-02-05',
      completedUpto: 'Approved',
    }),
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'leadId', label: 'Lead ID', placeholder: 'Lead ID', type: 'text' },
    { key: 'customer', label: 'Customer', placeholder: 'Select Customer', type: 'select', options: [] },
    { key: 'owner', label: 'Owner', placeholder: 'Select Owner', type: 'select', options: [] },
    { key: 'statusText', label: 'Status', placeholder: 'Select Status', type: 'select', options: [] },
    { key: 'campaign', label: 'Campaign', placeholder: 'Select campaign', type: 'select', options: [] },
    { key: 'fromDate', label: 'Start Date', type: 'date' },
    { key: 'toDate', label: 'End Date', type: 'date' },
  ];

  showModal = false;
  selected: any;

  uxModal: UxModalType | null = null;
  uxModalData: any = null;
  rerouteToUser: string = '';

  ngOnInit(): void {
    this.setSearchSelectOptions();

    const leadId = this.route.snapshot.queryParamMap.get('leadId') || '';
    if (leadId) {
      // Match the UI/UX breadcrumb format: "Lead ID - X"
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/adminmarketingdashboard' },
        { label: 'Track Leads', route: '/adminmarketing/track-leads' },
        { label: 'Open Leads', route: '/adminmarketing/open-leads' },
        { label: `Lead ID - ${leadId}` },
      ];

      // Prefill form from selected row (mock fallback)
      const row = (this.rows || []).find((r) => String(r.leadId) === String(leadId));
      if (row) {
        this.leadDetailsModel = {
          ...this.leadDetailsModel,
          campaign: row.campaign ? `${row.campaign}${row.date ? ` (${row.date})` : ''}` : (row.date ?? ''),
          customer: row.customer,
          contactPerson1: row.contactPerson,
        };
      }
    }
  }

  private makeRow(input: Omit<OpenLeadRow, 'status' | 'statusText'> & { completedUpto: LeadStage }): OpenLeadRow {
    const status = this.buildStatusHtml(input.completedUpto);
    const statusText = this.extractTextFromHtml(status);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { completedUpto, ...rest } = input as any;
    return {
      ...(rest as Omit<OpenLeadRow, 'status' | 'statusText'>),
      status,
      statusText,
    };
  }

  private buildStatusHtml(completedUpto: LeadStage): string {
    const stages: LeadStage[] = ['Lead', 'Approved', 'Opportunity', 'Quote', 'C Note'];
    const completedIdx = Math.max(0, stages.indexOf(completedUpto));
    const widths = ['19%', '19%', '19%', '19%', '20%'];

    const segments = stages
      .map((s, idx) => {
        const cls = idx <= completedIdx ? 'status-complete' : 'status-pending';
        return `<div class="progress-segment ${cls}" style="width: ${widths[idx]};">${s}</div>`;
      })
      .join('<div class="progress-segment status-divider" style="width: 1%;"></div>');

    return `<div class="status-progress-wrapper">${segments}</div>`;
  }

  private setSearchSelectOptions(): void {
    const customers = this.uniqueValues(this.rows, 'customer');
    const owners = this.uniqueValues(this.rows, 'owner');
    const statuses = this.uniqueValues(this.rows, 'statusText');
    const campaigns = this.uniqueValues(this.rows, 'campaign');

    this.setFieldOptions('customer', [
      { label: 'Select Customer', value: '' },
      ...customers.map((v) => ({ label: v, value: v })),
    ]);

    this.setFieldOptions('owner', [
      { label: 'Select Owner', value: '' },
      ...owners.map((v) => ({ label: v, value: v })),
    ]);

    this.setFieldOptions('statusText', [
      { label: 'Select Status', value: '' },
      ...statuses.map((v) => ({ label: v, value: v })),
    ]);

    this.setFieldOptions('campaign', [
      { label: 'Select campaign', value: '' },
      ...campaigns.map((v) => ({ label: v, value: v })),
    ]);
  }

  private setFieldOptions(key: string, options: { label: string; value: any }[]): void {
    const f = this.searchFields.find((x) => x?.key === key);
    if (f) f.options = options;
  }

  private uniqueValues(rows: OpenLeadRow[], key: keyof OpenLeadRow): string[] {
    const set = new Set<string>();
    for (const r of rows || []) {
      const v = (r?.[key] ?? '').toString().trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  private extractTextFromHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ====== FORM CONFIG (Lead Details) ======
  leadDetailsModel: any = {
    source: '2',
    campaign: 'Offlinetest (2025-09-17)',
    customer: 'test now (Ziro)',
    contactPerson1: 'test now k - Test (91-6666666666)',
    contactPerson2: '',
    contactPerson3: '',
    remarks1: 'dfzxdg',
    remarks2: 'dzxd',
  };

  leadDetailsFields: any[] = [
    {
      name: 'source',
      label: 'Source of Lead',
      type: 'select',
      required: true,
      disabled: true,
      options: [
        { label: 'Select Source of Lead', value: '' },
        { label: 'Visit', value: '1' },
        { label: 'Marketing Campaign', value: '2' },
        { label: 'Referral', value: '3' },
        { label: 'Telephonic', value: '4' },
      ],
    },
    {
      name: 'campaign',
      label: 'Campaign',
      type: 'text',
      required: true,
      placeholder: 'Campaign',
      disabled: true,
    },
    {
      name: 'customer',
      label: 'Customer',
      type: 'text',
      required: true,
      placeholder: 'Customer',
      disabled: true,
      actions: [
        { key: 'customerDetails', label: 'ℹ️', title: 'Customer Details' },
        { key: 'installationBase', label: '📚', title: 'Installation Base' },
      ],
    },
    {
      name: 'contactPerson1',
      label: 'Contact Person 1',
      type: 'text',
      required: true,
      placeholder: 'Contact Person 1',
      disabled: true,
    },
    {
      name: 'contactPerson2',
      label: 'Contact Person 2',
      type: 'text',
      required: false,
      placeholder: 'Contact Person 2',
      disabled: true,
    },
    {
      name: 'contactPerson3',
      label: 'Contact Person 3',
      type: 'text',
      required: false,
      placeholder: 'Contact Person 3',
      disabled: true,
    },
    {
      name: 'remarks1',
      label: 'Remarks1',
      type: 'textarea',
      required: false,
      placeholder: 'Remarks1',
    },
    {
      name: 'remarks2',
      label: 'Remarks2',
      type: 'textarea',
      required: false,
      placeholder: 'Remarks2',
    },
  ];

  showTab(tab: 'leadDetails' | 'opportunities' | 'quote' | 'contractNote'): void {
    this.activeTab = tab;
  }

  onLeadHeaderAction(event: any): void {
    const key = event?.key || event;
    if (key === 'showDetails') this.uxModal = 'timeline';
    if (key === 'rerouteLead') this.uxModal = 'reroute';
    if (key === 'dropLead') this.uxModal = 'drop';
  }

  openOpportunityInfo(row: any): void {
    this.uxModal = 'opportunityDetails';
    this.uxModalData = row;
  }

  openRevisions(event: any): void {
    this.uxModal = 'quoteRevisions';
    this.uxModalData = { revisionKey: event };
  }

  onQuoteAction(event: any): void {
    console.log('[OpenLeads] quote action', event);
  }

  downloadContractNote(row: any): void {
    console.log('[OpenLeads] contract note download', row);
  }

  onLeadFieldIconAction(event: any): void {
    const key = event?.key || event;
    if (key.includes('customerDetails')) this.uxModal = 'customerDetails';
    if (key.includes('installationBase')) this.uxModal = 'installationBase';
  }

  closeUxModal(): void {
    this.uxModal = null;
    this.uxModalData = null;
    this.rerouteToUser = '';
  }

  saveLeadDetails(data: any): void {
    console.log('[OpenLeads] saveLeadDetails', data);
    // TODO: integrate with API when available
  }

  cancelLeadDetails(): void {
    console.log('[OpenLeads] cancelLeadDetails');
    // Reset back to initial model
    this.leadDetailsModel = { ...this.leadDetailsModel };
  }

  navigateToOpenLeads(): void {
    this.router.navigate(['/adminmarketing/open-leads']);
  }
}
