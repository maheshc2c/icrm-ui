import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Form } from '../../../shared/form/form';
import { DataTable } from '../../../shared/data-table/data-table';

import { Breadcrumb } from '../../../models/breadcrumb';
import { Header } from "../../../layout/header/header";
import { Adminservice } from '../../../service/adminservice';
import { CommonModule } from '@angular/common';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-financial-year',
  standalone: true, 
  imports: [Pageheader, Sidebar, DataTable, Header, CommonModule],
  templateUrl: './financial-year.html',
  styleUrl: './financial-year.css',
})
export class FinancialYear {

  constructor(
    private adminservice: Adminservice,
    private router: Router,
    private route: ActivatedRoute
  ) {}

   headerTitle = 'Manage Financial Year';
    
       headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'FinancialYear', route: '/admin/financial-yr' }
      ];
  
      // 🔹 Table Columns
    columns = [
      { header: 'Financial Year', field: 'fyName' },
      { header: 'Start Date', field: 'fyStartDate' },
      { header: 'End date', field: 'fyEndDate' },
      { header: 'View Calender', field: 'fyStatus' },
      ];

    rows: any[] = [];
    fullRows: any[] = []; 

    // searchFields: SearchFieldConfig[] = [];

  
  onAdd() {
    this.router.navigate(['financial-yr/add']);
  }

  onEdit(row: any) {
        this.router.navigate(['financial-yr/edit', row.fyId]);

      }


      isEditMode = false;
      companyId!: number

  onDelete(row: any) {
    console.log('Delete row:', row);
  }
    

  
   ngOnInit(): void {
    this.loadFinancialyr();
    this.loadFinancialyr();      // existing table load
  this.loadDropdown(); 
  }

  // ✅ LIST API ONLY
private loadFinancialyr(): void {
  this.adminservice.getfinancialyr().subscribe({
    next: (financialyr: any[]) => {

      // ✅ keep FULL data untouched
      this.fullRows = financialyr;

      // ✅ map only what table needs
      this.rows = financialyr.map((c, index) => ({
        sno: index + 1,
        fyId: c.fyId,
        fyName: c.fyName,
        fyStartDate: c.fyStartDate,
        fyEndDate: c.fyEndDate,
        fyStatus: c.fyStatus
      }));
    }
  });
}

//search Functionality


searchFields: SearchFieldConfig[] = [
  {
    key: 'fyName',
    label: 'Financial Year',
    placeholder: 'Select Financial Year',
    type: 'text'   // ✅ now TypeScript knows this is literal
  }
];


onSearch(keyword: string) {

  if (!keyword || keyword.trim() === '') {
    // 🔁 If empty search → reload full list
    this.loadFinancialyr();
    return;
  }

  this.adminservice.searchfy(keyword).subscribe({
    next: (results: any[]) => {

      this.fullRows = results;

      this.rows = results.map((c, index) => ({
        sno: index + 1,
        fyId: c.fyId,
        fyName: c.fyName,
        fyStartDate: c.fyStartDate,
        fyEndDate: c.fyEndDate,
      }));
    },
    error: (err) => {
      console.error('Search failed', err);
    }
  });
}


loadDropdown() {
  this.adminservice.getDropfy().subscribe({
    next: (data: any[]) => {

      // ✅ CLEAR FIRST (important)
      const options = data.map(d => ({
        label: d,
        value: d
      }));

      this.searchFields = [
        {
          key: 'fyName',
          label: 'Financial Year',
          type: 'select',
          placeholder: 'Select Year',
          options: options
        }
      ];
    }
  });
}

onImport() {

  if (!this.fullRows || this.fullRows.length === 0) {
    alert('No data available');
    return;
  }

  this.adminservice.downloadFinancialYearExcel(this.fullRows).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'FinancialYear.xlsx';
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
