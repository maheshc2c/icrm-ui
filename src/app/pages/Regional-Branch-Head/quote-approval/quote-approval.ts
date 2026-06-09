import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Adminservice } from '../../../service/adminservice';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-quote-approval',
  standalone: true,
  imports: [CommonModule,
    Header,
    Sidebar,
    Pageheader,
    DataTable],
  templateUrl: './quote-approval.html',
  styleUrl: './quote-approval.css',
})
export class QuoteApproval {

  constructor(
    private adminservice: Adminservice,
    private router: Router
  ) {}

  headerTitle = 'Quote Approval';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Quote Approval', route: '/RegionalBranchHead/quotes-view' }
  ];

  columns = [
    { header: 'Customer', field: 'customer' },
    { header: 'Sales Engineer', field: 'salesEngineer' },
    { header: 'Quote ID', field: 'quoteId' },
    { header: 'Opportunity Details', field: 'opportunityDetails' },
    { header: 'Order Value', field: 'orderValue' },
    { header: 'Discount %', field: 'discount' },
    { header: 'Final Approver', field: 'finalApprover' }
  ];

  searchFields: SearchFieldConfig[] = [
  {
    key: 'quoteId',
    label: 'Quote',
    placeholder: 'Quote ID',
    type: 'text'
  },
  {
    key: 'opportunityDetails',
    label: 'Opportunity',
    placeholder: 'Opportunity Details',
    type: 'text'
  }
];

  rows: any[] = [];
  fullRows: any[] = [];

  
  onView(row: any): void {

    this.router.navigate([
      '/RegionalBranchHead/quotes-view',
      row.quoteId
    ]);
  }

}
