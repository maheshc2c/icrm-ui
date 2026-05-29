import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { Adminservice } from '../../../../service/adminservice';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { adminMarketingservice } from '../../../../service/adminmarketingservice';


@Component({
  selector: 'app-speciality',
  imports: [Header, Sidebar, Pageheader, DataTable],
  templateUrl: './speciality.html',
  styleUrl: './speciality.css',
})
export class Speciality {

  constructor(
    private adminmarketingService: adminMarketingservice,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  headerTitle = 'Manage Speciality';
  
     headerBreadcrumbs: Breadcrumb[] = [
      { label: 'Home', route: '/adminmarketingdashboard' },
      { label: 'Speciality', route: '/adminmarketing/speciality' }
    ];

    // 🔹 Table Columns
  columns = [
    { header: 'Name', field: 'specialityName' },

  ];

  
  rows: any[] = [];
  fullRows: any[] = [];   // ✅ full API data (for Excel)

  totalElements = 0;
  currentPage = 1;
  pageSize = 10;

   ngOnInit(): void {
    this.loadSpeciality();
  }

  // ✅ LIST API ONLY
private loadSpeciality(): void {
  this.adminmarketingService.getSpecialities(this.currentPage - 1, this.pageSize).subscribe({
    next: (res: any) => {
      const specialities = Array.isArray(res) ? res : (res?.content || []);
      this.totalElements = Array.isArray(res) ? res.length : (res?.totalElements || 0);

      // ✅ keep FULL data untouched
      this.fullRows = specialities;

      // ✅ map only what table needs
      this.rows = specialities.map((c: any, index: number) => ({
        sno: (this.currentPage - 1) * this.pageSize + index + 1,
        specialityId: c.specialityId,
        specialityName: c.specialityName,
      }));
    }
  });
}

onAdd() {
    this.router.navigate(['adminmarketing/speciality/add']);
  }

onEdit(row: any) {
  this.router.navigate(['adminmarketing/speciality/edit', row.specialityId]); 
}

isEditMode = false;
specialityId!: number

  onDelete(row: any) {
    console.log('Delete row:', row);
  }

  
  //search Functionality
  
  
  searchFields: SearchFieldConfig[] = [
    {
      key: 'specialityName',
      label: 'Speciality',
      placeholder: 'Name',
      type: 'text'   // ✅ now TypeScript knows this is literal
    }
  ];

  
onSearch(keyword: string) {

  const value = keyword?.trim();

  if (!value) {
    this.loadSpeciality();
    return;
  }

  this.currentPage = 1;

  this.adminmarketingService.searchSpeciality(value).subscribe({
    next: (results: any) => {
      const data = Array.isArray(results) ? results : (results?.content || []);

      this.fullRows = data;

      this.rows = data.map((c: any, index: number) => ({
        sno: index + 1,
        specialityId: c.specialityId,
        specialityName: c.specialityName,
      }));
    },
    error: (err) => {
      console.error('Search failed', err);
    }
  });
}


//Download
 onImport() {

  if (!this.fullRows || this.fullRows.length === 0) {
    alert('No data available to download');
    return;
  }

  this.adminmarketingService.downloadSpecialityExcel(this.fullRows).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Speciality.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Download failed:', err);
      alert(`Download failed: ${err.status}`);
    }
  });
}

onPageChange(page: number) {
  this.currentPage = page;
  this.loadSpeciality();
}

onPageSizeChange(size: number) {
  this.pageSize = size;
  this.currentPage = 1;
  this.loadSpeciality();
}

}

