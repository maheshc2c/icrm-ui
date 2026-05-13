import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';
import { Adminservice } from '../../../../service/adminservice';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ChannelPartnerModel } from '../../../../models/channel-partner-model';

@Component({
  selector: 'app-addcp',
  imports: [CommonModule, Header, Sidebar, Pageheader, Form],
  templateUrl: './addcp.html',
  styleUrl: './addcp.css',
})
export class Addcp implements OnInit{

    constructor(
    private adminService: Adminservice,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /* ================= HEADER ================= */

  headerTitle = 'Add Channel Partner';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Channel Partner', route: '/admin/channelpartner' }
  ];

  /* ================= STATE ================= */

  isEditMode = false;
  channelPartnerId!: number;
  formInitialData: Partial<ChannelPartnerModel> = {};

  /* ================= FORM FIELDS ================= */

  channelFields = [
    { name: 'name', label: 'Name', type: 'text', required: true },

    { name: 'bankName', label: 'Bank Name', type: 'text' },
    { name: 'bankAddress', label: 'Bank Address', type: 'text' },
    { name: 'ifscCode', label: 'IFSC Code', type: 'text' },

    { name: 'accountType', label: 'Account Type', type: 'text' },
    { name: 'accountNumber', label: 'Account Number', type: 'number' },

    { name: 'city', label: 'City', type: 'text' },

    { name: 'benificiaryName', label: 'Beneficiary Name', type: 'text' },
    { name: 'benificiaryAddress', label: 'Beneficiary Address', type: 'text' },

    { name: 'communicationAddress', label: 'Communication Address', type: 'text' },

    // { name: 'type', label: 'Type', type: 'number' },
    // { name: 'companyId', label: 'Company ID', type: 'number' },

    // { name: 'status', label: 'Status', type: 'number' }
  ];

  /* ================= INIT ================= */

  ngOnInit(): void {

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.channelPartnerId = Number(idParam);

      this.headerTitle = 'Edit Channel Partner';

      this.loadChannelPartnerById(this.channelPartnerId);
    }
  }

  /* ================= LOAD FOR EDIT ================= */

  private loadChannelPartnerById(id: number) {

    this.adminService.getChannelPartners().subscribe({
      next: (partners) => {

        const partner = Array.isArray(partners)
          ? partners.find(p => p.channelPartnerId === id)
          : partners;

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

  /* ================= SAVE ================= */

  saveChannelPartner(data: Partial<ChannelPartnerModel>) {

  if (!data.name || !data.name.trim()) {
    alert('Channel Partner Name is required');
    return;
  }

  const payload: any = {
  name: data.name,
  bankName: data.bankName ?? null,
  bankAddress: data.bankAddress ?? null,
  ifscCode: data.ifscCode ?? null,
  accountType: data.accountType ?? null,
  accountNumber: data.accountNumber ?? null,
  city: data.city ?? null,
  benificiaryName: data.benificiaryName ?? null,
  benificiaryAddress: data.benificiaryAddress ?? null,
  communicationAddress: data.communicationAddress ?? null,
  // type: data.type ?? null,
  // companyId: data.companyId ?? null,
  status: 1
};

  if (this.isEditMode) {
    this.adminService.updateChannelPartner(this.channelPartnerId, payload)
      .subscribe({
        next: () => this.router.navigate(['/admin/channelpartner']),
        error: () => alert('Update failed')
      });
  } else {
    this.adminService.createChannelPartner(payload)
      .subscribe({
        next: () => this.router.navigate(['/admin/channelpartner']),
        error: () => alert('Create failed')
      });
  }
}


  /* ================= CANCEL ================= */

  onCancel() {
    this.router.navigate(['/admin/channelpartner']);
  }

}
