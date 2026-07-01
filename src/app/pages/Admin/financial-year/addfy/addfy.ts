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
import { ToastService } from '../../../../service/toast.service';


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
    private router: Router,
    private toastService: ToastService
  ) {}

  /* ================= HEADER ================= */
  headerTitle = 'Add New Financial Year';
  headerBreadcrumbs: Breadcrumb[] = [];

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

  this.headerTitle = 'Add New Financial Year';

  this.headerBreadcrumbs = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Financial Year', route: '/financial-yr' },
    { label: 'Add Financial Year' }
  ];
}


  /* ================= SAVE ================= */
  savefy(data: Partial<FinancialyrModel>): void {

  const payload = {
    fyName: data.fyName?.trim(),
    fyStartDate: data.fyStartDate,
    fyEndDate: data.fyEndDate,
    fyStatus: 1
  };

  this.adminService.createfy(payload).subscribe({

    next: (response: any) => {

      this.toastService.success(
        'Financial Year created successfully'
      );

      this.adminService
        .getFinancialYearCalendar(response.fyId)
        .subscribe({

          next: (calendarResponse: any) => {

            this.router.navigate(
              ['/financial-year-calendar'],
              {
                state: {
                  data: calendarResponse,
                  fyName: response.fyName,
                  fyStartDate: response.fyStartDate
                }
              }
            );
          }
        });
    },

    error: err => {

      this.toastService.error(
        err?.error?.message ||
        'Failed to create Financial Year'
      );
    }
  });
}

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/financial-yr']);
  }

}
