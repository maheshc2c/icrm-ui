import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from "../../../../shared/form/form";
import { Header } from "../../../../layout/header/header";
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Countryservice } from '../../../../service/countryservice';
import { Geoservice } from '../../../../service/geoservice';
import { Country } from '../../../../models/country';

@Component({
  selector: 'app-addcountry',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addcountry.html',
  styleUrl: './addcountry.css'
})
export class Addcountry implements OnInit {

  /* ================= HEADER ================= */
  headerTitle = 'Add New Country';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= FORM STATE ================= */
  isEditMode = false;
  countryId!: number;
  model: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private countryService: Countryservice,
    private geoService: Geoservice
  ) { }

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    console.log('AddCountry component initialized');
    console.log('Route params:', this.route.snapshot.paramMap);

    // Load Geo options first
    this.loadGeoOptions();

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

        // Update the geo field with options
        const geoField = this.countryFields.find(field => field.name === 'geoName');
        if (geoField) {
          geoField.options = geos.map(geo => {
            const g = geo as any; // Cast to any to handle potential fallback fields
            return {
              label: g.locationName || g.name || g.geoName,
              value: g.locationName || g.name || g.geoName
            };
          });
        }

        console.log('Updated country fields:', this.countryFields);
      },
      error: (err: any) => {
        console.error('Failed to load geo options:', err);
      }
    });
  }

  /* ================= MODE SETUP ================= */
  private setupEditMode(id: number): void {
    this.isEditMode = true;
    this.countryId = id;

    this.headerTitle = 'Edit Country';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/admin/country' },
      { label: 'Country', route: '/admin/country' },
      { label: 'Edit Country' }
    ];

    this.loadCountryById(id);
  }

  private setupCreateMode(): void {
    this.isEditMode = false;

    this.headerTitle = 'Add New Country';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/admin/country' },
      { label: 'Country', route: '/admin/country' },
      { label: 'Add Country' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  countryFields: any[] = [
    {
      name: 'geoName', // Changed from geoId to geoName because backend expects name
      label: 'Geo',
      placeholder: 'Select Geo',
      type: 'select',
      required: true,
      options: [] as any[]
    },
    {
      name: 'countryName',
      label: 'Country Name',
      placeholder: 'Country Name',
      type: 'text',
      required: true
    }
  ];

  /* ================= SAVE ================= */
  saveCountry(data: any): void {
    // data contains { geoName: "...", countryName: "..." }
    const payload = {
      ...data,
      locationStatus: 1, // Default to Active
      // territoryLevelId is handled by backend or we can send it if needed, but createCountry logic implies it sets it (3L)
    };
    // delete payload.geoName; // Keep geoName as backend expects it (if DTO has geoName)
    console.log('Saving Country with payload:', payload);

    if (this.isEditMode) {
      this.countryService.updateCountry(this.countryId, payload).subscribe({
        next: (response: any) => {
          console.log('Update Country Success:', response);
          this.router.navigate(['/admin/country']);
        },
        error: (error: any) => {
          console.error('Failed to update country:', error);
          alert('Failed to update country');
        }
      });
    } else {
      this.countryService.createCountry(payload).subscribe({
        next: (response: any) => {
          console.log('Create Country Success:', response);
          this.router.navigate(['/admin/country']);
        },
        error: (error: any) => {
          console.error('Failed to create country:', error);
          alert('Failed to create country');
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/admin/country']);
  }

  /* ================= LOAD COUNTRY ================= */
  private loadCountryById(id: number): void {
    this.countryService.getCountryById(id).subscribe({
      next: (countries: any[]) => {
        console.log('Edit Mode - Requested ID:', id, 'Type:', typeof id);

        // Find country by ID or locationId, handling type mismatch
        const country = countries.find(c => {
          // console.log(`Checking country: id=${c.id}, locationId=${c.locationId}`);
          return String(c.id) === String(id) || String(c.locationId) === String(id);
        });

        if (!country) {
          console.error('Country not found! Available IDs:', countries.map((c: any) => ({ id: c.id, locationId: c.locationId })));
          alert('Country not found');
          this.router.navigate(['/admin/country']);
          return;
        }

        // We need to fetch the parent Geo name to populate the dropdown
        // The country object has 'parentId'. We need to find the Geo with that ID.
        // Robust parentId resolution
        const parentId = country.parentId || country.parentLocation?.id || country.parentLocation?.locationId;

        console.log('Edit Mode - Resolved Parent ID:', parentId);

        if (!parentId) {
          console.warn('Edit Mode - No Parent ID found for country:', country);
          this.model = {
            countryName: country.locationName,
            geoName: ''
          };
          return;
        }

        this.geoService.getGeos().subscribe(geos => {
          // Robust Geo finding
          const parentGeo = geos.find(g =>
            String(g.id) === String(parentId) ||
            String(g.locationId) === String(parentId)
          );

          if (parentGeo) {
            // Must match the value format in loadGeoOptions
            // Cast to any to avoid TS errors if 'name' or 'geoName' are not in interface
            const g = parentGeo as any;
            const geoValue = g.locationName || g.name || g.geoName;
            console.log('Edit Mode - Found Parent Geo:', parentGeo);
            console.log('Edit Mode - Setting Geo Value:', geoValue);

            this.model = {
              countryName: country.locationName,
              geoName: geoValue
            };
          } else {
            console.warn(`Edit Mode - Parent Geo not found for ID: ${parentId}`);
            this.model = {
              countryName: country.locationName,
              geoName: ''
            };
          }
        });
      },
      error: (err: any) => {
        console.error('Error loading country:', err);
        alert('Failed to load country');
      }
    });
  }
}
