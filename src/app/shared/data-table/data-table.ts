import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from "../button/button";
import { Search, SearchFieldConfig } from "../search/search";
@Component({
  selector: 'app-data-table',
   standalone: true,
  imports: [CommonModule, FormsModule, Button, Search],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css'
})

export class DataTable
{
  @ViewChild(Search) searchComponent?: Search;

  @Input() columns: any[] = [];   // column headers
  @Input() rows: any[] = [];      // data rows
  @Input() title = '';            // optional title
  @Input() breadcrumbs: any[] = [];
  @Input() showRefresh: boolean = false;
  @Input() showSerialNumber: boolean = true;
  @Input() showDeleteButton: boolean = true;
  @Input() showEditButton: boolean = true;
  @Input() showViewButton: boolean = false;

   filteredRows = [...this.rows];

  edit(row: any) {
    console.log("Edit clicked:", row);
    this.editRow.emit(row);
  }

  view(row: any) {
    console.log("View clicked:", row);
    this.viewRow.emit(row);
  }

  //   ngOnChanges(changes: SimpleChanges) {
  //   if (changes['rows']) {
  //     this.filteredRows = [...this.rows];
  //   }
  // }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['rows']) {
      this.filteredRows = [...this.rows];
      
      // If currentPage is provided as an input and has changed, use its value.
      // Otherwise, only reset to page 1 for client-side pagination (totalElements is null).
      if (changes['currentPage'] && changes['currentPage'].currentValue !== undefined) {
        this.currentPage = changes['currentPage'].currentValue;
      } else if (this.totalElements === null) {
        this.currentPage = 1;
      }
      this.updatePagination();
    } else if (changes['currentPage']) {
      this.currentPage = changes['currentPage'].currentValue;
      this.updatePagination();
    }
  }

   /* ===== TOOLBAR CONFIG ===== */

  @Input() showImport = true;
  @Input() showAdd = true;
  @Input() showPagination = true;
  @Input() showAssign = false;
  @Input() showUpload = false;
  @Input() showSearch = true;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() showView = false;
  @Input() showDownload = true;

  /* ===== TOOLBAR EVENTS ===== */

  @Output() import = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() editRow = new EventEmitter<any>();
  @Output() viewRow = new EventEmitter<any>();
  @Output() assignRow = new EventEmitter<any>();
  @Output() uploadRow = new EventEmitter<any>();

  assign(row: any) {
    this.assignRow.emit(row);
  }

  upload(row: any) {
    this.uploadRow.emit(row);
  }

@Input() emptyMessage = 'No records found';


//Download Fuctionality 
@Output() download = new EventEmitter<void>();
// @Input() searchFields: string[] = [];

//Search Functionality

searchText = '';
pendingSearchValues: any = {};

@Output() search = new EventEmitter<string>();

onSearchClick() {
  this.search.emit(this.searchText);
  this.searchChange.emit(this.pendingSearchValues);
}


@Input() searchFields: SearchFieldConfig[] = [];
@Output() searchChange = new EventEmitter<any>();
@Output() fieldChange = new EventEmitter<{ key: string; value: any }>();


onSearchFromChild(values: any) {
  if (!values) {
    this.searchText = '';
    this.pendingSearchValues = {};
    return;
  }
  this.pendingSearchValues = values;

  // Pick the first NON-empty string value
  const activeValue = Object.values(values)
    .find((v): v is string => typeof v === 'string' && v.trim().length > 0);

  this.searchText = activeValue || '';
}

//automates the search method 
detectKey(row: any, index: number) {
  return (
    row?.startDate??
    row?.endDate??
    row?.subcategoryName??
    row?.businessCategory??
    row?.segmentName??
    row?.locationName??
    row?.product??
    row?.status??
    row?.distributor??
    row?.poId??
    row?.customer??
    row?.opportunity??
    row?.subcategoryName??
    row?.qouteId??
    row?.customerName??
    row?.contactFirstName ??
    row?.productName ??
    row?.fyId ??
    row?.demoId ??
    row?.specialityId ??
    row?.competitorId ??
    row?.customerId ??
    row?.companyId ??
    row?.id ??
    index
  );
}


