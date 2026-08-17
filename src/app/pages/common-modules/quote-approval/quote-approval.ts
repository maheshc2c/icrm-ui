import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Adminservice } from '../../../service/adminservice';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { QuoteApprovalService } from './quote-approval.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-quote-approval',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    Header,
    Sidebar,
    Pageheader,
    DataTable],
  templateUrl: './quote-approval.html',
  styleUrl: './quote-approval.css',
})
export class QuoteApproval {

  constructor(
    private quoteApprovalService: QuoteApprovalService,
    private router: Router,
     private toastService: ToastService
  ) {}

  headerTitle = 'Quote Approval';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Quote Approval', route: '/RegionalBranchHead/quotes-view' }
  ];

  // columns = [
  //   { header: 'Customer', field: 'customer' },
  //   { header: 'Sales Engineer', field: 'salesEngineer' },
  //   { header: 'Quote ID', field: 'quoteId' },
  //   { header: 'Opportunity Details', field: 'opportunityDetails' },
  //   { header: 'Order Value', field: 'orderValue' },
  //   { header: 'Discount %', field: 'discount' },
  //   { header: 'Final Approver', field: 'finalApprover' }
  // ];

  columns = [

  { header:'Customer', field:'customerName' },

  { header:'Sales Engineer', field:'salesEngineer' },

  // { header:'Quote ID', field:'quoteNumber' },

    { header:'Quote ID', field:'quoteDisplay' },

  // { header:'Opportunity Details', field:'opportunityDetails' },
   { header:'Opportunity Details', field:'requiredQuantity' },

  { header:'Order Value', field:'orderValue' },

  { header:'Discount %', field:'discount' },

  { header:'Current Stage', field:'currentStage' },

  { header:'Final Approver', field:'finalApprover' }

];

loadQuotes(): void {

  const payload = {
    quoteId: '',
    opportunityDetails: '',
    regionId: this.selectedRegion,
    pagination: {
      pageNumber: this.currentPage - 1,
      pageSize: this.pageSize,
      sortBy: 'quoteId',
      sortOrder: 'DESC'
    }
  };

  this.quoteApprovalService.search(payload).subscribe({

    next: (response) => {

      console.log('Quote Response', response);

      if (response?.status && response?.data) {

        // this.rows = response.data.content || [];
         this.rows = (response.data.content || []).map((row: any) => ({
    ...row,
    quoteDisplay: `${row.quoteNumber}\n\n${row.quoteCreatedDate}`
  }));
        this.fullRows = [...this.rows];

        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;

      } else {

        this.rows = [];
        this.fullRows = [];
        this.totalElements = 0;
        this.totalPages = 0;

      }

    },

    error: (error) => {

      console.error('Error loading quotes', error);

      this.rows = [];
      this.fullRows = [];
      this.totalElements = 0;
      this.totalPages = 0;

    }

  });

}

ngOnInit(): void {

  this.loggedInRole = localStorage.getItem('role') || '';

  this.showRegionFilter =
      this.loggedInRole === 'National Sales Manager' ||
      this.loggedInRole === 'Country Head';

  this.updateSearchFields();

  if (this.showRegionFilter) {
    this.loadRegions();
  }

  this.loadQuotes();
}


loadRegions(): void {

  this.quoteApprovalService.getRegions().subscribe({

    next: (res: any) => {

      console.log('Regions', res);

      if (Array.isArray(res)) {

        this.regionOptions = res.map((item: any) => ({

          label: item.locationName,
          value: item.locationId

        }));

      } else if (res?.status) {

        this.regionOptions = (res.data || []).map((item: any) => ({

          label: item.locationName,
          value: item.locationId

        }));

      }

      this.updateSearchFields();

    },

    error: err => console.error(err)

  });

}



  searchFields: SearchFieldConfig[] = [];
private updateSearchFields(): void {

  this.searchFields = [

    {
      key: 'quoteId',
      label: 'Quote',
      placeholder: 'Quote ID',
      type: 'text'
    },

    {
      key: 'opportunityDetails',
      label: 'Opportunity',
      placeholder: 'Opportunity Details',
      type: 'text'
    }

  ];

  if (this.showRegionFilter) {

    this.searchFields.push({

      key: 'regionId',
      label: 'Region',
      placeholder: 'Select Region',
      type: 'select',
      options: [...this.regionOptions]

    });

  }

}

  rows: any[] = [];
  fullRows: any[] = [];

  


 onSearch(searchValues: any): void {

  const payload = {
    quoteId: searchValues?.quoteId ?? '',
    opportunityDetails: searchValues?.opportunityDetails ?? '',
     regionId: searchValues?.regionId ?? null,
    pagination: {
      pageNumber: 0,
      pageSize: this.pageSize,
      sortBy: 'quoteId',
      sortOrder: 'DESC'
    }
  };

  console.log("Search Payload:", payload);
  this.quoteApprovalService.search(payload).subscribe({

    next: (response) => {

      console.log('Search Response', response);

      if (response?.status && response?.data) {

        // this.rows = response.data.content || [];
          this.rows = (response.data.content || []).map((row: any) => ({
    ...row,
    quoteDisplay: `${row.quoteNumber}\n\n${row.quoteCreatedDate}`
  }));

        this.fullRows = [...this.rows];

        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;

        this.currentPage = 1;

      } else {

        this.rows = [];
        this.fullRows = [];

      }

    },

    error: (error) => {

      console.error(error);

      this.rows = [];
      this.fullRows = [];

    }

  });

}


