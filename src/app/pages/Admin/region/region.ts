import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTable } from '../../../shared/data-table/data-table';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Regionservice } from '../../../service/regionservice';
import { Geoservice } from '../../../service/geoservice';
import { Countryservice } from '../../../service/countryservice';
import { Region } from '../../../models/region';
import { Breadcrumb } from '../../../models/breadcrumb';

interface SearchFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: any }[];
}

@Component({
  selector: 'app-region',
  standalone: true,
  imports: [CommonModule, DataTable, Pageheader, Header, Sidebar, FormsModule],
  templateUrl: './region.html',
  styleUrl: './region.css'
})
export class RegionComponent implements OnInit {

  /* ================= HEADER ================= */
  headerTitle = 'Region';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Territory', route: '/region' },
    { label: 'Region' }
  ];

  role = localStorage.getItem('role');

  columns = [
    { header: 'Country', field: 'countryName' },
    { header: 'Region', field: 'regionName' }
  ];

  rows: any[] = [];
  fullRows: any[] = [];
  private originalData: any[] = [];
  private countryMap = new Map<string, string>();

  ngOnInit(): void {
    this.loadRegions();
  }

  constructor(
    private router: Router,
    private regionService: Regionservice,
    private geoService: Geoservice,
    private countryService: Countryservice
  ) { }

  /* ================= LOAD REGIONS ================= */
  loadRegions(): void {
    // Load Countries first to build the map, then Regions
    this.countryService.getCountries().subscribe({
      next: (countries: any[]) => {
        console.log('Country API Response:', countries);

        this.countryMap.clear();
        countries.forEach(c => {
          const name = c.locationName || c.name || c.countryName;
          const id = c.id || c.locationId || c.serialNo;
          if (id && name) {
            this.countryMap.set(String(id), name);
          }
        });

        this.regionService.getRegions().subscribe({
          next: (regions: any[]) => {
            console.log('Region API Response:', regions);
            this.originalData = regions;

            this.rows = regions.map((region, index) => {
              return this.mapRegionRow(region, index);
            });

            this.fullRows = this.rows;
          },
          error: (err: any) => {
            console.error('Failed to load region list:', err);
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to load country list:', err);
      }
    });
  }

  // Helper to map region data to row
  private mapRegionRow(region: any, index: number): any {
    // Robust countryId resolution
    const countryId = region.countryId ||
      region.parentId ||
      region.parentLocation?.id ||
      region.parentLocation?.locationId;

    // Robust countryName resolution
    let countryName = region.countryName ||
      region.parentLocation?.locationName ||
      region.parentLocation?.name;

    if (!countryName && countryId) {
      countryName = this.countryMap.get(String(countryId));
    }

    if (!countryName) {
      console.warn(`Mapping failed for region index ${index}:`, region);
      countryName = `Unknown (ID: ${countryId})`;
    }

    return {
      sno: index + 1,
      id: region.id || region.locationId,
      countryName: countryName,
      regionName: region.locationName || region.name || region.regionName
    };
  }

  onAdd() {
    this.router.navigate(['/addregion']);
  }

  onEdit(row: any) {
    console.log('Edit received in Region:', row);
    const id = row.id || row.regionId;
    if (!id) {
      alert('No valid ID found for editing');
      return;
    }
    this.router.navigate(['/editregion', id]);
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
      placeholder: 'Enter country or region name',
      type: 'text'
    }
  ];

  onSearch(searchData: any) {
    console.log('Search Triggered with Data:', searchData);

    const searchTerm = typeof searchData === 'string' 
      ? searchData.trim() 
      : searchData?.locationName?.trim() || '';

    if (!searchTerm) {
      console.log('Empty search term, resetting to full list...');
      this.rows = [...this.fullRows];
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();
    this.rows = this.fullRows.filter(row => {
      const matchCountry = row.countryName && row.countryName.toLowerCase().includes(lowerTerm);
      const matchRegion = row.regionName && row.regionName.toLowerCase().includes(lowerTerm);
      return matchCountry || matchRegion;
    });
    
    console.log('DataTable rows updated locally:', this.rows.length);
  }

  /* ================= DOWNLOAD FUNCTIONALITY ================= */
  onImport() {
    if (!this.originalData || this.originalData.length === 0) {
      alert('No data available to export');
      return;
    }

    // Map data for Excel export to ensure column names and data are correct
    const exportData = this.originalData.map(region => {
      const countryId = region.countryId ||
        region.parentId ||
        region.parentLocation?.id ||
        region.parentLocation?.locationId;

      let countryName = region.countryName ||
        region.parentLocation?.locationName ||
        region.parentLocation?.name;

      if (!countryName && countryId) {
        countryName = this.countryMap.get(String(countryId));
      }

      return {
        ...region,
        countryName: countryName || `Unknown (ID: ${countryId})`,
        regionName: region.locationName || region.name || region.regionName
      };
    });

    this.regionService.downloadRegionExcel(exportData).subscribe({
      next: (blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Regions.xlsx';
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
