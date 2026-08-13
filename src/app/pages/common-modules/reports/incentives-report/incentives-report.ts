import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ReportsLayoutComponent } from '../reports-layout/reports-layout';
import { AuthService } from '../../../../service/auth-service';

@Component({
  selector: 'app-incentives-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportsLayoutComponent, HttpClientModule],
  templateUrl: './incentives-report.html',
  styleUrl: './incentives-report.css'
})
export class IncentivesReportComponent implements OnInit {
  title = 'Incentives Report';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Incentives Report' }
  ];

  selectedUser: any = null;
  quarter = 'Quarter1';
  financialYear: string | null = null;

  users: any[] = [];
  financialYears: any[] = [];

  filteredUsers: any[] = [];
  searchTerm = '';
  isDropdownOpen = false;

  reports: any[] = [];

  // Pagination state
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  constructor(private http: HttpClient, private auth: AuthService, private eRef: ElementRef) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchFinancialYears();
    // Fetch initial data if desired
    this.fetchIncentives();
  }

  fetchUsers(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<any[]>('http://localhost:8080/user/active-users-dropdown', { headers }).subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  fetchFinancialYears(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<any>('http://localhost:8080/user/financialyears-dropdown', { headers }).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.financialYears = response.data;
        }
      },
      error: (err) => {
        console.error('Error fetching financial years:', err);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.fetchIncentives();
  }

  fetchIncentives(): void {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    const fyObj = this.financialYears.find(fy => fy.fyName === this.financialYear);
    const financialYearId = fyObj ? fyObj.fyId : null;

    const quarterMap: { [key: string]: string } = {
      'Quarter1': 'Q1',
      'Quarter2': 'Q2',
      'Quarter3': 'Q3',
      'Quarter4': 'Q4'
    };
    const apiQuarter = quarterMap[this.quarter] || 'Q1';

    const body = {
      financialYearId: financialYearId,
      quarter: apiQuarter,
      userId: this.selectedUser ? this.selectedUser.id : null,
      pagination: {
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        sortBy: "firstName",
        sortOrder: "ASC"
      }
    };

    this.http.post<any>('http://localhost:8080/reports/incentives/filter', body, { headers }).subscribe({
      next: (response) => {
        if (response.status) {
          if (response.data) {
            this.reports = response.data.map((item: any) => ({
              id: item.userId,
              role: item.role,
              user: item.name,
              erpTarget: item.totalTarget,
              erpSales: item.totalSales,
              incentiveAmount: item.incentiveAmount
            }));
          }
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
        }
      },
      error: (err) => {
        console.error('Error fetching incentives:', err);
      }
    });
  }

  changePage(delta: number): void {
    const newPage = this.currentPage + delta;
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.fetchIncentives();
    }
  }

  downloadIncentives(): void {
    const token = this.auth.getToken();
    const headers = token 
      ? new HttpHeaders({ Authorization: `Bearer ${token}` }) 
      : new HttpHeaders();

    const fyObj = this.financialYears.find(fy => fy.fyName === this.financialYear);
    const financialYearId = fyObj ? fyObj.fyId : null;
    const fyStartDate = fyObj ? fyObj.fyStartDate : null;
    const fyEndDate = fyObj ? fyObj.fyEndDate : null;

    let startYear = 2026;
    let endYear = 2027;

    if (fyStartDate) {
      startYear = new Date(fyStartDate).getFullYear();
    }
    if (fyEndDate) {
      endYear = new Date(fyEndDate).getFullYear();
    }

    const quarterMap: { [key: string]: string } = {
      'Quarter1': 'Q1',
      'Quarter2': 'Q2',
      'Quarter3': 'Q3',
      'Quarter4': 'Q4'
    };
    const apiQuarter = quarterMap[this.quarter] || 'Q1';

    let fromDate = `${startYear}-04-01`;
    let toDate = `${startYear}-06-30`;

    if (apiQuarter === 'Q2') {
      fromDate = `${startYear}-07-01`;
      toDate = `${startYear}-09-30`;
    } else if (apiQuarter === 'Q3') {
      fromDate = `${startYear}-10-01`;
      toDate = `${startYear}-12-31`;
    } else if (apiQuarter === 'Q4') {
      fromDate = `${endYear}-01-01`;
      toDate = `${endYear}-03-31`;
    }

    const body = {
      financialYearId: financialYearId,
      quarter: apiQuarter,
      userId: this.selectedUser ? this.selectedUser.id : null,
      roleId: null,
      regionId: null,
      fromDate: fromDate,
      toDate: toDate,
      pagination: {
        pageNumber: 0,
        pageSize: 100,
        sortBy: "id",
        sortOrder: "ASC"
      }
    };

    this.http.post('http://localhost:8080/reports/incentives/download', body, {
      headers: headers,
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Incentives_Report_${this.financialYear || 'FY'}_${apiQuarter}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading incentives report:', err);
        alert('Download failed');
      }
    });
  }

  getTotalIncentives(): number {
    return this.reports.reduce((sum, item) => sum + (item.incentiveAmount || 0), 0);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.searchTerm = '';
      this.filteredUsers = this.users;
    }
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u => u.name.toLowerCase().includes(term));
  }

  selectUser(user: any): void {
    this.selectedUser = user;
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
