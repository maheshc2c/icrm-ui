import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Form } from '../../../shared/form/form';
import { adminMarketingservice } from '../../../service/adminmarketingservice';
import { DropdownOption, AssignLeadPayload } from '../../../models/assign-lead.model';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-assign-leads',
  standalone: true,
  imports: [CommonModule, HttpClientModule, Header, Sidebar, Pageheader, Form],
  templateUrl: './assing-leads.html',
  styleUrl: './assing-leads.css',
})
export class AssignLeads implements OnInit {

  constructor(
    private router: Router,
    private adminMarketingService: adminMarketingservice,
    private toastService: ToastService
  ) {}

  headerTitle = 'Assign Lead';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/adminmarketingdashboard' },
    { label: 'Assign Lead' }
  ];

  ngOnInit(): void {
    this.loadCampaignOptions();
    this.loadCustomerOptions();
    this.loadUserOptions();
    this.loadContactOptions();
    this.loadContact2Options();
  }

  private setFieldOptions(fieldName: string, options: DropdownOption[]): void {
    const field = this.assignLeadFields.find((f: any) => f?.name === fieldName);
    if (field) field.options = options;
  }

  private loadCampaignOptions(): void {
    this.adminMarketingService.getCampaignDropdownOptions().subscribe((options: DropdownOption[]) => {
      this.setFieldOptions('campaignName', options);
    });
  }

  private loadCustomerOptions(): void {
    this.adminMarketingService.getCustomerDropdown().subscribe((options: DropdownOption[]) => {
      this.setFieldOptions('customerName', options);
    });
  }

  private loadUserOptions(): void {
    this.adminMarketingService.getUsernamesDropdown().subscribe((options: DropdownOption[]) => {
      this.setFieldOptions('username', options);
    });
  }

  private loadContactOptions(): void {
    this.adminMarketingService.getContactsDropdown().subscribe((options: DropdownOption[]) => {
      this.setFieldOptions('contactFirstName', options);
    });
  }

  private loadContact2Options(): void {
    this.adminMarketingService.getContactPerson2Dropdown().subscribe((options: DropdownOption[]) => {
      this.setFieldOptions('contactFirstName2', options);
    });
  }

  onFormFieldChange(ev: { name: string; value: any }): void {
    if (!ev) return;

    if (ev.name === 'customerName') {
      this.formInitialData.contactFirstName = '';
      this.formInitialData.contactFirstName2 = '';
    }
  }

  onAddCustomer(): void {
    this.router.navigate(['/adminmarketing/customer/add'], { queryParams: { returnUrl: '/adminmarketing/assing-leads' } });
  }

  onAddContact(): void {
    this.router.navigate(['/adminmarketing/contact/add'], { queryParams: { returnUrl: '/adminmarketing/assing-leads' } });
  }

  formInitialData: any = {
    campaignName: '',
    customerName: '',
    username: '',
    contactFirstName: '',
    contactFirstName2: '',
    leadPurchasePotential: '',
    leadVisitRequirement: '0',
    leadResourceRequirement: '0',
    leadCmdLine3: '',
    leadCmdLine1: '',
    leadCmdLine2: '',
    leadStatus: 1
  };

  assignLeadFields = [
    {
      name: 'campaignName',
      label: 'Campaign',
      type: 'select',
      required: true,
      options: [{ label: 'Select Campaign', value: '' }]
    },
    {
      name: 'customerName',
      label: 'Customer',
      type: 'select',
      required: true,
      options: [{ label: 'Select Customer', value: '' }]
    },
    {
      name: 'username',
      label: 'Assign To',
      type: 'select',
      required: true,
      options: [{ label: 'Select User to Assign', value: '' }]
    },
    {
      name: 'contactFirstName',
      label: 'Contact Person 1',
      type: 'select',
      required: true,
      options: [{ label: 'Select Contact Person', value: '' }]
    },
    {
      name: 'contactFirstName2',
      label: 'Contact Person 2',
      type: 'select',
      required: false,
      options: [{ label: 'Select Contact Person', value: '' }]
    },
    { name: 'leadPurchasePotential', label: 'Purchase Potential (Rs)', placeholder: 'Purchase Potential', type: 'text', required: false },
    {
      name: 'leadVisitRequirement',
      label: 'Visit Requirement',
      type: 'radio',
      required: false,
      options: [
        { label: 'Yes', value: '1' },
        { label: 'No', value: '0' }
      ]
    },
    {
      name: 'leadResourceRequirement',
      label: 'Resource Requirement',
      type: 'radio',
      required: false,
      options: [
        { label: 'Yes', value: '1' },
        { label: 'No', value: '0' }
      ]
    },
    {
      name: 'leadCmdLine3',
      label: 'Resource Required Information',
      type: 'textarea',
      required: true,
      showIf: { field: 'leadResourceRequirement', equals: '1' }
    },
    { name: 'leadCmdLine1', label: 'Comment Line 1', type: 'textarea', required: false },
    { name: 'leadCmdLine2', label: 'Comment Line 2', type: 'textarea', required: false }
  ];

  saveAssignLead(data: AssignLeadPayload): void {
    this.adminMarketingService.assignLead(data).subscribe({
      next: (res: any) => {
        if (res?.status === false || res?.error) {
          this.toastService.error(res?.message ?? 'Assign lead failed');
        } else {
          this.toastService.success('Lead assigned successfully!');
          this.router.navigate(['/adminmarketing/track-leads']);
        }
      },
      error: (err: any) => {
        console.error('Assign lead error:', err);
        this.toastService.error('Failed to assign lead: ' + (err?.message || 'Unknown error'));
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/adminmarketingdashboard']);
  }
}
