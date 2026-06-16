import { Component, OnInit } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { DataTable } from '../../../shared/data-table/data-table';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Adminservice } from '../../../service/adminservice';
import { SearchFieldConfig } from '../../../shared/search/search';
import { ToastService } from '../../../service/toast.service';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';

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
    private route: ActivatedRoute,
    private toastService: ToastService,
    private confirmService: ConfirmDialogService
  ) {}

  headerTitle = 'Manage Sub System';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Sub System', route: '/sub-system' },
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

      const subsystems = (Array.isArray(res) ? res : [res])
        .sort((a: any, b: any) => b.subCategoryId - a.subCategoryId);

      this.fullRows = subsystems;

      this.rows = subsystems.map((c, index) => ({
        sno: index + 1,
        subCategoryId: c.subCategoryId,
        subcategoryName: c.subcategoryName || c.name,
        status: c.subcategoryStatus || c.status
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

    // actiavte and deactivate
   onDelete(row: any) {

  const isActive = Number(row.status) === 1;

  this.confirmService.confirm({
    title: 'Confirm',
    message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this Sub System?`,
    confirmText: isActive ? 'Deactivate' : 'Activate'
  }).then((confirmed) => {

    if (!confirmed) return;

    this.adminservice.toggleSubSystem(row.subCategoryId)
      .subscribe({
        next: () => {

          row.status =
            Number(row.status) === 1 ? 2 : 1;

          this.rows = [...this.rows];
          this.toastService.success(`SubSystem ${isActive ? 'deactivated' : 'activated'} successfully`);

          this.loadSubSystems();
        },
        error: err => {
          console.error(err);
          this.toastService.error('Failed to update status');
        }
      });

  });
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
        status: s.subcategoryStatus || s.status
      }));
    },
    error: err => {
      console.error('Search Error:', err);
      this.rows = [];
    }
  });
}


onImport() {

  if (!this.rows?.length) {
    alert('No data available to download');
    return;
  }
  

  console.log('ROWS =>', this.rows);

const payload = this.rows.map(row => ({
  subCategoryId: row.subCategoryId,
  subcategoryName: row.subcategoryName,
  subcategoryStatus: row.subcategoryStatus
}));

console.log('DOWNLOAD PAYLOAD =>', payload);

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
