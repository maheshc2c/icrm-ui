import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Adminservice } from '../../../service/adminservice';
import { ToastService } from '../../../service/toast.service';
import { SearchFieldConfig } from '../../../shared/search/search';

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

  searchFields: SearchFieldConfig[] = [
    {
      key: 'searchKeyword',
      label: 'CNOTE ID',
      placeholder: 'NOTE: separate multiple C Note IDs with comma(,) (Ex: 25,28,78)',
      type: 'text'
    }
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
    const requestPayload = {
      ids: this.searchCnoteId || '',
      pagination: {
        pageNumber: this.currentPage - 1,
        pageSize: this.pageSize,
        sortBy: 'contractNoteId',
        sortOrder: 'DESC'
      }
    };

    this.adminService.searchDeleteContractNotes(requestPayload).subscribe({
      next: (res: any) => {
        console.log('[DeleteContractNote] Loaded contract notes:', res);
        this.rows = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;
      },
      error: (err: any) => {
        console.error('[DeleteContractNote] Error loading contract notes:', err);
        this.toastService.error('Failed to load contract notes');
      }
    });
  }

  onSearch(searchData: any): void {
    console.log('[DeleteContractNote] onSearch called with:', searchData);
    this.searchCnoteId = searchData && searchData.searchKeyword ? searchData.searchKeyword.trim() : '';
    this.currentPage = 1;
    this.loadContractNotes();
  }

  onReset(): void {
    this.searchCnoteId = '';
    this.currentPage = 1;
    this.loadContractNotes();
  }

  onDelete(row: any): void {
    console.log('[DeleteContractNote] Deleting contract note:', row);
    if (!row || !row.cnoteId) return;

    this.adminService.deleteContractNote(row.cnoteId).subscribe({
      next: (res: any) => {
        const msg = res?.message || 'Contract note deleted successfully';
        this.toastService.success(msg);
        this.loadContractNotes();
      },
      error: (err: any) => {
        console.error('[DeleteContractNote] Error deleting contract note:', err);
        const errorMsg = err.error?.message || err.error || 'Failed to delete contract note';
        this.toastService.error(errorMsg);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadContractNotes();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadContractNotes();
  }
}
