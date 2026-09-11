import { Component } from '@angular/core';
import { SalesDirectorService } from '../../../service/sales-director.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { DataTable } from '../../../shared/data-table/data-table';
import { Header } from '../../../layout/header/header';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-plan-visit',
  imports: [Pageheader, Sidebar, DataTable, Header],
  templateUrl: './plan-visit.html',
  styleUrl: './plan-visit.css',
})
export class PlanVisit {

  constructor(
    private salesdirectorservice: SalesDirectorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  private getHomeRoute(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const role = localStorage.getItem('role')?.trim();
      if (role) {
        const normalizedRole = role.replace(/[\s_]+/g, '').toUpperCase();
        switch (normalizedRole) {
          case 'SUPERADMIN':
            return '/superadmindashboard';
          case 'ADMIN':
            return '/admindashboard';
          case 'ADMINMARKETING':
            return '/adminmarketingdashboard';
          case 'SALESDIRECTOR':
            return '/sddashboard';
          case 'REGIONALBRANCHHEAD':
            return '/regional-branch-head-dashboard';
          case 'REGIONALSALESMANAGER':
            return '/regional-sales-manager-dashboard';
          case 'NATIONALSALESMANAGER':
            return '/national-sales-manager-dashboard';
          case 'GLOBALHEAD':
            return '/globalhead-dashboard';
          case 'COUNTRYHEAD':
            return '/country-head';
          case 'CUSTOMERINTERACTIONCENTER':
            return '/Approve-Leads';
          case 'OTR':
            return '/Cnotedownload';
          case 'SALESENGINEER':
          case 'SALESMANAGER':
          default:
            return '/sales-manager-dashboard';
        }
      }
    }
    return '/sales-manager-dashboard';
  }

  headerTitle = 'Manage Visit';
  headerBreadcrumbs: Breadcrumb[] = [];

  columns = [
    { header: 'Customer Name', field: 'customerName' },
    { header: 'Purpose', field: 'purposeName' },
    { header: 'Start Date', field: 'startDate' },
    { header: 'End Date', field: 'endDate' },
  ];

  rows: any[] = [];
  fullRows: any[] = [];

  onAdd() {
    this.router.navigate(['salesdirector/planVisit/add']);
  }

  onEdit(row: any) {
    this.router.navigate(['salesdirector/planVisit/edit', row.visitId]);
  }

  isEditMode = false;
  visitId!: number;

  onDelete(row: any) {
    console.log('Delete row:', row);
  }

  ngOnInit(): void {
    this.headerBreadcrumbs = [
      { label: 'Home', route: this.getHomeRoute() },
      { label: 'Plan Visit', route: '/salesdirector/planVisit' }
    ];
    this.loadVisit();
  }

  // ✅ LIST API ONLY
private loadVisit(): void {
  this.salesdirectorservice.getPlanVisit().subscribe({
    next: (visit: any[]) => {

      // ✅ keep FULL data untouched
      this.fullRows = visit;

      // ✅ map only what table needs
      this.rows = visit.map((c, index) => ({
        sno: index + 1,
        visitId: c.visitId,
        purposeName: c.purposeName,
        startDate: c.startDate,
        endDate: c.endDate
      
      }));
    }
  });
}

//search Functionality

searchFields: SearchFieldConfig[] = [
  {
    key: 'leadId',
    label: 'Lead ID',
    placeholder: 'Enter Lead ID',
    type: 'text'
  },
  {
    // key: 'customerid',
    key: 'customerName',
    label: 'Customer',
    placeholder: 'Enter Customer Name',
    type: 'text'
  },
  {
    key: 'startDate',
    label: 'Start Date',
    placeholder: 'Select Start Date',
    type: 'datetime-local'
  },
  {
    key: 'endDate',
    label: 'End Date',
    placeholder: 'Select End Date',
    type: 'datetime-local'
  }
];



//automated 
onSearch(filters: any) {
  const isEmpty =
    !filters?.leadId &&
    !filters?.customerName &&
    !filters?.startDate &&
    !filters?.endDate;

  if (isEmpty) {
    this.loadVisit();
    return;
  }

  const payload: {
    leadId?: number;
    customerName?: string;
    startDate?: string;
    endDate?: string;
  } = {
    leadId: filters?.leadId ? Number(filters.leadId) : undefined,
    customerName: filters?.customerName?.trim() || undefined,
    startDate: filters?.startDate || undefined,
    endDate: filters?.endDate || undefined
  };

  this.salesdirectorservice.searchVisits(payload).subscribe({
    next: (results: any[]) => {
      this.fullRows = results;

      this.rows = results.map((c, index) => ({
        sno: index + 1,
        visitId: c.visitId,
        leadId: c.leadId,
        purposeName: c.purposeName,
        startDate: c.startDate,
        endDate: c.endDate
      }));
    },
    error: (err) => {
      console.error('Visit search failed', err);
      this.rows = [];
    }
  });
}

onImport() {

  if (!this.fullRows || this.fullRows.length === 0) {
    alert('No data available');
    return;
  }

  this.salesdirectorservice.downloadVisit(this.fullRows).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PlanVisit.xlsx';
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
