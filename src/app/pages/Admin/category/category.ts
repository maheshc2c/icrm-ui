import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataTable } from '../../../shared/data-table/data-table';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Categoryservice } from '../../../service/categoryservice';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, DataTable, Pageheader, Header, Sidebar],
  templateUrl: './category.html',
  styleUrls: ['./category.css']
})
export class CategoryComponent implements OnInit {
  /* ================= DATA ================= */
  categories: any[] = [];
  fullRows: any[] = [];
  rows: any[] = [];
  loading: boolean = true;

  /* ================= HEADER ================= */
  headerTitle: string = 'Product Category Management';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Product', route: '/admin/category' },
    { label: 'Category', route: '/admin/category' }
  ];

  /* ================= TABLE CONFIG ================= */
  columns: any[] = [
    { header: 'Category Name', field: 'categoryName' },
    { header: 'Description', field: 'categoryDescription' }
  ];

  /* ================= SEARCH CONFIG ================= */
  searchFields: SearchFieldConfig[] = [
    {
      key: 'searchKeyword',
      label: 'Category Name',
      placeholder: 'Enter category name',
      type: 'text'
    }
  ];

  constructor(
    private categoryService: Categoryservice,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('Category component initialized');
    this.loadCategories();
  }

  /* ================= DATA LOADING ================= */
  loadCategories(): void {
    this.loading = true;
    console.log('Loading categories...');

    this.categoryService.getCategories().subscribe({
      next: (categories: any[]) => {
        console.log('Category API Response:', categories);
        console.log('Total categories:', categories.length);
        
        this.fullRows = categories;
        this.rows = categories.map((c, index) => ({
          id: c.categoryId,
          categoryName: c.categoryName || 'N/A',
          categoryDescription: c.categoryDescription || 'N/A'
        }));
        
        console.log('Total rows created:', this.rows.length);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load categories:', err);
        this.loading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /* ================= SEARCH FUNCTIONALITY ================= */
  onSearch(searchData: any): void {
    console.log('Search data:', searchData);

    if (!searchData || !searchData.searchKeyword || searchData.searchKeyword.trim() === '') {
      this.loadCategories();
      return;
    }

    const keyword = searchData.searchKeyword.trim();
    console.log('Searching for:', keyword);

    this.categoryService.searchCategory(keyword).subscribe({
      next: (results: any[]) => {
        console.log('Search API Response:', results);
        this.fullRows = results;
        this.rows = results.map((c) => ({
          id: c.categoryId,
          categoryName: c.categoryName || 'N/A',
          categoryDescription: c.categoryDescription || 'N/A'
        }));
      },
      error: (err: any) => {
        console.error('Search failed:', err);
      
      }
    });
  }

  /* ================= ACTION HANDLERS ================= */
  onAdd(): void {
    this.router.navigate(['/admin/addcategory']);
  }

  onEdit(category: any): void {
    console.log('Edit category:', category);
    if (!category.id) {
      alert('Cannot edit: Category ID not found');
      return;
    }
    this.router.navigate(['/admin/editcategory', category.id]);
  }

  onDelete(category: any): void {
    if (confirm(`Are you sure you want to delete ${category.categoryName}?`)) {
      console.log('Delete category:', category);
      alert('Delete functionality not implemented yet');
    }
  }

  onImport(): void {
    console.log('Downloading categories...');
    
    if (!this.fullRows || this.fullRows.length === 0) {
      alert('No data available to export');
      return;
    }

    this.categoryService.downloadCategoryExcel(this.fullRows).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Categories.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Export failed:', err);
        alert('Export failed');
      }
    });
  }
}
