import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ReportsLayoutComponent } from '../reports-layout/reports-layout';
import { ReportService, IncentiveFilterRequest } from '../../../../service/report.service';

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

  selectedUserId: number | null = null;
  quarter = 'Q1';
  financialYear = '2026-27';
  financialYearId: number = 1;

  users: { id: number; label: string }[] = [];
  isLoading = false;
  isDownloading = false;

  reports: any[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadReport();
  }

  loadUsers(): void {
    this.reportService.getUsersForDropdown().subscribe({
      next: (userList) => {
        this.users = userList;
      },
      error: (err) => console.error('Failed to load users for dropdown', err)
    });
  }

  buildFilterPayload(): IncentiveFilterRequest {
    return {
      userId: this.selectedUserId ? Number(this.selectedUserId) : null,
      quarter: this.quarter,
      financialYearId: this.financialYearId,
      pagination: {
        pageNumber: 0,
        pageSize: 100,
        sortBy: 'id',
        sortOrder: 'ASC'
      }
    };
  }

  loadReport(): void {
    this.isLoading = true;
    const filter = this.buildFilterPayload();
    this.reportService.getIncentivesReport(filter).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.status && Array.isArray(res.data)) {
          this.reports = res.data.map((item: any, idx: number) => ({
            id: idx + 1,
            role: item.role || 'N/A',
            user: item.name || 'N/A',
            erpTarget: item.totalTarget ?? 0,
            erpSales: item.totalSales ?? 0,
            incentiveAmount: item.incentiveAmount ?? 0
          }));
        } else if (res && Array.isArray(res)) {
          this.reports = res.map((item: any, idx: number) => ({
            id: idx + 1,
            role: item.role || 'N/A',
            user: item.name || 'N/A',
            erpTarget: item.totalTarget ?? 0,
            erpSales: item.totalSales ?? 0,
            incentiveAmount: item.incentiveAmount ?? 0
          }));
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching incentives report', err);
      }
    });
  }

  onDownload(): void {
    this.isDownloading = true;
    const filter = this.buildFilterPayload();
    this.reportService.downloadIncentivesReport(filter).subscribe({
      next: (blob: Blob) => {
        this.isDownloading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Incentives_Report_${this.quarter}_${this.financialYear}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.isDownloading = false;
        console.error('Error downloading incentives report', err);
      }
    });
  }

  get totalIncentives(): number {
    return this.reports.reduce((acc, curr) => acc + (curr.incentiveAmount || 0), 0);
  }
}
