import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Adminservice } from '../../../service/adminservice';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-speciality',
  imports: [Header, Sidebar, Pageheader, DataTable],
  templateUrl: './speciality.html',
  styleUrl: './speciality.css',
})
export class Speciality {

  constructor(
    private adminservice: Adminservice,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  headerTitle = 'Manage Speciality';
  
     headerBreadcrumbs: Breadcrumb[] = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Speciality', route: '/admin/speciality' }
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
  this.adminservice.getSpecialities().subscribe({
    next: (specialities: any[]) => {

      // ✅ keep FULL data untouched
      this.fullRows = specialities;

      // ✅ map only what table needs
      this.rows = specialities.map((c, index) => ({
        sno: index + 1,
        specialityId: c.specialityId,
        specialityName: c.specialityName,
        specialityStatus: c.specialityStatus
      }));
    },
    error: (err) => {
      console.error('Failed to load specialities', err);
    }
  });
}

onDelete(row: any) {
  if (!row?.specialityId) {
    return;
  }

  const apiCall =
    row.specialityStatus === 1
      ? this.adminservice.deactivateSpeciality(row.specialityId)
      : this.adminservice.activateSpeciality(row.specialityId);

  apiCall.subscribe({
    next: () => {
      this.loadSpeciality();
    },
    error: (err) => {
      console.error('Status update failed', err);
    }
  });
}

onAdd() {
    this.router.navigate(['speciality/add']);
  }

onEdit(row: any) {
  this.router.navigate(['speciality/edit', row.specialityId]); 
}

isEditMode = false;
specialityId!: number

  // onDelete(row: any) {
  //   console.log('Delete row:', row);
  // }

  
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

  this.adminservice.searchSpeciality(value).subscribe({
    next: (results: any[]) => {

      this.fullRows = results;

      this.rows = results.map((c, index) => ({
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

  this.adminservice.downloadSpecialityExcel(this.fullRows).subscribe({
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


}
