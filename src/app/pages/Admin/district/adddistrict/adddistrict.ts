import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from "../../../../shared/form/form";
import { Header } from "../../../../layout/header/header";
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Districtservice } from '../../../../service/Districtservice';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../service/auth-service';

import { environment } from '../../../../../environments/environment';

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
  private baseUrl = environment.baseUrl;

  constructor(
    private districtService: Districtservice,
    private http: HttpClient,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    console.log('Add District component initialized');
    this.loadStateOptions();

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

  /* ================= LOAD STATE OPTIONS ================= */
  loadStateOptions(): void {
    this.http.get<any[]>(`${this.baseUrl}/location/locations?territoryLevelId=5`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (states: any[]) => {
          const stateField = this.districtFields.find(field => field.name === 'stateId');
          if (stateField) {
            stateField.options = states.map(s => ({
              label: s.locationName || s.name || s.stateName,
              value: String(s.locationId ?? s.id)
            }));
          }
        },
        error: (err) => console.error('Failed to load state options:', err)
      });
  }

  /* ================= MODE SETUP ================= */
  setupEditMode(id: number): void {
    this.isEditMode = true;
    this.districtId = id;
    
    this.headerTitle = 'Edit District';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/district' },
      { label: 'District', route: '/district' },
      { label: 'Edit District' }
    ];
    
    this.loadDistrictById(id);
  }

  setupCreateMode(): void {
    this.isEditMode = false;
    this.districtId = 0;
    
    this.headerTitle = 'Add New District';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/district' },
      { label: 'District', route: '/district' },
      { label: 'Add District' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  districtFields: any[] = [
    {
      name: 'stateId',
      label: 'Select State',
      placeholder: 'Select State',
      type: 'select',
      required: true,
      options: [] as any[]
    },
    {
      name: 'districtName',
      label: 'District Name',
      type: 'text',
      required: true,
      placeholder: 'Enter district name'
    }
  ];

  /* ================= SAVE ================= */
  saveDistrict(data: any): void {
    if (!data.stateId || !data.districtName) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      districtName: data.districtName,
      stateId: +data.stateId
    };

    if (this.isEditMode && this.districtId) {
      this.districtService.updateDistrict(this.districtId, payload).subscribe({
        next: (response: any) => {
          this.router.navigate(['/district']);
        },
        error: (err: any) => {
          alert(`Failed to update district: ${err.status}`);
        }
      });
    } else {
      this.districtService.createDistrict(payload).subscribe({
        next: (response: any) => {
          this.router.navigate(['/district']);
        },
        error: (err: any) => {
          alert(`Failed to create district: ${err.status}`);
        }
      });
    }
  }

  /* ================= LOAD DISTRICT ================= */
  private loadDistrictById(id: number): void {
    console.log('========== LOADING DISTRICT FOR EDIT ==========');
    this.districtService.getDistricts().subscribe({
      next: (districts: any[]) => {
        const district = districts.find(d => {
          return String(d.id) === String(id) || String(d.locationId) === String(id) || String(d.districtId) === String(id);
        });

        if (!district) {
          alert('District not found');
          this.router.navigate(['/district']);
          return;
        }

        const stateId = district.stateId || district.parentId;

        this.model = {
          stateId: stateId ? String(stateId) : '',
          districtName: district.districtName || district.locationName || district.location
        };
      },
      error: (err: any) => {
        alert('Failed to load district details');
      }
    });
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    console.log('Cancel clicked, navigating back to district list');
    this.router.navigate(['/district']);
  }
}
