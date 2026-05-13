import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from "../../../../shared/form/form";
import { Header } from "../../../../layout/header/header";
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Regionservice } from '../../../../service/regionservice';
import { Geoservice } from '../../../../service/geoservice';
import { Countryservice } from '../../../../service/countryservice';
import { Region } from '../../../../models/region';

@Component({
  selector: 'app-addregion',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addregion.html',
  styleUrl: './addregion.css'
})
export class Addregion implements OnInit {

  /* ================= HEADER ================= */
  headerTitle = 'Add New Region';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= FORM STATE ================= */
  isEditMode = false;
  regionId!: number;
  model: any = {};
  countriesCache: any[] = [];
  regionsCache: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private regionService: Regionservice,
    private geoService: Geoservice,
    private countryService: Countryservice
  ) { }

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    console.log('AddRegion component initialized');
    console.log('Route params:', this.route.snapshot.paramMap);

    // Load Country options only (no Geo)
    this.loadCountryOptions();

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

        const geoField = this.regionFields.find(field => field.name === 'geoId');
        if (geoField) {
          geoField.options = geos.map(geo => ({
            label: geo.locationName || geo.name,
            value: geo.id
          }));
        }

        console.log('Updated region fields with geo options:', this.regionFields);
      },
      error: (err: any) => {
        console.error('Failed to load geo options:', err);
      }
    });
  }

  /* ================= LOAD COUNTRY OPTIONS ================= */
  loadCountryOptions(): void {
    this.countryService.getCountries().subscribe({
      next: (countries: any[]) => {
        console.log('Country options loaded:', countries);
        this.countriesCache = countries || [];

        const countryField = this.regionFields.find(field => field.name === 'countryId');
        if (countryField) {
          countryField.options = countries.map(country => ({
            label: country.countryName || country.locationName || country.name,
            value: country.id ?? country.locationId
          }));
        }

        console.log('Updated region fields with country options:', this.regionFields);
      },
      error: (err: any) => {
        console.error('Failed to load country options:', err);
      }
    });
  }

  /* ================= MODE SETUP ================= */
  private setupEditMode(id: number): void {
    this.isEditMode = true;
    this.regionId = id;

    this.headerTitle = 'Edit Region';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/admin/region' },
      { label: 'Region', route: '/admin/region' },
      { label: 'Edit Region' }
    ];

    this.loadRegionById(id);
  }

  private setupCreateMode(): void {
    this.isEditMode = false;

    this.headerTitle = 'Add New Region';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/admin/region' },
      { label: 'Region', route: '/admin/region' },
      { label: 'Add Region' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  regionFields: any[] = [
    {
      name: 'countryId',
      label: 'Country',
      placeholder: 'Select Country',
      type: 'select',
      required: true,
      options: [] as any[]
    },
    {
      name: 'regionName',
      label: 'Region Name',
      placeholder: 'Region Name',
      type: 'text',
      required: true
    }
  ];

  /* ================= SAVE ================= */
  saveRegion(data: any): void {
    const selectedCountry = this.countriesCache.find(c => (c.id ?? c.locationId) === data.countryId);

    const payload: any = {
      countryId: data.countryId,
      countryName: selectedCountry?.countryName || selectedCountry?.locationName || selectedCountry?.name,
      regionName: data.regionName
    };

    if (this.isEditMode) {
      payload.serialNo = this.regionId;
    }

    console.log('Final Payload being sent to Backend:', JSON.stringify(payload));

    if (this.isEditMode) {
      console.log('Attempting UPDATE at:', this.regionId);
      this.regionService.updateRegion(this.regionId, payload).subscribe({
        next: (response: any) => {
          console.log('Update Success Response:', response);
          this.router.navigate(['/admin/region']);
        },
        error: (err: any) => {
          console.error('Update Error Object:', err);
          // Log extra details for 403 debugging
          if (err.status === 403) {
            console.warn('403 Forbidden - Possible incorrect endpoint or missing permission');
          }
          alert(`Failed to update region: ${err.status} ${err.statusText}`);
        }
      });
    } else {
      console.log('Attempting CREATE');
      this.regionService.createRegion(payload).subscribe({
        next: (response: any) => {
          console.log('Create Success Response:', response);
          this.router.navigate(['/admin/region']);
        },
        error: (err: any) => {
          console.error('Create Error Object:', err);
          alert(`Failed to create region: ${err.status} ${err.statusText}`);
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/admin/region']);
  }

  /* ================= LOAD REGION ================= */
  private loadRegionById(id: number): void {
    console.log('Loading Region for Edit. ID:', id);
    // Ensure caches are loaded before attempting to find the region
    if (this.countriesCache.length === 0 || this.regionsCache.length === 0) {
      // If caches are not yet loaded, subscribe to them and then process
      this.countryService.getCountries().subscribe({
        next: (countries: any[]) => {
          this.countriesCache = countries;
          this.regionService.getRegions().subscribe({
            next: (regions: any[]) => {
              this.regionsCache = regions;
              this.processRegionData(id);
            },
            error: (err: any) => console.error('Failed to load regions for edit:', err)
          });
        },
        error: (err: any) => console.error('Failed to load countries for edit:', err)
      });
    } else {
      this.processRegionData(id);
    }
  }

  private processRegionData(id: number): void {
    const region = this.regionsCache.find(r => String(r.id) === String(id) || String(r.locationId) === String(id));

    if (!region) {
      console.error('Region not found in list');
      alert('Region not found');
      this.router.navigate(['/admin/region']);
      return;
    }

    // Robust countryId resolution
    const countryId = region.countryId ||
      region.parentId ||
      region.parentLocation?.id ||
      region.parentLocation?.locationId;

    // Robust countryName resolution (for display if needed, though form uses countryId)
    let countryName = region.countryName ||
      region.parentLocation?.locationName ||
      region.parentLocation?.name;

    // Fallback: Resolve name from the countries list if we only have an ID
    if (!countryName && countryId) {
      const country = this.countriesCache.find(c =>
        String(c.id) === String(countryId) ||
        String(c.locationId) === String(countryId) ||
        String(c.serialNo) === String(countryId)
      );
      countryName = country?.locationName || country?.name || country?.countryName;
    }

    this.model = {
      countryId: countryId, // Pre-populate select with ID
      regionName: region.locationName || region.name || region.regionName
    };
    console.log('Edit Mode - Model successfully resolved:', this.model);
  }
}
