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
    // 1. Fetch Categories
    this.segmentService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.map(cat => ({ label: cat.categoryName, value: cat.categoryId }));
        // 2. Fetch Competitors (for options)
        this.segmentService.getCompetitors().subscribe({
          next: (comps) => {
            this.competitors = comps.map(c => ({ label: c.competitorName, value: c.competitorName }));
            this.buildForm();
          },
          error: (err) => console.error('Failed to load competitors', err)
        });
      },
      error: (err) => console.error('Failed to load categories', err)
    });
 
    // 2. Load Statuses (Static - though hidden now)
    this.statuses = [
      { label: 'Active', value: 1 },
      { label: 'Inactive', value: 0 }
    ];
  }
 
  private buildForm(): void {
    this.segmentFields = [
      { name: 'categoryId', label: 'Business Category', type: 'select', required: true, options: this.categories },
      { name: 'groupName', label: 'Segment Name', type: 'text', required: true },
      { name: 'groupDescription', label: 'Description', type: 'textarea', required: false },
      // Competitors Field Added
      { name: 'competitors', label: 'Competitors', type: 'checkbox', options: this.competitors }
      // Group Status Field Removed
    ];
 
    this.loadSegment();
  }
 
  private loadSegment(): void {
    this.segmentService.getSegmentById(this.segmentId).subscribe({
      next: (segment: any) => {
        const categoryId = segment.productCategoryId || segment.category?.categoryId;
        let compsObj: any = {};

        const finishLoading = () => {
          this.initialData = {
            categoryId: categoryId || '',
            groupName: segment.groupName,
            groupDescription: segment.groupDescription,
            groupStatus: segment.groupStatus,
            competitors: compsObj
          };
        };

        if (segment.competitorNames && Array.isArray(segment.competitorNames) && segment.competitorNames.length > 0) {
          segment.competitorNames.forEach((name: string) => {
            compsObj[name] = true;
          });
          finishLoading();
        } else if (categoryId) {
          this.segmentService.getCompetitorsByCategoryId(categoryId).subscribe({
            next: (comps: any[]) => {
              if (Array.isArray(comps)) {
                comps.forEach((c: any) => {
                  const name = c.competitorName || c.name;
                  if (name) {
                    compsObj[name] = true;
                  }
                });
              }
              finishLoading();
            },
            error: () => finishLoading()
          });
        } else {
          finishLoading();
        }
      },
      error: (err) => {
        console.error('Failed to load segment', err);
        if (err.status === 403) {
          console.error('Permission denied. Please ensure you are logged in as Admin.');
        }
      }
    });
  }
 
  updateSegment(formData: any): void {
    // Transform competitors object { 'A': true } to list ['A']
    const selectedCompetitors: string[] = [];
    if (formData.competitors) {
      Object.keys(formData.competitors).forEach(key => {
        if (formData.competitors[key]) {
          selectedCompetitors.push(key);
        }
      });
    }
 
    const payload: SegmentDto = {
      categoryId: formData.categoryId,
      groupName: formData.groupName,
      description: formData.groupDescription,
      groupStatus: Number(this.initialData.groupStatus || 1), // Preserve hidden status
      competitorNames: selectedCompetitors
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
