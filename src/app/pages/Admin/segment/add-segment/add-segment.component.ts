import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { SegmentService } from '../../../../service/segmentservice';
import { SegmentDto } from '../../../../models/segment';
import { ToastService } from '../../../../service/toast.service';
 
@Component({
  selector: 'app-add-segment',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './add-segment.component.html',
  styleUrl: './add-segment.component.css'
})
export class AddSegment implements OnInit {
 
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private segmentService: SegmentService,
    private toastService: ToastService
  ) { }
 
  /* ================= HEADER ================= */
  headerTitle = 'Add New Segment';
  headerBreadcrumbs: Breadcrumb[] = [];
 
  /* ================= FORM STATE ================= */
  isEditMode = false;
  formInitialData: any = {
    competitors: {}
  };
 
  // Dynamic dropdown options
  businessCategories: any[] = [];
  competitors: any[] = [];
 
  /* ================= ON INIT ================= */
  ngOnInit(): void {
    this.setupCreateMode();
    this.loadDropdownData();
  }
 
  /* ================= LOAD DROPDOWN DATA ================= */
  private loadDropdownData(): void {
    forkJoin({
      categories: this.segmentService.getCategories(),
      competitors: this.segmentService.getCompetitors()
    }).subscribe({
      next: (res) => {
        this.businessCategories = (res.categories || []).map(cat => ({
          label: cat.categoryName,
          value: cat.categoryId
        }));
        this.competitors = (res.competitors || []).map(comp => ({
          label: comp.competitorName,
          value: comp.competitorId
        }));
        this.updateFormFields();
      },
      error: (err) => console.error('Failed to load dropdown data', err)
    });
  }
 
  private updateFormFields(): void {
    this.buildSegmentFields();
  }
 
  /* ================= MODE SETUP ================= */
  private setupCreateMode(): void {
    this.isEditMode = false;
 
    this.headerTitle = 'Add New Segment';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Segment', route: '/segment' },
      { label: 'Add Segment' }
    ];
  }
 
  /* ================= FORM FIELDS ================= */
  segmentFields: any[] = [];
 
  private buildSegmentFields(): void {
    this.segmentFields = [
      { name: 'businessCategory', label: 'Business Category Name', placeholder: 'Select business category', type: 'select', required: true, options: this.businessCategories },
      { name: 'segmentName', label: 'Segment Name', placeholder: 'Enter segment name', type: 'text', required: true },
      { name: 'segmentDescription', label: 'Segment Description', placeholder: 'Enter segment description', type: 'textarea', required: false },
      { name: 'competitors', label: 'Competitors', placeholder: '-- Select Competitors --', type: 'checkbox', required: false, options: this.competitors }
    ];
  }
 
  /* ================= SAVE ================= */
  saveSegment(data: any): void {
    const selectedCompetitorIds: number[] = [];
    const selectedCompetitorNames: string[] = [];

    if (data.competitors && typeof data.competitors === 'object') {
      Object.keys(data.competitors).forEach(key => {
        if (data.competitors[key] === true) {
          const numKey = Number(key);
          if (!isNaN(numKey)) {
            if (!selectedCompetitorIds.includes(numKey)) {
              selectedCompetitorIds.push(numKey);
              const found = this.competitors.find(c => c.value === numKey);
              if (found && !selectedCompetitorNames.includes(found.label)) {
                selectedCompetitorNames.push(found.label);
              }
            }
          } else {
            const found = this.competitors.find(c => c.label === key || String(c.value) === key);
            if (found && typeof found.value === 'number') {
              if (!selectedCompetitorIds.includes(found.value)) {
                selectedCompetitorIds.push(found.value);
              }
              if (!selectedCompetitorNames.includes(found.label)) {
                selectedCompetitorNames.push(found.label);
              }
            } else {
              if (!selectedCompetitorNames.includes(key)) {
                selectedCompetitorNames.push(key);
              }
            }
          }
        }
      });
    }
 
    const payload: SegmentDto = {
      categoryId: Number(data.businessCategory),
      groupName: data.segmentName,
      description: data.segmentDescription || '',
      groupDescription: data.segmentDescription || '',
      competitorIds: selectedCompetitorIds.length > 0 ? selectedCompetitorIds : undefined,
      competitorNames: selectedCompetitorNames.length > 0 ? selectedCompetitorNames : undefined,
      groupStatus: 1
    };
 
    console.log('Saving segment:', payload);
 
    this.segmentService.createSegment(payload).subscribe({
      next: () => {
        console.log('Segment created successfully');
        this.toastService.success('Segment created successfully');
        this.router.navigate(['/segment']);
      },
      error: (err) => {
        console.error('Failed to create segment:', err);
        this.toastService.error('Failed to create segment');
        if (err.status === 401 || err.status === 403) {
          console.error('Authentication failed. Please login again.');
          this.router.navigate(['/segment']);
        }
      }
    });
  }
 
  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/segment']);
  }
}