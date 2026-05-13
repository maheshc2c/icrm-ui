import { Component, OnInit } from '@angular/core';
import { DataTable } from '../../../shared/data-table/data-table';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';
import { Button } from "../../../shared/button/button";
import { Router, ActivatedRoute } from '@angular/router';
import { Form } from '../../../shared/form/form';
import { Companyservice } from '../../../service/companyservice';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SearchFieldConfig } from '../../../shared/search/search';


@Component({
  selector: 'app-company',
  imports: [CommonModule, DataTable, Header, Sidebar, Pageheader],
  templateUrl: './company.html',
  styleUrl: './company.css'
})
export class Company implements OnInit
{

  constructor(
    private companyService: Companyservice,
    private router: Router,
    private route: ActivatedRoute
  ) {}


  headerTitle = 'Manage Companies';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/superadmin' },
    { label: 'Company', route: '/superadmin/company' },
    { label: 'Add New' }
  ];


  role = localStorage.getItem('role');


columns = [
  { header: 'Company Name', field: 'companyName' }


];

  rows: any[] = [];
  //allRows: any[] = []; // 🔹 master copy
  fullRows: any[] = [];   // ✅ full API data (for Excel)


   ngOnInit(): void {
    this.loadCompanies();
  }

loadCompanies() {
  this.companyService.getCompanies().subscribe({
    next: (companies: any[]) => {

      console.log('API Response:', companies);

      // ✅ STORE FULL DATA (DO NOT TOUCH)
      this.fullRows = companies;

      // ✅ MAP ONLY WHAT TABLE NEEDS
      this.rows = companies.map((c, index) => ({
        sno: index + 1,
        companyId: c.companyId,
        companyName: c.companyName
      }));

    },
    error: (err) => {
      console.error('Failed to load company list:', err);
      if (err.status === 401) {
        alert('Session expired, please login again.');
        this.router.navigate(['/login']);
      }
    }
  });
}

  // 
  onAdd() {
  this.router.navigate(['/superadmin/addcompany']);
  }

onEdit(row: any) {
  console.log('Edit received in Company:', row);
  this.router.navigate(['/superadmin/edit', row.companyId]);

}
  isEditMode = false;
companyId!: number

onDelete(row: any) {
  console.log('Delete', row);

}



//Search Funstionality

searchFields: SearchFieldConfig[] = [
  {
    key: 'companyName',
    label: 'Company Name',
    placeholder: 'Name',
    type: 'text'   // ✅ now TypeScript knows this is literal
  }
  // { key: 'test', label: 'test', type: 'text' },
  // {
  //   key: 'status',
  //   label: 'Status',
  //   type: 'select',
  //   options: [
  //     { label: 'Active', value: 'ACTIVE' },
  //     { label: 'Inactive', value: 'INACTIVE' }
  //   ]
  // }
];


onSearch(keyword: string) {
  console.log('Search keyword received:', keyword);


  if (!keyword || keyword.trim() === '') {
    // 🔁 If empty search → reload full list
    this.loadCompanies();
    return;
  }

  this.companyService.searchCompany(keyword).subscribe({
    next: (results: any[]) => {

      this.fullRows = results;

      this.rows = results.map((c, index) => ({
        sno: index + 1,
        companyId: c.companyId,
        companyName: c.companyName
      }));
    },
    error: (err) => {
  console.error('Search failed FULL ERROR:', err);
  console.log('Status:', err.status);
  console.log('Message:', err.message);
}

  });
}



//Download

 onImport() {

  if (!this.fullRows || this.fullRows.length === 0) {
    alert('No data available to download');
    return;
  }

  this.companyService.downloadCompanyExcel(this.fullRows).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Company.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Download failed:', err);
      alert(`Download failed: ${err.status}`);
    }
  });
}

}
