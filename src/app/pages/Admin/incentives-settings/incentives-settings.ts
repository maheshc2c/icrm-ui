import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Adminservice } from '../../../service/adminservice';
import { Breadcrumb } from '../../../models/breadcrumb';

@Component({
  selector: 'app-incentives-settings',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './incentives-settings.html',
  styleUrl: './incentives-settings.css'
})
export class IncentivesSettings implements OnInit {
  headerTitle = 'Manage Settings';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Settings' }
  ];

  columns = [
    { header: 'Financial Year', field: 'financialYear' },
    { header: 'Role', field: 'role' }
  ];

  rows: any[] = [];
  selectedFyId: number | null = null;
  selectedRoleId: number | null = null;

  roleOptions: Array<{ label: string; value: string }> = [];
  financialYearOptions: Array<{ label: string; value: string }> = [];

  searchFields: SearchFieldConfig[] = [
    {
      key: 'financialYear',
      label: 'Financial Year',
      type: 'select',
      placeholder: 'Select Year',
      options: this.financialYearOptions
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      placeholder: 'Select Role',
      options: this.roleOptions
    }
  ];

  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  totalItems = this.rows.length;

  constructor(private router: Router, private adminService: Adminservice) {}

  ngOnInit(): void {
    this.loadFinancialYears();
    this.loadRoles();
    this.loadIncentives();
  }

  loadFinancialYears(): void {
    this.adminService.getFinancialYearsDropdown().subscribe({
      next: (res) => {
        const response = res as any;
        const source = Array.isArray(response) ? response : (response?.data ?? []);
        this.financialYearOptions = source.map((item: any) => {
          if (typeof item === 'string') return { label: item, value: item };
          const year = item.fyName ?? item.label ?? item.value ?? String(item);
          const value = item.fyId ?? item.id ?? item.value ?? year;
          return { label: year, value };
        });

        const sf = this.searchFields.find(s => s.key === 'financialYear');
        if (sf) {
          sf.options = this.financialYearOptions;
          sf._filtered = this.financialYearOptions.slice();
        }
      },
      error: () => {
        this.financialYearOptions = [];
      }
    });
  }

  loadRoles(): void {
    this.adminService.getRolesSearchDropdown().subscribe({
      next: (res) => {
        const response = res as any;
        const source = Array.isArray(response) ? response : (response?.data ?? []);

        this.roleOptions = source.map((r: any) => {
          if (typeof r === 'string') return { label: r, value: r };
          const name = r.roleName ?? r.name ?? r.label ?? r.value ?? JSON.stringify(r);
          const value = r.roleId ?? r.id ?? r.value ?? name;
          return { label: name, value };
        });

        const sf = this.searchFields.find(s => s.key === 'role');
        if (sf) {
          sf.options = this.roleOptions;
          sf._filtered = this.roleOptions.slice();
        }
      },
      error: () => {
        this.roleOptions = [];
      }
    });
  }

  onView(row: any) {
    const incentiveId = row.incentives_id ?? row.incentivesId ?? row.id ?? row.incentiveId ?? null;
    if (!incentiveId) {
      console.error('Unable to determine incentive ID for view navigation:', row);
      return;
    }

    console.log('Navigating to view incentives with data:', row, 'using id:', incentiveId);
    this.router.navigate([`/admin/incentives-settings/view`, incentiveId], {
      state: { data: row }
    });
  }

  onAdd() {
    this.router.navigate(['/admin/incentives-settings/add']);
  }

  onSearchFromChild(searchValues: any) {
    console.log('Filters received:', searchValues);
    this.selectedFyId = searchValues.financialYear != null && searchValues.financialYear !== ''
      ? Number(searchValues.financialYear)
      : null;
    this.selectedRoleId = searchValues.role != null && searchValues.role !== ''
      ? Number(searchValues.role)
      : null;

    this.currentPage = 1;
    this.loadIncentives(0, this.pageSize);
  }

  onRefresh() {
    this.selectedFyId = null;
    this.selectedRoleId = null;
    this.currentPage = 1;
    this.loadIncentives(0, this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadIncentives(page - 1, this.pageSize);
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadIncentives(0, size);
  }

  private loadIncentives(page: number = 0, size: number = this.pageSize) {
    const payload = {
      fyId: this.selectedFyId,
      roleId: this.selectedRoleId,
      pagination: {
        pageNumber: page,
        pageSize: size,
        sortBy: 'createdTime',
        sortOrder: 'DESC'
      }
    };

    this.adminService.getIncentivesList(payload).subscribe({
      next: (res) => {
        const response = res as any;
        const dataArray = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.content)
              ? response.data.content
              : Array.isArray(response?.content)
                ? response.content
                : [];

        this.rows = dataArray.map((item: any) => ({
          ...item,
          incentives_id: item.incentives_id ?? item.incentivesId ?? item.incentiveId ?? item.id,
          financialYear: item.financialYear?.fyName ?? item.fyName ?? item.financialYear ?? item.financial_year ?? item.year,
          role: item.role?.roleName ?? item.roleName ?? item.role ?? item.userRole ?? item.role_name,
          value: item.value ?? item.quarterIncentive ?? item.quarter_value,
          upperValue: item.upperValue ?? item.upperCap ?? item.upper_value,
          ppLl: item.ppLl ?? item.ppLL ?? item.pp_ll,
          ppUl: item.ppUl ?? item.ppUL ?? item.pp_ul,
          spLl: item.spLl ?? item.spLL ?? item.sp_ll,
          spUl: item.spUl ?? item.spUL ?? item.sp_ul
        }));

        this.totalItems = response.totalElements ?? response.totalItems ?? dataArray.length;
        this.totalPages = response.totalPages ?? Math.ceil(this.totalItems / size);
        this.currentPage = page + 1;
      },
      error: (err) => {
        console.error('Failed to load incentives list:', err);
        this.rows = [];
        this.totalItems = 0;
        this.totalPages = 1;
        this.currentPage = 1;
      }
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.rows.length / this.pageSize);
  }
}
