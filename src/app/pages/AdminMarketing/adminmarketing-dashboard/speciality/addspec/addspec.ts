import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../../../models/breadcrumb';
import { SpecialityModel } from '../../../../../models/speciality-model';
import { Header } from '../../../../../layout/header/header';
import { Pageheader } from '../../../../../shared/pageheader/pageheader';
import { Form } from '../../../../../shared/form/form';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../../../layout/sidebar/sidebar';
import { adminMarketingservice } from '../../../../../service/adminmarketingservice';
import { ToastService } from '../../../../../service/toast.service';

@Component({
  selector: 'app-addspec',
  imports: [Header, Pageheader, Form, CommonModule, Sidebar ],
  templateUrl: './addspec.html',
  styleUrl: './addspec.css',
})
export class Addspec {



  constructor(
    private adminmarketingService: adminMarketingservice,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}



  /* ================= HEADER ================= */
  headerTitle = 'Add Speciality';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= STATE ================= */
  isEditMode = false;
  specialityId!: number;
  formInitialData: Partial<SpecialityModel> = {};

  /* ================= FORM FIELDS ================= */
  specialityFields = [
    {
      name: 'specialityName',
      label: 'Speciality Name',
      type: 'text',
      placeholder: 'Enter speciality name',
      required: true
    },
  
  ];


  /* ================= INIT ================= */
  ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('id');

  if (idParam !== null) {
    this.isEditMode = true;
    this.specialityId = Number(idParam);

    this.headerTitle = 'Edit Speciality';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/adminmarketingdashboard' },
      { label: 'Speciality', route: '/adminmarketing/speciality' },
      { label: 'Edit Speciality' }
    ];

    this.loadSpecialityById(this.specialityId);
  } else {
    this.isEditMode = false;
    this.headerTitle = 'Add Speciality';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/adminmarketingdashboard' },
      { label: 'Speciality', route: '/adminmarketing/speciality' },
      { label: 'Add Speciality' }
    ];
  }
}


  /* ================= LOAD ================= */
  private loadSpecialityById(id: number): void {
  this.adminmarketingService.getSpecialities().subscribe({
    next: (res: any) => {
      // ✅ Handle paginated response (res.content) or direct array
      const specialities = Array.isArray(res) ? res : (res?.content || (res ? [res] : []));
      const speciality = specialities.find((c: any) => c.specialityId === id);

      if (!speciality) {
        this.toastService.error('Speciality not found');
        this.router.navigate(['/adminmarketing/speciality']);
        return;
      }

      this.formInitialData = {
        specialityName: speciality.specialityName,
     
      };
    },
    error: () => {
      this.toastService.error('Failed to load speciality');
      this.router.navigate(['/adminmarketing/speciality']);
    }
  });
}

  /* ================= SAVE ================= */
  saveSpeciality(data: Partial<SpecialityModel>): void {

  const payload: SpecialityModel = {
    specialityName: data.specialityName!.trim(),
    specialityStatus: 1
  };

  if (this.isEditMode) {
    this.adminmarketingService.updateSpeciality(this.specialityId, payload).subscribe({
      next: () => {
        this.toastService.success('Speciality updated successfully');
        this.router.navigate(['/adminmarketing/speciality']);
      },
      error: (err: any) => {
        console.error('Update failed:', err);
        this.toastService.error('Failed to update speciality');
      }
    });
  } else {
    this.adminmarketingService.createSpeciality(payload).subscribe({
      next: () => {
        this.toastService.success('Speciality created successfully');
        this.router.navigate(['/adminmarketing/speciality']);
      },
      error: (err: any) => {
        console.error('Create failed:', err);
        this.toastService.error('Failed to create speciality');
      }
    });
  }
}


  onCancel(): void {
    this.router.navigate(['/adminmarketing/speciality']);
  }
}

