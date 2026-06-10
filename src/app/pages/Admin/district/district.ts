import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataTable } from '../../../shared/data-table/data-table';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Districtservice } from '../../../service/Districtservice';
import { Geoservice } from '../../../service/geoservice';
import { Countryservice } from '../../../service/countryservice';
import { Regionservice } from '../../../service/regionservice';
import { Stateservice } from '../../../service/stateservice';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';

@Component({
  selector: 'app-district',
  standalone: true,
  imports: [CommonModule, DataTable, Pageheader, Header, Sidebar],
  templateUrl: './district.html',
  styleUrls: ['./district.css']
})
export class DistrictComponent implements OnInit {
  /* ================= DATA ================= */
  districts: any[] = [];
  fullRows: any[] = [];
  rows: any[] = [];
  loading: boolean = true;

  /* ================= HEADER ================= */
  headerTitle: string = 'District Management';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Territory', route: '/district' },
    { label: 'District', route: '/district' }
  ];

  /* ================= TABLE CONFIG ================= */
  columns: any[] = [
    { header: 'Country', field: 'countryName' },
    { header: 'Region', field: 'regionName' },
    { header: 'State', field: 'stateName' },
    { header: 'District', field: 'districtName' }
  ];

  /* ================= SEARCH CONFIG ================= */
  searchFields: SearchFieldConfig[] = [
    {
      key: 'locationName',
      label: 'Search',
      placeholder: 'Enter country, region, state or district name',
      type: 'text'
    }
  ];

  /* ================= BREADCRUMB ================= */
  breadcrumb: any[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Territory', route: '/district' },
    { label: 'District' }
  ];

  constructor(
    private districtService: Districtservice,
    private geoService: Geoservice,
    private countryService: Countryservice,
    private regionService: Regionservice,
    private stateService: Stateservice,
    private router: Router,
    private confirmService: ConfirmDialogService
  ) { }

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    console.log('District component initialized');
    this.loadDistricts();
  }

  /* ================= LOAD DATA ================= */
  loadDistricts(): void {
    this.loading = true;
    console.log('Loading districts...');

    // Load all data and join
    this.districtService.getDistricts().subscribe({
      next: (districts: any[]) => {
        console.log('========== DISTRICT LIST LOADED ==========');
        console.log('District API Response:', districts);
        console.log('Total districts:', districts.length);
        
        if (districts.length > 0) {
          console.log('First district structure:', districts[0]);
        }
        
        this.fullRows = districts;
        this.rows = districts.map((d, index) => {
          const row = {
            id: d.id || d.districtId || d.locationId,
            countryName: d.countryName || 'N/A',
            regionName: d.regionName || 'N/A',
            stateName: d.stateName || 'N/A',
            districtName: d.locationName || d.name || d.districtName || 'N/A'
          };
          
          if (index === 0) {
            console.log('First row mapped:', row);
          }
          
          return row;
        });
        
        console.log('Total rows created:', this.rows.length);
        console.log('========================================');
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load districts:', err);
        this.loading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /* ================= SEARCH FUNCTIONALITY ================= */
  onSearch(searchData: any): void {
    console.log('Search data:', searchData);

    // Handle both object-based and string-based search input
    const searchTerm = typeof searchData === 'string' 
      ? searchData 
      : searchData?.locationName?.trim() || '';

    if (!searchTerm) {
      console.log('Empty search, reloading full list');
      this.loadDistricts();
      return;
    }

    console.log('Searching with term:', searchTerm);

    // Load all districts and filter client-side
    this.districtService.getDistricts().subscribe({
      next: (allDistricts: any[]) => {
        console.log('All districts loaded:', allDistricts.length);
        
        const lowerSearch = searchTerm.toLowerCase();
        
        // Filter districts where country, region, state, or district name matches
        const filteredDistricts = allDistricts.filter(d => {
          const countryMatch = (d.countryName || '').toLowerCase().includes(lowerSearch);
          const regionMatch = (d.regionName || '').toLowerCase().includes(lowerSearch);
          const stateMatch = (d.stateName || '').toLowerCase().includes(lowerSearch);
          const districtMatch = (d.locationName || d.districtName || '').toLowerCase().includes(lowerSearch);
          
          return countryMatch || regionMatch || stateMatch || districtMatch;
        });
        
        console.log('Filtered districts:', filteredDistricts.length);
        
        this.fullRows = filteredDistricts;
        this.rows = filteredDistricts.map((d, index) => ({
          id: d.id || d.districtId || d.locationId,
          countryName: d.countryName || 'N/A',
          regionName: d.regionName || 'N/A',
          stateName: d.stateName || 'N/A',
          districtName: d.locationName || d.name || d.districtName || 'N/A'
        }));
        
        console.log('Final rows:', this.rows.length);
      },
      error: (err: any) => {
        console.error('Search failed:', err);
        alert('Search failed');
      }
    });
  }

  /* ================= ACTION HANDLERS ================= */
  onAdd(): void {
    this.router.navigate(['/adddistrict']);
  }

  onEdit(district: any): void {
    console.log('========== EDIT DISTRICT CLICKED ==========');
    console.log('District object:', district);
    console.log('District ID:', district.id);
    console.log('Navigating to:', `/editdistrict/${district.id}`);
    
    if (!district.id) {
      console.error('❌ No ID found in district object!');
      alert('Cannot edit: District ID not found');
      return;
    }
    
    this.router.navigate(['/editdistrict', district.id]);
    console.log('========================================');
  }

  async onDelete(district: any): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${district.districtName}?`,
      confirmText: 'Delete'
    });
    
    if (confirmed) {
      console.log('Delete district:', district);
      // TODO: Implement delete functionality
      alert('Delete functionality not implemented yet');
    }
  }

  onImport(): void {
    console.log('========== DOWNLOADING DISTRICTS EXCEL ==========');
    console.log('Total rows to export:', this.fullRows.length);
    
    if (!this.fullRows || this.fullRows.length === 0) {
      console.error('❌ No data to export');
      alert('No data available to export');
      return;
    }
    
    // The backend expects Location objects, not LocationDto
    // We need to search to get the full Location objects
    console.log('Fetching full Location objects for download...');
    
    // Use search with a space character to get all locations (empty string might not work)
    this.districtService.searchDistrict(' ').subscribe({
      next: (allLocations: any[]) => {
        console.log('========== SEARCH RESPONSE ==========');
        console.log('All locations from search:', allLocations);
        console.log('Total locations:', allLocations.length);
        
        if (allLocations.length > 0) {
          console.log('First location sample:', allLocations[0]);
        }
        
        // Filter to get only districts (level 6)
        const districts = allLocations.filter(loc => {
          const isDistrict = loc.territoryLevelId === 6;
          if (isDistrict) {
            console.log('District found:', loc);
          }
          return isDistrict;
        });
        
        console.log('Filtered districts for download:', districts.length);
        console.log('========================================');
        
        if (districts.length === 0) {
          console.error('❌ No districts with territoryLevelId=6 found');
          alert('No district data found for export. The search returned no districts.');
          return;
        }

        console.log('Calling downloadDistrictExcel API with', districts.length, 'districts...');
        this.districtService.downloadDistrictExcel(districts).subscribe({
          next: (blob: Blob) => {
            console.log('✅ Excel file received, size:', blob.size);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Districts.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log('✅ Download triggered successfully');
          },
          error: (err: any) => {
            console.error('========== ❌ EXPORT FAILED ==========');
            console.error('Error:', err);
            console.error('Status:', err.status);
            console.error('Message:', err.message);
            console.error('Full error:', err);
            alert(`Export failed: ${err.status} - ${err.message || 'Unknown error'}`);
          }
        });
      },
      error: (err: any) => {
        console.error('========== ❌ SEARCH FAILED ==========');
        console.error('Failed to fetch district data for download:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        alert(`Failed to fetch district data: ${err.status} - ${err.message || 'Unknown error'}`);
      }
    });
  }
}
