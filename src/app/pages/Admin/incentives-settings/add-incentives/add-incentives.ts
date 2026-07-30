import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ToastService } from '../../../../service/toast.service';
import { Adminservice } from '../../../../service/adminservice';

@Component({
  selector: 'app-add-incentives',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader],
  templateUrl: './add-incentives.html',
  styleUrl: './add-incentives.css'
})
export class AddIncentives implements OnInit {
  headerTitle = 'Settings';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Settings' }
  ];

  financialYears: Array<{ label: string; value: number | string }> = [];
  roles: Array<{ label: string; value: number | string }> = [];

  formData = {
    incentivesId: null,
    fyId: null,
    role: '',
    roleId: null,
    value: null,
    upperValue: null,
    osPercent: null,
    section1: 'Grade A',
    ppLl: null,
    ppUl: null,
    spLl: null,
    spUl: null,
    section2: 'Grade B',
    pp2Ll: null,
    pp2Ul: null,
    sp2Ll: null,
    sp2Ul: null,
    fromDate: '2018-03-12',
    toDate: null,
    status: 1
  };

  constructor(
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly adminService: Adminservice
  ) {}

  ngOnInit(): void {
    this.loadFinancialYears();
    this.loadRoles();
  }

  loadFinancialYears(): void {
    this.adminService.getFinancialYearsDropdown().subscribe({
      next: (res) => {
        const response = res as any;
        const source = Array.isArray(response) ? response : (response?.data ?? []);
        this.financialYears = source.map((item: any) => {
          const label = item.fyName ?? item.label ?? item.value ?? String(item);
          const value = item.fyId ?? item.id ?? item.value ?? label;
          return { label, value };
        });
      },
      error: () => {
        this.financialYears = [];
      }
    });
  }

  loadRoles(): void {
    this.adminService.getRolesSearchDropdown().subscribe({
      next: (res) => {
        const source = Array.isArray(res) ? res : (res?.data ?? []);
        this.roles = source.map((r: any) => {
          if (typeof r === 'string') {
            return { label: r, value: r };
          }
          const label = r.roleName ?? r.name ?? r.label ?? r.value ?? String(r);
          const value = r.roleId ?? r.id ?? r.value ?? label;
          return { label, value };
        });
      },
      error: () => {
        this.roles = [];
      }
    });
  }

  onRoleSelected(roleId: any): void {
    const selected = this.roles.find((r) => r.value === roleId);
    this.formData.role = selected?.label ?? '';
  }

  private isEmptyValue(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  onSubmit() {
    if (!this.formData.fyId || !this.formData.roleId) {
      this.toastService.error('Please fill in all required fields.');
      return;
    }

    if (
      this.isEmptyValue(this.formData.ppLl) ||
      this.isEmptyValue(this.formData.ppUl) ||
      this.isEmptyValue(this.formData.spLl) ||
      this.isEmptyValue(this.formData.spUl) ||
      this.isEmptyValue(this.formData.value) ||
      this.isEmptyValue(this.formData.upperValue)
    ) {
      this.toastService.error('Please fill in all required Grade A fields.');
      return;
    }

    if (this.formData.role === 'Sales Manager') {
      if (
        this.isEmptyValue(this.formData.pp2Ll) ||
        this.isEmptyValue(this.formData.pp2Ul) ||
        this.isEmptyValue(this.formData.sp2Ll) ||
        this.isEmptyValue(this.formData.sp2Ul)
      ) {
        this.toastService.error('Please fill in all Grade B values for Sales Manager.');
        return;
      }
    }

    const payload: any = {
      fyId: Number(this.formData.fyId),
      roleId: Number(this.formData.roleId),
      value: Number(this.formData.value),
      upperValue: Number(this.formData.upperValue),
      osPercent: this.formData.osPercent != null ? Number(this.formData.osPercent) : 15.0,
      gradeA: {
        section1: this.formData.section1,
        ppLl: Number(this.formData.ppLl),
        ppUl: Number(this.formData.ppUl),
        spLl: Number(this.formData.spLl),
        spUl: Number(this.formData.spUl)
      },
      fromDate: this.formData.fromDate || '2018-03-12',
      toDate: this.formData.toDate || null,
      status: 1
    };

    if (this.formData.role === 'Sales Manager') {
      payload.gradeB = {
        section2: this.formData.section2,
        pp2Ll: this.formData.pp2Ll != null ? Number(this.formData.pp2Ll) : null,
        pp2Ul: this.formData.pp2Ul != null ? Number(this.formData.pp2Ul) : null,
        sp2Ll: this.formData.sp2Ll != null ? Number(this.formData.sp2Ll) : null,
        sp2Ul: this.formData.sp2Ul != null ? Number(this.formData.sp2Ul) : null
      };
    } else {
      payload.gradeB = null;
    }

    if (this.formData.incentivesId != null) {
      payload.incentivesId = this.formData.incentivesId;
    }

    this.adminService.saveIncentive(payload).subscribe({
      next: () => {
        this.toastService.success('Incentive settings added successfully.');
        this.router.navigate(['/admin/incentives-settings']);
      },
      error: (err) => {
        console.error('Save incentive failed:', err);
        this.toastService.error('Failed to save incentive settings.');
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/incentives-settings']);
  }
}
