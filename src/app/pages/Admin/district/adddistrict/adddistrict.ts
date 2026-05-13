import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from "../../../../shared/form/form";
import { Header } from "../../../../layout/header/header";
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Districtservice } from '../../../../service/Districtservice';
import { Geoservice } from '../../../../service/geoservice';
import { Countryservice } from '../../../../service/countryservice';
import { Regionservice } from '../../../../service/regionservice';
import { Stateservice } from '../../../../service/stateservice';

@Component({
  selector: 'app-adddistrict',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './adddistrict.html',
  styleUrl: './adddistrict.css'
})
export class Adddistrict implements OnInit {

  /* ================= HEADER ================= */
  headerTitle = 'Add New District';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= FORM STATE ================= */
  isEditMode = false;
  districtId!: number;
  model: any = {};
  districtFields: any[] = [];
  countriesCache: any[] = [];
  regionsCache: any[] = [];
  statesCache: any[] = [];
  districtsCache: any[] = [];

  constructor(
    private districtService: Districtservice,
    private geoService: Geoservice,
    private countryService: Countryservice,
    private regionService: Regionservice,
    private stateService: Stateservice,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('Add District component initialized');
    this.initializeFields();
    this.loadDropdownOptions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log('Edit mode detected for ID:', id);
      this.isEditMode = true;
      this.districtId = +id;
      this.headerTitle = 'Edit District';
      this.setupEditMode(this.districtId);
    } else {
      console.log('Setting up create mode');
      this.setupCreateMode();
    }
  }

  /* ================= FIELD INITIALIZATION ================= */
  initializeFields(): void {
    this.districtFields = [
      {
        name: 'stateId',
        label: 'State',
        placeholder: 'Select State',
        type: 'select',
        required: true,
        options: []
      },
      {
        name: 'districtName',
        label: 'District Name',
        type: 'text',
        required: true,
        placeholder: 'Enter district name'
      }
    ];
  }

  /* ================= LOAD OPTIONS ================= */
  loadDropdownOptions(): void {
    console.log('========== LOADING DISTRICT DROPDOWNS ==========');
    
    // Load countries and regions for cache (needed for save logic)
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

    // Load states for dropdown
    this.stateService.getStates().subscribe({
      next: (states: any[]) => {
        console.log('========== STATES API RESPONSE ==========');
        console.log('Raw states data:', states);
        
        if (states.length === 0) {
          console.error('❌ NO STATES RETURNED FROM API!');
          return;
        }
        
        const hasLevelId = states.length > 0 && states[0].territoryLevelId !== undefined;
        let filteredStates = hasLevelId 
          ? states.filter(s => s.territoryLevelId === 5)
          : states;
        
        if (filteredStates.length === 0 && hasLevelId) {
          filteredStates = states;
        }
        
        this.statesCache = filteredStates;
        console.log('States cache set:', this.statesCache.length, 'items');
        
        const stateField = this.districtFields.find(f => f.name === 'stateId');
        if (stateField) {
          stateField.options = filteredStates.map(s => ({
            label: s.location || s.stateName || s.locationName || s.name || 'Unknown',
            value: s.locationId ?? s.stateId ?? s.id
          }));
          console.log('✅ State field options set:', stateField.options.length, 'options');
        }
      },
      error: (err) => {
        console.error('Failed to load states:', err);
      }
    });
  }

  /* ================= FORM SETUP ================= */
  setupEditMode(id: number): void {
    this.isEditMode = true;
    this.districtId = id;
    
    this.headerTitle = 'Edit District';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/admin/district' },
      { label: 'District', route: '/admin/district' },
      { label: 'Edit District' }
    ];
    
    console.log('Edit mode setup for ID:', id);
    this.loadDistrictById(id);
  }

  setupCreateMode(): void {
    this.isEditMode = false;
    this.districtId = 0;
    
    this.headerTitle = 'Add New District';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/admin/district' },
      { label: 'District', route: '/admin/district' },
      { label: 'Add District' }
    ];
    
    console.log('Create mode setup');
  }

  /* ================= LOAD DISTRICT FOR EDIT ================= */
  private loadDistrictById(id: number): void {
    console.log('========== LOADING DISTRICT FOR EDIT ==========');
    console.log('District ID:', id);
    
    this.districtService.getDistricts().subscribe({
      next: (districts: any[]) => {
        console.log('All districts:', districts);
        
        // Find the district by matching various ID fields
        const district = districts.find(d => {
          const matchId = d.id === id || d.districtId === id || d.locationId === id ||
                         String(d.id) === String(id) || String(d.districtId) === String(id) || String(d.locationId) === String(id);
          return matchId;
        });
        
        console.log('Found District:', district);

        if (!district) {
          console.error('District not found with ID:', id);
          alert('District not found');
          this.router.navigate(['/admin/district']);
          return;
        }

        // Set the model with only stateId and districtName
        this.model = {
          stateId: district.stateId,
          districtName: district.districtName || district.locationName || district.location || district.name
        };
        
        console.log('Model set for edit:', this.model);
        console.log('========================================');
      },
      error: (err: any) => {
        console.error('========== ERROR LOADING DISTRICT ==========');
        console.error('Error:', err);
        alert('Failed to load district');
        console.error('========================================');
      }
    });
  }

  /* ================= SAVE ================= */
  saveDistrict(data: any): void {
    console.log('========== SAVING DISTRICT ==========');
    console.log('Form data received:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.stateId || !data.districtName) {
      console.error('❌ Missing required fields!');
      alert('Please fill in all required fields');
      return;
    }
    
    // Find the selected state
    const selectedState = this.statesCache.find(s => 
      (s.id ?? s.locationId ?? s.stateId) === data.stateId ||
      String(s.id ?? s.locationId ?? s.stateId) === String(data.stateId)
    );
    
    console.log('Selected State:', selectedState);
    
    if (!selectedState) {
      alert('Invalid state selection');
      return;
    }
    
    // Get region from state's parent
    const regionId = selectedState.parentId || selectedState.regionId;
    const selectedRegion = this.regionsCache.find(r => 
      (r.id ?? r.locationId) === regionId ||
      String(r.id ?? r.locationId) === String(regionId)
    );
    
    console.log('Selected Region:', selectedRegion);
    
    if (!selectedRegion) {
      alert('Cannot find region for selected state');
      return;
    }
    
    // Get country from region's parent
    const countryId = selectedRegion.parentId || selectedRegion.countryId;
    const selectedCountry = this.countriesCache.find(c => 
      (c.id ?? c.locationId) === countryId ||
      String(c.id ?? c.locationId) === String(countryId)
    );
    
    console.log('Selected Country:', selectedCountry);
    
    if (!selectedCountry) {
      alert('Cannot find country for selected region');
      return;
    }

    const payload = {
      countryId: countryId,
      countryName: selectedCountry.countryName || selectedCountry.locationName || selectedCountry.location || selectedCountry.name || '',
      regionId: regionId,
      regionName: selectedRegion.regionName || selectedRegion.locationName || selectedRegion.location || selectedRegion.name || '',
      stateId: data.stateId,
      stateName: selectedState.stateName || selectedState.locationName || selectedState.location || selectedState.name || '',
      districtName: data.districtName,
      serialNo: 1
    };
    
    console.log('📤 Final payload:', JSON.stringify(payload, null, 2));

    if (this.isEditMode && this.districtId) {
      console.log('🔄 Calling updateDistrict API...');
      this.districtService.updateDistrict(this.districtId, payload).subscribe({
        next: (response: any) => {
          console.log('✅ Update Success:', response);
          alert('District updated successfully!');
          this.router.navigate(['/admin/district']);
        },
        error: (err: any) => {
          console.error('❌ Update failed:', err);
          alert(`Failed to update district: ${err.status} ${err.statusText}`);
        }
      });
    } else {
      console.log('➕ Calling createDistrict API...');
      this.districtService.createDistrict(payload).subscribe({
        next: (response: any) => {
          console.log('✅ Create Success:', response);
          alert('District created successfully!');
          this.router.navigate(['/admin/district']);
        },
        error: (err: any) => {
          console.error('❌ Create failed:', err);
          alert(`Failed to create district: ${err.status} ${err.statusText}`);
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    console.log('Cancel clicked, navigating back to district list');
    this.router.navigate(['/admin/district']);
  }
}
