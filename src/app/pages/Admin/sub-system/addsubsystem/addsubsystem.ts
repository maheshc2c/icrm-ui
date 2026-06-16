import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';

import { Adminservice } from '../../../../service/adminservice';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { SubsystemModel } from '../../../../models/subsystem-model';
import { ToastService } from '../../../../service/toast.service';


@Component({
  selector: 'app-addsubsystem',
  imports: [CommonModule, Header, Sidebar, Pageheader, Form],
  templateUrl: './addsubsystem.html',
  styleUrl: './addsubsystem.css',
})
export class Addsubsystem implements OnInit{


  constructor(
    private adminService: Adminservice,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  /* HEADER */
  headerTitle = 'Add Sub System';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* STATE */
  isEditMode = false;
  subCategoryId!: number;
  formInitialData: Partial<SubsystemModel> = {};

  /* FORM FIELDS */
  subsystemFields = [
    {
      name: 'subcategoryName',
      label: 'Sub System Name',
      type: 'text',
      placeholder: 'Enter Sub System',
      required: true
    },
    // {
    //   name: 'subcategoryStatus',
    //   label: 'Status',
    //   type: 'number',
    //   placeholder: 'Enter Status (1/0)',
    //   required: true
    // }
  ];

  /* INIT */
  ngOnInit(): void {

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam !== null) {
      this.isEditMode = true;
      this.subCategoryId = Number(idParam);

      this.headerTitle = 'Edit Sub System';

      this.headerBreadcrumbs = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'Sub System', route: '/sub-system' },
        { label: 'Edit Sub System' }
      ];

      this.loadSubSystemById(this.subCategoryId);
    }
  }

  /* LOAD FOR EDIT */
  private loadSubSystemById(id: number): void {

    this.adminService.getSubSystem().subscribe({
      next: (res: any) => {

        const list = Array.isArray(res) ? res : [res];
        const item = list.find(x => x.subCategoryId === id);

        if (!item) {
          this.toastService.error('Sub System not found');
<<<<<<< Updated upstream
          this.router.navigate(['/admin/sub-system']);
=======
          this.router.navigate(['/sub-system']);
>>>>>>> Stashed changes
          return;
        }

        this.formInitialData = {
          subcategoryName: item.subcategoryName,
          subcategoryStatus: item.subcategoryStatus
        };
      },
      error: () => {
        this.toastService.error('Failed to load Sub System');
<<<<<<< Updated upstream
        this.router.navigate(['/admin/sub-system']);
=======
        this.router.navigate(['/sub-system']);
>>>>>>> Stashed changes
      }
    });
  }

  /* SAVE */
  saveSubSystem(data: Partial<SubsystemModel>): void {

    if (!data.subcategoryName || data.subcategoryName.trim() === '') {
  this.toastService.error('Sub System Name is required');
  return;
}

    const payload: SubsystemModel = {
      subCategoryId: this.isEditMode ? this.subCategoryId : 0,
      subcategoryName: data.subcategoryName!,
      // subcategoryStatus: data.subcategoryStatus!,
       subcategoryStatus: 1, 
      subcategoryCreatedBy: 0
    };

    if (this.isEditMode) {

      this.adminService.updateSubSystem(this.subCategoryId, payload)
        .subscribe({
          next: () =>{ 
            this.toastService.success(
        'Sub System updated successfully'
      );
<<<<<<< Updated upstream
            this.router.navigate(['/admin/sub-system'])},
=======
            this.router.navigate(['/sub-system'])},
>>>>>>> Stashed changes
          error: err => {
            console.error(err);
            this.toastService.error(
        err?.error?.message || 'Failed to update Sub System'
      );
          }
        });

    } else {

      this.adminService.createSubSystem(payload)
        .subscribe({
          next: () =>{
             this.toastService.success(
        'Sub System created successfully'
      );
<<<<<<< Updated upstream
             this.router.navigate(['/admin/sub-system'])},
=======
             this.router.navigate(['/sub-system'])},
>>>>>>> Stashed changes
          error: err => {
            console.error(err);
            this.toastService.error(
        err?.error?.message || 'Failed to create Sub System'
      );
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/sub-system']);
  }
}


