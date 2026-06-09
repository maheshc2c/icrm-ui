import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTable } from '../../../shared/data-table/data-table';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Stateservice } from '../../../service/stateservice';
import { Geoservice } from '../../../service/geoservice';
import { Countryservice } from '../../../service/countryservice';
import { Regionservice } from '../../../service/regionservice';
import { State } from '../../../models/state';
import { Breadcrumb } from '../../../models/breadcrumb';

interface SearchFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: any }[];
}

@Component({
  selector: 'app-state',
  standalone: true,
  imports: [CommonModule, DataTable, Pageheader, Header, Sidebar, FormsModule],
  templateUrl: './state.html',
  styleUrl: './state.css'
})
export class StateComponent implements OnInit {

  /* ================= HEADER ================= */
  headerTitle = 'State';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Territory', route: '/state' },
    { label: 'State' }
  ];

  role = localStorage.getItem('role');

  columns = [
    { header: 'Country', field: 'countryName' },
    { header: 'Region', field: 'regionName' },
    { header: 'State', field: 'stateName' }
  ];

  rows: any[] = [];
  fullRows: any[] = [];

  ngOnInit(): void {
    this.loadStates();
  }

  constructor(
    private router: Router,
    private stateService: Stateservice,
    private geoService: Geoservice,
    private countryService: Countryservice,
    private regionService: Regionservice
  ) { }

  /* ================= LOAD STATES ================= */
  loadStates(): void {
    console.log('Loading states...');
    this.stateService.getStates().subscribe({
      next: (states: any[]) => {
        console.log('State API Response:', states);
        console.log('First state:', states[0]);
        if (states.length === 0) {
          console.log('No states found in API response');
          this.rows = [];
          this.fullRows = [];
          return;
        }

        this.fullRows = states;

        this.rows = states.map((state, index) => {
          return {
            sno: index + 1,
            // Use stateId from DTO
            id: state.stateId,
            countryName: state.countryName || 'N/A',
            regionName: state.regionName || 'N/A',
            stateName: state.stateName || 'N/A',
            stateId: state.stateId,
            regionId: state.regionId,
            countryId: state.countryId
          };
        });

        console.log('Final data:', this.rows);
        console.log('First row:', this.rows[0]);
      },
      error: (err: any) => {
        console.error('Failed to load state list:', err);
        if (err.status === 401) {
          alert('Session expired, please login again.');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  onAdd() {
    this.router.navigate(['/addstate']);
  }

  onEdit(row: any) {
    console.log('Edit received in State:', row);
    const id = row.id || row.stateId;
    
    if (!id) {
      console.error('No ID found in row:', row);
      alert('Cannot edit: State ID is missing. Please ask the backend team to populate stateId in the LocationDto.');
      return;
    }
    
    console.log('Navigating to edit with ID:', id);
    this.router.navigate(['/editstate', id]);
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
      placeholder: 'Enter country, region or state name',
      type: 'text'
    }
  ];

  onSearch(searchData: any) {
    console.log('Search data received:', searchData);

    // Handle both object-based and string-based search input
    const searchTerm = typeof searchData === 'string' 
      ? searchData 
      : searchData?.locationName?.trim() || '';

    if (!searchTerm) {
      console.log('Empty search, reloading full list');
      this.loadStates();
      return;
    }

    console.log('Searching with term:', searchTerm);

    // Load all states and filter client-side
    // This allows searching by country, region, or state name
    this.stateService.getStates().subscribe({
      next: (allStates: any[]) => {
        console.log('All states loaded:', allStates.length);
        
        const lowerSearch = searchTerm.toLowerCase();
        
        // Filter states where country, region, or state name matches
        const filteredStates = allStates.filter(s => {
          const countryMatch = (s.countryName || '').toLowerCase().includes(lowerSearch);
          const regionMatch = (s.regionName || '').toLowerCase().includes(lowerSearch);
          const stateMatch = (s.stateName || '').toLowerCase().includes(lowerSearch);
          
          return countryMatch || regionMatch || stateMatch;
        });
        
        console.log('Filtered states:', filteredStates.length);
        
        this.fullRows = filteredStates;
        this.rows = filteredStates.map((s, index) => ({
          sno: index + 1,
          id: s.locationId || s.stateId || s.id,
          countryName: s.countryName || 'N/A',
          regionName: s.regionName || 'N/A',
          stateName: s.stateName || s.location || 'N/A'
        }));
        
        console.log('Final rows:', this.rows.length);
      },
      error: (err: any) => {
        console.error('Search failed:', err);
        alert('Search failed');
      }
    });
  }

  /* ================= DOWNLOAD FUNCTIONALITY ================= */
  onImport() {
    console.log('========== DOWNLOADING STATES EXCEL ==========');
    console.log('Total rows to export:', this.fullRows.length);
    
    if (!this.fullRows || this.fullRows.length === 0) {
      alert('No data available to export');
      return;
    }

    // The backend expects Location objects, not LocationDto
    // We need to search to get the full Location objects
    console.log('Fetching full Location objects for download...');
    
    // Use search with empty string to get all states as Location objects
    this.stateService.searchState('').subscribe({
      next: (allLocations: any[]) => {
        console.log('All locations from search:', allLocations);
        
        // Filter to get only states (level 5)
        const states = allLocations.filter(loc => loc.territoryLevelId === 5);
        console.log('Filtered states for download:', states.length);
        
        if (states.length === 0) {
          alert('No state data found for export');
          return;
        }

        console.log('Calling downloadStateExcel API...');
        this.stateService.downloadStateExcel(states as any).subscribe({
          next: (response: any) => {
            console.log('✅ Response received:', response);
            
            const blob = response.body;
            console.log('Blob size:', blob?.size);
            console.log('Blob type:', blob?.type);
            
            if (blob) {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'States.xlsx';
              link.click();
              URL.revokeObjectURL(link.href);
              console.log('✅ Download triggered successfully');
            }
          },
          error: (err: any) => {
            console.error('========== ❌ DOWNLOAD FAILED ==========');
            console.error('Full error:', err);
            console.error('Status:', err.status);
            
            // Check if error body is actually a blob (sometimes 404 returns HTML as blob)
            if (err.error instanceof Blob) {
              console.log('⚠️ Error body is a Blob');
              
              // Check if it's actually an Excel file
              if (err.error.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  err.error.type === 'application/octet-stream' ||
                  err.error.size > 1000) {
                console.log('✅ Blob appears to be a valid Excel file, downloading...');
                const link = document.createElement('a');
                link.href = URL.createObjectURL(err.error);
                link.download = 'States.xlsx';
                link.click();
                URL.revokeObjectURL(link.href);
                console.log('✅ Downloaded from error body');
              } else {
                err.error.text().then((text: string) => {
                  console.error('Blob content:', text.substring(0, 500));
                  alert(`Download failed: ${text.substring(0, 100)}`);
                });
              }
            } else {
              alert(`Failed to download Excel file: ${err.status} - ${err.message || 'Unknown error'}`);
            }
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to fetch state data for download:', err);
        alert('Failed to fetch state data for download');
      }
    });
  }
}
