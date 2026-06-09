import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from "../../../../shared/form/form";
import { Header } from "../../../../layout/header/header";
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Geoservice } from '../../../../service/geoservice';



@Component({
  selector: 'app-addgeo',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addgeo.html',
  styleUrl: './addgeo.css'
})
export class Addgeo implements OnInit {

  constructor(
    private geoService: Geoservice,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /* ================= HEADER ================= */
  headerTitle = 'Add New Geo';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= FORM STATE ================= */
  isEditMode = false;
  geoId!: number;
  model: any = {};

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    console.log('AddGeo component initialized');
    console.log('Route params:', this.route.snapshot.paramMap);

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

  /* ================= MODE SETUP ================= */
  private setupEditMode(id: number): void {
    this.isEditMode = true;
    this.geoId = id;

    this.headerTitle = 'Edit Geo';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/geo' },
      { label: 'Geo', route: '/geo' },
      { label: 'Edit Geo' }
    ];

    this.loadGeoById(id);
  }

  private setupCreateMode(): void {
    this.isEditMode = false;

    this.headerTitle = 'Add New Geo';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Territory', route: '/geo' },
      { label: 'Geo', route: '/geo' },
      { label: 'Add Geo' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  geoFields = [
    { name: 'locationName', label: 'Geo Name', placeholder: 'Geo Name', type: 'text', required: true }
  ];


  /* ================= SAVE ================= */
  saveGeo(data: any): void {
    const payload = {
      ...data,
      locationStatus: 1, // Correct field for backend
      territoryLevelId: 1
    };
    console.log('Saving Geo with payload:', payload);

    if (this.isEditMode) {
      this.geoService.updateGeo(this.geoId, payload).subscribe({
        next: (response) => {
          console.log('Update Geo Success:', response);
          this.router.navigate(['/geo']);
        },
        error: (error) => {
          console.error('Failed to update geo:', error);
          alert('Failed to update geo');
        }
      });
    } else {
      this.geoService.createGeo(payload).subscribe({
        next: (response) => {
          console.log('Create Geo Success:', response);
          this.router.navigate(['/geo']);
        },
        error: (error) => {
          console.error('Failed to create geo:', error);
          alert('Failed to create geo');
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/geo']);
  }

  /* ================= LOAD GEO ================= */
  private loadGeoById(id: number): void {
    console.log('Loading Geo by ID:', id);
    this.geoService.getGeoById(id).subscribe({
      next: (geos: any[]) => {
        console.log('API Response - All Geos:', geos);
        // Match by id OR locationId
        const geo = geos.find(g => (g.id === id) || (g.locationId === id));
        console.log('Found Geo:', geo);

        if (!geo) {
          alert('Geo not found');
          this.router.navigate(['/geo']);
          return;
        }

        console.log('Setting model with geo data:', geo);
        this.model = { ...geo };
      },
      error: err => {
        console.error('Error loading geo:', err);
        alert('Failed to load geo');
      }
    });
  }
}
