import { Component, OnInit } from '@angular/core';
import { Header } from '../../../../layout/header/header';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Adminservice } from '../../../../service/adminservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { FinancialyrModel } from '../../../../models/financialyr-model';

@Component({
  selector: 'app-addfy',
  standalone: true,
  imports: [Header, Pageheader, Form, CommonModule, Sidebar],
  templateUrl: './addfy.html',
  styleUrl: './addfy.css',
})
export class Addfy implements OnInit {

  constructor(
    private adminService: Adminservice,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /* ================= HEADER ================= */
  headerTitle = 'Add New Financial Year';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= STATE ================= */
  isEditMode = false;
  fyId!: number;
  formInitialData: Partial<FinancialyrModel> = {};

  /* ================= FORM FIELDS ================= */
  fyFields = [
  {
    name: 'fyStartDate',     // ✅ MUST be name
    label: 'Start Date',
    type: 'date',
    placeholder: 'Start Date',
    required: true
  },
  {
    name: 'fyEndDate',       // ✅ MUST be name
    label: 'End Date',
    type: 'date',
    placeholder: 'End Date',
    required: true
  },
  {
    name: 'fyName',          // ✅ FIXED typo
    label: 'Financial Year',
    type: 'text',            // ✅ FIXED type
    placeholder: 'For example: 2025-26',
    required: true
  }
];


  /* ================= INIT ================= */
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam !== null) {
      this.isEditMode = true;
      this.fyId = Number(idParam);

      this.headerTitle = 'Edit Financial Year';
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'Financial Year', route: '/admin/financial-yr' },
        { label: 'Edit Financial Year' }
      ];

      this.loadFyById(this.fyId);
    } else {
      this.isEditMode = false;
      this.headerTitle = 'Add New Financial Year';
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'Financial Year', route: '/admin/financial-yr' },
        { label: 'Add Financial Year' }
      ];
    }
  }

  /* ================= LOAD ================= */
  private loadFyById(id: number): void {
    this.adminService.getfinancialyr().subscribe({
      next: (financialYears: FinancialyrModel[]) => {

        const financial = financialYears.find(f => f.fyId === id);

        if (!financial) {
          alert('Financial Year not found');
          this.router.navigate(['/admin/financial-yr']);
          return;
        }

        this.formInitialData = {
          fyId: financial.fyId,
          fyName: financial.fyName,
          fyStartDate: financial.fyStartDate,
          fyEndDate: financial.fyEndDate,
          fyStatus: financial.fyStatus
        };
      },
      error: () => {
        alert('Failed to load financial year');
        this.router.navigate(['/admin/financial-yr']);
      }
    });
  }

  /* ================= SAVE ================= */
  savefy(data: Partial<FinancialyrModel>): void {

  const payload = {
    fyName: data.fyName!.trim(),
    fyStartDate: String(data.fyStartDate),
    fyEndDate: String(data.fyEndDate),
    fyStatus: data.fyStatus ?? 1
  };

  if (this.isEditMode) {

    this.adminService.updatefy(this.fyId, payload as any).subscribe({
      next: () => this.router.navigate(['/admin/financial-yr']),
      error: err => {
        console.error('Update failed:', err);
        alert('Failed to update financial year');
      }
    });

  } else {

    this.adminService.createfy(payload as any).subscribe({
      next: () => this.router.navigate(['/admin/financial-yr']),
      error: err => {
        console.error('Create failed:', err);
        alert('Failed to create financial year');
      }
    });
  }
}

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/admin/financial-yr']);
  }

}
