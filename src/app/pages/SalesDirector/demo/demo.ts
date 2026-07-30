import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Header } from "../../../layout/header/header";
import { Sidebar } from "../../../layout/sidebar/sidebar";
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { DataTable } from "../../../shared/data-table/data-table";
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-demo',
  imports: [Header, Sidebar, Pageheader, DataTable],
  templateUrl: './demo.html',
  styleUrl: './demo.css',
})
export class Demo {

  constructor(private router: Router) {}

  headerTitle = 'Manage Demo';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sd-dashboard' },
    { label: 'PlanVisit', route: '/salesdirector/Demo' }
  ];

  // ✅ Static Columns
  columns = [
    { header: 'Customer Name', field: 'CustomerName' },
    { header: 'Opportunity', field: 'Opportunity' },
    { header: 'Demo Machine', field: 'Demo Machine' },
    { header: 'Start Date	', field: 'Start Date	' },
    { header: 'End Date	', field: 'End Date	' },
  ];

  // ✅ Static Rows (Hardcoded Data)
  rows = [
    {
      sno: 1,
      visitId: 101,
      CustomerName: 'ABC Pvt Ltd',
      Opportunity: 'Meeting',
      startDate: '2026-04-20',
      endDate: '2026-04-21'
    },
    {
      sno: 2,
      visitId: 102,
      CustomerName: 'XYZ Corp',
      Opportunity: 'Demo',
      startDate: '2026-04-22',
      endDate: '2026-04-22'
    },
    {
      sno: 3,
      visitId: 103,
      CustomerName: 'Test Client',
      Opportunity: 'Follow-up',
      startDate: '2026-04-23',
      endDate: '2026-04-24'
    }
  ];

  // ✅ Navigation Actions (kept)
  onAdd() {
    this.router.navigate(['salesdirector/planVisit/add']);
  }

  onEdit(row: any) {
    this.router.navigate(['salesdirector/planVisit/edit', row.visitId]);
  }

  onDelete(row: any) {
    console.log('Delete row:', row);
  }

  


  searchFields: SearchFieldConfig[] = [
    {
      key: 'OppurtunityId',
      label: 'Oppurtunity ID',
      placeholder: 'Oppurtunity ID',
      type: 'text'   // ✅ now TypeScript knows this is literal
    },
    {
      key: 'customerid',
      label: 'Select Customer',
      placeholder: 'Select Customer',
      type: 'select'   // ✅ now TypeScript knows this is literal
    },
    {
      key: 'starttime',
      label: 'Start Time',
      placeholder: 'Start Time',
      type: 'text'   // ✅ now TypeScript knows this is literal
    },
    {
      key: 'endTime',
      label: 'End Time',
      placeholder: 'End Time',
      type: 'text'   // ✅ now TypeScript knows this is literal
    }
  ];
  

  // ❌ Disabled Dynamic Features
  onImport() {}
  onSearch() {}

}
