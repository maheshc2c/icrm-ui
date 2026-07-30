import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { SegmentDto } from '../../../../models/segment';
import { SegmentService } from '../../../../service/segmentservice';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Adminservice } from '../../../../service/adminservice';
import { ToastService } from '../../../../service/toast.service';

@Component({
  selector: 'app-edit-segment',
  standalone: true,
  imports: [CommonModule, Pageheader, Form, Header, Sidebar],
  templateUrl: './edit-segment.component.html',
  styleUrls: ['./edit-segment.component.css']
})
export class EditSegment implements OnInit {

   segmentId!: number;
  initialData: any = null;
 
  // Dynamic dropdown options
  categories: any[] = [];
  competitors: any[] = [];
  statuses: any[] = [];
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private segmentService: SegmentService,
    private toastService: ToastService
  ) { }
 
  headerTitle = 'Edit Segment';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admin' },
    { label: 'Segment', route: '/segment' },
    { label: 'Edit' }
  ];
 
  segmentFields: any[] = [];
 
  ngOnInit(): void {
    this.segmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDropdownData();
  }
 
  private loadDropdownData(): void {
    forkJoin({
      categories: this.segmentService.getCategories(),
      competitors: this.segmentService.getCompetitors()
    }).subscribe({
      next: (res) => {
        this.categories = (res.categories || []).map(cat => ({
          label: cat.categoryName,
          value: cat.categoryId
        }));
        this.competitors = (res.competitors || []).map(c => ({
          label: c.competitorName,
          value: c.competitorId
        }));
        this.buildForm();
      },
      error: (err) => {
        console.error('Failed to load dropdown data', err);
        this.buildForm();
      }
    });

    this.statuses = [
      { label: 'Active', value: 1 },
      { label: 'Inactive', value: 0 }
    ];
  }
 
  private buildForm(): void {
    this.segmentFields = [
      { name: 'categoryId', label: 'Business Category', placeholder: 'Select Business Category', type: 'select', required: true, options: this.categories },
      { name: 'groupName', label: 'Segment Name', placeholder: 'Enter segment name', type: 'text', required: true },
      { name: 'groupDescription', label: 'Description', placeholder: 'Enter description', type: 'textarea', required: false },
      { name: 'competitors', label: 'Competitors', placeholder: '-- Select Competitors --', type: 'checkbox', options: this.competitors }
    ];
 
    this.loadSegment();
  }
 
  private loadSegment(): void {
    this.segmentService.getSegmentById(this.segmentId).subscribe({
      next: (segment: any) => {
        console.log('Loaded segment details for edit:', segment);
        const categoryId = segment.categoryId || segment.productCategoryId || segment.category?.categoryId;
        const description = segment.description || segment.groupDescription || '';
        const compsObj: any = {};

        if (segment.competitors && Array.isArray(segment.competitors) && segment.competitors.length > 0) {
          segment.competitors.forEach((c: any) => {
            if (typeof c === 'object' && c !== null) {
              if (c.competitorId !== undefined && c.competitorId !== null) {
                compsObj[c.competitorId] = true;
              }
              if (c.competitorName) {
                compsObj[c.competitorName] = true;
              }
            } else if (c !== undefined && c !== null) {
              compsObj[c] = true;
            }
          });
        } else if (segment.competitorIds && Array.isArray(segment.competitorIds) && segment.competitorIds.length > 0) {
          segment.competitorIds.forEach((id: any) => {
            compsObj[id] = true;
          });
        } else if (segment.competitorNames && Array.isArray(segment.competitorNames) && segment.competitorNames.length > 0) {
          segment.competitorNames.forEach((name: string) => {
            compsObj[name] = true;
          });
        }

        this.setInitialData(categoryId, segment, description, compsObj);
      },
      error: (err) => {
        console.error('Failed to load segment:', err);
        if (err.status === 403) {
          console.error('Permission denied. Please ensure you are logged in as Admin.');
        }
      }
    });
  }

  private setInitialData(categoryId: any, segment: any, description: string, compsObj: any): void {
    this.initialData = {
      categoryId: categoryId ? Number(categoryId) : '',
      groupName: segment.groupName || '',
      groupDescription: description,
      groupStatus: segment.status ?? segment.groupStatus ?? 1,
      competitors: compsObj
    };
  }
 
  updateSegment(formData: any): void {
    const selectedCompetitorIds: number[] = [];
    const selectedCompetitorNames: string[] = [];

    if (formData.competitors && typeof formData.competitors === 'object') {
      Object.keys(formData.competitors).forEach(key => {
        if (formData.competitors[key]) {
          const numKey = Number(key);
          if (!isNaN(numKey)) {
            selectedCompetitorIds.push(numKey);
            const found = this.competitors.find(c => c.value === numKey);
            if (found) {
              selectedCompetitorNames.push(found.label);
            }
          } else {
            selectedCompetitorNames.push(key);
            const found = this.competitors.find(c => c.label === key || c.value === key);
            if (found && typeof found.value === 'number') {
              selectedCompetitorIds.push(found.value);
            }
          }
        }
      });
    }

    const payload: SegmentDto = {
      categoryId: Number(formData.categoryId),
      groupName: formData.groupName,
      description: formData.groupDescription,
      groupDescription: formData.groupDescription,
      groupStatus: Number(this.initialData?.groupStatus ?? 1),
      competitorIds: selectedCompetitorIds,
      competitorNames: selectedCompetitorNames
    };

    console.log('Updating segment:', payload);

    this.segmentService.updateSegment(this.segmentId, payload).subscribe({
      next: () => {
        console.log('Segment updated successfully');
        this.toastService.success('Segment updated successfully');
        this.router.navigate(['/segment']);
      },
      error: (err) => {
        console.error('Failed to update segment:', err);
        this.toastService.error('Failed to update segment');
        if (err.status === 403) {
          console.error('Update failed: 403 Forbidden. Check permissions.');
        }
      }
    });
  }
 
  onCancel(): void {
    this.router.navigate(['/segment']);
  }
}
