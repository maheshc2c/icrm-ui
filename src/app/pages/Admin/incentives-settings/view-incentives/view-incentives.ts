import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Adminservice } from '../../../../service/adminservice';

@Component({
  selector: 'app-view-incentives',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader],
  templateUrl: './view-incentives.html',
  styleUrls: ['./view-incentives.css']
})
export class ViewIncentives implements OnInit {
  headerTitle = 'View Incentive Settings';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Settings', route: '/admin/incentives-settings' },
    { label: 'View Incentive Settings' }
  ];

  data: any = null;
  responseData: any = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly adminService: Adminservice
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number.parseInt(idParam, 10) : null;
    const navigation = this.router.getCurrentNavigation();
    const source = navigation?.extras?.state?.['data'];

    if (id !== null) {
      this.loadIncentive(id, source);
    } else if (source) {
      this.responseData = source;
      this.data = this.normalizeData(source);
    }
  }

  private loadIncentive(id: number, fallbackSource?: any) {
    this.adminService.getIncentiveById(id).subscribe({
      next: (res) => {
        const response = res as any;
        const source = response?.data ?? response;
        this.data = this.normalizeData(source);
      },
      error: (err) => {
        console.error('Failed to load incentive:', err);
        if (fallbackSource) {
          this.data = this.normalizeData(fallbackSource);
        } else {
          this.data = null;
        }
      }
    });
  }

  private normalizeData(source: any) {
    return {
      financialYear: source.fyName ?? source.financialYear ?? source.financial_year ?? '2024-25',
      role: source.roleName ?? source.role ?? source.userRole ?? 'Regional Sales Manager',
      quarterIncentive: source.value ?? source.quarterIncentive ?? source.quarter_value ?? '75000',
      upperCap: source.upperCap ?? source.upperValue ?? source.upper_value ?? '90000',
      section1: source.gradeA?.section1 ?? source.section1 ?? source.field1 ?? 'Grade A',
      ppLL: source.gradeA?.ppLl ?? source.ppLl ?? source.ppLL ?? source.pp_ll ?? '85%',
      ppUL: source.gradeA?.ppUl ?? source.ppUl ?? source.ppUL ?? source.pp_ul ?? '100%',
      spLL: source.gradeA?.spLl ?? source.spLl ?? source.spLL ?? source.sp_ll ?? '85%',
      spUL: source.gradeA?.spUl ?? source.spUl ?? source.spUL ?? source.sp_ul ?? '100%',
      section2: source.gradeB?.section2 ?? source.gradeB?.section1 ?? source.section2 ?? source.field2 ?? null,
      ppLL2: source.gradeB?.pp2Ll ?? source.gradeB?.ppLl ?? source.gradeB?.ppLL ?? source.ppLl ?? source.ppLL ?? source.pp_ll ?? null,
      ppUL2: source.gradeB?.pp2Ul ?? source.gradeB?.ppUl ?? source.gradeB?.ppUL ?? source.ppUl ?? source.ppUL ?? source.pp_ul ?? null,
      spLL2: source.gradeB?.sp2Ll ?? source.gradeB?.spLl ?? source.gradeB?.spLL ?? source.spLl ?? source.spLL ?? source.sp_ll ?? null,
      spUL2: source.gradeB?.sp2Ul ?? source.gradeB?.spUl ?? source.gradeB?.spUL ?? source.spUl ?? source.spUL ?? source.sp_ul ?? null
    };
  }

  onBack() {
    this.router.navigate(['/admin/incentives-settings']);
  }
}
