import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { adminMarketingservice } from '../../../../service/adminmarketingservice';
import { ToastService } from '../../../../service/toast.service';
import * as XLSX from 'xlsx';


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
    private route: ActivatedRoute,
    private toastService: ToastService
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
  // allRows: any[] = []; // 🔹 master copy
  fullRows: any[] = [];   // ✅ full API data (for Excel)



   ngOnInit(): void {
    this.loadSpeciality();
  }

  // ✅ LIST API ONLY
private loadSpeciality(): void {
  this.adminmarketingService.getSpecialities().subscribe({
    next: (res: any) => {
      // ✅ Handle paginated response (res.content) or direct array
      const specialities = Array.isArray(res) ? res : (res?.content || (res ? [res] : []));

      // ✅ keep FULL data untouched
      this.fullRows = specialities;

      // ✅ map only what table needs
      this.rows = specialities.map((c: any, index: number) => ({
        sno: index + 1,
        specialityId: c.specialityId,
        specialityName: c.specialityName,
        specialityStatus: c.specialityStatus ?? (c.isActive ? 1 : 0),
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

  onStatusToggle(row: any) {
    if (row.specialityStatus === 1) {
      this.adminmarketingService.deactivateSpeciality(row.specialityId).subscribe({
        next: () => this.loadSpeciality(),
        error: (err) => console.error('Deactivate failed', err),
      });
      return;
    }

    this.adminmarketingService.activateSpeciality(row.specialityId).subscribe({
      next: () => this.loadSpeciality(),
      error: (err) => console.error('Activate failed', err),
    });
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

  this.adminmarketingService.searchSpeciality(value).subscribe({
    next: (res: any) => {
      // ✅ Handle paginated response (res.content) or direct array
      const results = Array.isArray(res) ? res : (res?.content || (res ? [res] : []));

      this.fullRows = results;

      this.rows = results.map((c: any, index: number) => ({
        sno: index + 1,
        specialityId: c.specialityId,
        specialityName: c.specialityName,
        specialityStatus: c.specialityStatus ?? (c.isActive ? 1 : 0),
      }));
    },
    error: (err) => {
      console.error('Search failed', err);
    }
  });
}
 onDownload() {

  if (!this.rows || this.rows.length === 0) {
    this.toastService.warning('No data available to download');
    return;
  }

  const exportData = this.rows.map(row => ({
    'S.No': row.sno,
    'Speciality Name': row.specialityName,
    'Status': row.specialityStatus === 1 ? 'Active' : 'Inactive'
  }));

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Specialities');
  XLSX.writeFile(workbook, 'Specialities_' + new Date().toISOString().slice(0, 10) + '.xlsx');
}


}
