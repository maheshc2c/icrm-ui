// channel-partner.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Adminservice } from '../../../service/adminservice';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { ChannelPartnerModel } from '../../../models/channel-partner-model';
import { ToastService } from '../../../service/toast.service';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';

@Component({
  selector: 'app-channel-partner',
  imports: [CommonModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './channel-partner.html',
  styleUrl: './channel-partner.css',
})
export class ChannelPartner implements OnInit {
  constructor(
    private adminservice: Adminservice,
    private router: Router,
    private route: ActivatedRoute,
      private toastService: ToastService,
        private confirmService: ConfirmDialogService
  ) {}

  headerTitle = 'Manage Channel Partner';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Channel Partner', route: '/admin/channelpartner' },
    { label: 'Add New' }
  ];

  columns = [

    { header: 'Name', field: 'name' },
  { header: 'Beneficiary', field: 'benificiaryName' },
  { header: 'City', field: 'city' }
    // { header: 'Name', field: 'name' },
    // { header: 'City', field: 'city' },
    // { header: 'Bank Name', field: 'bankName' },
    // { header: 'IFSC Code', field: 'ifscCode' },
    // { header: 'Status', field: 'status' }
  ];

  rows: any[] = [];
  fullRows: ChannelPartnerModel[] = [];

  ngOnInit(): void {
    this.loadChannelPartners();
    // this.loadChannelPartners(event.pageIndex, event.pageSize);
  }


  pageNumber = 0;
pageSize = 10;
totalPages = 0;
totalElements = 0;

 private loadChannelPartners(
  page: number = 0,
  size: number = 10
) {

  this.adminservice.searchChannelPartners(null, page, size)
    .subscribe({

      next: (res: any) => {

        const partners = res.content;

        this.fullRows = partners;

        this.rows = partners.map((p: any, i: number) => ({
          sno: page * size + i + 1,
          channelPartnerId: p.channelPartnerId,
          name: p.name,
          city: p.city,
          benificiaryName: p.benificiaryName,
          bankName: p.bankName,
          ifscCode: p.ifscCode,
          status: p.status
        }));

        // Save pagination details
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.pageNumber = res.number;
        this.pageSize = res.size;

      },

      error: err => console.error(err)

    });
}

  onAdd() {
    this.router.navigate(['/channelpartner/add']);
  }

  onEdit(row: any) {
    this.router.navigate(['/channelpartner/edit', Number(row.channelPartnerId)]);
  }

onDelete(row: any) {

  const isActive = row.status === 1;

  this.confirmService.confirm({
    title: 'Confirm',
    message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this Channel Partner?`,
    confirmText: isActive ? 'Deactivate' : 'Activate'
  }).then((confirmed) => {

    if (!confirmed) {
      return;
    }

    const status = isActive ? 0 : 1;

    this.adminservice
      .changeChannelPartnerStatus(row.channelPartnerId, status)
      .subscribe({

        next: () => {

          this.toastService.success(
            `Channel Partner ${isActive ? 'deactivated' : 'activated'} successfully`
          );

          this.loadChannelPartners(this.pageNumber, this.pageSize);
        },

        error: (err) => {

          console.error(err);

          this.toastService.error(
            `Failed to ${isActive ? 'deactivate' : 'activate'} Channel Partner`
          );
        }

      });

  });

}

  onImport() {

  this.adminservice
      .downloadChannelPartners('')
      .subscribe(blob => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');

        a.href = url;

        a.download = 'channel_partner.xlsx';

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

  this.adminservice.searchChannelPartners(keyword).subscribe({

  next: (res: any) => {

    const partners = res.content;

    this.fullRows = partners;

    this.rows = partners.map((p: any, i: number) => ({
      sno: i + 1,
      channelPartnerId: p.channelPartnerId,
      name: p.name,
      city: p.city,
      benificiaryName: p.benificiaryName,
      bankName: p.bankName,
      ifscCode: p.ifscCode,
      status: p.status
    }));

    this.totalElements = res.totalElements;
    this.totalPages = res.totalPages;
    this.pageNumber = res.number;
    this.pageSize = res.size;
  }

});

}


onReset(){
  this.pageNumber = 0;
  this.loadChannelPartners(0, this.pageSize);
}
}