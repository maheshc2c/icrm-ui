import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { DataTable } from '../../../shared/data-table/data-table';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { SegmentService } from '../../../service/segmentservice';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Adminservice } from '../../../service/adminservice';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
import { ToastService } from '../../../service/toast.service';
 
@Component({
  standalone: true,
  selector: 'app-segment',
  imports: [
    CommonModule,
    Header,
    Sidebar,
    Pageheader,
    DataTable
  ],
  providers: [],
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.css']
})
export class SegmentComponent implements OnInit {
  role: string | null = null;
 
  constructor(
     private adminservice: Adminservice,
    private router: Router,
    private route: ActivatedRoute,
    private segmentService: SegmentService,
    private confirmService: ConfirmDialogService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
 
  headerTitle = 'Segment List';
 
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admin' },
    { label: 'Segment', route: '/segment' }
  ];
 
  columns = [
    { header: 'Business Category', field: 'businessCategory' },
    { header: 'Segment', field: 'segmentName' },
    { header: 'Description', field: 'segmentDescription' }
  ];
 
  rows: any[] = [];
 
  searchFields: SearchFieldConfig[] = [
    { key: 'businessCategory', label: 'Business Category', type: 'text', placeholder: 'Search by Category' },
    { key: 'segmentName', label: 'Segment Name', type: 'text', placeholder: 'Search by Segment' }
  ];
 
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('role');
    }
    this.loadSegments();
  }
 
  loadSegments(): void {
    this.segmentService.getSegments().subscribe({
      next: (segments) => {
        // Sort descending by groupId to show newest first
        segments.sort((a: any, b: any) => (b.groupId || 0) - (a.groupId || 0));
        
         this.fullRows = segments;
        this.rows = segments.map((segment) => ({
          groupId: segment.groupId,
          businessCategory: segment.category?.categoryName ?? '',
          segmentName: segment.groupName ?? '',
          segmentDescription: segment.groupDescription ?? '',
          groupStatus: segment.groupStatus
        }));
      },
      error: (err: any) => {
        console.error('Failed to load segment list:', err);
        if (err.status === 401 || err.status === 403) {
          console.error('Authentication failed. Please login again.');
          this.router.navigate(['/admin/product']);
        }
      }
    });
  }
 
  onSearch(searchData?: any): void {
    console.log('Search data received (Client-side):', searchData);
 
    let searchCategory = '';
    let searchSegment = '';
 
    if (typeof searchData === 'string') {
      searchSegment = searchData.toLowerCase().trim();
    } else if (searchData && typeof searchData === 'object') {
      searchCategory = (searchData.businessCategory || '').toLowerCase().trim();
      searchSegment = (searchData.segmentName || '').toLowerCase().trim();
    }
 
    if (!searchCategory && !searchSegment) {
      // 🔁 Restore full list from fullRows
      this.rows = this.fullRows.map((segment) => ({
        groupId: segment.groupId,
        businessCategory: segment.category?.categoryName ?? '',
        segmentName: segment.groupName ?? '',
        segmentDescription: segment.groupDescription ?? '',
        groupStatus: segment.groupStatus
      }));
      return;
    }
 
    // Filter fullRows locally
    const filtered = this.fullRows.filter(segment => {
      const category = (segment.category?.categoryName || '').toLowerCase();
      const groupName = (segment.groupName || '').toLowerCase();
 
      const matchesCategory = searchCategory ? category.includes(searchCategory) : true;
      const matchesSegment = searchSegment ? (groupName.includes(searchSegment) || category.includes(searchSegment)) : true;
 
      return matchesCategory && matchesSegment;
    });
 
    // Update table rows
    this.rows = filtered.map((segment) => ({
      groupId: segment.groupId,
      businessCategory: segment.category?.categoryName ?? '',
      segmentName: segment.groupName ?? '',
      segmentDescription: segment.groupDescription ?? '',
      groupStatus: segment.groupStatus
    }));
  }
 
  // onImport(): void {
  //   console.log("Import Clicked");
  // }
 
 
    fullRows: any[] = [];
 
 
onImport() {
 
  if (!this.fullRows || this.fullRows.length === 0) {
    alert('No data available');
    return;
  }
 
  this.adminservice.downloadGroup(this.fullRows).subscribe({
    next: (blob: Blob) => {
 
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Segment.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: err => {
      console.error('Download failed:', err);
      alert(`Download failed: ${err.status}`);
    }
  });
}
 
 
  onAdd(): void {
    this.router.navigate(['/segment/add']);
  }
 
  onEdit(row: any): void {
    console.log('Edit received in Segment:', row);
    this.router.navigate(['/segment/edit', row.groupId]);
  }
 
  onDelete(row: any) {
    const id = row.groupId;
    if (!id) return;

    const isActive = Number(row.groupStatus) === 1;

    this.confirmService.confirm({
      title: 'Confirm',
      message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this segment?`,
      confirmText: isActive ? 'Deactivate' : 'Activate'
    }).then((confirmed) => {
      if (!confirmed) return;

      const apiCall = isActive
        ? this.segmentService.deactivateSegment(id)
        : this.segmentService.activateSegment(id);

      apiCall.subscribe({
        next: () => {
          row.groupStatus = isActive ? 2 : 1;
          this.rows = [...this.rows];
          this.fullRows = [...this.fullRows];
          this.toastService.success(`Segment ${isActive ? 'deactivated' : 'activated'} successfully`);
        },
        error: err => {
          console.error('Status update failed', err);
          this.toastService.error('Failed to update status');
        }
      });
    });
  }
}