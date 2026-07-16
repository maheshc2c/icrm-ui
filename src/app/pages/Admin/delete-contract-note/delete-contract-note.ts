import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Adminservice } from '../../../service/adminservice';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-delete-contract-note',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './delete-contract-note.html',
  styleUrl: './delete-contract-note.css',
})
export class DeleteContractNote implements OnInit {
  headerTitle = 'Contract Notes';

  headerBreadcrumbs = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Contract Notes' }
  ];

  searchCnoteId = '';
  rows: any[] = [];
  filteredRows: any[] = [];

  // Pagination fields for DataTable
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  columns = [
    { header: 'C Note ID', field: 'cnoteId' },
    { header: 'Lead ID', field: 'leadId' },
    { header: 'Quote Ref ID', field: 'quoteRefId' },
    { header: 'Billing', field: 'billing' },
    { header: 'Discount', field: 'discount' },
    { header: 'PO Number', field: 'poNumber' },
    { header: 'PO Date', field: 'poDate' },
    { header: 'SO Number', field: 'soNumber' }
  ];

  constructor(
    private adminService: Adminservice,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadContractNotes();
  }

  loadContractNotes(): void {
    console.log('[DeleteContractNote] loadContractNotes called...');
    this.adminService.searchDeleteContractNotes(this.searchCnoteId || undefined).subscribe({
      next: (data: any) => {
        console.log('[DeleteContractNote] Loaded contract notes:', data);
        this.rows = data || [];
        this.totalElements = this.rows.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        this.updatePaginatedRows();
      },
      error: (err: any) => {
        console.error('[DeleteContractNote] Error loading contract notes:', err);
        this.toastService.error('Failed to load contract notes');
      }
    });
  }

  updatePaginatedRows(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredRows = this.rows.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadContractNotes();
  }

  onDelete(row: any): void {
    console.log('[DeleteContractNote] Deleting contract note:', row);
    if (!row || !row.cnoteId) return;

    this.adminService.deleteContractNote(row.cnoteId).subscribe({
      next: () => {
        this.toastService.success('Contract note deleted successfully');
        this.loadContractNotes();
      },
      error: (err: any) => {
        console.error('[DeleteContractNote] Error deleting contract note:', err);
        this.toastService.error('Failed to delete contract note');
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedRows();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    this.updatePaginatedRows();
  }
}
