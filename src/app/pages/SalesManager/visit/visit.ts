import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';
import { VisitService, VisitDto } from '../../../service/visit-service';

@Component({
  selector: 'app-visit',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule],
  templateUrl: './visit.html',
  styleUrls: ['./visit.css']
})
export class VisitComponent implements OnInit {
  
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Manage Visit' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'leadId', label: 'Lead ID', type: 'text', placeholder: 'Lead ID' },
    { key: 'customer', label: 'Customer', type: 'select', placeholder: 'Select Customer', options: [
      { value: '', label: 'Select Customer' }
    ]},
    { key: 'startTime', label: 'Start Time', type: 'date', placeholder: 'Start Time' },
    { key: 'endTime', label: 'End Time', type: 'date', placeholder: 'End Time' }
  ];

  columns = [
    { header: 'Purpose', field: 'purposeName' },
    { header: 'Start Date', field: 'startDateFormatted' },
    { header: 'End Date', field: 'endDateFormatted' }
  ];

  rows: any[] = [];

  constructor(private router: Router, private visitService: VisitService) { }

  ngOnInit(): void {
    this.loadVisits();
  }

  loadVisits(): void {
    this.visitService.getAllVisits().subscribe({
      next: (data) => {
        this.rows = data.map((v, index) => ({
          ...v,
          index: index + 1,
          startDateFormatted: this.formatDate(v.startDate),
          endDateFormatted: this.formatDate(v.endDate)
        }));
      },
      error: (err) => console.error('Failed to load visits:', err)
    });
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
    } catch (e) {
      return dateStr;
    }
  }

  onSearch(filters: any): void {
    console.log('Search filters:', filters);
  }

  onAdd(): void {
    this.router.navigate(['/salesmanager/visit/add']);
  }

  onEdit(row: any): void {
    this.router.navigate(['/salesmanager/visit/edit', row.visitId]);
  }

  onDownload(): void {
    console.log('Download visits as Excel');
    alert('Download functionality will be implemented');
  }
}


