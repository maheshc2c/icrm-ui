import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, SimpleChanges } from '@angular/core';
import {  Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from "../../layout/header/header";
import { Sidebar } from "../../layout/sidebar/sidebar";
import { Button } from "../button/button";
import { Search, SearchFieldConfig } from "../search/search";
@Component({
  selector: 'app-data-table',
   standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Button, Search],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css'
})
export class DataTable
{
  @Input() columns: any[] = [];   // column headers
  @Input() rows: any[] = [];      // data rows
  @Input() title = '';            // optional title

   filteredRows = [...this.rows];

   edit(row: any) {
    console.log("Edit clicked:", row);
    this.editRow.emit(row);
  }

  delete(row: any) {
    console.log("Delete clicked:", row);
  }

  //   ngOnChanges(changes: SimpleChanges) {
  //   if (changes['rows']) {
  //     this.filteredRows = [...this.rows];
  //   }
  // }
  
  ngOnChanges(changes: SimpleChanges) {
  if (changes['rows']) {
    this.filteredRows = [...this.rows];
    this.currentPage = 1;
    this.updatePagination();   // ✅ IMPORTANT
  }
}

   /* ===== TOOLBAR CONFIG ===== */

  @Input() showImport = true;
  @Input() showAdd = true;

  /* ===== TOOLBAR EVENTS ===== */

  @Output() import = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() editRow = new EventEmitter<any>();

@Input() emptyMessage = 'No records found';


//Download Fuctionality 
@Output() download = new EventEmitter<void>();
// @Input() searchFields: string[] = [];

//Search Functionality

searchText = '';

@Output() search = new EventEmitter<string>();

onSearchClick() {
  this.search.emit(this.searchText);
}


@Input() searchFields: SearchFieldConfig[] = [];
@Output() searchChange = new EventEmitter<any>();


onSearchFromChild(values: any) {
  if (!values) {
    this.searchText = '';
    return;
  }

  // ✅ Pick the first NON-empty string value
  const activeValue = Object.values(values)
    .find((v): v is string => typeof v === 'string' && v.trim().length > 0);

  this.searchText = activeValue || '';
  this.searchChange.emit(values);
}

//automates the search method 
detectKey(row: any, index: number) {
  return (
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
@Output() viewRow = new EventEmitter<any>();

view(row: any) {
  console.log('View clicked:', row);
  this.viewRow.emit(row);
}


//[pagination]
pageSize = 10;
currentPage = 1;
totalPages = 1;
paginatedRows: any[] = [];

updatePagination() {
  this.totalPages = Math.ceil(this.filteredRows.length / this.pageSize);

  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  this.paginatedRows = this.filteredRows.slice(start, end);
}

// ✅ Page navigation
prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.updatePagination();
  }
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.updatePagination();
  }
}

// ✅ Page size change
changePageSize(size: number) {
  this.pageSize = Number(size);
  this.currentPage = 1;
  this.updatePagination();
}

}
