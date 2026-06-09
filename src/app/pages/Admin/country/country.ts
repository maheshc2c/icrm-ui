import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTable } from '../../../shared/data-table/data-table';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Countryservice } from '../../../service/countryservice';
import { Geoservice } from '../../../service/geoservice';
import { Country } from '../../../models/country';
import { Breadcrumb } from '../../../models/breadcrumb';
 
interface SearchFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: any }[];
}
 
@Component({
  selector: 'app-country',
  standalone: true,
  imports: [CommonModule, DataTable, Pageheader, Header, Sidebar, FormsModule],
  templateUrl: './country.html',
  styleUrl: './country.css'
})
export class CountryComponent implements OnInit {
 
  /* ================= HEADER ================= */
  headerTitle = 'Country';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Territory', route: '/country' },
    { label: 'Country' }
  ];
 
  role = localStorage.getItem('role');
 
  columns = [
    { header: 'Geo', field: 'geoName' },
    { header: 'Country', field: 'countryName' }
  ];
 
  // Store raw API data for export
  private originalData: any[] = [];
 
  rows: any[] = [];
  fullRows: any[] = [];
 
  ngOnInit(): void {
    this.loadCountries();
  }
 
  constructor(
    private router: Router,
    private countryService: Countryservice,
    private geoService: Geoservice
  ) { }
 
  // Class property for Geo Map
  private geoMap = new Map<string, string>();
 
  /* ================= LOAD COUNTRIES ================= */
  loadCountries(): void {
    // Load both Geo and Country data
    this.geoService.getGeos().subscribe({
      next: (geos: any[]) => {
        // Populate Geo Map
        this.geoMap.clear();
        geos.forEach(g => {
          const name = g.locationName || g.name || g.geoName;
          const id = g.locationId || g.id;
          if (id) {
            this.geoMap.set(String(id), name);
          }
        });
 
        this.countryService.getCountries().subscribe({
          next: (countries: any[]) => {
            console.log('Country API Response:', countries);
 
            // Store raw data for export
            this.originalData = countries;
 
            this.rows = countries.map((country, index) => {
              return this.mapCountryRow(country, index);
            });
 
            this.fullRows = this.rows;
            console.log('Final joined data:', this.rows);
          },
          error: (err: any) => {
            console.error('Failed to load country list:', err);
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to load geo list:', err);
      }
    });
  }
 
  // Helper to map country data to row
  private mapCountryRow(country: any, index: number): any {
    const parentId = country.parentId || country.parentLocation?.id || country.parentLocation?.locationId;
    let geoName = country.parentLocation?.locationName || country.parentLocation?.name;
 
    if (!geoName && parentId) {
      geoName = this.geoMap.get(String(parentId));
    }
 
    if (!geoName) {
      // console.warn(`Geo lookup failed for ID: ${parentId}`);
      geoName = `Unknown (ID: ${parentId})`;
    }
 
    return {
      sno: index + 1,
      id: country.id || country.locationId,
      geoName: geoName,
      countryName: country.locationName
    };
  }
 
  /* ================= ACTIONS ================= */
  onAdd() {
    this.router.navigate(['/addcountry']);
  }
 
  onEdit(row: any) {
    console.log('Edit received in Country:', row);
    const id = row.id || row.countryId;
 
    if (!id) {
      alert('No valid ID found for editing');
      return;
    }
 
    this.router.navigate(['/editcountry', id]);
  }
 
  onDelete(row: any) {
    console.log('Delete', row);
    alert('Delete functionality not yet implemented');
  }
 
  /* ================= SEARCH FUNCTIONALITY ================= */
  searchFields: SearchFieldConfig[] = [
    {
      key: 'locationName',
      label: 'Search',
      placeholder: 'Enter geo or country name',
      type: 'text'
    }
  ];
 
  onSearch(searchData: any) {
    console.log('Search data:', searchData);
 
    // Handle both object and direct string input
    const searchTerm = typeof searchData === 'string'
      ? searchData
      : searchData?.locationName?.trim() || '';
 
    // If empty, reload all
    if (!searchTerm) {
      this.rows = [...this.fullRows];
      return;
    }
 
    console.log('Searching with term:', searchTerm);
   
    // Client-side filtering (matches pattern in state.ts)
    const lowerSearch = searchTerm.toLowerCase();
   
    this.rows = this.fullRows.filter(row => {
      const geoMatch = (row.geoName || '').toLowerCase().includes(lowerSearch);
      const countryMatch = (row.countryName || '').toLowerCase().includes(lowerSearch);
      return geoMatch || countryMatch;
    });
   
    // Update originalData for export with the filtered mapped rows
    // To keep it simple, we just export the current filtered rows.
    this.originalData = this.rows;
  }
 
  /* ================= DOWNLOAD FUNCTIONALITY ================= */
  onImport() {
    if (!this.originalData || this.originalData.length === 0) {
      alert('No data available to export');
      return;
    }
 
    this.countryService.downloadCountryExcel(this.originalData).subscribe({
      next: (blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Countries.xlsx';
        link.click();
        URL.revokeObjectURL(link.href);
      },
      error: (err: any) => {
        console.error('Download failed:', err);
        alert('Failed to download Excel file');
      }
    });
  }
}
 