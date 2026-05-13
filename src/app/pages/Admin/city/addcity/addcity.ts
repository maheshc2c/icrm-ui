import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Cityservice } from '../../../../service/cityservice';
import { Geoservice } from '../../../../service/geoservice';
import { Countryservice } from '../../../../service/countryservice';
import { Regionservice } from '../../../../service/regionservice';
import { Stateservice } from '../../../../service/stateservice';
import { Districtservice } from '../../../../service/Districtservice';
import { Breadcrumb } from '../../../../models/breadcrumb';

@Component({
  selector: 'app-addcity',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addcity.html',
  styleUrls: ['./addcity.css']
})
export class Addcity implements OnInit {
  /* ================= DATA ================= */
  cityFields: any[] = [];
  model: any = {};
  isEditMode: boolean = false;
  cityId: number | null = null;
  countriesCache: any[] = [];
  regionsCache: any[] = [];
  statesCache: any[] = [];
  districtsCache: any[] = [];

  /* ================= HEADER ================= */
  headerTitle: string = 'Add City';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Territory', route: '/admin/city' },
    { label: 'City', route: '/admin/city' },
    { label: 'Add City' }
  ];

  constructor(
    private cityService: Cityservice,
    private geoService: Geoservice,
    private countryService: Countryservice,
    private regionService: Regionservice,
    private stateService: Stateservice,
    private districtService: Districtservice,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('Add City component initialized');
    this.initializeFields();
    this.loadDropdownOptions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log('Edit mode detected for ID:', id);
      this.isEditMode = true;
      this.cityId = +id;
      this.headerTitle = 'Edit City';
      this.headerBreadcrumbs[3].label = 'Edit City';
      this.setupEditMode(this.cityId);
    } else {
      console.log('Setting up create mode');
      this.setupCreateMode();
    }
  }

  /* ================= FIELD INITIALIZATION ================= */
  initializeFields(): void {
    this.cityFields = [
      {
        name: 'districtId',
        label: 'District',
        type: 'select',
        required: true,
        options: []
      },
      {
        name: 'cityName',
        label: 'City Name',
        type: 'text',
        required: true,
        placeholder: 'Enter city name'
      }
    ];
  }

  /* ================= LOAD OPTIONS ================= */
  loadDropdownOptions(): void {
    console.log('========== LOADING CITY DROPDOWNS ==========');
    
    // Load countries, regions, and states in cache (needed for save logic)
    this.countryService.getCountries().subscribe({
      next: (countries: any[]) => {
        this.countriesCache = countries.filter(c => c.territoryLevelId === 3);
        console.log('Countries cache loaded:', this.countriesCache.length);
      },
      error: (err) => console.error('Failed to load countries:', err)
    });
    
    this.regionService.getRegions().subscribe({
      next: (regions: any[]) => {
        this.regionsCache = regions.filter(r => r.territoryLevelId === 4);
        console.log('Regions cache loaded:', this.regionsCache.length);
      },
      error: (err) => console.error('Failed to load regions:', err)
    });
    
    this.stateService.getStates().subscribe({
      next: (states: any[]) => {
        const hasLevelId = states.length > 0 && states[0].territoryLevelId !== undefined;
        let filteredStates = hasLevelId 
          ? states.filter(s => s.territoryLevelId === 5)
          : states;
        
        if (filteredStates.length === 0 && hasLevelId) {
          filteredStates = states;
        }
        
        this.statesCache = filteredStates;
        console.log('States cache loaded:', this.statesCache.length);
      },
      error: (err) => console.error('Failed to load states:', err)
    });
    
    // Load districts for dropdown
    this.districtService.getDistricts().subscribe({
      next: (districts: any[]) => {
        console.log('========== LOADING DISTRICTS FOR CITY ==========');
        console.log('Raw districts data:', districts);
        console.log('Total districts received:', districts.length);
        
        if (districts.length > 0) {
          console.log('First district structure:', districts[0]);
        }
        
        const hasLevelId = districts.length > 0 && districts[0].territoryLevelId !== undefined;
        console.log('Districts have territoryLevelId?', hasLevelId);
        
        let filteredDistricts = hasLevelId 
          ? districts.filter(d => d.territoryLevelId === 6)
          : districts;
        
        console.log('Filtered districts (level 6):', filteredDistricts.length);
        
        if (filteredDistricts.length === 0 && hasLevelId) {
          console.error('❌ NO DISTRICTS AT LEVEL 6!');
          filteredDistricts = districts;
          console.log('Using all districts as fallback');
        }
        
        this.districtsCache = filteredDistricts;
        console.log('Districts cache set:', this.districtsCache.length, 'items');
        
        const field = this.cityFields.find(f => f.name === 'districtId');
        if (field) {
          field.options = filteredDistricts.map(d => ({
            label: d.location || d.districtName || d.locationName || d.name || 'Unknown',
            value: d.locationId ?? d.districtId ?? d.id
          }));
          console.log('✅ District field options set:', field.options.length, 'options');
        }
        console.log('========================================');
      },
      error: (err) => {
        console.error('Failed to load districts:', err);
      }
    });
  }

  /* ================= FORM SETUP ================= */
  setupEditMode(id: number): void {
    this.isEditMode = true;
    this.cityId = id;
    
    this.headerTitle = 'Edit City';
    this.headerBreadcrumbs[3].label = 'Edit City';
    
    console.log('Edit mode setup for ID:', id);
    this.loadCityById(id);
  }

  setupCreateMode(): void {
    this.isEditMode = false;
    this.cityId = null;
    
    this.headerTitle = 'Add City';
    this.headerBreadcrumbs[3].label = 'Add City';
    
    console.log('Create mode setup');
  }

  /* ================= LOAD CITY FOR EDIT ================= */
  private loadCityById(id: number): void {
    console.log('========== LOADING CITY FOR EDIT ==========');
    console.log('City ID:', id);
    
    this.cityService.getCities().subscribe({
      next: (cities: any[]) => {
        console.log('All cities:', cities);
        
        const city = cities.find(c => {
          const matchId = c.id === id || c.cityId === id || c.locationId === id ||
                         String(c.id) === String(id) || String(c.cityId) === String(id) || String(c.locationId) === String(id);
          return matchId;
        });
        
        console.log('Found City:', city);

        if (!city) {
          console.error('City not found with ID:', id);
          alert('City not found');
          this.router.navigate(['/admin/city']);
          return;
        }

        // Set the model with only districtId and cityName
        this.model = {
          districtId: city.districtId,
          cityName: city.cityName || city.locationName || city.location || city.name
        };
        
        console.log('Model set for edit:', this.model);
        console.log('========================================');
      },
      error: (err: any) => {
        console.error('========== ERROR LOADING CITY ==========');
        console.error('Error:', err);
        alert('Failed to load city');
        console.error('========================================');
      }
    });
  }

  /* ================= SAVE ================= */
  saveCity(data: any): void {
    console.log('========== SAVING CITY ==========');
    console.log('Form data received:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.districtId || !data.cityName) {
      console.error('❌ Missing required fields!');
      alert('Please fill in all required fields');
      return;
    }
    
    // Find the selected district
    const selectedDistrict = this.districtsCache.find(d => 
      (d.id ?? d.locationId ?? d.districtId) === data.districtId ||
      String(d.id ?? d.locationId ?? d.districtId) === String(data.districtId)
    );
    
    console.log('========== DISTRICT LOOKUP ==========');
    console.log('Selected District:', selectedDistrict);
    console.log('District has parentId?', selectedDistrict?.parentId);
    console.log('District has stateId?', selectedDistrict?.stateId);
    
    if (!selectedDistrict) {
      alert('Invalid district selection');
      return;
    }
    
    // Try to get state ID from district
    let stateId = selectedDistrict.parentId || selectedDistrict.stateId;
    
    // If district doesn't have parent info, try to find it from the district's other fields
    if (!stateId && selectedDistrict.stateName) {
      // Find state by name
      const stateByName = this.statesCache.find(s => 
        (s.stateName || s.locationName || s.location || s.name) === selectedDistrict.stateName
      );
      if (stateByName) {
        stateId = stateByName.id ?? stateByName.locationId ?? stateByName.stateId;
        console.log('Found state by name:', stateByName);
      }
    }
    
    console.log('========== STATE LOOKUP ==========');
    console.log('State ID to find:', stateId);
    console.log('States cache:', this.statesCache);
    
    const selectedState = this.statesCache.find(s => 
      (s.id ?? s.locationId ?? s.stateId) === stateId ||
      String(s.id ?? s.locationId ?? s.stateId) === String(stateId)
    );
    
    console.log('Selected State:', selectedState);
    console.log('State has parentId?', selectedState?.parentId);
    console.log('State has regionId?', selectedState?.regionId);
    
    if (!selectedState) {
      console.error('❌ Cannot find state for selected district');
      console.error('District data:', selectedDistrict);
      console.error('Looking for stateId:', stateId);
      alert('Cannot find state for selected district. Please check the data.');
      return;
    }
    
    // Get region from state's parent
    let regionId = selectedState.parentId || selectedState.regionId;
    
    // If state doesn't have parent info, try to find it from the state's other fields
    if (!regionId && selectedState.regionName) {
      const regionByName = this.regionsCache.find(r => 
        (r.regionName || r.locationName || r.location || r.name) === selectedState.regionName
      );
      if (regionByName) {
        regionId = regionByName.id ?? regionByName.locationId ?? regionByName.regionId;
        console.log('Found region by name:', regionByName);
      }
    }
    
    console.log('========== REGION LOOKUP ==========');
    console.log('Region ID to find:', regionId);
    
    const selectedRegion = this.regionsCache.find(r => 
      (r.id ?? r.locationId ?? r.regionId) === regionId ||
      String(r.id ?? r.locationId ?? r.regionId) === String(regionId)
    );
    
    console.log('Selected Region:', selectedRegion);
    
    if (!selectedRegion) {
      console.error('❌ Cannot find region for selected state');
      alert('Cannot find region for selected state. Please check the data.');
      return;
    }
    
    // Get country from region's parent
    let countryId = selectedRegion.parentId || selectedRegion.countryId;
    
    // If region doesn't have parent info, try to find it from the region's other fields
    if (!countryId && selectedRegion.countryName) {
      const countryByName = this.countriesCache.find(c => 
        (c.countryName || c.locationName || c.location || c.name) === selectedRegion.countryName
      );
      if (countryByName) {
        countryId = countryByName.id ?? countryByName.locationId ?? countryByName.countryId;
        console.log('Found country by name:', countryByName);
      }
    }
    
    console.log('========== COUNTRY LOOKUP ==========');
    console.log('Country ID to find:', countryId);
    
    const selectedCountry = this.countriesCache.find(c => 
      (c.id ?? c.locationId ?? c.countryId) === countryId ||
      String(c.id ?? c.locationId ?? c.countryId) === String(countryId)
    );
    
    console.log('Selected Country:', selectedCountry);
    
    if (!selectedCountry) {
      console.error('❌ Cannot find country for selected region');
      alert('Cannot find country for selected region. Please check the data.');
      return;
    }

    const payload = {
      countryId: countryId,
      countryName: selectedCountry.countryName || selectedCountry.locationName || selectedCountry.location || selectedCountry.name || '',
      regionId: regionId,
      regionName: selectedRegion.regionName || selectedRegion.locationName || selectedRegion.location || selectedRegion.name || '',
      stateId: stateId,
      stateName: selectedState.stateName || selectedState.locationName || selectedState.location || selectedState.name || '',
      districtId: data.districtId,
      districtName: selectedDistrict.districtName || selectedDistrict.locationName || selectedDistrict.location || selectedDistrict.name || '',
      cityName: data.cityName,
      serialNo: 1
    };
    
    console.log('📤 Final payload:', JSON.stringify(payload, null, 2));
    console.log('========================================');

    if (this.isEditMode && this.cityId) {
      console.log('🔄 Calling updateCity API...');
      this.cityService.updateCity(this.cityId, payload).subscribe({
        next: (response: any) => {
          console.log('✅ Update Success:', response);
          alert('City updated successfully!');
          this.router.navigate(['/admin/city']);
        },
        error: (err: any) => {
          console.error('❌ Update failed:', err);
          alert(`Failed to update city: ${err.status} ${err.statusText}`);
        }
      });
    } else {
      console.log('➕ Calling createCity API...');
      this.cityService.createCity(payload).subscribe({
        next: (response: any) => {
          console.log('✅ Create Success:', response);
          alert('City created successfully!');
          this.router.navigate(['/admin/city']);
        },
        error: (err: any) => {
          console.error('❌ Create failed:', err);
          alert(`Failed to create city: ${err.status} ${err.statusText}`);
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    console.log('Cancel clicked, navigating back to city list');
    this.router.navigate(['/admin/city']);
  }
}
