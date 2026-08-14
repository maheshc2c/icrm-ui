import { Component, OnInit } from '@angular/core';
import { Leadservice } from '../../../service/leadservice';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Sidebar } from "../../../layout/sidebar/sidebar";
import { Header } from "../../../layout/header/header";
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { DataTable } from "../../../shared/data-table/data-table";
import { CommonModule } from '@angular/common';
import { OpportunityFunnelHistory } from '../../../models/OpportunityFunnelHistory';

@Component({
  selector: 'app-opportunity-funnel-history-status',
  standalone: true,
  imports: [Sidebar, Header, Pageheader, DataTable, CommonModule],
  templateUrl: './opportunity-funnel-history-status.html',
  styleUrl: './opportunity-funnel-history-status.css',
})
export class OpportunityFunnelHistoryStatus implements OnInit {

  headerTitle = 'Opportunity Funnel History';
  funnelHistory: OpportunityFunnelHistory[] = [];

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Opportunity Funnel History' }
  ];

  searchFields: SearchFieldConfig[] = [
    {
      key: 'oppId',
      label: 'Opp ID',
      type: 'text',
      placeholder: 'Enter Opportunity ID'
    },
    {
      key: 'searchDate',
      label: 'Search Date',
      type: 'date',
      placeholder: 'Select Date'
    }
  ];

  columns = [
    { header: 'ID', field: 'oppId' },
    { header: 'Lead Details', field: 'leadDetails' },
    { header: 'Product', field: 'product' },
    { header: 'Qty', field: 'qty' },
    { header: 'Value (Lakhs)', field: 'valueLakhs' },
    { header: 'Life Time(Days)', field: 'lifeTimeDays' },
    { header: 'Stage', field: 'stage' },
    { header: 'Current Stage', field: 'currentStage' }
  ];

  // funnelHistory: any[] = [];

  rows: any[] = [];

currentPage = 1;
pageSize = 10;
totalElements = 0;
totalPages = 1;

  filters: any = {};

  constructor(private leadService: Leadservice) {}

  ngOnInit(): void {
    this.loadData();
  }

 loadData() {

  const payload = {
    oppId: null,
    searchDate: null,
    pagination: {
      pageNumber: this.currentPage - 1,
      pageSize: this.pageSize
    }
  };

  this.leadService.searchOpportunityFunnelHistory(payload)
    .subscribe({
      next: (response: any) => {

        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;

        this.funnelHistory = response.content || [];

        this.rows = this.funnelHistory.map((item: OpportunityFunnelHistory, index: number) => ({

          sno: ((this.currentPage - 1) * this.pageSize) + index + 1,

          oppId: item.oppId,
          leadDetails: item.leadDetails,
          product: item.product,
          qty: item.qty,
          valueLakhs: item.valueLakhs,
          lifeTimeDays: item.lifeTimeDays,
          stage: item.stage,
          currentStage: item.currentStage

        }));
        console.log('ROWS =>', this.rows);

      },
      error: err => console.log(err)
    });

}

  onSearchChange(filters: any) {
    this.filters = filters;
  }

  onSearch() {

  const payload = {
    oppId: this.filters?.oppId || null,
    searchDate: this.filters?.searchDate || null,
    pagination: {
      pageNumber: this.currentPage - 1,
      pageSize: this.pageSize
    }
  };

  this.leadService.searchOpportunityFunnelHistory(payload)
    .subscribe({
      next: (response: any) => {

        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;

        this.rows = (response.content || []).map((item: OpportunityFunnelHistory, index: number) => ({

          sno: ((this.currentPage - 1) * this.pageSize) + index + 1,

          oppId: item.oppId,
          leadDetails: item.leadDetails,
          product: item.product,
          qty: item.qty,
          valueLakhs: item.valueLakhs,
          lifeTimeDays: item.lifeTimeDays,
          stage: item.stage,
          currentStage: item.currentStage

        }));

        console.log('ROWS =>', this.rows);

      }
    });
}

  // onReset() {
  //   this.filters = {};
  //   this.currentPage = 1;
  //   this.loadData();
  // }

  onPageChange(page: number) {
    this.currentPage = page;
    this.onSearch();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.onSearch();
  }

  onReset(): void {

  this.filters = {};

  this.currentPage = 1;
  this.pageSize = 10;

  this.searchFields = [
    {
      key: 'oppId',
      label: 'Opp ID',
      type: 'text',
      placeholder: 'Enter Opportunity ID'
    },
    {
      key: 'searchDate',
      label: 'Search Date',
      type: 'date',
      placeholder: 'Select Date'
    }
  ];

  this.loadData();
}
download(): void {

  const payload = {
    oppId: this.filters?.oppId || null,
    searchDate: this.filters?.searchDate || null,
    pagination: {
      pageNumber: 0,
      pageSize: 10000,
      sortBy: 'opportunityId',
      sortOrder: 'ASC'
    }
  };

  this.leadService.downloadOpportunityFunnelHistory(payload).subscribe({
  next: (res: any) => {

    const blob = res.body || res;

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'Opportunity_Funnel_History.xlsx';

    a.click();

    window.URL.revokeObjectURL(url);
  },
  error: (err) => {
    console.log(err);
  }
});
} 
}
