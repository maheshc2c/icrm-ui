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
  totalElements = 0;
pageNumber = 0;
pageSize = 10;

  ngOnInit(): void {
    this.loadSubSystems();
  }

  // new Load Subsystems
 private loadSubSystems(
  pageNumber: number = 0,
  pageSize: number = 10,
  keyword: string = ''
): void {

  this.adminservice
    .getSubSystems(keyword, pageNumber, pageSize)
    .subscribe({

      next: (res: any) => {

        const data = res?.content || [];

        this.totalElements = res?.totalElements || 0;

        this.rows = data
          .filter((s: any) => s?.subcategoryName)
          .map((s: any, index: number) => ({
            sno: pageNumber * pageSize + index + 1,
            subCategoryId: s.SubCategoryId ?? s.subCategoryId,
            subcategoryName: s.subcategoryName,
            status: s.SubcategoryStatus ?? s.subcategoryStatus
          }));
      },

      error: err => {
        console.error(err);
        this.rows = [];
        this.totalElements = 0;
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

searchKeyword = '';

onSearch(keyword: string): void {

  this.searchKeyword = keyword?.trim() || '';

  this.loadSubSystems(
    0,
    this.pageSize,
    this.searchKeyword
  );
}

onImport() {

  const payload = {
    name: this.searchKeyword || null,
    pagination: {
      pageNumber: 0,
      pageSize: 100000,
      sortBy: 'SubcategoryCreatedTime',
      sortOrder: 'DESC'
    }
  };

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
      console.error(err);
      this.toastService.error('Excel download failed');
    }
  });
}

onReset(): void {

  this.searchKeyword = '';
  this.pageNumber = 0;
  this.currentPage = 1;

  this.loadSubSystems();
}

currentPage = 1;
totalPages = 1;

onPageChange(page: number) {

  this.currentPage = page;

  this.loadSubSystems(
    page - 1,
    this.pageSize,
    this.searchKeyword
  );
}
onPageSizeChange(size: number) {

  this.pageSize = size;
  this.pageNumber = 0;
  this.currentPage = 1;

  this.loadSubSystems(
    this.pageNumber,
    this.pageSize
  );
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
