import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { ProductService } from '../../../../service/productservice';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ToastService } from '../../../../service/toast.service';
 
@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  providers: [ProductService],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProduct implements OnInit {
 
  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) { }
 
  /* ================= HEADER ================= */
  headerTitle = 'Add New Product';
  headerBreadcrumbs: Breadcrumb[] = [];
 
  /* ================= FORM STATE ================= */
  isEditMode = false;
  formInitialData: any = {};
 
  // Dynamic dropdown options
  categories: any[] = [];
  segments: any[] = [];
  subSystems: any[] = [];
  productTypes: any[] = [];
 
  /* ================= ON INIT ================= */
  ngOnInit(): void {
    this.setupCreateMode();
    this.loadDropdownData();
  }
 
  /* ================= LOAD DROPDOWN DATA ================= */
  private loadDropdownData(): void {
    // Lead categories
    this.productService.getCategoriesFull().subscribe({
      next: (data) => {
        this.updateFieldOptions('productCategory', data.map(c => ({
          label: c.categoryName,
          value: c.categoryName
        })));
      },
      error: (err) => console.error('Failed to load categories:', err)
    });
 
    // Load Product Types
    this.productService.getProductTypesFull().subscribe({
      next: (data) => {
        this.updateFieldOptions('productType', data.map(t => ({
          label: t.typeName,
          value: t.typeName
        })));
      },
      error: (err) => console.error('Failed to load product types:', err)
    });
 
    // Load Sub Systems (SubCategories)
    this.productService.getSubCategoriesFull().subscribe({
      next: (data) => {
        this.updateFieldOptions('productSubSystem', data.map(s => ({
          label: s.subcategoryName,
          value: s.subcategoryName
        })));
      },
      error: (err) => console.error('Failed to load sub systems:', err)
    });
  }
 
  /* ================= MODE SETUP ================= */
  private setupCreateMode(): void {
    this.isEditMode = false;
 
    this.headerTitle = 'Add New Product';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admin' },
      { label: 'Product', route: '/admin/product' },
      { label: 'Add Product' }
    ];
  }
 
  /* ================= FORM FIELDS ================= */
  productFields = [
    { name: 'productCode', label: 'Product Code', placeholder: 'Product Code', type: 'text', required: true },
    { name: 'productCategory', label: 'Category', placeholder: 'Select Category', type: 'select', required: true, options: [] }, // Dynamic
    { name: 'productSegment', label: 'Segment', placeholder: 'Select Segment', type: 'select', required: true, options: [] }, // Dynamic key: Group
    { name: 'productSubSystem', label: 'Sub System', placeholder: 'Select Sub System', type: 'select', required: true, options: [] }, // Dynamic
    { name: 'productName', label: 'Product Name', placeholder: 'Product Name', type: 'text', required: true },
    { name: 'productDescription', label: 'Description', placeholder: 'Product Description', type: 'textarea', required: false }, // optional
    { name: 'productType', label: 'Product Type', placeholder: 'Select Product Type', type: 'select', required: true, options: [] }, // Dynamic
    {
      name: 'productTarget', label: 'Target', type: 'radio', required: false, options: [
        { label: 'Yes', value: 1 },
        { label: 'No', value: 0 }
      ]
    },
    {
      name: 'productAvailability', label: 'Availability', type: 'radio', required: false, options: [
        { label: 'Active', value: 1 },
        { label: 'Inactive', value: 0 }
      ]
    },
    { name: 'productMrp', label: 'MRP', placeholder: 'MRP', type: 'number', required: true }, // *
    { name: 'productBasePrice', label: 'Base Price', placeholder: 'Base Price', type: 'number', required: true }, // *
    { name: 'productGst', label: 'GST In %', placeholder: 'GST', type: 'number', required: true }, // *
    { name: 'productFreightInsurance', label: 'Freight Insurance In %', placeholder: 'Freight Insurance', type: 'number', required: true }, // *
    { name: 'productRrp', label: 'RRP', placeholder: 'RRP', type: 'number', required: true }, // *
    { name: 'productDp', label: 'DP', placeholder: 'DP', type: 'number', required: true }, // *
    { name: 'productTechnicalSpecifications', label: 'Technical Specifications', placeholder: 'Technical Specifications', type: 'textarea', required: false },
    { name: 'productScopeOfSupply', label: 'Scope of Supply', placeholder: 'Scope of Supply', type: 'textarea', required: false }
  ];
 
  /* ================= DYNAMIC LOGIC ================= */
  onFieldChange(event: { name: string, value: any }): void {
    console.log('AddProduct: onFieldChange', event);
 
    if (event.name === 'productCategory') {
      const selectedCategoryName = event.value;
 
      if (selectedCategoryName) {
        // Fetch groups (Segments) by NAME using search API
        console.log('Fetching segments for category Name using search:', selectedCategoryName);
        this.productService.searchGroups(selectedCategoryName).subscribe({
          next: (data) => {
            console.log('Segments fetched via search:', data);
            this.segments = data;
            this.updateFieldOptions('productSegment', this.segments.map(g => ({
              label: g.groupName,
              value: g.groupName
            })));
          },
          error: (err) => console.error('Failed to load segments:', err)
        });
      } else {
        this.updateFieldOptions('productSegment', []);
      }
    }
  }
 
  private updateFieldOptions(fieldName: string, options: any[]): void {
    const field = this.productFields.find(f => f.name === fieldName);
    if (field) {
      field.options = options;
      // Trigger change detection for child components by updating the array reference
      this.productFields = [...this.productFields];
    }
  }
 
  /* ================= SAVE ================= */
  saveProduct(data: any): void {
    const payload = {
      ...data,
      // Ensure mapping is correct
      productSecondaryName: data.productCode, // Map productCode back to backend's productSecondaryName
      groupName: data.productSegment, // Segment -> Group
      categoryName: data.productCategory,
      subCategoryName: data.productSubSystem,
      typeName: data.productType,
      productFeatures: data.productTechnicalSpecifications, // Map form fields to backend names
      productScope: data.productScopeOfSupply,
      productStatus: 1 // Always active record
    };
 
    this.productService.createProduct(payload).subscribe({
      next: () => {
        this.toastService.success('Product Created Successfully!');
        this.router.navigate(['/admin/product']);
      },
      error: err => {
        console.error('Create failed', err);
        this.toastService.error('Failed to create product');
      }
    });
  }
 
  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/admin/product']);
  }
}