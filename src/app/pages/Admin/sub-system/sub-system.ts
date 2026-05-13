import { Component, OnInit } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { DataTable } from '../../../shared/data-table/data-table';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Adminservice } from '../../../service/adminservice';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  standalone: true,
  selector: 'app-sub-system',
  imports: [Header, DataTable, Sidebar, Pageheader],
  templateUrl: './sub-system.html',
  styleUrls: ['./sub-system.css'],
})
export class SubSystem implements OnInit {

  constructor(
    private adminservice: Adminservice,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  headerTitle = 'Manage Sub System';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Sub System', route: '/admin/sub-system' },
    { label: 'Add New' }
  ];

  // Table Columns
  columns = [
    { header: 'Sub System', field: 'subcategoryName' }
  ];

  rows: any[] = [];
  fullRows: any[] = [];

  ngOnInit(): void {
    this.loadSubSystems();
  }

  // Load Subsystems
  private loadSubSystems(): void {
  this.adminservice.getSubSystem().subscribe({
    next: (res: any) => {

      console.log('API Response:', res);

      // Convert object → array safely
      const subsystems = Array.isArray(res) ? res : [res];

      this.fullRows = subsystems;

      this.rows = subsystems.map((c, index) => ({
        sno: index + 1,
        subCategoryId: c.subCategoryId,
        subcategoryName: c.subcategoryName || c.name,
        subcategoryStatus: c.subcategoryStatus || c.status
      }));
    },
    error: err => {
      console.error('API ERROR:', err);
      this.rows = [];
    }
  });
}
  // Add
  onAdd() {
    this.router.navigate(['sub-system/add']);
  }

  // Edit
  onEdit(row: any) {
    this.router.navigate(['sub-system/edit', row.subCategoryId]);
  }

  // Delete placeholder
  onDelete(row: any) {
    console.log('Delete clicked:', row);
  }

  onSearch(keyword: string) {

  if (!keyword?.trim()) {
    this.loadSubSystems();
    return;
  }

  this.adminservice.searchSubSystem(keyword).subscribe({
    next: (res: any) => {

      console.log('Search Response:', res);

      // Handle object OR array response
      const results = Array.isArray(res) ? res : [res];

      this.rows = results.map((s, index) => ({
        sno: index + 1,
        subCategoryId: s.subCategoryId,
        subcategoryName: s.subcategoryName || s.name,
        subcategoryStatus: s.subcategoryStatus || s.status
      }));
    },
    error: err => {
      console.error('Search Error:', err);
      this.rows = [];
    }
  });
}

 onImport() {

  if (!this.fullRows?.length) {
    alert('No data available to download');
    return;
  }

  const payload = Array.isArray(this.fullRows)
    ? this.fullRows
    : [this.fullRows];

  this.adminservice.downloadSubSystemExcel(payload).subscribe({
    next: (blob: Blob) => {

      const file = new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(file);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'SubSystem.xlsx';
      link.click();

      window.URL.revokeObjectURL(url);
    },
    error: err => {
      console.error('Download error:', err);
      alert('Excel download failed');
    }
  });
}

  
searchFields: SearchFieldConfig[] = [
  {
    key: 'subcategoryName',
    label: 'Sub System',
    placeholder: 'Search Sub System',
    type: 'text'
  }
];
}
