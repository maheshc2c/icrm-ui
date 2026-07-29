import { Component, OnInit } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Adminservice } from '../../../service/adminservice';
import { ToastService } from '../../../service/toast.service';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';

@Component({
  selector: 'app-demo',
  imports: [Header, Sidebar, CommonModule, Pageheader, DataTable],
  templateUrl: './demo.html',
  styleUrl: './demo.css',
})
export class Demo implements OnInit {

  constructor(
    private adminservice: Adminservice,
    private router: Router,
    private toastService: ToastService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  headerTitle = 'Manage Demo Product';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Demo', route: '/demoproduct' }
  ];

  columns = [
    { header: 'Product', field: 'productName' },
    { header: 'Serial Number', field: 'demoProductDetailSerialNumber' },
    { header: 'City', field: 'cityName' },
    { header: 'Location', field: 'demoProductDetailLocation' },
    { header: 'Region', field: 'regionName' },
    { header: 'Branch', field: 'branchName' }
  ];

  rows: any[] = [];
  fullRows: any[] = [];

  ngOnInit(): void {
    this.loadDemo();
    this.loadDropdowns();
  }

  loadDropdowns(): void {
      this.adminservice.getAllCategoriesForSearch().subscribe({
        next: (data: any[]) => {
          const field = this.searchFields.find(f => f.key === 'categoryId');
          if (field) {
            field.options = data.map(c => ({ label: c.categoryName, value: c.categoryId }));
          }
        },
        error: (err) => console.error('Failed to load categories dropdown', err)
      });

      this.adminservice.getAllGroupsForSearch().subscribe({
        next: (data: any[]) => {
          const field = this.searchFields.find(f => f.key === 'segmentId');
          if (field) {
            field.options = data.map(g => ({ label: g.groupName, value: g.groupId }));
          }
        },
        error: (err) => console.error('Failed to load groups dropdown', err)
      });
  }

  onRefresh(): void {
    this.loadDemo();
  }

  // ================= LOAD DATA =================
  private loadDemo(): void {
    this.adminservice.getDemo().subscribe({
      next: (data: any[]) => {

        // Sort descending by ID to show latest first
        data.sort((a: any, b: any) => (b.demoId ?? 0) - (a.demoId ?? 0));

        this.fullRows = data;

        this.rows = data.map((c: any, index: number) => ({
  sno: index + 1,
  demoProductDetailId: c.demoId,
  demoProductDetailStatus: 1,
 

  productName: c.product ?? '-',

  demoProductDetailSerialNumber:
    c.serialNumber ??       
    '-',

  demoProductDetailLocation:
    c.location ??
    '-',

  cityName: c.city ?? '-',
  regionName: c.region ?? '-',
  branchName: c.branch ?? '-'
}));

        // dropdown population
        this.buildDropdownOptions(data, 'productId', (d: any) => ({ label: d.product, value: d.productId }));
        this.buildDropdownOptions(data, 'regionId', (d: any) => ({ label: d.region, value: d.regionId }));
      }
    });
  }


    //actiavte and deactivate
  //actiavte and deactivate
onDelete(row: any) {
  const detailId = row?.demoProductDetailId;
 
  if (!detailId) {
    return;
  }
 
  const status = Number(row?.demoProductDetailStatus);
  const isActive = status === 1;
  const actionText = isActive ? 'deactivate' : 'activate';
  const confirmMsg = `Are you sure you want to ${actionText} this demo product?`;
 
  this.confirmDialogService.confirm({
    title: 'Confirm',
    message: confirmMsg,
    confirmText: isActive ? 'Deactivate' : 'Activate'
  }).then((confirmed: boolean) => {
    if (confirmed) {
      const apiCall = isActive
        ? this.adminservice.deactivateDemo(detailId)
        : this.adminservice.activateDemo(detailId);
     
      apiCall.subscribe({
        next: () => {
          row.demoProductDetailStatus = isActive ? 2 : 1;
          this.rows = [...this.rows];
          this.fullRows = [...this.fullRows];
          this.toastService.success(`Demo product ${actionText}d successfully`);
        },
        error: (err) => {
          console.error('Status update failed', err);
          this.toastService.error(`Failed to ${actionText} demo product`);
        }
      });
    }
  });
}

  // ================= DROPDOWN BUILDER =================
  private buildDropdownOptions(
    data: any[],
    key: string,
    extractor: (item: any) => { label: string, value: number }
  ): void {
    const map = new Map<number, string>();

    data.forEach((item: any) => {
      const extracted = extractor(item);
      if (extracted.label && extracted.value) {
        map.set(extracted.value, extracted.label);
      }
    });

    const field = this.searchFields.find(f => f.key === key);

    if (field) {
      field.options = Array.from(map.entries()).map(([val, lbl]) => ({
        label: lbl,
        value: val
      }));
    }
  }

