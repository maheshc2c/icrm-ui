import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Stateservice } from '../../../../service/stateservice';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../service/auth-service';

@Component({
  selector: 'app-addstate',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addstate.html',
  styleUrls: ['./addstate.css']
})
export class Addstate implements OnInit {
  /* ================= DATA ================= */
  model: any = {};
  isEditMode: boolean = false;
  stateId: number | null = null;
  private baseUrl = 'http://localhost:8080';

  /* ================= HEADER ================= */
  headerTitle: string = 'Add State';
  headerBreadcrumbs: Breadcrumb[] = [];

  constructor(
    private stateService: Stateservice,
    private http: HttpClient,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    console.log('Add State component initialized');
    this.loadRegionOptions();

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

  /* ================= LOAD REGION OPTIONS ================= */
  loadRegionOptions(): void {
    this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=4`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (regions: any[]) => {
          const regionField = this.stateFields.find(field => field.name === 'regionId');
          if (regionField) {
            regionField.options = regions.map(r => ({
              label: r.locationName || r.name || r.regionName,
              value: String(r.locationId ?? r.id)
            }));
          }
        },
        error: (err) => console.error('Failed to load region options:', err)
      });
  }

  /* ================= FORM SETUP ================= */
  setupEditMode(id: number): void {
    this.isEditMode = true;
    this.stateId = id;
    
    this.headerTitle = 'Edit State';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/state' },
      { label: 'State', route: '/state' },
      { label: 'Edit State' }
    ];
    
    this.loadStateById(id);
  }

  setupCreateMode(): void {
    this.isEditMode = false;
    this.stateId = null;
    
    this.headerTitle = 'Add State';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/state' },
      { label: 'State', route: '/state' },
      { label: 'Add State' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  stateFields: any[] = [
    {
      name: 'regionId',
      label: 'Select Region',
      placeholder: 'Select Region',
      type: 'select',
      required: true,
      options: [] as any[]
    },
    {
      name: 'stateName',
      label: 'State Name',
      type: 'text',
      required: true,
      placeholder: 'Enter state name'
    }
  ];

  /* ================= SAVE ================= */
  saveState(data: any): void {
    if (!data.regionId || !data.stateName) {
      alert('Please fill in all required fields');
      return;
    }
    
    const payload = {
      stateName: data.stateName,
      regionId: +data.regionId
    };
    
    if (this.isEditMode && this.stateId) {
      this.stateService.updateState(this.stateId, payload).subscribe({
        next: (response: any) => {
          this.router.navigate(['/state']);
        },
        error: (err: any) => {
          alert(`Failed to update state: ${err.status}`);
        }
      });
    } else {
      this.stateService.createState(payload).subscribe({
        next: (response: any) => {
          this.router.navigate(['/state']);
        },
        error: (err: any) => {
          alert(`Failed to create state: ${err.status}`);
        }
      });
    }
  }

  /* ================= LOAD STATE FOR EDIT ================= */
  private loadStateById(id: number): void {
    console.log('========== LOADING STATE FOR EDIT ==========');
    this.stateService.getStates().subscribe({
      next: (states: any[]) => {
        const state = states.find(s => {
          return String(s.id) === String(id) || String(s.stateId) === String(id) || String(s.locationId) === String(id);
        });
        
        if (!state) {
          alert('State not found');
          this.router.navigate(['/state']);
          return;
        }

        const regionId = state.regionId || state.parentId;

        this.model = {
          regionId: regionId ? String(regionId) : '',
          stateName: state.stateName || state.locationName || state.location
        };
      },
      error: (err: any) => {
        alert('Failed to load state');
      }
    });
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/state']);
  }
}
