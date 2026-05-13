import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Categoryservice } from '../../../../service/categoryservice';
import { Breadcrumb } from '../../../../models/breadcrumb';

@Component({
  selector: 'app-addcategory',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addcategory.html',
  styleUrls: ['./addcategory.css']
})
export class AddcategoryComponent implements OnInit {
  /* ================= HEADER ================= */
  headerTitle: string = 'Add Product Category';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= FORM STATE ================= */
  isEditMode: boolean = false;
  categoryId: number | null = null;
  model: any = {};

  /* ================= FORM FIELDS ================= */
  categoryFields: any[] = [
    {
      name: 'categoryName',
      label: 'Category Name',
      placeholder: 'Enter category name',
      type: 'text',
      required: true
    },
    {
      name: 'categoryDescription',
      label: 'Description',
      placeholder: 'Enter description',
      type: 'text',
      required: true
    }
  ];

  constructor(
    private categoryService: Categoryservice,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log('AddCategory component initialized');
    
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Extracted ID:', id);

    if (id) {
      console.log('Setting up edit mode for ID:', id);
      this.setupEditMode(+id);
    } else {
      console.log('Setting up create mode');
      this.setupCreateMode();
    }
  }

  /* ================= MODE SETUP ================= */
  private setupEditMode(id: number): void {
    this.isEditMode = true;
    this.categoryId = id;

    this.headerTitle = 'Edit Product Category';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Product', route: '/admin/category' },
      { label: 'Category', route: '/admin/category' },
      { label: 'Edit Category' }
    ];

    this.loadCategory(id);
  }

  private setupCreateMode(): void {
    this.isEditMode = false;

    this.headerTitle = 'Add Product Category';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Product', route: '/admin/category' },
      { label: 'Category', route: '/admin/category' },
      { label: 'Add Category' }
    ];
  }

  /* ================= LOAD CATEGORY FOR EDIT ================= */
  loadCategory(id: number): void {
    console.log('Loading category for edit, ID:', id);
    
    this.categoryService.getCategories().subscribe({
      next: (categories: any[]) => {
        const category = categories.find(c => c.categoryId === id);
        if (category) {
          this.model = {
            categoryName: category.categoryName,
            categoryDescription: category.categoryDescription
          };
          console.log('Category loaded:', this.model);
        } else {
          alert('Category not found');
          this.router.navigate(['/admin/category']);
        }
      },
      error: (err: any) => {
        console.error('Failed to load category:', err);
        alert('Failed to load category');
      }
    });
  }

  /* ================= SAVE CATEGORY ================= */
  saveCategory(data: any): void {
    console.log('========== SAVING CATEGORY ==========');
    console.log('Form data received:', data);
    console.log('Is Edit Mode:', this.isEditMode);

    if (!data.categoryName || !data.categoryDescription) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.isEditMode && this.categoryId) {
      // Update existing category
      this.categoryService.updateCategory(this.categoryId, data).subscribe({
        next: (response) => {
          console.log('Category updated:', response);
          alert('Category updated successfully!');
          this.router.navigate(['/admin/category']);
        },
        error: (err) => {
          console.error('Update failed:', err);
          alert('Failed to update category');
        }
      });
    } else {
      // Create new category
      this.categoryService.createCategory(data).subscribe({
        next: (response) => {
          console.log('Category created:', response);
 
          this.router.navigate(['/admin/category']);
        },
        error: (err) => {
          console.error('Create failed:', err);
          alert('Failed to create category');
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/admin/category']);
  }
}
