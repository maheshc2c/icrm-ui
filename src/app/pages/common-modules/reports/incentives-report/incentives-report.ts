import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ReportsLayoutComponent } from '../reports-layout/reports-layout';

@Component({
  selector: 'app-incentives-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportsLayoutComponent],
  templateUrl: './incentives-report.html',
  styleUrl: './incentives-report.css'
})
export class IncentivesReportComponent implements OnInit {
  title = 'Incentives Report';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Incentives Report' }
  ];

  selectUsers = 'Select Users';
  quarter = 'Quarter1';
  financialYear = '2026-27';

  reports = [
    {
      id: 1,
      role: 'Super User',
      user: 'Krishna T',
      erpTarget: 0,
      erpSales: 9.85,
      incentiveAmount: 0
    }
  ];

  ngOnInit(): void {
    // placeholder for future API wiring
  }
}
