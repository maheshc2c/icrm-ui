import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-marketing-documents',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule],
  templateUrl: './marketing-documents.html',
  styleUrls: ['./marketing-documents.css']
})
export class MarketingDocumentsComponent implements OnInit {

  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Marketing Documents' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'documentName', label: 'Document Name', type: 'text', placeholder: 'Document Name' }
  ];

  columns = [
    { header: 'Document Name', field: 'documentName' },
    { header: 'Description', field: 'description' },
    { header: 'Attachment', field: 'attachment' }
  ];

  rows: any[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    // Data will be loaded from API
    this.rows = [];
  }

  onSearch(filters: any): void {
    console.log('Search filters:', filters);
  }

  onEdit(row: any): void {
    console.log('View document:', row);
  }
}
