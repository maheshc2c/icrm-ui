import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { SegmentService } from '../../../../service/segmentservice';
import { SegmentDto } from '../../../../models/segment';
 
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
    private segmentService: SegmentService
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
    // 1. Fetch Categories
    this.segmentService.getCategories().subscribe({
      next: (data) => {
        this.businessCategories = data.map(cat => ({ label: cat, value: cat }));
        this.updateFormFields(); // Refresh fields with new data
      },
      error: (err) => console.error('Failed to load categories', err)
    });
 
    // 2. Fetch Competitors
    this.segmentService.getCompetitors().subscribe({
      next: (data) => {
        this.competitors = data.map(comp => ({
          label: comp.competitorName,
          value: comp.competitorName
        }));
        this.updateFormFields(); // Refresh fields with new data
      },
      error: (err) => console.error('Failed to load competitors', err)
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
      { label: 'Home', route: '/admin' },
      { label: 'Segment', route: '/admin/segment' },
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
      { name: 'competitors', label: 'Competitors', type: 'checkbox', required: false, options: this.competitors }
    ];
  }
 
  /* ================= SAVE ================= */
  saveSegment(data: any): void {
    // Convert checkbox object to array of selected competitor names
    const selectedCompetitors: string[] = [];
    if (data.competitors && typeof data.competitors === 'object') {
      Object.keys(data.competitors).forEach(key => {
        if (data.competitors[key] === true) {
          selectedCompetitors.push(key);
        }
      });
    }
 
    // Map form data to DTO matching backend GroupDto structure
    const payload: SegmentDto = {
      categoryName: data.businessCategory,
      groupName: data.segmentName,
      groupDescription: data.segmentDescription || '',
      competitorNames: selectedCompetitors.length > 0 ? selectedCompetitors : undefined,
      groupStatus: 1
    };
 
    console.log('Saving segment:', payload);
 
    this.segmentService.createSegment(payload).subscribe({
      next: () => {
        console.log('Segment created successfully');
        this.router.navigate(['/admin/segment']);
      },
      error: (err) => {
        console.error('Failed to create segment:', err);
        if (err.status === 401 || err.status === 403) {
          console.error('Authentication failed. Please login again.');
          this.router.navigate(['/admin/segment']);
        }
      }
    });
  }
 
  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/admin/segment']);
  }
}