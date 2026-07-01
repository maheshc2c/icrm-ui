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
import { ToastService } from '../../../service/toast.service';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';

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
    private route: ActivatedRoute,
    private toastService: ToastService,
  
  ) {}

   headerTitle = 'Manage Financial Year';
    
       headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'FinancialYear', route: '/financial-yr' }
      ];
  
      // 🔹 Table Columns
    columns = [
      { header: 'Financial Year', field: 'fyName' },
      { header: 'Start Date', field: 'fyStartDate' },
      { header: 'End date', field: 'fyEndDate' },
      ];

    rows: any[] = [];
    fullRows: any[] = []; 

    // searchFields: SearchFieldConfig[] = [];

  
  onAdd() {
    this.router.navigate(['financial-yr/add']);
  }

  // onDelete(row: any) {
  //   console.log('Delete row:', row);
  // }
    

  
   ngOnInit(): void {
    this.loadFinancialyr();
    this.loadFinancialyr();      // existing table load
  this.loadDropdown(); 
  }

  // ✅ LIST API ONLY
private loadFinancialyr(): void {

  this.adminservice.getFinancialYears(
    null,
    0,
    1000
  ).subscribe({

    next: (response: any) => {

      const financialyr = response.content || [];

      this.fullRows = financialyr;

      this.rows = financialyr.map((c: any, index: number) => ({
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

  this.adminservice.getFinancialYears(
    keyword || null,
    0,
    1000
  ).subscribe({

    next: (response: any) => {

      const results = response.content || [];

      this.fullRows = results;

      this.rows = results.map((c: any, index: number) => ({
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

loadDropdown() {
  this.adminservice.getDropfy().subscribe({
    next: (data: any[]) => {
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

calendarData: any[] = [];
onView(row: any) {

  const selectedFy = this.fullRows.find(
    (f: any) => f.fyId === row.fyId
  );

  console.log(selectedFy);

  this.adminservice
    .getFinancialYearCalendar(row.fyId)
    .subscribe({

      next: (response) => {

        this.router.navigate(
          ['/financial-year-calendar'],
          {
            state: {
              data: response,
              fyName: selectedFy?.fyName,
              fyStartDate: selectedFy?.fyStartDate
            }
          }
        );
      }
    });
}

onReset(){
 // Reload full list
  this.loadFinancialyr();
}

}