totalElements = 0;
totalPages = 0;
currentPage = 1;
pageSize = 10;

onPageChange(page: number): void {

  this.currentPage = page;
  this.loadQuotes();

}

onPageSizeChange(size: number): void {

  this.pageSize = size;
  this.currentPage = 1;
  this.loadQuotes();

}

selectedQuote: any = null;
// selectedQuote: any = {};
showApprovalPopup = false;
remarks = '';
approvalHistory: any[] = [];
showHistoryPopup = false;

showViewPopup = false;
marginAnalysisData: any = null;
approvalInProgress = false;
approve(row: any): void {

  if (this.approvalInProgress) {
    return;
  }

  if (!row?.quoteRevisionId) {
    this.toastService.error('Quote Revision ID is missing.');
    return;
  }

  this.approvalInProgress = true;

  const startTime = performance.now();

  console.log('========== APPROVE START ==========');
  console.log('Time:', new Date().toISOString());
  console.log('Role:', this.loggedInRole);
  console.log('Stage:', row.currentStage);
  console.log('Revision ID:', row.quoteRevisionId);

  const payload: any = {
    quoteRevisionId: row.quoteRevisionId,
    action: 'APPROVE'
  };

  switch (row.currentStage) {
    case 'RBH':
      payload.quoteRemarks1 = this.remarks;
      break;

    case 'NSM':
      payload.quoteRemarks2 = this.remarks;
      break;

    case 'CH':
      payload.quoteRemarks3 = this.remarks;
      break;

    default:
      this.approvalInProgress = false;
      this.toastService.error('Invalid approval stage.');
      return;
  }

  console.log('APPROVE PAYLOAD:', payload);

  const apiStart = performance.now();

  this.quoteApprovalService.action(payload).subscribe({

    next: (response) => {

      const apiTime = performance.now() - apiStart;
      const totalTime = performance.now() - startTime;

      console.log('========== APPROVE RESPONSE ==========');
      console.log('API response time:', apiTime.toFixed(0), 'ms');
      console.log('Total frontend time:', totalTime.toFixed(0), 'ms');
      console.log('Response:', response);

      if (response?.status === true) {

        this.toastService.success(
          'Quote approved successfully.'
        );

        this.showApprovalPopup = false;
        this.showHistoryPopup = false;

        this.rows = this.rows.filter(
          x => x.quoteRevisionId !== row.quoteRevisionId
        );

        this.fullRows = this.fullRows.filter(
          x => x.quoteRevisionId !== row.quoteRevisionId
        );

        if (this.totalElements > 0) {
          this.totalElements--;
        }

        this.selectedQuote = null;
        this.remarks = '';
      }

      this.approvalInProgress = false;

      console.log('========== APPROVE END ==========');
    },

    error: (error) => {

      const apiTime = performance.now() - apiStart;
      const totalTime = performance.now() - startTime;

      console.error('========== APPROVE ERROR ==========');
      console.error('API response time:', apiTime.toFixed(0), 'ms');
      console.error('Total frontend time:', totalTime.toFixed(0), 'ms');
      console.error(error);

      this.approvalInProgress = false;

      this.toastService.error(
        error?.error?.message ||
        'Failed to approve quote.'
      );
    }

  });
}

// approve(row:any):void {

//  const payload:any={
//    quoteRevisionId: row.quoteRevisionId,
//    action:'APPROVE'
//  };


//  switch(row.currentStage){

//  case 'RBH':
//    payload.quoteRemarks1=this.remarks;
//    break;

//  case 'NSM':
//    payload.quoteRemarks2=this.remarks;
//    break;

//  case 'CH':
//    payload.quoteRemarks3=this.remarks;
//    break;

//  }


//  this.quoteApprovalService.action(payload)
//  .subscribe({

//  next:(response)=>{


//    this.toastService.success(
//       response?.message || 'Approved successfully'
//    );


//    this.showApprovalPopup=false;
//    this.remarks='';


//    // keep row visible
//   //  this.refreshCurrentRow(row);
//   this.loadQuotes();


//  },


//  error:()=>{
//    this.toastService.error('Failed to approve quote.');
//  }

//  });

// }

refreshCurrentRow(updatedRow:any):void {

  const index = this.rows.findIndex(
    x => x.quoteRevisionId === updatedRow.quoteRevisionId
  );

  if(index !== -1){

    this.rows[index] = {
      ...this.rows[index],
      currentStage: updatedRow.currentStage,
      canApprove:false
    };

    this.rows = [...this.rows];

  }

}


