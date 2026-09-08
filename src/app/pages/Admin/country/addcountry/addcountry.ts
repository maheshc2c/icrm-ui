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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../service/auth-service';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-addcountry',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addcountry.html',
  styleUrl: './addcountry.css'
})
export class Addcountry implements OnInit {

  private baseUrl = environment.baseUrl;

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
    private geoService: Geoservice,
    private http: HttpClient,
    private auth: AuthService
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
    const token = this.auth?.getToken?.();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=2`, { headers })
      .subscribe({
        next: (geos: any[]) => {
          console.log('Geo options loaded:', geos);

          const geoField = this.countryFields.find(field => field.name === 'geoId');
          if (geoField) {
            geoField.options = geos.map(geo => {
              const g = geo as any;
              return {
                label: g.locationName || g.name || g.geoName,
                value: String(g.locationId ?? g.id)
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
      { label: 'Manage Territory', route: '/country' },
      { label: 'Country', route: '/country' },
      { label: 'Edit Country' }
    ];

    this.loadCountryById(id);
  }

  private setupCreateMode(): void {
    this.isEditMode = false;

    this.headerTitle = 'Add New Country';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/country' },
      { label: 'Country', route: '/country' },
      { label: 'Add Country' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  countryFields: any[] = [
    {
      name: 'geoId',
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
    const payload = {
      countryName: data.countryName,
      geoId: +data.geoId
    };
    console.log('Saving Country with payload:', payload);

    if (this.isEditMode) {
      this.countryService.updateCountry(this.countryId, payload).subscribe({
        next: (response: any) => {
          console.log('Update Country Success:', response);
          this.router.navigate(['/country']);
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
          this.router.navigate(['/country']);
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
    this.router.navigate(['/country']);
  }

  /* ================= LOAD COUNTRY ================= */
  private loadCountryById(id: number): void {
    this.countryService.getCountryById(id).subscribe({
      next: (countries: any[]) => {
        console.log('Edit Mode - Requested ID:', id, 'Type:', typeof id);

        const country = countries.find(c => {
          return String(c.id) === String(id) || String(c.locationId) === String(id);
        });

        if (!country) {
          console.error('Country not found!');
          alert('Country not found');
          this.router.navigate(['/country']);
          return;
        }

        const parentId = country.parentId || country.parentLocation?.id || country.parentLocation?.locationId;

        console.log('Edit Mode - Resolved Parent ID:', parentId);

        this.model = {
          countryName: country.locationName || country.countryName,
          geoId: parentId ? String(parentId) : ''
        };
      },
      error: (err: any) => {
        console.error('Error loading country:', err);
        alert('Failed to load country');
      }
    });
  }
}
