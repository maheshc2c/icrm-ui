import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Header } from "../../../layout/header/header";
import { Sidebar } from "../../../layout/sidebar/sidebar";
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { DataTable } from "../../../shared/data-table/data-table";
import { SearchFieldConfig } from '../../../shared/search/search';
import { SalesDirectorService } from '../../../service/sales-director.service';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
import { ToastService } from '../../../service/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-demo',
  imports: [Header, Sidebar, Pageheader, DataTable, CommonModule, FormsModule],
  templateUrl: './demo.html',
  styleUrl: './demo.css',
})
export class Demo {

  constructor(
    private router: Router,
    private salesdirectorservice: SalesDirectorService,
    private route: ActivatedRoute,
      private toastService: ToastService,
      private confirmService: ConfirmDialogService
  ) {}

  headerTitle = 'Manage Demo';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sd-dashboard' },
    { label: 'PlanVisit', route: '/salesdirector/Demo' }
  ];

  rows:any[]=[];
fullRows:any[]=[];

ngOnInit(){

   this.loadDemo();
  this.loadCustomerDropdown();

}

  columns = [
  { header:'Customer Name', field:'customerName' },
  { header:'Opportunity', field:'opportunity' },
  { header:'Demo Machine', field:'demoMachine' },
  { header:'Start Date', field:'startDate' },
  { header:'End Date', field:'endDate' }
    ];


    currentPage = 1;
pageSize = 10;
totalPages = 1;
totalElements = 0;

private loadDemo(): void {
  const payload = {
  opportunityId: this.currentFilters?.opportunityId || null,
  customerName: this.currentFilters?.customerName || null,
  startDate: this.currentFilters?.startDate || null,
  endDate: this.currentFilters?.endDate || null,
  pagination: {
    pageNumber: this.currentPage - 1,
    pageSize: this.pageSize,
    sortBy: 'demoId',
    sortOrder: 'DESC'
  }
};

  this.salesdirectorservice.searchPlanDemo(payload).subscribe({

    next: (response: any) => {

      this.totalPages = response.totalPages;
      this.totalElements = response.totalElements;

      this.fullRows = response.data;

      this.rows = response.data.map((d: any) => ({
  demoId: d.demoId,
  customerName: d.customerName,
  opportunity: d.opportunity,
  demoMachine: d.demoMachine,
  startDate: d.startDate,
  endDate: d.endDate,


}));

    }

  });

}


searchFilters: any = {};
currentFilters: any = {};
onPageChange(page: number): void {

  this.currentPage = page;

  this.loadDemo();

}
 onPageSizeChange(size: number): void {

  this.pageSize = size;

  this.currentPage = 1;

  this.loadDemo();

}

  onAdd(){ 
    this.router.navigate(['planDemo/Add']);
  }

 onEdit(row: any) {

  console.log("Row =", row);

  this.router.navigate(
    ['/planDemo/edit', row.demoId],
    {
      state: {
        demo: row
      }
    }
  );
}

  onDelete(row: any) {
    console.log('Delete row:', row);
  }


  searchFields: SearchFieldConfig[] = [

{
key:'opportunityId',
label:'Opportunity ID',
placeholder:'Opportunity ID',
type:'text'
},

{
key:'customerName',
label:'Customer',
placeholder:'Select Customer',
type:'select'

},

{
key:'startDate',
label:'Start Time',
type:'datetime-local',
placeholder:'Start Time'
},

{
key:'endDate',
label:'End Time',
type:'datetime-local',
placeholder:'End Time'
}

];

  onSearch(filters: any) {

  this.currentFilters = filters;
  this.currentPage = 1;

  this.loadDemo();

}


loadCustomerDropdown(search: string = '') {

  this.salesdirectorservice.getCustomerDropdown(search)
    .subscribe((res: any[]) => {

      const field = this.searchFields.find(
        f => f.key === 'customerName'
      );

      if (field) {
        field.options = res.map(c => ({
          label: c.customerName,
          value: c.customerName
        }));
      }

    });

}

//   onImport() {

//   const payload = {
//     oppOpportunityId: this.currentFilters?.opportunityId || null,
//     customerName: this.currentFilters?.customerName || null,
//     demoStartDate: this.currentFilters?.startDate || null,
//     demoEndDate: this.currentFilters?.endDate || null,

//     pagination: {
//     pageNumber: this.currentPage - 1,
//     pageSize: this.pageSize,
//     sortBy: 'demoId',
//     sortOrder: 'DESC'
//   }
  
//     // pagination: {
//     //   pageNumber: 0,
//     //   pageSize: this.totalElements,   // download all matching records
//     //   sortBy: 'demoId',
//     //   sortOrder: 'DESC'
//     // }
//   };

//   this.salesdirectorservice.downloadPlanDemo(payload).subscribe(blob => {

//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'PlanDemo.xlsx';
//     a.click();

//     window.URL.revokeObjectURL(url);
//   });

// }

onImport() {


  const payload = {

    opportunityId:
      this.currentFilters?.opportunityId || null,


    customerName:
      this.currentFilters?.customerName || null,


    startDate:
      this.currentFilters?.startDate || null,


    endDate:
      this.currentFilters?.endDate || null,


    pagination: {

      pageNumber: 0,

      pageSize: this.totalElements,

      sortBy: 'demoId',

      sortOrder: 'DESC'

    }

  };


  console.log("Download Payload",payload);



  this.salesdirectorservice
      .downloadPlanDemo(payload)
      .subscribe({

        next:(blob:any)=>{


          const url =
            window.URL.createObjectURL(blob);


          const link =
            document.createElement('a');


          link.href=url;


          link.download='PlanDemo.xlsx';


          link.click();


          window.URL.revokeObjectURL(url);


        },


        error:(err)=>{

          console.error(err);

          this.toastService.error(
            "Failed to download Demo details"
          );

        }

      });

}

onReset(){
  this.loadDemo();
}

//feedback
showFeedbackPopup = false;

selectedDemo: any = {};

feedback = '';

openFeedback(row: any) {

  console.log("Feedback clicked");
  console.log(row);

  this.selectedDemo = row;
  this.feedback = row.demoRemarks2 || '';
  this.showFeedbackPopup = true;

  console.log(this.showFeedbackPopup);
}

saveFeedback() {

  const payload={

demoId:this.selectedDemo.demoId,

feedback:this.feedback

}

  this.salesdirectorservice
      .updateDemoFeedback( payload)
      .subscribe({

        next: () => {

          this.selectedDemo.demoRemarks2 = this.feedback;

          this.toastService.success("Feedback Updated Successfully");

          this.showFeedbackPopup = false;

        },

        error: (err) => {

          this.toastService.error("Failed to update feedback");

        }

      });

}

}
