import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Adminservice } from '../../../service/adminservice';
import { SearchFieldConfig } from '../../../shared/search/search';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-speciality',
  imports: [Header, Sidebar, Pageheader, DataTable],
  templateUrl: './speciality.html',
  styleUrl: './speciality.css',
})
export class Speciality implements OnInit {

  constructor(
    private adminservice: Adminservice,
    private router: Router,
    private route: ActivatedRoute,
    private confirmService: ConfirmDialogService,
    private toastService: ToastService
  ) {}

  headerTitle = 'Manage Speciality';
  
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Speciality', route: '/speciality' }
  ];

  columns = [
    { header: 'Name', field: 'specialityName' },
  ];

  rows: any[] = [];
  fullRows: any[] = [];
  searchFilters: any = {};
  allSpecialities: any[] = [];

  totalElements = 0;
  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.adminservice.getSpecialityDropDown().subscribe({
      next: (res: any) => {
        this.allSpecialities = Array.isArray(res) ? res : (res?.content || []);
        this.loadSpeciality();
      },
      error: () => {
        this.loadSpeciality();
      }
    });
  }

  private loadSpeciality(): void {
    const keyword = this.searchFilters.specialityName || null;
    
    this.adminservice.searchSpeciality(
      keyword,
      this.currentPage - 1, 
      this.pageSize,
      'specialityName',
      'asc'
    ).subscribe({
      next: (res: any) => {
        const specialities = Array.isArray(res) ? res : (res?.content || []);
        
        // If it's a flat array, we can't know the true filtered total elements from the backend.
        // We'll approximate it by filtering the allSpecialities list locally just for the count.
        if (Array.isArray(res)) {
           const localFiltered = keyword 
             ? this.allSpecialities.filter(s => s.specialityName.toLowerCase().includes(keyword.toLowerCase()))
             : this.allSpecialities;
           this.totalElements = localFiltered.length;
        } else {
           this.totalElements = res?.totalElements || 0;
        }

        this.fullRows = specialities;

        this.rows = specialities.map((item: any, index: number) => {
          // If the backend returned a flat string, map it to the full object (legacy fallback)
          const nameStr = typeof item === 'string' ? item : (item.name || item.specialityName);
          const fullObj = typeof item === 'string' 
            ? this.allSpecialities.find(s => s.specialityName === nameStr)
            : item;

          return {
            sno: (this.currentPage - 1) * this.pageSize + index + 1,
            specialityId: fullObj?.id || fullObj?.specialityId || null,
            specialityName: nameStr,
            specialityStatus: fullObj?.status ?? fullObj?.specialityStatus ?? 1
          };
        });
      },
      error: (err) => {
        console.error('Failed to load specialities', err);
      }
    });
  }

  onDelete(row: any) {
    const Id = row?.specialityId;
    if (!Id) {
      return;
    }
    
    const status = Number(row?.specialityStatus);
    const isActive = status === 1;

    this.confirmService.confirm({
      title: 'Confirm',
      message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this speciality?`,
      confirmText: isActive ? 'Deactivate' : 'Activate'
    }).then((confirmed) => {
      if (!confirmed) return;

      this.adminservice.toggleSpeciality(Id).subscribe({
        next: () => {
          this.adminservice.clearSpecialityDropdownCache();
          row.specialityStatus = isActive ? 2 : 1;
          this.rows = [...this.rows];
          this.fullRows = [...this.fullRows];
          this.toastService.success(`Speciality ${isActive ? 'deactivated' : 'activated'} successfully`);
          this.loadSpeciality();
        },
        error: (err) => {
          console.error('Status update failed', err);
          this.toastService.error('Failed to update status');
        }
      });
    });
  }

  onAdd() {
    this.router.navigate(['speciality/add']);
  }

  onEdit(row: any) {
    this.router.navigate(['speciality/edit', row.specialityId]); 
  }

  searchFields: SearchFieldConfig[] = [
    {
      key: 'specialityName',
      label: 'Speciality',
      placeholder: 'Name',
      type: 'text'
    }
  ];

  onSearch(keyword: string) {
    this.searchFilters = { specialityName: keyword?.trim() };
    this.currentPage = 1;
    this.loadSpeciality();
  }
  
  onSearchChange(filters: any) {
    this.searchFilters = { ...filters };
    this.currentPage = 1;
    this.loadSpeciality();
  }

  onImport() {
    const keyword = this.searchFilters.specialityName || null;
    
    this.adminservice.downloadSpecialityExcel(
      keyword,
      0,
      100000,
      'specialityId',
      'desc'
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Specialities.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed:', err);
        alert('Download failed');
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadSpeciality();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadSpeciality();
  }
}
