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
    private route: ActivatedRoute
  ) {}

  headerTitle = 'Manage Competitor';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Competitor', route: '/admin/competitor' },
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

  // ✅ LIST API ONLY
private loadCompetitors(): void {
  this.adminservice.getCompetitors().subscribe({
    next: (competitors: any[]) => {

      // ✅ keep FULL data untouched
      this.fullRows = competitors;

      // ✅ map only what table needs
      this.rows = competitors.map((c, index) => ({
        sno: index + 1,
        competitorId: c.competitorId,
        competitorName: c.competitorName,
        competitorRating: c.competitorRating
      }));
    }
  });
}

//Download

 onImport() {

  if (!this.fullRows || this.fullRows.length === 0) {
    alert('No data available to download');
    return;
  }

  this.adminservice.downloadCompetitorExcel(this.fullRows).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Competitors.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Download failed:', err);
      alert(`Download failed: ${err.status}`);
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

  onDelete(row: any) {
    console.log('Delete row:', row);
  }


//search Functionality


searchFields: SearchFieldConfig[] = [
  {
    key: 'competitorName',
    label: 'Competitor Name',
    placeholder: 'Search competitor',
    type: 'text'   // ✅ now TypeScript knows this is literal
  }
];


onSearch(keyword: string) {

  if (!keyword || keyword.trim() === '') {
    // 🔁 If empty search → reload full list
    this.loadCompetitors();
    return;
  }

  this.adminservice.searchCompetitors(keyword).subscribe({
    next: (results: any[]) => {

      this.fullRows = results;

      this.rows = results.map((c, index) => ({
        sno: index + 1,
        competitorId: c.competitorId,
        competitorName: c.competitorName,
        competitorRating: c.competitorRating
      }));
    },
    error: (err) => {
      console.error('Search failed', err);
    }
  });
}


//  filtering without search button help


// onSearchFromTable(filters: any) {
//   const name = filters.competitorName || '';

//   if (!name.trim()) {
//     this.loadCompetitors();
//     return;
//   }

//   this.adminservice.searchCompetitors(name).subscribe({
//     next: (results) => {
//       this.fullRows = results;
//       this.rows = results.map((c, index) => ({
//         sno: index + 1,
//         competitorId: c.competitorId,
//         competitorName: c.competitorName,
//         competitorRating: c.competitorRating
//       }));
//     }
//   });
// }



}
