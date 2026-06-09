// addcp.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';
import { Adminservice } from '../../../../service/adminservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ChannelPartnerModel } from '../../../../models/channel-partner-model';

@Component({
  selector: 'app-addcp',
  imports: [CommonModule, Header, Sidebar, Pageheader, Form],
  templateUrl: './addcp.html',
  styleUrl: './addcp.css',
})
export class Addcp implements OnInit {
  constructor(
    private adminService: Adminservice,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  headerTitle = 'Add Channel Partner';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Channel Partner', route: '/admin/channelpartner' }
  ];

  isEditMode = false;
  channelPartnerId!: number;
  formInitialData: Partial<ChannelPartnerModel> = {};

 channelFields = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter channel partner name' },

  { name: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Enter bank name' },

  { name: 'bankAddress', label: 'Bank Address', type: 'text', placeholder: 'Enter bank address' },

  { name: 'ifscCode', label: 'IFSC Code', type: 'text', placeholder: 'Enter IFSC code' },

  { name: 'accountType', label: 'Account Type', type: 'text', placeholder: 'Enter account type' },

  { name: 'accountNumber', label: 'Account Number', type: 'number', placeholder: 'Enter account number' },

  { name: 'city', label: 'City', type: 'text', placeholder: 'Enter city name' },

  { name: 'benificiaryName', label: 'Beneficiary Name', type: 'text', placeholder: 'Enter beneficiary name' },

  { name: 'benificiaryAddress', label: 'Beneficiary Address', type: 'text', placeholder: 'Enter beneficiary address' },

  { name: 'communicationAddress', label: 'Communication Address', type: 'text', placeholder: 'Enter communication address' }
];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.channelPartnerId = Number(idParam);
      this.headerTitle = 'Edit Channel Partner';
      this.loadChannelPartnerById(this.channelPartnerId);
    }
  }

  private loadChannelPartnerById(id: number) {
    this.adminService.getChannelPartners().subscribe({
      next: (partners: any[]) => {
        const partner = partners.find(p => Number(p.channelPartnerId) === id);

        if (!partner) {
          alert('Channel Partner not found');
          this.router.navigate(['/admin/channelpartner']);
          return;
        }

        this.formInitialData = { ...partner };
      },
      error: () => {
        alert('Failed to load data');
        this.router.navigate(['/admin/channelpartner']);
      }
    });
  }

  saveChannelPartner(data: Partial<ChannelPartnerModel>) {
  if (!data.name?.trim()) {
    alert('Channel Partner Name is required');
    return;
  }

  const payload = {
    name: data.name.trim(),
    bankName: data.bankName?.trim() || null,
    bankAddress: data.bankAddress?.trim() || null,
    ifscCode: data.ifscCode?.trim() || null,
    accountType: data.accountType?.trim() || null,
    accountNumber: data.accountNumber ? Number(data.accountNumber) : null,
    city: data.city?.trim() || null,
    benificiaryName: data.benificiaryName?.trim() || null,
    benificiaryAddress: data.benificiaryAddress?.trim() || null,
    communicationAddress: data.communicationAddress?.trim() || null,

    // add these only if backend expects them
    type: 1,
    companyId: 1,
    status: 1
  };

  console.log('CREATE/UPDATE PAYLOAD =>', payload);

  const req = this.isEditMode
    ? this.adminService.updateChannelPartner(this.channelPartnerId, payload as ChannelPartnerModel)
    : this.adminService.createChannelPartner(payload as ChannelPartnerModel);

  req.subscribe({
    next: () => this.router.navigate(['/admin/channelpartner']),
    error: (err) => {
      console.error('SAVE FAILED =>', err);
      alert(err?.error?.message || 'Save failed');
    }
  });
}

  onCancel() {
    this.router.navigate(['/admin/channelpartner']);
  }
}