import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';
import { UserlogModel } from '../../../models/userlog-model';
import { Breadcrumb } from '../../../models/breadcrumb';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Adminservice } from '../../../service/adminservice';

@Component({
  selector: 'app-userlog',
  imports: [CommonModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './userlog.html',
  styleUrl: './userlog.css',
})
export class Userlog {

  constructor(
    private adminservice: Adminservice,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /* ================= HEADER ================= */

  headerTitle = 'User Login History';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'User Log', route: '/admin/userlog' }
  ];

  /* ================= TABLE ================= */

  columns = [
    { header: 'Name', field: 'name' },
    { header: 'Role', field: 'role' },
    { header: 'Employee ID', field: 'employeeId' },
    { header: 'Branch', field: 'branch' },
    { header: 'Login Time', field: 'loginTime' },
    { header: 'Last Active', field: 'lastActive' },
    { header: 'IP Address', field: 'ipAddress' },
    { header: 'Browser', field: 'browser' }
  ];

  rows: any[] = [];
  fullRows: UserlogModel[] = [];

  /* ================= INIT ================= */

  ngOnInit(): void {
    this.loadUserLogs();
  }

  /* ================= LOAD ================= */

  private loadUserLogs(): void {
    this.adminservice.getUserLogs().subscribe({
      next: (logs: UserlogModel[]) => {

        this.fullRows = logs;

        this.rows = logs.map((l, index) => ({
          sno: index + 1,
          name: l.name,
          role: l.role,
          employeeId: l.employeeId,
          branch: l.branch,
          loginTime: l.loginTime,
          lastActive: l.lastActive,
          ipAddress: l.ipAddress,
          browser: l.browser
        }));
      },
      error: err => console.error('Load error:', err)
    });
  }

  /* ================= DOWNLOAD ================= */

  onImport() {

    if (!this.fullRows?.length) {
      alert('No data available to download');
      return;
    }

    this.adminservice.downloadUserLogExcel(this.fullRows)
      .subscribe({
        next: (blob: Blob) => {

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');

          a.href = url;
          a.download = 'UserLoginHistory.xlsx';
          a.click();

          window.URL.revokeObjectURL(url);
        },
        error: err => {
          console.error(err);
          alert('Download failed');
        }
      });
  }

  /* ================= SEARCH ================= */

  searchFields: SearchFieldConfig[] = [
    {
      key: 'name',
      label: 'User Name',
      placeholder: 'Search user',
      type: 'text'
    }
  ];

  onSearch(keyword: string) {

    if (!keyword?.trim()) {
      this.loadUserLogs();
      return;
    }

    this.adminservice.searchUserLogs(keyword)
      .subscribe({
        next: logs => {
          this.rows = logs.map((l, index) => ({
            sno: index + 1,
            name: l.name,
            role: l.role,
            employeeId: l.employeeId,
            branch: l.branch,
            loginTime: l.loginTime,
            lastActive: l.lastActive,
            ipAddress: l.ipAddress,
            browser: l.browser
          }));
        },
        error: err => console.error(err)
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
  // Edit
  onDelete(row: any) {
    this.router.navigate(['sub-system/edit', row.subCategoryId]);
  }

}
