import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../models/breadcrumb';
import { Pageheader } from '../pageheader/pageheader';

export interface ReportsColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent {
  @Input() title = 'Reports';
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() tableTitle = '';
  @Input() tableSubTitle = '';
  @Input() users: Array<{ id: number; label: string }> = [];
  @Input() selectedUserId: number | null = null;
  @Input() selectedQuarter = 'Quarter1';
  @Input() selectedFinancialYear = '2026-27';
  @Input() columns: ReportsColumn[] = [];
  @Input() rows: any[] = [];
  @Input() showSearchButton = true;
  @Input() showExportButton = true;

  @Output() search = new EventEmitter<void>();
  @Output() exportReport = new EventEmitter<void>();
  @Output() userChange = new EventEmitter<number | null>();

  dropdownOpen = false;
  searchQuery = '';

  get filteredUsers() {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.users;
    }

    return this.users.filter((user) => user.label.toLowerCase().includes(query));
  }

  get selectedUserLabel(): string {
    if (this.selectedUserId == null) {
      return 'Select Users';
    }

    const foundUser = this.users.find((user) => user.id === this.selectedUserId);
    return foundUser?.label ?? 'Select Users';
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    if (!this.dropdownOpen) {
      this.searchQuery = '';
    }
  }

  onUserSelect(userId: number | null): void {
    this.selectedUserId = userId;
    this.dropdownOpen = false;
    this.searchQuery = '';
    this.userChange.emit(userId);
  }

  onSearch(): void {
    this.search.emit();
  }

  onExport(): void {
    this.exportReport.emit();
  }
}
