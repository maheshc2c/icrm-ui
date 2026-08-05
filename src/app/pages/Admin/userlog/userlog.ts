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

  headerTitle = 'Manage User Logs';

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

        // Dynamically populate role search field options from loaded logs
        const uniqueRoles = Array.from(new Set(logs.map(l => l.role).filter(Boolean)));
        const roleOptions = uniqueRoles.map(role => ({ label: role, value: role }));
        const roleField = this.searchFields.find(f => f.key === 'role');
        if (roleField) {
          roleField.options = roleOptions;
        }

        this.resetRows();
      },
      error: err => console.error('Load error:', err)
    });
  }

  private resetRows(): void {
    this.mapRows(this.fullRows);
  }

  private mapRows(logs: UserlogModel[]): void {
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
      key: 'role',
      label: 'Role ',
      dependsOn: '',
      placeholder: 'Select Role',
      type: 'select',
      options: []
    },

    {
      key: 'name',
      label: 'Name',
      placeholder: 'search name',
      type: 'text'
    },

    {
      key: 'employeeId',
      label: 'Employee ID',
      placeholder: 'Search employee ID',
      type: 'text'
    },

   {
    key: 'fromDate',
    label: 'From Date',
    placeholder: 'Select from date',
    type: 'date'
   },
   
   {
    key: 'toDate',
    label: 'To Date',
    placeholder: 'Select to date',
    type: 'date'
   }
  ];

  onSearch(keyword: string) {
    if (!keyword?.trim()) {
      this.resetRows();
      return;
    }
    const kw = keyword.toLowerCase().trim();
    const filtered = this.fullRows.filter(l => 
      (l.name && l.name.toLowerCase().includes(kw)) ||
      (l.role && l.role.toLowerCase().includes(kw)) ||
      (l.employeeId && l.employeeId.toLowerCase().includes(kw)) ||
      (l.branch && l.branch.toLowerCase().includes(kw)) ||
      (l.ipAddress && l.ipAddress.toLowerCase().includes(kw)) ||
      (l.browser && l.browser.toLowerCase().includes(kw))
    );
    this.mapRows(filtered);
  }

  onSearchChange(filters: any) {
    if (!filters || Object.keys(filters).length === 0) {
      this.resetRows();
      return;
    }

    let filtered = [...this.fullRows];

    if (filters.role) {
      filtered = filtered.filter(l => l.role && l.role.trim().toLowerCase() === filters.role.trim().toLowerCase());
    }

    if (filters.name) {
      filtered = filtered.filter(l => l.name && l.name.toLowerCase().includes(filters.name.toLowerCase()));
    }

    if (filters.employeeId) {
      filtered = filtered.filter(l => l.employeeId && l.employeeId.toLowerCase().includes(filters.employeeId.toLowerCase()));
    }

    if (filters.fromDate) {
      filtered = filtered.filter(l => {
        if (!l.loginTime) return false;
        const logDateStr = l.loginTime.substring(0, 10);
        return logDateStr >= filters.fromDate;
      });
    }

    if (filters.toDate) {
      filtered = filtered.filter(l => {
        if (!l.loginTime) return false;
        const logDateStr = l.loginTime.substring(0, 10);
        return logDateStr <= filters.toDate;
      });
    }

    this.mapRows(filtered);
  }

  onReset() {
    this.resetRows();
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
