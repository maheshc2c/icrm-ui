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

@Component({
  selector: 'app-demo',
  imports: [Header, Sidebar, CommonModule, Pageheader, DataTable],
  templateUrl: './demo.html',
  styleUrl: './demo.css',
})
export class Demo implements OnInit {

  constructor(
    private adminservice: Adminservice,
    private router: Router
  ) {}

  headerTitle = 'Manage Demo Product';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Demo', route: '/admin/demo' }
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
  }

  // ================= LOAD DATA =================
  private loadDemo(): void {
    this.adminservice.getDemo().subscribe({
      next: (data: any[]) => {

        this.fullRows = data;

        this.rows = data.map((c: any, index: number) => ({
  sno: index + 1,
  demoProductDetailId: c.demoProductDetailId,
  demoProductDetailStatus: c.demoProductDetailStatus,
 

  productName: c.productName ?? '-',

  // ✅ FIXED
  demoProductDetailSerialNumber:
    c.demoProductDetailSerialNumber ??
    c.serialNo ??
    c.serialNumber ??       // 🔥 ADD THIS
  c.demoSerialNumber ??   // 🔥 ADD THIS
  c.productSerialNumber ??// 🔥 ADD THIS
    '-',

  // ✅ FIXED
  demoProductDetailLocation:
    c.demoProductDetailLocation ??
    c.location ??
    '-',

  cityName: c.cityName ?? '-',
  regionName: c.regionName ?? c.region ?? '-',
  branchName: c.branchName ?? '-'
}));

        // dropdown population
        this.buildDropdownOptions(data, 'productName', (d: any) => d.productName);
        this.buildDropdownOptions(data, 'regionName', (d: any) => d.regionName);
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
 
  const apiCall = isActive
    ? this.adminservice.deactivateDemo(detailId)
    : this.adminservice.activateDemo(detailId);
 
  apiCall.subscribe({
    next: () => {
 
      row.demoProductDetailStatus = isActive ? 2 : 1;
 
      this.rows = [...this.rows];
      this.fullRows = [...this.fullRows];
 
    },
 
    error: (err) => {
      console.error('Status update failed', err);
      alert('Failed to update status');
    }
  });
}

  // ================= DROPDOWN BUILDER =================
  private buildDropdownOptions(
    data: any[],
    key: string,
    extractor: (item: any) => string
  ): void {

    const unique = new Set<string>();

    data.forEach((item: any) => {
      const value = extractor(item);
      if (value) unique.add(value);
    });

    const field = this.searchFields.find(f => f.key === key);

    if (field) {
      field.options = Array.from(unique).map(v => ({
        label: v,
        value: v
      }));
    }
  }

  // ================= SEARCH FIELDS =================
  searchFields: SearchFieldConfig[] = [
    { key: 'categoryName', label: 'Category', type: 'text', placeholder: 'Category' },
    { key: 'groupName', label: 'Segment', type: 'text', placeholder: 'Segment' },
    { key: 'productName', label: 'Product', type: 'select', placeholder: 'Product', options: [] },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'Location' },
    { key: 'serialNo', label: 'Serial Number', type: 'text', placeholder: 'Serial Number' },
    { key: 'regionName', label: 'Region', type: 'select', placeholder: 'Region', options: [] }
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

onSearch(filters: any): void {

  if (!filters || Object.values(filters).every(v => !v)) {
    this.loadDemo();
    return;
  }

  this.adminservice.searchDemo(filters).subscribe({
    next: (results: any[]) => {

      this.rows = results.map((c: any, index: number) => {

        const match = this.fullRows.find(f =>
          f.demoProductDetailSerialNumber === c.serialNo
        );

        return {
          sno: index + 1,

          demoProductDetailId:
            match?.demoProductDetailId ?? null,

          demoProductDetailStatus:
            match?.demoProductDetailStatus ?? 1,

          productName:
            c.productName ?? '-',

          demoProductDetailSerialNumber:
            c.serialNo ?? '-',

          demoProductDetailLocation:
            c.location ?? '-',

          cityName:
            match?.cityName ?? '-',

          branchName:
            match?.branchName ?? '-',

          regionName:
            c.regionName ?? '-'
        };
      });

    },
    error: (err) => {
      console.error('Search failed', err);
    }
  });
}



  // ================= NAVIGATION =================
  onAdd(): void {
    this.router.navigate(['/admin/demo/add']);
  }

  onEdit(row: any): void {
    this.router.navigate(['/admin/demo/edit', row.demoProductDetailId]);
  }

 

  // ================= DOWNLOAD =================
  onImport(): void {

    if (!this.fullRows.length) {
      alert('No data available');
      return;
    }

    this.adminservice.downloadDemo(this.fullRows).subscribe(blob => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DemoProduct.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
