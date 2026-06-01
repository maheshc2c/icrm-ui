import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';
import { DataTable } from '../../../shared/data-table/data-table';

import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { SalesDirectorService } from '../../../service/sales-director.service';
import { OpportunityTableModel } from '../../../models/opportunity-table.model';

@Component({
  selector: 'app-oppurtunity',
  standalone: true,
  imports: [Pageheader, Sidebar, DataTable, Header, CommonModule, FormsModule],
  templateUrl: './oppurtunity.html',
  styleUrls: ['./oppurtunity.css'],
})
export class Oppurtunity implements OnInit {

  constructor(
    private router: Router,
    private salesService: SalesDirectorService
  ) {}

  headerTitle = 'Opportunities';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sd-dashboard' },
    { label: 'Opportunity', route: '/salesdirector/opportunity' }
  ];

  columns = [
    { header: 'Lead Details', field: 'leadDetails' },
    { header: 'Product', field: 'productAndCategory' },
    { header: 'Qty', field: 'qty' },
    { header: 'Stage', field: 'stage' },
    { header: 'Category', field: 'category' },
    { header: 'Probability', field: 'probability' },
    { header: 'Life Time (Days)', field: 'lifeTimeDays' },
  
  ];

  rows: OpportunityTableModel[] = [];
  fullRows: OpportunityTableModel[] = [];

  searchFields: SearchFieldConfig[] = [
    {
      key: 'leadId',
      label: 'Lead ID',
      placeholder: 'Enter Lead ID',
      type: 'text'
    }
  ];

  ngOnInit(): void {
    this.loadOpportunities();
  }

  // Load all records
  private loadOpportunities(): void {
    this.salesService.getOpportunityTable().subscribe({
      next: (data: OpportunityTableModel[]) => {
        this.fullRows = data || [];
        this.rows = this.fullRows.map((row, index) => ({
          ...row,
          sno: index + 1
        }));
      },
      error: (err) => {
        console.error('Load opportunities failed:', err);
        this.rows = [];
        this.fullRows = [];
      }
    });
  }

  // Search by leadId
  onSearch(keyword: string) {
    if (!keyword || keyword.trim() === '') {
      this.loadOpportunities();
      return;
    }

    const leadId = Number(keyword);
    if (isNaN(leadId)) {
      alert('Please enter a valid Lead ID');
      return;
    }

    this.salesService.getOpportunityTableByLeadId(leadId).subscribe({
      next: (data: OpportunityTableModel[]) => {
        this.fullRows = data || [];
        this.rows = this.fullRows.map((row, index) => ({
          ...row,
          sno: index + 1
        }));
      },
      error: (err) => {
        console.error('Search failed:', err);
        this.rows = [];
      }
    });
  }

  onAdd() {
    this.router.navigate(['salesdirector/opportunity/add']);
  }

  onEdit(row: any) {
    console.log('Edit:', row);
  }

  onDelete(row: any) {
    console.log('Delete:', row);
  }

 
onImport() {

  if (!this.fullRows || this.fullRows.length === 0) {
    alert('No data available');
    return;
  }

  this.salesService.downloadOpp(this.fullRows).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Oppurtunity.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: err => {
      console.error('Download failed:', err);
      alert(`Download failed: ${err.status}`);
    }
  });
}
}