reject(row: any): void {

  const payload: any = {
    quoteRevisionId: row.quoteRevisionId,

    action: 'REJECT'
  };

  switch (row.currentStage) {

    case 'RBH':
      payload.quoteRemarks1 = this.remarks;
      break;

    case 'NSM':
      payload.quoteRemarks2 = this.remarks;
      break;

    case 'CH':
      payload.quoteRemarks3 = this.remarks;
      break;
  }

  this.quoteApprovalService.action(payload).subscribe({

   next: (response) => {

  console.log('APPROVE SUCCESS RESPONSE:', response);

  if (response?.status === true) {

    this.toastService.success(
      response?.message || 'Quote approved successfully.'
    );

    this.showApprovalPopup = false;
    this.showHistoryPopup = false;
    this.selectedQuote = null;
    this.remarks = '';

    // Remove the approved quote immediately from the current list
    this.rows = this.rows.filter(
      x => x.quoteRevisionId !== row.quoteRevisionId
    );

    this.fullRows = this.fullRows.filter(
      x => x.quoteRevisionId !== row.quoteRevisionId
    );

    // Update total count
    if (this.totalElements > 0) {
      this.totalElements--;
    }

  } else {

    this.toastService.error(
      response?.message || 'Failed to approve quote.'
    );

  }

},
error: () => {

  this.toastService.error('Failed to reject quote.');

}
  });

}
// onView(row: any): void {

//   const quoteRevisionId = row.quoteRevisionId;

//   if (!quoteRevisionId) {
//     console.error('quoteRevisionId is missing from row', row);
//     return;
//   }

//   this.quoteApprovalService.getMarginAnalysis(quoteRevisionId).subscribe({

//     next: (response) => {

//       console.log('Margin Analysis Response', response);

//       if (response?.status && response?.data) {
//         this.marginAnalysisData = response.data;
//         this.showViewPopup = true;
//       } else {
//         console.error('Unexpected response format', response);
//       }

//     },

//     error: (error) => {
//       console.error('Error loading margin analysis', error);
//     }

//   });

// }

onView(row: any): void {

  if (!row?.quoteRevisionId) {
    console.error('Quote Revision Id missing');
    return;
  }

  this.marginAnalysisData = null;

  this.quoteApprovalService
      .getMarginAnalysis(row.quoteRevisionId)
      .subscribe({

        next: (response) => {

          console.log(response);

          if (response.status) {

            this.marginAnalysisData = response.data;

            this.showViewPopup = true;

          }

        },

        error: err => {

          console.error(err);

        }

      });

}
// onEdit(row: any): void {

//   console.log("Edit clicked:", row);

//   this.selectedQuote = row;
//   this.approvalHistory = [];

//   if (row.canApprove) {

//     this.remarks = '';
//     this.showApprovalPopup = true;
//     this.showHistoryPopup = false;

//   } else {

//     this.showApprovalPopup = false;

//     console.log("ROW DATA:", row);
//     console.log("REVISION ID:", row.quoteRevisionId);

//     this.quoteApprovalService.getApprovalHistory(row.quoteRevisionId)
//       .subscribe({

//         next: (res: any) => {

//           console.log("History API Response:", res);

//           if (res?.status && Array.isArray(res.data)) {

//             this.approvalHistory = res.data;

//             console.log("Approval History:", this.approvalHistory);

//           } else {

//             this.approvalHistory = [];
//             console.warn("History is empty.");

//           }

//           // Open history popup AFTER data is loaded
//           this.showHistoryPopup = true;

//         },

//         error: (err) => {

//           console.error("History API Error:", err);

//           this.toastService.error("Unable to load approval history.");

//         }

//       });

//   }

// }

onEdit(row: any): void {

  console.log("Edit clicked:", row);

  this.selectedQuote = {
    ...row,
    opportunityDetails: 
      row.opportunityDetails || 
      row.opportunity || 
      row.opportunityDetail
  };

  console.log("Popup Selected Quote:", this.selectedQuote);

  this.approvalHistory = [];

  if (row.canApprove) {

    this.remarks = '';
    this.showApprovalPopup = true;
    this.showHistoryPopup = false;

  } else {

    this.showApprovalPopup = false;

    this.quoteApprovalService
      .getApprovalHistory(row.quoteRevisionId)
      .subscribe({

        next:(res:any)=>{

          this.approvalHistory = res.data || [];
          this.showHistoryPopup = true;

        },

        error:(err)=>{

          console.error(err);

        }

      });

  }
}

closeApprovalPopup(): void {

  if (this.approvalInProgress) {
    return;
  }

  this.showApprovalPopup = false;
  this.selectedQuote = null;
  this.remarks = '';
}

closeHistoryPopup(): void {

  this.showHistoryPopup = false;

  this.selectedQuote = null;

  this.approvalHistory = [];

}

closeViewPopup(): void {

  this.showViewPopup = false;
  this.marginAnalysisData = null;

}


OnReset(){
    this.selectedRegion = null;
  this.loadQuotes();
}


regionOptions: any[] = [];
selectedRegion: number | null = null;

loggedInRole = '';
showRegionFilter = false;


}
