import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataTable } from '../../../shared/data-table/data-table';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Cityservice } from '../../../service/cityservice';
import { Geoservice } from '../../../service/geoservice';
import { Countryservice } from '../../../service/countryservice';
import { Regionservice } from '../../../service/regionservice';
import { Stateservice } from '../../../service/stateservice';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule, DataTable, Pageheader, Header, Sidebar],
  templateUrl: './city.html',
  styleUrls: ['./city.css']
})
export class CityComponent implements OnInit {
  /* ================= DATA ================= */
  cities: any[] = [];
  fullRows: any[] = [];
  rows: any[] = [];
  loading: boolean = true;

  /* ================= HEADER ================= */
  headerTitle: string = 'City Management';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Territory', route: '/city' },
    { label: 'City', route: '/city' }
  ];

  /* ================= TABLE CONFIG ================= */
  columns: any[] = [
    { header: 'Country', field: 'countryName' },
    { header: 'Region', field: 'regionName' },
    { header: 'State', field: 'stateName' },
    { header: 'District', field: 'districtName' },
    { header: 'City', field: 'cityName' }
  ];

  /* ================= SEARCH CONFIG ================= */
  searchFields: SearchFieldConfig[] = [
    {
      key: 'locationName',
      label: 'Search',
      placeholder: 'Enter country, region, state, district or city name',
      type: 'text'
    }
  ];

  constructor(
    private cityService: Cityservice,
    private geoService: Geoservice,
    private countryService: Countryservice,
    private regionService: Regionservice,
    private stateService: Stateservice,
    private router: Router,
    private confirmService: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    console.log('City component initialized');
    this.loadCities();
  }

  /* ================= DATA LOADING ================= */
  loadCities(): void {
    this.loading = true;
    console.log('========== LOADING CITIES ==========');

    this.cityService.getCities().subscribe({
      next: (cities: any[]) => {
        console.log('City API Response:', cities);
        console.log('Total cities received:', cities.length);
        
        if (cities.length > 0) {
          console.log('First city structure:', cities[0]);
          console.log('First city keys:', Object.keys(cities[0]));
        }
        
        this.fullRows = cities;
        this.rows = cities.map((c, index) => {
          const row = {
            id: c.id || c.cityId || c.locationId,
            countryName: c.countryName || 'N/A',
            regionName: c.regionName || 'N/A',
            stateName: c.stateName || 'N/A',
            districtName: c.districtName || 'N/A',
            cityName: c.cityName || c.locationName || c.location || c.name || 'N/A'
          };
          
          if (index === 0) {
            console.log('First row mapped:', row);
          }
          
          return row;
        });
        
        console.log('Total rows created:', this.rows.length);
        console.log('Rows array:', this.rows);
        console.log('========================================');
        this.loading = false;
      },
      error: (err: any) => {
        console.error('========== ERROR LOADING CITIES ==========');
        console.error('Failed to load cities:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error response:', err.error);
        console.error('========================================');
        alert('Failed to load cities');
        this.loading = false;
      }
    });
  }

  /* ================= SEARCH FUNCTIONALITY ================= */
  onSearch(searchData: any): void {
    console.log('========== 🔍 CITY SEARCH TRIGGERED ==========');
    console.log('Search data received:', searchData);
    
    // Handle both object-based and string-based search input
    const searchTerm = typeof searchData === 'string' 
      ? searchData 
      : searchData?.locationName?.trim() || '';
  
    if (!searchTerm) {
      console.log('Empty search, loading all cities');
      this.loadCities();
      return;
    }

    console.log('Searching with term:', searchTerm);
    this.loading = true;
    
    // Load all cities and filter client-side
    this.cityService.getCities().subscribe({
      next: (allCities: any[]) => {
        console.log('All cities loaded:', allCities.length);
        
        const lowerSearch = searchTerm.toLowerCase();
        
        // Filter cities where country, region, state, district, or city name matches
        const filteredCities = allCities.filter(c => {
          const countryMatch = (c.countryName || '').toLowerCase().includes(lowerSearch);
          const regionMatch = (c.regionName || '').toLowerCase().includes(lowerSearch);
          const stateMatch = (c.stateName || '').toLowerCase().includes(lowerSearch);
          const districtMatch = (c.districtName || '').toLowerCase().includes(lowerSearch);
          const cityMatch = (c.cityName || c.locationName || '').toLowerCase().includes(lowerSearch);
          
          return countryMatch || regionMatch || stateMatch || districtMatch || cityMatch;
        });
        
        console.log('Filtered cities:', filteredCities.length);
        
        this.fullRows = filteredCities;
        this.rows = filteredCities.map((c, index) => ({
          id: c.id || c.cityId || c.locationId,
          countryName: c.countryName || 'N/A',
          regionName: c.regionName || 'N/A',
          stateName: c.stateName || 'N/A',
          districtName: c.districtName || 'N/A',
          cityName: c.cityName || c.locationName || c.location || c.name || 'N/A'
        }));
        
        console.log('Final rows:', this.rows.length);
        console.log('========================================');
        this.loading = false;
        
        if (this.rows.length === 0) {
          alert('No cities found matching: ' + searchTerm);
        }
      },
      error: (err: any) => {
        console.error('========== ❌ SEARCH FAILED ==========');
        console.error('Error:', err);
        console.error('========================================');
        alert('Search failed');
        this.loading = false;
      }
    });
  }

  /* ================= ACTION HANDLERS ================= */
  onAdd(): void {
    this.router.navigate(['/addcity']);
  }

  onEdit(city: any): void {
    console.log('========== EDIT CITY CLICKED ==========');
    console.log('City object:', city);
    console.log('City ID:', city.id);
    console.log('Navigating to:', `/editcity/${city.id}`);
    
    if (!city.id) {
      console.error('❌ No ID found in city object!');
      alert('Cannot edit: City ID not found');
      return;
    }
    
    this.router.navigate(['/editcity', city.id]);
    console.log('========================================');
  }

  async onDelete(city: any): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${city.cityName}?`,
      confirmText: 'Delete'
    });
    
    if (confirmed) {
      console.log('Delete city:', city);
      // TODO: Implement delete functionality
      alert('Delete functionality not implemented yet');
    }
  }

  onImport(): void {
    console.log('========== DOWNLOADING CITIES EXCEL ==========');
    console.log('Total rows to export:', this.fullRows.length);
    
    if (!this.fullRows || this.fullRows.length === 0) {
      console.error('❌ No data to export');
      alert('No data available to export');
      return;
    }
    
    console.log('First row sample:', this.fullRows[0]);
    
    // Transform LocationDto to Location format expected by backend
    const locationsForExport = this.fullRows.map(city => ({
      locationId: city.id || city.cityId || city.locationId,
      locationName: city.cityName || city.location,
      territoryLevelId: 7,
      parentId: city.districtId
    }));
    
    console.log('Transformed data sample:', locationsForExport[0]);
    console.log('Calling downloadCityExcel API...');
    
    this.cityService.downloadCityExcel(locationsForExport).subscribe({
      next: (blob: Blob) => {
        console.log('✅ Excel file received');
        console.log('Blob size:', blob.size, 'bytes');
        console.log('Blob type:', blob.type);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Cities.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Download triggered successfully');
        console.log('========================================');
      },
      error: (err: any) => {
        console.error('========== ❌ EXPORT FAILED ==========');
        console.error('Error:', err);
        console.error('Status:', err.status);
        console.error('Status Text:', err.statusText);
        console.error('Message:', err.message);
        console.error('Error body:', err.error);
        console.error('========================================');
        
        // More detailed error message
        let errorMsg = 'Export failed: ';
        if (err.status === 403) {
          errorMsg += 'Access forbidden. The backend endpoint may not exist or you lack permission.';
        } else if (err.status === 404) {
          errorMsg += 'Endpoint not found. Backend may not have /admin/city-excel implemented.';
        } else if (err.status === 500) {
          errorMsg += 'Server error. Check backend logs for details.';
        } else {
          errorMsg += `${err.status} ${err.statusText || 'Error'}`;
        }
        
        alert(errorMsg);
      }
    });
  }
}
