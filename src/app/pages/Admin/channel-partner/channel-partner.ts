import { Component } from '@angular/core';
import { ChannelPartnerModel } from '../../../models/channel-partner-model';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Adminservice } from '../../../service/adminservice';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { CommonModule } from '@angular/common';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';

@Component({
  selector: 'app-channel-partner',
  imports: [CommonModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './channel-partner.html',
  styleUrl: './channel-partner.css',
})
export class ChannelPartner {

   constructor(
    private adminservice: Adminservice,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  headerTitle = 'Manage Channel Partner';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Channel Partner', route: '/admin/channelpartner' },
    { label: 'Add New' }
  ];

  columns = [
    { header: 'Name', field: 'name' },
    { header: 'City', field: 'city' },
    { header: 'Bank Name', field: 'bankName' },
    { header: 'IFSC Code', field: 'ifscCode' },
    { header: 'Status', field: 'status' }
  ];

  rows: any[] = [];
  fullRows: ChannelPartnerModel[] = [];

  ngOnInit(): void {
    this.loadChannelPartners();
  }

  private loadChannelPartners() {

    this.adminservice.getChannelPartners().subscribe({
      next: (res: any) => {

        const partners = Array.isArray(res) ? res : [res];

        this.fullRows = partners;

        this.rows = partners.map((p, i) => ({
          sno: i + 1,
          channelPartnerId: p.channelPartnerId,
          name: p.name,
          city: p.city,
          bankName: p.bankName,
          ifscCode: p.ifscCode,
          status: p.status
        }));
      }
    });
  }

  onAdd() {
    this.router.navigate(['channelpartner/add']);
  }

  onEdit(row: any) {
    this.router.navigate(['channelpartner/edit', row.channelPartnerId]);
  }

  onDelete(row: any) {
    console.log('Delete:', row);
  }

  onImport() {

    if (!this.fullRows.length) {
      alert('No data to download');
      return;
    }

    this.adminservice.downloadChannelExcel(this.fullRows)
      .subscribe(blob => {

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'ChannelPartners.xlsx';
        a.click();

        window.URL.revokeObjectURL(url);
      });
  }

  searchFields: SearchFieldConfig[] = [
    {
      key: 'name',
      label: 'Channel Partner',
      placeholder: 'Search Channel Partner',
      type: 'text'
    }
  ];

  onSearch(keyword: string) {

    if (!keyword?.trim()) {
      this.loadChannelPartners();
      return;
    }

    this.adminservice.searchChannelPartner(keyword)
      .subscribe(results => {

        this.rows = results.map((p, i) => ({
          sno: i + 1,
          channelPartnerId: p.channelPartnerId,
          name: p.name,
          city: p.city,
          bankName: p.bankName,
          ifscCode: p.ifscCode,
          status: p.status
        }));
      });
  }

}