//[pagination]
@Input() totalElements: number | null = null;
@Input() set totalItems(value: number | null) {
  this.totalElements = value;
}
get totalItems(): number | null {
  return this.totalElements;
}
@Input() showPagination = true;
@Output() pageChange = new EventEmitter<number>();
@Output() pageSizeChange = new EventEmitter<number>();

  @Input() pageSize = 10;
  @Input() currentPage = 1;
@Input() totalPages = 1;
paginatedRows: any[] = [];

updatePagination() {
  if (this.totalElements !== null) {
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    this.paginatedRows = this.filteredRows;
  } else {
    this.totalPages = Math.ceil(this.filteredRows.length / this.pageSize);

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedRows = this.filteredRows.slice(start, end);
  }
}

getStartRecord(): number {
  const total = this.totalElements !== null ? this.totalElements : this.filteredRows.length;
  if (total === 0) return 0;
  return (this.currentPage - 1) * this.pageSize + 1;
}

getEndRecord(): number {
  const total = this.totalElements !== null ? this.totalElements : this.filteredRows.length;
  return Math.min(this.currentPage * this.pageSize, total);
}

getVisiblePages(): (number | string)[] {
  const pages: (number | string)[] = [];
  const maxVisible = 7;

  if (this.totalPages <= maxVisible) {
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    let start = Math.max(2, this.currentPage - 1);
    let end = Math.min(this.totalPages - 1, this.currentPage + 1);

    if (this.currentPage <= 3) {
      end = 4;
    } else if (this.currentPage >= this.totalPages - 2) {
      start = this.totalPages - 3;
    }

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < this.totalPages - 1) {
      pages.push('...');
    }

    pages.push(this.totalPages);
  }

  return pages;
}

goToPage(page: number | string) {
  if (typeof page === 'number') {
    this.currentPage = page;
    if (this.totalElements !== null) {
      this.pageChange.emit(this.currentPage);
    } else {
      this.updatePagination();
    }
  }
}

// Page navigation
prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    if (this.totalElements !== null) {
      this.pageChange.emit(this.currentPage);
    } else {
      this.updatePagination();
    }
  }
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    if (this.totalElements !== null) {
      this.pageChange.emit(this.currentPage);
    } else {
      this.updatePagination();
    }
  }
}

//  Page size change
changePageSize(size: number) {
  this.pageSize = Number(size);
  this.currentPage = 1;
  if (this.totalElements !== null) {
    this.pageSizeChange.emit(this.pageSize);
  } else {
    this.updatePagination();
  }
}

@Input() showReset = false;

@Output() reset = new EventEmitter<void>();

onResetClick() {
  this.searchText = '';
  this.pendingSearchValues = {};
  this.currentPage = 1;
  if (this.searchComponent) {
    this.searchComponent.clear();
  }
  this.searchChange.emit({});
  this.reset.emit();
}

//delete 
@Input() trackByField: string = '';
@Input() showStatusToggle = false;
@Output() deleteRow = new EventEmitter<any>();
delete(row: any) {

  const status = this.getRowStatus(row);

  const action = status === 1 ? 'Deactivate' : 'Activate';

  const confirmed = confirm(
    `Are you sure you want to ${action}?`
  );

  if (confirmed) {
    this.deleteRow.emit(row);
  }
}

@Input() statusField: string = 'status';
getRowStatus(row: any): number | undefined {
  return row?.competitorStatus
    ?? row?.specialityStatus
    ?? row?.status
    ?? row?.customerStatus
    ?? row?.contactStatus
    ?? row?.demoProductDetailStatus
    ?? row?.leadStatus;
}


}
