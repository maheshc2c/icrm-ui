import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Regionservice } from '../../../../service/regionservice';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../service/auth-service';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-addregion',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addregion.html',
  styleUrls: ['./addregion.css']
})
export class Addregion implements OnInit {
  /* ================= DATA ================= */
  model: any = {};
  isEditMode: boolean = false;
  regionId: number | null = null;
  private baseUrl = environment.baseUrl;

  /* ================= HEADER ================= */
  headerTitle: string = 'Add Region';
  headerBreadcrumbs: Breadcrumb[] = [];

  constructor(
    private regionService: Regionservice,
    private http: HttpClient,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    console.log('Add Region component initialized');
    this.loadCountryOptions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.setupEditMode(+id);
    } else {
      this.setupCreateMode();
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  /* ================= LOAD COUNTRY OPTIONS ================= */
  loadCountryOptions(): void {
    this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=3`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (countries: any[]) => {
          const countryField = this.regionFields.find(field => field.name === 'countryId');
          if (countryField) {
            countryField.options = countries.map(c => ({
              label: c.locationName || c.name || c.countryName,
              value: String(c.locationId ?? c.id)
            }));
          }
        },
        error: (err) => console.error('Failed to load country options:', err)
      });
  }

  /* ================= FORM SETUP ================= */
  setupEditMode(id: number): void {
    this.isEditMode = true;
    this.regionId = id;
    
    this.headerTitle = 'Edit Region';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/region' },
      { label: 'Region', route: '/region' },
      { label: 'Edit Region' }
    ];
    
    this.loadRegionById(id);
  }

  setupCreateMode(): void {
    this.isEditMode = false;
    this.regionId = null;
    
    this.headerTitle = 'Add Region';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/region' },
      { label: 'Region', route: '/region' },
      { label: 'Add Region' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  regionFields: any[] = [
    {
      name: 'countryId',
      label: 'Select Country',
      placeholder: 'Select Country',
      type: 'select',
      required: true,
      options: [] as any[]
    },
    {
      name: 'regionName',
      label: 'Region Name',
      type: 'text',
      required: true,
      placeholder: 'Enter region name'
    }
  ];

  /* ================= SAVE ================= */
  saveRegion(data: any): void {
    if (!data.countryId || !data.regionName) {
      alert('Please fill in all required fields');
      return;
    }
    
    const payload = {
      regionName: data.regionName,
      countryId: +data.countryId
    };
    
    if (this.isEditMode && this.regionId) {
      this.regionService.updateRegion(this.regionId, payload).subscribe({
        next: (response: any) => {
          this.router.navigate(['/region']);
        },
        error: (err: any) => {
          alert(`Failed to update region: ${err.status}`);
        }
      });
    } else {
      this.regionService.createRegion(payload).subscribe({
        next: (response: any) => {
          this.router.navigate(['/region']);
        },
        error: (err: any) => {
          alert(`Failed to create region: ${err.status}`);
        }
      });
    }
  }

  /* ================= LOAD REGION FOR EDIT ================= */
  private loadRegionById(id: number): void {
    console.log('========== LOADING REGION FOR EDIT ==========');
    this.regionService.getRegions().subscribe({
      next: (regions: any[]) => {
        const region = regions.find(r => {
          return String(r.id) === String(id) || String(r.regionId) === String(id) || String(r.locationId) === String(id);
        });
        
        if (!region) {
          alert('Region not found');
          this.router.navigate(['/region']);
          return;
        }

        const countryId = region.countryId || region.parentId;

        this.model = {
          countryId: countryId ? String(countryId) : '',
          regionName: region.regionName || region.locationName || region.location
        };
      },
      error: (err: any) => {
        alert('Failed to load region');
      }
    });
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/region']);
  }
}
