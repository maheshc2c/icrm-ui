import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Button } from '../../../shared/button/button';
import { Adminservice } from '../../../service/adminservice';
import { Breadcrumb } from '../../../models/breadcrumb';
import { CompetitorModel } from '../../../models/competitor-model';
import { SearchFieldConfig } from '../../../shared/search/search';
import { ToastService } from '../../../service/toast.service';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';


@Component({
  selector: 'app-competitor',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    Sidebar,
    Pageheader,
    DataTable
  ],
  templateUrl: './competitor.html',
  styleUrl: './competitor.css'
})
export class Competitor implements OnInit {

  constructor(
    private adminservice: Adminservice,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private confirmService: ConfirmDialogService
  ) {}

  headerTitle = 'Manage Competitor';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Competitor', route: '/competitor' },
    { label: 'Add New' }
  ];

  role = localStorage.getItem('role');

columns = [
  { header: 'Competitor Name', field: 'competitorName' },
  { header: 'Rating', field: 'competitorRating' }
];



  rows: any[] = [];
  // allRows: any[] = []; // 🔹 master copy
  fullRows: any[] = [];   // ✅ full API data (for Excel)



   ngOnInit(): void {
    this.loadCompetitors();
  }
private loadCompetitors(): void {

  this.adminservice.getCompetitors(
    null,
    this.currentPage - 1,
    this.pageSize
  ).subscribe({
    next: (response: any) => {

      this.totalElements = response.totalElements;
      this.totalPages = response.totalPages;

      this.fullRows = response.content;

      this.rows = response.content.map(
        (c: any, index: number) => ({
          sno: ((this.currentPage - 1) * this.pageSize) + index + 1,
          competitorId: c.competitorId,
          competitorName: c.competitorName,
          competitorRating: c.competitorRating,
          competitorStatus: c.competitorStatus
        })
      );
    },
    error: (err) => {
      console.error(err);
    }
  });
}

//pagination
totalElements = 0;
currentPage = 1;
pageSize = 10;
totalPages = 1;

onPageChange(page: number) {
  this.currentPage = page;
  this.loadCompetitors();
}

onPageSizeChange(size: number) {
  this.pageSize = size;
  this.currentPage = 1;
  this.loadCompetitors();
}

//actiavte and deactivate
onDelete(row: any) {

  if (!row?.competitorId) {
    return;
  }

  const isActive = row.competitorStatus === 1;

  this.confirmService.confirm({
    title: 'Confirm',
    message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this competitor?`,
    confirmText: isActive ? 'Deactivate' : 'Activate'
  }).then((confirmed) => {

    if (!confirmed) {
      return;
    }

    this.adminservice
      .toggleCompetitorStatus(row.competitorId)
      .subscribe({

        next: () => {

          row.competitorStatus = isActive ? 2 : 1;

          this.rows = [...this.rows];

          this.toastService.success(
            `Competitor ${isActive ? 'deactivated' : 'activated'} successfully`
          );

          this.loadCompetitors();
        },

        error: (err: any) => {

          console.error('Status update failed', err);

          this.toastService.error(
            'Failed to update competitor status'
          );
        }
      });
  });
}
searchFilters: any = {};

onReset(): void {

  this.currentSearchKeyword = '';
  this.searchFilters = {};
  this.currentPage = 1;

  this.loadCompetitors();
}
 
//new download

onImport() {

  const payload = {
    competitorName: this.currentSearchKeyword || null,
    pagination: {
      pageNumber: 0,
      pageSize: 100000,
      sortBy: 'competitorId',
      sortOrder: 'DESC'
    }
  };

  this.adminservice.downloadCompetitor(payload)
    .subscribe({

      next: (blob: Blob) => {

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'Competitor.xlsx';
        link.click();

        window.URL.revokeObjectURL(url);
      },

      error: (err) => {
        console.error(err);
        this.toastService.error('Excel download failed');
      }
    });
}


  onAdd() {
    this.router.navigate(['competitor/add']);
  }

onEdit(row: any) {
  this.router.navigate(['competitor/edit', row.competitorId]);
}
isEditMode = false;
companyId!: number



//search Functionality


searchFields: SearchFieldConfig[] = [
  {
    key: 'competitorName',
    label: 'Competitor Name',
    placeholder: 'Search competitor',
    type: 'text'   // ✅ now TypeScript knows this is literal
  }
];


currentSearchKeyword = '';
onSearch(keyword: string) {

  this.currentSearchKeyword = keyword || '';

  if (!keyword || keyword.trim() === '') {
    this.currentPage = 1;
    this.loadCompetitors();
    return;
  }

  this.adminservice.getCompetitors(
    keyword,
    0,
    this.pageSize
  ).subscribe({
    next: (response: any) => {

      this.totalElements = response.totalElements;
      this.totalPages = response.totalPages;
      this.currentPage = 1;

      this.rows = response.content.map((c: any, index: number) => ({
        sno: index + 1,
        competitorId: c.competitorId,
        competitorName: c.competitorName,
        competitorRating: c.competitorRating,
        competitorStatus: c.competitorStatus
      }));
    }
  });
}




}
