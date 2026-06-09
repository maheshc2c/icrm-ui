import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Cityservice } from '../../../../service/cityservice';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../service/auth-service';

@Component({
  selector: 'app-addcity',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addcity.html',
  styleUrls: ['./addcity.css']
})
export class Addcity implements OnInit {
  /* ================= DATA ================= */
  model: any = {};
  isEditMode: boolean = false;
  cityId: number | null = null;
  private baseUrl = 'http://localhost:8080';

  /* ================= HEADER ================= */
  headerTitle: string = 'Add City';
  headerBreadcrumbs: Breadcrumb[] = [];

  constructor(
    private cityService: Cityservice,
    private http: HttpClient,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    console.log('Add City component initialized');
    this.loadDistrictOptions();

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

  /* ================= LOAD DISTRICT OPTIONS ================= */
  loadDistrictOptions(): void {
    this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=6`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (districts: any[]) => {
          const districtField = this.cityFields.find(field => field.name === 'districtId');
          if (districtField) {
            districtField.options = districts.map(d => ({
              label: d.locationName || d.name || d.districtName,
              value: String(d.locationId ?? d.id)
            }));
          }
        },
        error: (err) => console.error('Failed to load district options:', err)
      });
  }

  /* ================= FORM SETUP ================= */
  setupEditMode(id: number): void {
    this.isEditMode = true;
    this.cityId = id;
    
    this.headerTitle = 'Edit City';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/city' },
      { label: 'City', route: '/city' },
      { label: 'Edit City' }
    ];
    
    this.loadCityById(id);
  }

  setupCreateMode(): void {
    this.isEditMode = false;
    this.cityId = null;
    
    this.headerTitle = 'Add City';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/city' },
      { label: 'City', route: '/city' },
      { label: 'Add City' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  cityFields: any[] = [
    {
      name: 'districtId',
      label: 'Select District',
      placeholder: 'Select District',
      type: 'select',
      required: true,
      options: [] as any[]
    },
    {
      name: 'cityName',
      label: 'City/Town Name',
      type: 'text',
      required: true,
      placeholder: 'Enter city name'
    }
  ];

  /* ================= SAVE ================= */
  saveCity(data: any): void {
    if (!data.districtId || !data.cityName) {
      alert('Please fill in all required fields');
      return;
    }
    
    const payload = {
      cityName: data.cityName,
      districtId: +data.districtId
    };
    
    if (this.isEditMode && this.cityId) {
      this.cityService.updateCity(this.cityId, payload).subscribe({
        next: (response: any) => {
          this.router.navigate(['/city']);
        },
        error: (err: any) => {
          alert(`Failed to update city: ${err.status}`);
        }
      });
    } else {
      this.cityService.createCity(payload).subscribe({
        next: (response: any) => {
          this.router.navigate(['/city']);
        },
        error: (err: any) => {
          alert(`Failed to create city: ${err.status}`);
        }
      });
    }
  }

  /* ================= LOAD CITY FOR EDIT ================= */
  private loadCityById(id: number): void {
    console.log('========== LOADING CITY FOR EDIT ==========');
    this.cityService.getCities().subscribe({
      next: (cities: any[]) => {
        const city = cities.find(c => {
          return String(c.id) === String(id) || String(c.cityId) === String(id) || String(c.locationId) === String(id);
        });
        
        if (!city) {
          alert('City not found');
          this.router.navigate(['/city']);
          return;
        }

        const districtId = city.districtId || city.parentId;

        this.model = {
          districtId: districtId ? String(districtId) : '',
          cityName: city.cityName || city.locationName || city.location
        };
      },
      error: (err: any) => {
        alert('Failed to load city');
      }
    });
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/city']);
  }
}
