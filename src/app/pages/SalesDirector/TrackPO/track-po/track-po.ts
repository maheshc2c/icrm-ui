import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Search, SearchFieldConfig } from '../../../../shared/search/search';
import { SalesDirectorService } from '../../../../service/sales-director.service';
import { TrackPomodel } from '../../../../models/TrackPomodel';
import { Router } from '@angular/router';


@Component({
  selector: 'app-track-po',
  standalone: true,
  imports: [Pageheader, DataTable, Header, Sidebar, Search],
  templateUrl: './track-po.html',
  styleUrl: './track-po.css',
})
export class TrackPo implements OnInit {
  headerTitle = 'Track PO';

  constructor(
    private router: Router,
    private service: SalesDirectorService) {}

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sd-dashboard' },
    { label: 'Track PO', route: '/salesdirector/track-po' }
  ];

  columns = [
    { header: 'PO ID', field: 'poId' },
    { header: 'Distributor', field: 'distributor' },
    { header: 'Product Details', field: 'productDetails' },
    { header: 'Discount', field: 'discount' },
    { header: 'Current Stage', field: 'currentStage' },
    { header: 'Status', field: 'status' },
    { header: 'Final Approver', field: 'finalApprover' },
    { header: 'PO Documents', field: 'poDocuments' }
  ];

  searchFields: SearchFieldConfig[] = [
  {
    key: 'poId',
    label: 'PO ID',
    placeholder: 'Enter PO ID',
    type: 'text'
  },
  {
    key: 'status',
    label: 'PO Documents',
    placeholder: 'Enter PO Documents',
    type: 'text'
  },
  // {
  //   key: 'distributor',
  //   label: 'Distributor',
  //   placeholder: 'Enter Distributor Name',
  //   type: 'text'
  // },
  // {
  //   key: 'product',
  //   label: 'Product',
  //   placeholder: 'Enter Product Name',
  //   type: 'text'
  // }
];

  rows: any[] = [];
  fullRows: any[] = [];

  ngOnInit(): void {
    this.loadPo();
  }

  private loadPo(): void {
    this.service.getTrackPo().subscribe({
      next: (data: TrackPomodel[]) => {
        this.fullRows = data;
        this.rows = data.map((p, index) => ({
          sno: index + 1,
          poId: p.poId,
          distributor: p.distributor,
          productDetails: p.productDetails,
          discount: p.discount,
          currentStage: p.currentStage,
          status: p.status,
          finalApprover: p.finalApprover,
          poDocuments: p.poDocuments
        }));
      },
      error: (err: any) => {
        console.error('Failed to load PO data', err);
      }
    });
  }

//   onSearch(keyword: string): void {
//   console.log('SEARCH DATA =>', keyword);

//   if (!keyword || keyword.trim() === '') {
//     this.loadPo();
//     return;
//   }

//   this.service.searchPo(keyword).subscribe({
//     next: (results: TrackPomodel[]) => {
//       console.log('SEARCH RESULTS =>', results);

//       this.fullRows = results;
//       this.rows = results.map((p, index) => ({
//         sno: index + 1,
//         poId: p.poId,
//         distributor: p.distributor,
//         productDetails: p.productDetails,
//         discount: p.discount,
//         currentStage: p.currentStage,
//         status: p.status,
//         finalApprover: p.finalApprover,
//         poDocuments: p.poDocuments
//       }));
//     },
//     error: (err: any) => {
//       console.error('Search failed', err);
//     }
//   });
// }


onSearch(keyword: string): void {
  console.log('SEARCH DATA =>', keyword);

  if (!keyword || keyword.trim() === '') {
    this.loadPo();
    return;
  }

  this.service.searchPoById(keyword).subscribe({
    next: (results: TrackPomodel[]) => {
      this.rows = results.map((p, index) => ({
        sno: index + 1,
        poId: p.poId,
        distributor: p.distributor,
        productDetails: p.productDetails,
        discount: p.discount,
        currentStage: p.currentStage,
        status: p.status,
        finalApprover: p.finalApprover,
        poDocuments: p.poDocuments
      }));
    },
    error: (err: any) => {
      console.error('Search failed', err);
    }
  });
}

onReset(): void {
  this.router.navigate(['salesdirector/track-po']);
}
}