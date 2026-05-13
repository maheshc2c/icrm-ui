import { Component, OnInit } from '@angular/core';
import { DataTable } from '../../../shared/data-table/data-table';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';
import { Button } from "../../../shared/button/button";
import { Router, ActivatedRoute } from '@angular/router';
import { Form } from '../../../shared/form/form';
import { Geoservice } from '../../../service/geoservice';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SearchFieldConfig } from '../../../shared/search/search';
 
 
@Component({
  selector: 'app-geo',
  imports: [CommonModule, DataTable, Header, Sidebar, Pageheader],
  templateUrl: './geo.html',
  styleUrl: './geo.css'
})
export class Geo implements OnInit {
 
  constructor(
    private geoService: Geoservice,
    private router: Router,
    private route: ActivatedRoute
  ) { }
 
 
  headerTitle = 'Manage Geo';
 
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Territory', route: '/admin/geo' },
    { label: 'Geo' }
  ];
 
 
  role = localStorage.getItem('role');
 
 
  columns = [
    { header: 'Geo', field: 'locationName' }
  ];
 
  rows: any[] = [];
  //allRows: any[] = []; // 🔹 master copy
  fullRows: any[] = [];   // ✅ full API data (for Excel)
 
 
  ngOnInit(): void {
    this.loadGeos();
  }
 
  loadGeos() {
    this.geoService.getGeos().subscribe({
      next: (geos: any[]) => {
 
        console.log('API Response:', geos);
 
        // ✅ STORE FULL DATA (DO NOT TOUCH)
        this.fullRows = geos;
 
        // ✅ MAP ONLY WHAT TABLE NEEDS
        this.rows = geos.map((g, index) => ({
          sno: index + 1,
          id: g.id || g.locationId, // Handle both id formats
          locationName: g.locationName
        }));
 
      },
      error: (err) => {
        console.error('Failed to load geo list:', err);
        if (err.status === 401) {
          alert('Session expired, please login again.');
          this.router.navigate(['/login']);
        }
      }
    });
  }
 
  //
  onAdd() {
    this.router.navigate(['/admin/addgeo']);
  }
 
  onEdit(row: any) {
    console.log('Edit received in Geo:', row);
    console.log('Row structure:', JSON.stringify(row, null, 2));
    console.log('Row ID:', row.id);
    console.log('Available fields:', Object.keys(row));
 
    // Try different possible ID field names
    console.log('row.id:', row.id);
    console.log('row.geoId:', row.geoId);
    console.log('row.location_id:', row.location_id);
 
    const id = row.id || row.geoId || row.location_id;
    console.log('Final ID to use:', id);
 
    if (!id) {
      alert('No valid ID found for editing');
      return;
    }
 
    console.log('Navigating to:', `/admin/editgeo/${id}`);
    this.router.navigate(['/admin/editgeo', id]);
  }
  isEditMode = false;
  geoId!: number
 
  onDelete(row: any) {
    console.log('Delete', row);
    alert('Delete functionality not yet implemented');
  }
 
 
 
  //Search Funstionality
 
  searchFields: SearchFieldConfig[] = [
    {
      key: 'locationName',
      label: 'Geo Name',
      placeholder: 'Name',
      type: 'text'   // ✅ now TypeScript knows this is literal
    }
    // { key: 'test', label: 'test', type: 'text' },
    // {
    //   key: 'status',
    //   label: 'Status',
    //   type: 'select',
    //   options: [
    //     { label: 'Active', value: 'ACTIVE' },
    //     { label: 'Inactive', value: 'INACTIVE' }
    //   ]
    // }
  ];
 
 
  
onSearch(keyword: string) {

  if (!keyword || keyword.trim() === '') {
    // 🔁 If empty search → reload full list
    this.loadGeos();
    return;
  }

  this.geoService.searchGeo(keyword).subscribe({
    next: (results: any[]) => {

      this.fullRows = results;

      this.rows = results.map((c, index) => ({
          sno: index + 1,
          id: c.id,
          locationName: c.locationName,
      }));
    },
    error: (err) => {
      console.error('Search failed', err);
    }
  });
}

 
 
  //Download
 
  onImport() {
 
    if (!this.fullRows || this.fullRows.length === 0) {
      alert('No data available to download');
      return;
    }
 
    this.geoService.downloadGeoExcel(this.fullRows).subscribe({
      next: (blob: Blob) => {
 
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Geo.xlsx';
        a.click();
 
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed:', err);
        alert(`Download failed: ${err.status}`);
      }
    });
  }
 
}
 