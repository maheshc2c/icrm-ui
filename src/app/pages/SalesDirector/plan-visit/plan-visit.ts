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

   headerTitle = 'Manage Visit';
    
       headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/sd-dashboard' },
        { label: 'PlanVisit', route: '/salesdirector/planVisit' }
      ];
  
      // 🔹 Table Columns
    columns = [
      { header: 'Customer Name', field: 'CustomerName' },
      { header: 'Purpose', field: 'purposeName' },
      { header: 'Start Date', field: 'startDate' },
      { header: 'End Date', field: 'endDate' },
      ];


      // leadId: number;
      //   purposeId: number;
      //   purposeName: string;
      //   startDate: string;
      //   endDate: string;

    rows: any[] = [];
    fullRows: any[] = []; 

    // searchFields: SearchFieldConfig[] = [];

  
  onAdd() {
    this.router.navigate(['salesdirector/planVisit/add']);
  }

  onEdit(row: any) {
        this.router.navigate(['salesdirector/planVisit/edit', row.visitId]);

      }


      isEditMode = false;
      visitId!: number

  onDelete(row: any) {
    console.log('Delete row:', row);
  }
    

  
   ngOnInit(): void {

    this.loadVisit();      // existing table load
 
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
    key: 'leadid',
    label: 'Lead ID',
    placeholder: 'Lead ID',
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


// onSearch(keyword: string) {

//   if (!keyword || keyword.trim() === '') {
//     // 🔁 If empty search → reload full list
//     this.loadVisit();
//     return;
//   }

//   this.salesdirectorservice.searchfy(keyword).subscribe({
//     next: (results: any[]) => {

//       this.fullRows = results;

//       this.rows = results.map((c, index) => ({
//         sno: index + 1,
//         visitId: c.visitId,
//         purposeName: c.purposeName,
//         startDate: c.startDate,
//         endDate: c.endDate,
//       }));
//     },
//     error: (err) => {
//       console.error('Search failed', err);
//     }
//   });
// }


// loadDropdown() {
//   this.salesdirectorservice.getDropfy().subscribe({
//     next: (data: any[]) => {

//       // ✅ CLEAR FIRST (important)
//       const options = data.map(d => ({
//         label: d,
//         value: d
//       }));

//       this.searchFields = [
//         {
//           key: 'purposeName',
//           label: 'Financial Year',
//           type: 'select',
//           placeholder: 'Select Year',
//           options: options
//         }
//       ];
//     }
//   });
// }


onSearch(){}

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
