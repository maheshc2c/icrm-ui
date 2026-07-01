import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';

import { Adminservice } from '../../../../service/adminservice';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { CompetitorModel } from '../../../../models/competitor-model';
import { ToastService } from '../../../../service/toast.service';

@Component({
  selector: 'app-add-competitor',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader, Form],
  templateUrl: './add-competitor.html',
  styleUrl: './add-competitor.css'
})
export class AddCompetitor implements OnInit {


  constructor(
    private adminService: Adminservice,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}



  /* ================= HEADER ================= */
  headerTitle = 'Add Competitor';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= STATE ================= */
  isEditMode = false;
  competitorId!: number;
  formInitialData: Partial<CompetitorModel> = {};

  /* ================= FORM FIELDS ================= */
  competitorFields = [
    {
      name: 'competitorName',
      label: 'Competitor Name',
      type: 'text',
      placeholder: 'Enter competitor name',
      required: true
    },
    {
      name: 'competitorRating',
      label: 'Competitor Rating',
      type: 'number',
      placeholder: 'Enter rating',
      required: true,
      min: 1,
    max: 10
    }
  ];


  /* ================= INIT ================= */
  ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('id');

  if (idParam !== null) {
    this.isEditMode = true;
    this.competitorId = Number(idParam);

    this.headerTitle = 'Edit Competitor';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Competitor', route: '/competitor' },
      { label: 'Edit Competitor' }
    ];

    this.loadCompetitorById(this.competitorId);
  } else {
    this.isEditMode = false;
    this.headerTitle = 'Add Competitor';
  }
}


  /* ================= LOAD ================= */
  private loadCompetitorById(id: number): void {
  this.adminService.getCompetitors().subscribe({
    next: (response: any) => {

      const competitors = response.content;

      const competitor = competitors.find(
        (c: CompetitorModel) => c.competitorId === id
      );

      if (!competitor) {
         this.toastService.error('Competitor not found');
        this.router.navigate(['/competitor']);
        return;
      }

      this.formInitialData = {
        competitorName: competitor.competitorName,
        competitorRating: competitor.competitorRating
      };
    },
    error: () => {
      this.toastService.error('Failed to load competitor');
      this.router.navigate(['/competitor']);
    }
  });
}

  /* ================= SAVE ================= */
  saveCompetitor(data: Partial<CompetitorModel>): void {

    // Competitor Name Validation
  if (!data.competitorName || data.competitorName.trim() === '') {
  this.toastService.error('Competitor Name is required');
  return;
}

    if (this.isEditMode) {
      // ✅ FULL MODEL FOR UPDATE
      const payload: CompetitorModel = {
        competitorId: this.competitorId,
        competitorName: data.competitorName!,
        competitorRating: data.competitorRating!,
        // status: 1
      };

      this.adminService.updateCompetitor(this.competitorId, payload).subscribe({
        next: () =>
         { 
          this.toastService.success('Competitor updated successfully');
          this.router.navigate(['/competitor'])
         },
        error: err => {
          console.error(err);
          this.toastService.error('Failed to create competitor');
        }
      });

    } else {
      // ✅ FULL MODEL FOR CREATE
      const payload: CompetitorModel = {
        competitorId: 0, // backend will generate
        competitorName: data.competitorName!,
        competitorRating: data.competitorRating!,
        // status: 1
      };

      this.adminService.createCompetitor(payload).subscribe({
        next: () => {
          this.toastService.success('Competitor created successfully');
          this.router.navigate(['/competitor'])}
        ,
        error: err => {
          console.error(err);
          this.toastService.error('Failed to update competitor');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/competitor']);
  }
}
