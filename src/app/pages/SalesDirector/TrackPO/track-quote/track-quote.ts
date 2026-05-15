import { Component } from '@angular/core';
import { SalesDirectorService } from '../../../../service/sales-director.service';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { DataTable } from '../../../../shared/data-table/data-table';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { Router } from '@angular/router';

@Component({
  selector: 'app-track-quote',
   standalone: true,
  imports: [Header, Sidebar, DataTable, Pageheader ],
  templateUrl: './track-quote.html',
  styleUrl: './track-quote.css',
})
export class TrackQuote {
  constructor(
    private router: Router,
    private service: SalesDirectorService) {}

  headerTitle = 'Track Quotes';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sd-dashboard' },
    { label: 'Track Quotes', route: '/salesdirector/track-quotes' }
  ];

  columns = [
    { header: 'Quote ID', field: 'quoteId' },
    { header: 'Customer', field: 'customer' },
    { header: 'Opportunity Details', field: 'opportunityDetails' },
    { header: 'Discount', field: 'discount' },
    { header: 'Current Stage', field: 'currentStage' },
    { header: 'Status', field: 'status' },
    // { header: 'Final Approver', field: 'status' },
  ];

  rows: any[] = [];
  fullRows: any[] = [];

  ngOnInit(): void {
    this.loadQuotes();
  }

  private loadQuotes(): void {
    this.service.getTrackQuotes().subscribe({
      next: (data) => {
        console.log('API DATA =>', data);

        this.fullRows = data;

        this.rows = data.map((q, index) => ({
          sno: index + 1,
          customer: q.customer,
          quoteId: q.quoteId,
          opportunityDetails: q.opportunityDetails,
          discount: q.discount,
          currentStage: q.currentStage,
          status: q.status
        }));

      },
      error: (err) => {
        console.error('Failed to load quotes', err);
      }
    });
  }

  searchFields: SearchFieldConfig[] = [
    {
      key: 'qouteId',
      label: 'Qoute Id, Customer Name, Oppurtunity Details',
      placeholder: 'Search',
      type: 'text'   // ✅ now TypeScript knows this is literal
    },
    // {
    //   key: 'customer',
    //   label: 'Customer',
    //   placeholder: 'Customer Name',
    //   type: 'text'   // ✅ now TypeScript knows this is literal
    // },
    // {
    //   key: 'opportunity',
    //   label: 'Opportunity',
    //   placeholder: 'Opportunity Details',
    //   type: 'text'   // ✅ now TypeScript knows this is literal
    // },
  ];



onSearch(keyword: string) {

  if (!keyword || keyword.trim() === '') {
    // 🔁 If empty search → reload full list
    this.loadQuotes();
    return;
  }

  this.service.searchQoute(keyword).subscribe({
    next: (results: any[]) => {

      this.fullRows = results;

      this.rows = results.map((c, index) => ({
          sno: index + 1,
          customer: c.customer,
          quoteId: c.quoteId,
          opportunityDetails: c.opportunityDetails,
          discount: c.discount,
          currentStage: c.currentStage,
          status: c.status
      }));
    },
    error: (err) => {
      console.error('Search failed', err);
    }
  });
}

onReset(): void {
  this.router.navigate(['salesdirector/track-quotes']);
}
  

}
