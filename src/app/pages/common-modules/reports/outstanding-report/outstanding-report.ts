import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../service/report.service';
import { Pageheader } from '../../../../shared/pageheader/pageheader';

@Component({
  selector: 'app-outstanding-report',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader],
  templateUrl: './outstanding-report.html',
  styleUrls: ['./outstanding-report.css']
})
export class OutstandingReportComponent implements OnInit {
  breadcrumbs = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Outstanding Report' }
  ];

  // Filters
  selectedRegionId: number | null = null;
  selectedMonthId: number = new Date().getMonth() + 1;
  selectedYearId: number = new Date().getFullYear();

  // Dropdown lists
  regions: { id: number; label: string }[] = [];
  months = [
    { id: 1, label: 'January' },
    { id: 2, label: 'February' },
    { id: 3, label: 'March' },
    { id: 4, label: 'April' },
    { id: 5, label: 'May' },
    { id: 6, label: 'June' },
    { id: 7, label: 'July' },
    { id: 8, label: 'August' },
    { id: 9, label: 'September' },
    { id: 10, label: 'October' },
    { id: 11, label: 'November' },
    { id: 12, label: 'December' }
  ];
  years = [2024, 2025, 2026, 2027];

  // Dropdown open states
  regionDropdownOpen = false;
  monthDropdownOpen = false;
  yearDropdownOpen = false;

  // Pagination State
  pageNumber = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  openPageSizeDropdown = false;

  // Data
  isLoading = false;
  reportData: any = null;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadRegions();
    this.fetchReportData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper') && !target.closest('.custom-dropdown-container')) {
      this.closeAllDropdowns();
    }
  }

  loadRegions() {
    this.reportService.getRegionsForDropdown().subscribe({
      next: (res) => (this.regions = res),
      error: (err) => console.error('Error fetching regions:', err)
    });
  }

  get selectedRegionLabel(): string {
    if (this.selectedRegionId === null) return 'Select Region';
    const found = this.regions.find(r => r.id === this.selectedRegionId);
    return found ? found.label : 'Select Region';
  }

  get selectedMonthLabel(): string {
    const found = this.months.find(m => m.id === this.selectedMonthId);
    return found ? found.label : 'Select Month';
  }

  closeAllDropdowns() {
    this.regionDropdownOpen = false;
    this.monthDropdownOpen = false;
    this.yearDropdownOpen = false;
    this.openPageSizeDropdown = false;
  }

  toggleRegionDropdown() {
    const nextState = !this.regionDropdownOpen;
    this.closeAllDropdowns();
    this.regionDropdownOpen = nextState;
  }

  toggleMonthDropdown() {
    const nextState = !this.monthDropdownOpen;
    this.closeAllDropdowns();
    this.monthDropdownOpen = nextState;
  }

  toggleYearDropdown() {
    const nextState = !this.yearDropdownOpen;
    this.closeAllDropdowns();
    this.yearDropdownOpen = nextState;
  }

  selectRegion(id: number | null) {
    this.selectedRegionId = id;
    this.regionDropdownOpen = false;
  }

  selectMonth(id: number) {
    this.selectedMonthId = id;
    this.monthDropdownOpen = false;
  }

  selectYear(year: number) {
    this.selectedYearId = year;
    this.yearDropdownOpen = false;
  }

  applySearch() {
    this.pageNumber = 0;
    this.fetchReportData();
  }

  resetFilters() {
    this.selectedRegionId = null;
    this.selectedMonthId = new Date().getMonth() + 1;
    this.selectedYearId = new Date().getFullYear();
    this.pageNumber = 0;
    this.fetchReportData();
  }

  fetchReportData() {
    this.isLoading = true;
    const filter = {
      regionId: this.selectedRegionId,
      monthId: this.selectedMonthId,
      yearId: this.selectedYearId,
      pagination: {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize
      }
    };

    this.reportService.getOutstandingUploadReport(filter).subscribe({
      next: (response) => {
        if (response && response.status) {
          this.reportData = response.data;
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching Outstanding Upload report:', err);
        this.isLoading = false;
      }
    });
  }

  downloadExcel() {
    const filter = {
      regionId: this.selectedRegionId,
      monthId: this.selectedMonthId,
      yearId: this.selectedYearId
    };

    this.reportService.downloadOutstandingUploadReport(filter).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Outstanding_Upload_Report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error downloading Outstanding Upload Excel:', err)
    });
  }

  // Pagination Helper Methods
  getFromIndex(): number {
    if (this.totalElements === 0) return 0;
    return this.pageNumber * this.pageSize + 1;
  }

  getToIndex(): number {
    return Math.min((this.pageNumber + 1) * this.pageSize, this.totalElements);
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.pageNumber) {
      this.pageNumber = page;
      this.fetchReportData();
    }
  }

  togglePageSizeDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.openPageSizeDropdown = !this.openPageSizeDropdown;
  }

  selectPageSize(size: number) {
    this.pageSize = size;
    this.openPageSizeDropdown = false;
    this.pageNumber = 0;
    this.fetchReportData();
  }
}
