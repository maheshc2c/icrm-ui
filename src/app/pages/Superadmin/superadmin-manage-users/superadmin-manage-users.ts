import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { DataTable } from '../../../shared/data-table/data-table';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';
import { Button } from "../../../shared/button/button";
import { Router, ActivatedRoute } from '@angular/router';
import { Form } from '../../../shared/form/form';
import { Companyservice } from '../../../service/companyservice';
import { ManageUserService } from '../../../service/manageuserservice';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SearchFieldConfig } from '../../../shared/search/search';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-superadmin-manage-users',
  imports: [DataTable, Pageheader, Sidebar, Header],
  templateUrl: './superadmin-manage-users.html',
  styleUrl: './superadmin-manage-users.css',
})
export class SuperadminManageUsers implements OnInit {
  private platformId = inject(PLATFORM_ID);

  constructor(
    private manageuserService: ManageUserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  headerTitle = 'Manage Users';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/superadmindashboard' },
    { label: 'Manage User', route: '/superadmin/manage-users' },
    { label: 'Add New Manage User' }
  ];

  get role(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('role') : null;
  }

  columns = [
    { header: 'Employee ID', field: 'employeeId' },
    { header: 'Name', field: 'name' },
    { header: 'Company', field: 'company' },
    { header: 'Email', field: 'email' },
    { header: 'Mobile', field: 'mobile' }
  ];
  rows: any[] = [];
  //allRows: any[] = []; // 🔹 master copy
  fullRows: any[] = [];   // ✅ full API data (for Excel)
  isLoading = false;

  ngOnInit(): void {
    this.loadsuperadminmanageusers();
  }

  loadsuperadminmanageusers() {
    this.isLoading = true;

    this.manageuserService.getUsers().subscribe({
      next: (users: any[]) => {
        console.log('API Response:', users);


        this.fullRows = users;

        // ✅ OPTIMIZED MAPPING - Use for better performance with large datasets
        this.rows = users.map((c, index) => ({
          sno: index + 1,
          // employeeId: c.id,
          employeeId: c.username,
          name: `${c.firstName} ${c.lastName}`,
          company: c.company?.companyName || 'N/A',
          email: c.email,
          mobile: c.phoneNumber,
          userId: c.id
        }));

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load user list:', err);
        if (err.status === 401) {
          alert('Session expired, please login again.');
          this.router.navigate(['/superadmin/manage-user']);
        } else {
          alert('Failed to load users. Please try again.');
        }
      }
    });
  }

  //
  onAdd() {
    this.router.navigate(['/superadmin/add-manage-user']);
  }

  onEdit(row: any) {
    console.log('Edit received in Manage Users:', row);
    this.router.navigate(['/superadmin/edit-manage-user', row.userId]);
  }
  isEditMode = false;
  userId!: number

  onDelete(row: any) {
    console.log('Delete', row);
    // Clear cache and refresh after delete
    this.manageuserService.clearUsersCache();
    this.loadsuperadminmanageusers();
  }

  // Refresh data method
  refreshData(): void {
    this.manageuserService.clearUsersCache();
    this.loadsuperadminmanageusers();
  }



  //Search Funstionality

  searchFields: SearchFieldConfig[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Search by name',
      type: 'text'
    },
    {
      key: 'email',
      label: 'Email',
      placeholder: 'Search by email',
      type: 'text'
    }

  ];


  onSearch(searchData?: any) {
    console.log('Search data received (Client-side):', searchData);

    let searchName = '';
    let searchEmail = '';

    if (typeof searchData === 'string') {
      searchName = searchData.toLowerCase().trim();
    } else if (searchData && typeof searchData === 'object') {
      searchName = (searchData.name || '').toLowerCase().trim();
      searchEmail = (searchData.email || '').toLowerCase().trim();
    }

    if (!searchName && !searchEmail) {
      // 🔁 If empty search → restore full list from fullRows
      this.isLoading = true;
      this.rows = this.fullRows.map((c, index) => ({
        sno: index + 1,
        employeeId: c.username,
        // employeeId: c.id,
        name: `${c.firstName} ${c.lastName}`,
        company: c.company?.companyName || 'N/A',
        email: c.email,
        mobile: c.phoneNumber,
        userId: c.id
      }));
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    // Filter fullRows locally
    const filtered = this.fullRows.filter(c => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const email = (c.email || '').toLowerCase();
      const company = (c.company?.companyName || '').toLowerCase();
      const mobile = (c.phoneNumber || '').toLowerCase();

      // Match either name OR email (if email is provided)
      const matchesName = searchName ? (fullName.includes(searchName) || email.includes(searchName) || company.includes(searchName) || mobile.includes(searchName)) : true;
      const matchesEmail = searchEmail ? email.includes(searchEmail) : true;

      return matchesName && matchesEmail;
    });

    // Update table rows
    this.rows = filtered.map((c, index) => ({
      sno: index + 1,
      // employeeId: c.id,
      employeeId: c.username,
      name: `${c.firstName} ${c.lastName}`,
      company: c.company?.companyName || 'N/A',
      email: c.email,
      mobile: c.phoneNumber,
      userId: c.id
    }));

    this.isLoading = false;
  }



  //Download

  onImport() {
    if (!this.rows || this.rows.length === 0) {
      alert('No data available to download');
      return;
    }

    // Transform current table rows for Excel formatting
    const excelData = this.rows.map((row) => ({
      'S.NO': row.sno,
      'Employee ID': row.employeeId,
      'Name': row.name,
      'Company': row.company,
      'Email': row.email,
      'Mobile': row.mobile
    }));

    // Generate worksheet and workbook
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Users': worksheet },
      SheetNames: ['Users']
    };

    // Buffer the binary and trigger local download
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    saveAs(data, `users_export_${new Date().getTime()}.xlsx`);
  }

}