  // ================= SEARCH FIELDS =================
  searchFields: SearchFieldConfig[] = [
    { key: 'categoryId', label: 'Category', type: 'select', placeholder: 'Category', options: [] },
    { key: 'segmentId', label: 'Segment', type: 'select', placeholder: 'Segment', options: [] },
    { key: 'productId', label: 'Product', type: 'select', placeholder: 'Product', options: [] },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'Location' },
    { key: 'serialNumber', label: 'Serial Number', type: 'text', placeholder: 'Serial Number' },
    { key: 'regionId', label: 'Region', type: 'select', placeholder: 'Region', options: [] }
  ];

  // ================= SEARCH =================
  // onSearch(filters: any): void {

  //   if (!filters || Object.values(filters).every(v => !v)) {
  //     this.loadDemo();
  //     return;
  //   }

  //   this.adminservice.searchDemo(filters).subscribe({
  //     next: (results: any[]) => {

  //       this.fullRows = results;

  //       this.rows = results.map((c: any, index: number) => ({
  //         sno: index + 1,
  //         demoProductDetailId: c.demoProductDetailId,
  //         productName: c.productName,
  //         demoProductDetailSerialNumber: c.demoProductDetailSerialNumber,
  //         cityName: c.cityName,
  //         demoProductDetailLocation: c.demoProductDetailLocation,
  //         regionName: c.regionName,
  //         branchName: c.branchName
  //       }));
  //     },
  //     error: err => console.error('Search failed', err)
  //   });
  // }

//   onSearch(filters: any): void {

//   if (!filters || Object.values(filters).every(v => !v)) {
//     this.loadDemo();
//     return;
//   }

//   this.adminservice.searchDemo(filters).subscribe({
//     next: (results: any[]) => {

//       console.log('Search results:', results);

//       this.fullRows = results;

//       this.rows = results.map((c: any, index: number) => ({
//   sno: index + 1,
//   productName: c.productName || c.product || '-',
//   demoProductDetailSerialNumber:
//     c.demoProductDetailSerialNumber || c.serialNo || '-',
//       // cityName: c.city || '-',   // ADD THIS,
//   cityName: c.cityName || c.city || '-',
//   demoProductDetailLocation:
//     c.demoProductDetailLocation || c.location || '-',
//   regionName: c.regionName || c.region || '-',
//   branchName: c.branchName || '-'
// }));



//     },
//     error: err => console.error('Search failed', err)
//   });
// }

currentPage = 1;
totalPages = 1;
totalItems: number | null = null;
pageSize = 10;
currentFilters: any = null;

onPageChange(pageIndex: number) {
  this.currentPage = pageIndex;
  if (this.currentFilters && Object.values(this.currentFilters).some(v => v)) {
    this.executeSearch(this.currentFilters);
  } else {
    this.loadDemo();
  }
}

onPageSizeChange(size: number) {
  this.pageSize = size;
  this.currentPage = 1;
  if (this.currentFilters && Object.values(this.currentFilters).some(v => v)) {
    this.executeSearch(this.currentFilters);
  } else {
    this.loadDemo();
  }
}

onSearch(filters: any): void {
  this.currentFilters = filters;
  this.currentPage = 1;

  if (!filters || Object.values(filters).every(v => !v)) {
    this.totalItems = null; // revert to client-side pagination for default loadDemo
    this.loadDemo();
    return;
  }

  this.executeSearch(filters);
}

executeSearch(filters: any): void {
  this.adminservice.searchDemoPaginated(filters, this.currentPage - 1, this.pageSize).subscribe({
    next: (response: any) => {
      let results: any[] = [];
      const actualData = response.data || response;
      
      if (actualData && actualData.content) {
        results = actualData.content;
        this.totalPages = response.totalPages || actualData.totalPages || 1;
        this.totalItems = response.totalElements || actualData.totalElements || 0;
      } else if (Array.isArray(actualData)) {
        results = actualData;
      } else {
        results = [];
      }

      this.rows = results.map((c: any, index: number) => {
        return {
          sno: ((this.currentPage - 1) * this.pageSize) + index + 1,
          demoProductDetailId: c.demoId ?? null,
          demoProductDetailStatus: 1,
          productName: c.product ?? '-',
          demoProductDetailSerialNumber: c.serialNumber ?? '-',
          demoProductDetailLocation: c.location ?? '-',
          cityName: c.city ?? '-',
          branchName: c.branch ?? '-',
          regionName: c.region ?? '-'
        };
      });
    },
    error: (err) => {
      console.error('Search failed', err);
      this.toastService.error('Search failed');
      this.rows = [];
      this.totalItems = 0;
      this.totalPages = 1;
    }
  });
}



  // ================= NAVIGATION =================
  onAdd(): void {
    this.router.navigate(['/demoproduct/add']);
  }

  onEdit(row: any): void {
    this.router.navigate(['/demoproduct/edit', row.demoProductDetailId]);
  }

 

  // ================= DOWNLOAD =================
  onImport(): void {
    const filters = this.currentFilters || {};
    
    const body = {
      categoryId: filters.categoryId || null,
      segmentId: filters.segmentId || null,
      productId: filters.productId || null,
      location: filters.location || null,
      serialNumber: filters.serialNumber || null,
      regionId: filters.regionId || null,
      pagination: {
        pageNumber: 0,
        pageSize: 1000000,
        sortBy: "demoId",
        sortOrder: "DESC"
      }
    };

    this.adminservice.downloadDemo(body).subscribe(blob => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DemoProduct.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
