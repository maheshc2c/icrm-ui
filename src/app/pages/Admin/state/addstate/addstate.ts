import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from "../../../../shared/form/form";
import { Header } from "../../../../layout/header/header";
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Stateservice } from '../../../../service/stateservice';
import { Geoservice } from '../../../../service/geoservice';
import { Countryservice } from '../../../../service/countryservice';
import { Regionservice } from '../../../../service/regionservice';
import { State } from '../../../../models/state';

@Component({
  selector: 'app-addstate',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addstate.html',
  styleUrl: './addstate.css'
})
export class Addstate implements OnInit {

  /* ================= HEADER ================= */
  headerTitle = 'Add New State';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= FORM STATE ================= */
  isEditMode = false;
  stateId!: number;
  model: any = {};
  private countriesCache: any[] = [];
  private regionsCache: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stateService: Stateservice,
    private geoService: Geoservice,
    private countryService: Countryservice,
    private regionService: Regionservice
  ) { }

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    console.log('AddState component initialized');
    console.log('Route params:', this.route.snapshot.paramMap);

    // Load countries (needed for save logic) and regions
    this.loadCountryOptions();
    this.loadRegionOptions();

    const id = this.route.snapshot.paramMap.get('id');
    console.log('Extracted ID:', id);

    if (id) {
      console.log('Setting up edit mode for ID:', id);
      this.setupEditMode(+id);
    } else {
      console.log('Setting up create mode');
      this.setupCreateMode();
    }
  }

  /* ================= LOAD GEO OPTIONS ================= */
  loadGeoOptions(): void {
    this.geoService.getGeos().subscribe({
      next: (geos: any[]) => {
        console.log('Geo options loaded:', geos);

        const geoField = this.stateFields.find(field => field.name === 'geoName');
        if (geoField) {
          geoField.options = geos.map(geo => ({
            label: geo.locationName || geo.name,
            value: geo.locationName || geo.name
          }));
        }

        console.log('Updated state fields with geo options:', this.stateFields);
      },
      error: (err: any) => {
        console.error('Failed to load geo options:', err);
      }
    });
  }

  /* ================= LOAD COUNTRY OPTIONS ================= */
  // Database structure: Country = Level 3, Region = Level 4
  loadCountryOptions(): void {
    this.countryService.getCountries().subscribe({
      next: (data: any[]) => {
        console.log('========== LOADING COUNTRIES ==========');
        console.log('Raw data from /admin/view-country:', data);
        console.log('Total items:', data.length);
        console.log('First item structure:', data[0]);
        
        // The /admin/view-country endpoint should return level 3 (countries)
        const countries = data.filter(item => item.territoryLevelId === 3);
        console.log('Filtered countries (level 3):', countries);
        
        if (countries.length === 0) {
          console.error('❌ NO COUNTRIES FOUND AT LEVEL 3!');
          console.log('Available levels:', [...new Set(data.map(i => i.territoryLevelId))]);
        }
        
        // IMPORTANT: Store the full country objects in cache
        this.countriesCache = countries;
        console.log('Countries cache populated:', this.countriesCache);

        const countryField = this.stateFields.find(field => field.name === 'countryId');
        if (countryField) {
          countryField.options = countries.map(country => ({
            // Database field is 'location', not 'locationName'
            label: country.location || country.locationName || country.name,
            value: country.locationId ?? country.id
          }));
        }

        console.log('Final country options:', countryField?.options);
      },
      error: (err: any) => {
        console.error('❌ Failed to load countries:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
      }
    });
  }

  /* ================= LOAD REGION OPTIONS ================= */
  // Database structure: Country = Level 3, Region = Level 4
  loadRegionOptions(): void {
    this.regionService.getRegions().subscribe({
      next: (data: any[]) => {
        console.log('========== LOADING REGIONS ==========');
        console.log('Raw data from /admin/search-region-country:', data);
        console.log('Total items:', data.length);
        console.log('First item structure:', data[0]);
        
        // The endpoint returns BOTH countries and regions, so filter for level 4 (regions)
        const regions = data.filter(item => item.territoryLevelId === 4);
        console.log('Filtered regions (level 4):', regions);
        
        if (regions.length === 0) {
          console.error('❌ NO REGIONS FOUND AT LEVEL 4!');
          console.log('Available levels in response:', [...new Set(data.map(i => i.territoryLevelId))]);
        }
        
        // IMPORTANT: Store the full region objects in cache
        this.regionsCache = regions;
        console.log('Regions cache populated:', this.regionsCache);

        const regionField = this.stateFields.find(field => field.name === 'regionId');
        if (regionField) {
          regionField.options = regions.map(region => ({
            label: region.location || region.locationName || region.name,
            value: region.locationId ?? region.id
          }));
        }

        console.log('Final region options:', regionField?.options);
      },
      error: (err: any) => {
        console.error('❌ Failed to load regions:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
      }
    });
  }

  /* ================= MODE SETUP ================= */
  private setupEditMode(id: number): void {
    this.isEditMode = true;
    this.stateId = id;

    this.headerTitle = 'Edit State';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/admin/state' },
      { label: 'State', route: '/admin/state' },
      { label: 'Edit State' }
    ];

    this.loadStateById(id);
  }

  private setupCreateMode(): void {
    this.isEditMode = false;

    this.headerTitle = 'Add New State';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/admin/state' },
      { label: 'State', route: '/admin/state' },
      { label: 'Add State' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  stateFields: any[] = [
    {
      name: 'regionId',
      label: 'Region',
      placeholder: 'Select Region',
      type: 'select',
      required: true,
      options: [] as any[]
    },
    {
      name: 'stateName',
      label: 'State Name',
      placeholder: 'State Name',
      type: 'text',
      required: true
    }
  ];

  /* ================= SAVE ================= */
  saveState(data: any): void {
    console.log('========== SAVING STATE ==========');
    console.log('Form data received:', JSON.stringify(data, null, 2));
    console.log('Is Edit Mode:', this.isEditMode);
    console.log('State ID:', this.stateId);
    console.log('Current model:', JSON.stringify(this.model, null, 2));
    
    // Validate that we have the required data
    if (!data.regionId || !data.stateName) {
      console.error('❌ Missing required fields!');
      console.error('regionId:', data.regionId);
      console.error('stateName:', data.stateName);
      alert('Please fill in all required fields');
      return;
    }
    
    // Find selected region from cache
    console.log('🔍 Searching for region with ID:', data.regionId, 'Type:', typeof data.regionId);
    console.log('📦 Regions cache:', JSON.stringify(this.regionsCache, null, 2));
    
    const selectedRegion = this.regionsCache.find(r => 
      r.locationId === data.regionId || 
      r.id === data.regionId ||
      String(r.locationId) === String(data.regionId) ||
      String(r.id) === String(data.regionId)
    );
    
    console.log('✅ Selected Region from cache:', selectedRegion);
    
    if (!selectedRegion) {
      console.error('❌ Region not found in cache for ID:', data.regionId);
      console.error('Available region IDs:', this.regionsCache.map(r => ({ 
        id: r.id, 
        locationId: r.locationId,
        location: r.location 
      })));
      alert('Invalid region selection. Please refresh the page and try again.');
      return;
    }
    
    // Get country from region's parent
    const countryId = selectedRegion.parentId;
    console.log('🔍 Country ID from region parent:', countryId);
    
    // Find country from cache
    const selectedCountry = this.countriesCache.find(c => 
      c.locationId === countryId || 
      c.id === countryId ||
      String(c.locationId) === String(countryId) ||
      String(c.id) === String(countryId)
    );
    
    console.log('✅ Selected Country from cache:', selectedCountry);
    
    if (!selectedCountry) {
      console.error('❌ Country not found in cache for ID:', countryId);
      alert('Invalid country for selected region. Please contact administrator.');
      return;
    }
    
    const payload = {
      countryId: countryId,
      regionId: data.regionId,
      countryName: selectedCountry.location || selectedCountry.locationName || selectedCountry.name,
      regionName: selectedRegion.location || selectedRegion.locationName || selectedRegion.name,
      stateName: data.stateName,
      serialNo: 1
    };
    
    console.log('📤 Final payload being sent to backend:', JSON.stringify(payload, null, 2));
    console.log('========================================');

    if (this.isEditMode) {
      console.log('🔄 Calling updateState API for ID:', this.stateId);
      console.log('🌐 API URL:', `http://localhost:8080/admin/state-update/${this.stateId}`);
      
      this.stateService.updateState(this.stateId, payload).subscribe({
        next: (response: any) => {
          console.log('✅ Update State Success:', JSON.stringify(response, null, 2));
          // alert('State updated successfully!');
          this.router.navigate(['/admin/state']);
        },
        error: (error: any) => {
          console.error('❌ Failed to update state:', error);
          console.error('Error Status:', error.status);
          console.error('Error Message:', error.message);
          console.error('Full Error Object:', JSON.stringify(error, null, 2));
          alert(`Failed to update state (${error.status || 'unknown'}): ${error.message || 'Error'}`);
        }
      });
    } else {
      console.log('➕ Calling createState API...');
      console.log('🌐 API URL:', 'http://localhost:8080/admin/state-create');
      
      this.stateService.createState(payload).subscribe({
        next: (response: any) => {
          console.log('✅ Create State Success:', JSON.stringify(response, null, 2));
        
          this.router.navigate(['/admin/state']);
        },
        error: (error: any) => {
          console.error('❌ Failed to create state:', error);
          console.error('Error Status:', error.status);
          console.error('Error Message:', error.message);
          console.error('Full Error:', JSON.stringify(error, null, 2));
          // alert(`Failed to create state (${error.status || 'unknown'}): ${error.message || 'Error'}`);
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/admin/state']);
  }

  /* ================= COUNTRY CHANGE HANDLER ================= */
  onCountryChange(countryId: any): void {
    console.log('========== COUNTRY CHANGED ==========');
    console.log('Selected Country ID:', countryId);
    
    // Find the selected country
    const selectedCountry = this.countriesCache.find(c => 
      c.locationId === countryId || 
      c.id === countryId ||
      String(c.locationId) === String(countryId) ||
      String(c.id) === String(countryId)
    );
    
    console.log('Selected Country:', selectedCountry);
    
    if (!selectedCountry) {
      console.error('Country not found in cache');
      return;
    }
    
    // Filter regions that belong to this country (parentId matches country's locationId)
    const filteredRegions = this.regionsCache.filter(region => {
      const match = region.parentId === selectedCountry.locationId || 
                    region.parentId === selectedCountry.id;
      console.log(`Region: ${region.location}, parentId: ${region.parentId}, countryId: ${selectedCountry.locationId}, match: ${match}`);
      return match;
    });
    
    console.log('Filtered Regions for this country:', filteredRegions);
    
    // Update region dropdown options
    const regionField = this.stateFields.find(field => field.name === 'regionId');
    if (regionField) {
      regionField.options = filteredRegions.map(region => ({
        label: region.location || region.locationName || region.name,
        value: region.locationId ?? region.id
      }));
      
      console.log('Updated region options:', regionField.options);
    }
    
    // Clear the selected region since country changed
    this.model.regionId = null;
    console.log('Region selection cleared');
    console.log('========================================');
  }

  /* ================= LOAD STATE ================= */
  private loadStateById(id: number): void {
    console.log('========== LOADING STATE FOR EDIT ==========');
    console.log('State ID:', id);
    
    this.stateService.getStateById(id).subscribe({
      next: (states: any[]) => {
        console.log('API Response - All States:', states);
        console.log('Total states:', states.length);
        
        // Find the state by matching various ID fields
        const state = states.find(s => {
          const matchId = s.id === id || s.stateId === id || s.locationId === id;
          console.log(`Checking state: id=${s.id}, stateId=${s.stateId}, locationId=${s.locationId}, match=${matchId}`);
          return matchId;
        });
        
        console.log('Found State:', state);

        if (!state) {
          console.error('State not found with ID:', id);
          console.error('Available state IDs:', states.map(s => ({ id: s.id, stateId: s.stateId, locationId: s.locationId })));
          alert('State not found');
          this.router.navigate(['/admin/state']);
          return;
        }

        // Map the state data to form fields (only regionId and stateName)
        this.model = {
          regionId: state.regionId,
          stateName: state.stateName || state.location
        };
        
        console.log('Model set for edit:', this.model);
        console.log('========================================');
      },
      error: (err: any) => {
        console.error('========== ERROR LOADING STATE ==========');
        console.error('Error:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        alert('Failed to load state');
      }
    });
  }
}
