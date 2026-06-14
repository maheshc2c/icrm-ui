import { Component } from '@angular/core';
import { Adminservice } from '../../../../service/adminservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { SpecialityModel } from '../../../../models/speciality-model';
import { Header } from '../../../../layout/header/header';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { DataTable } from '../../../../shared/data-table/data-table';
import { Form } from '../../../../shared/form/form';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { ToastService } from '../../../../service/toast.service';

@Component({
  selector: 'app-addspec',
  imports: [Header, Pageheader, Form, CommonModule, Sidebar ],
  templateUrl: './addspec.html',
  styleUrl: './addspec.css',
})
export class Addspec {



  constructor(
    private adminService: Adminservice,
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
      { label: 'Home', route: '/admindashboard' },
      { label: 'Speciality', route: '/speciality' },
      { label: 'Edit Speciality' }
    ];

    this.loadSpecialityById(this.specialityId);
  } else {
    this.isEditMode = false;
    this.headerTitle = 'Add Speciality';
  }
}


  /* ================= LOAD ================= */
  private loadSpecialityById(id: number): void {
  this.adminService.getSpecialityDropDown().subscribe({
    next: (res: any) => {
      const specialitys = Array.isArray(res) ? res : (res?.content || []);
      const speciality = specialitys.find((c: any) => c.id === id || c.specialityId === id);

      if (!speciality) {
        this.toastService.error('Speciality not found');
        this.router.navigate(['/speciality']);
        return;
      }

      this.formInitialData = {
        specialityName: speciality.specialityName,
     
      };
    },
    error: () => {
      this.toastService.error('Failed to load speciality');
      this.router.navigate(['/speciality']);
    }
  });
}

  /* ================= SAVE ================= */
  saveSpeciality(data: Partial<SpecialityModel>): void {

  const payload: any = {
    name: data.specialityName!.trim(),
    status: 1
  };

  if (this.isEditMode) {
    payload.id = this.specialityId;
    this.adminService.updateSpeciality(payload).subscribe({
      next: () => {
        this.toastService.success('Speciality updated successfully');
        this.adminService.clearSpecialityDropdownCache();
        this.router.navigate(['/speciality']);
      },
      error: err => {
        console.error('Update failed:', err);
        this.toastService.error('Update failed');
      }
    });
  } else {
    this.adminService.createSpeciality(payload).subscribe({
      next: () => {
        this.toastService.success('Speciality created successfully');
        this.adminService.clearSpecialityDropdownCache();
        this.router.navigate(['/speciality']);
      },
      error: err => {
        console.error('Save failed:', err);
        this.toastService.error('Save failed');
      }
    });
  }
}


  onCancel(): void {
    this.router.navigate(['/speciality']);
  }
}
