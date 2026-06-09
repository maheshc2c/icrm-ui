import { Component } from '@angular/core';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { DataTable } from '../../../shared/data-table/data-table';
import { Router } from 'express';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Adminservice } from '../../../service/adminservice';
import { ActivatedRoute } from '@angular/router';
import { Citymodel } from '../../../models/citymodel';

@Component({
  selector: 'app-territory',
  imports: [Pageheader, Header, Sidebar],
  templateUrl: './territory.html',
  styleUrl: './territory.css',
})
export class Territory {

   constructor(
    private adminservice: Adminservice,
    // private router: Router,
    // private route: ActivatedRoute
  ) {}

  headerTitle = 'Manage City';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'City', route: '/admin/territory' }
  ];

  // 🔹 Table Columns
  // columns = [
  //   { header: 'S.No', field: 'sno' },
  //   { header: 'City', field: 'cityName' },
  //   { header: 'District', field: 'districtName' },
  //   { header: 'State', field: 'stateName' },
  //   { header: 'Country', field: 'countryName' },
  //   { header: 'Region', field: 'regionName' }
  // ];

  // rows: any[] = [];
  // fullRows: Citymodel[] = [];

  // ngOnInit(): void {
  //   this.loadCity();
  // }

  // ✅ LIST CITY
  // private loadCity(): void {
  //   this.adminservice.getCity().subscribe({
  //     next: (cities: Citymodel[]) => {
  //       this.fullRows = cities;

  //       this.rows = cities.map((c, index) => ({
  //         sno: index + 1,
  //         cityName: c.cityName,
  //         districtName: c.districtName,
  //         stateName: c.stateName,
  //         countryName: c.countryName,
  //         regionName: c.regionName
  //       }));
  //     },
  //     error: (err) => {
  //       console.error('Failed to load cities', err);
  //     }
  //   });
  // }

  // ================= SEARCH =================
  // searchFields: SearchFieldConfig[] = [
  //   {
  //     key: 'cityName',
  //     label: 'City',
  //     placeholder: 'Enter city name',
  //     type: 'text'
  //   }
  // ];

  // onSearch(keyword: string) {
  //   const value = keyword?.trim();

  //   if (!value) {
  //     this.loadCity();
  //     return;
  //   }

  //   this.adminservice.searchCity(value).subscribe({
  //     next: (results: Citymodel[]) => {
  //       this.fullRows = results;

  //       this.rows = results.map((c, index) => ({
  //         sno: index + 1,
  //         cityName: c.cityName,
  //         districtName: c.districtName,
  //         stateName: c.stateName,
  //         countryName: c.countryName,
  //         regionName: c.regionName
  //       }));
  //     },
  //     error: (err) => {
  //       console.error('City search failed', err);
  //     }
  //   });
  // }

  // ================= DOWNLOAD =================
  // onImport() {
  //   if (!this.fullRows || this.fullRows.length === 0) {
  //     alert('No data available to download');
  //     return;
  //   }

  //   this.adminservice.downloadCityExcel(this.fullRows).subscribe({
  //     next: (blob: Blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = 'City.xlsx';
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //     },
  //     error: (err) => {
  //       console.error('City download failed', err);
  //       alert(`Download failed: ${err.status}`);
  //     }
  //   });
  // }

  // ================= NAVIGATION =================
  // onAdd() {
  //   this.router.navigate(['city/add']);
  // }

  // onEdit(row: any) {
  //   this.router.navigate(['city/edit', row.cityName]);
  // }

  // onDelete(row: any) {
  //   console.log('Delete city:', row);
  // }
    

}
