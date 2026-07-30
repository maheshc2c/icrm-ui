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
  allSegments: any[] = [];
  subSystems: any[] = [];
  productTypes: any[] = [];
 
  /* ================= ON INIT ================= */
  ngOnInit(): void {
    this.setupCreateMode();
    this.loadDropdownData();
  }
 
  /* ================= LOAD DROPDOWN DATA ================= */
  /* ================= LOAD DROPDOWN DATA ================= */
  private loadDropdownData(): void {
    // 1. Lead categories
    this.productService.getCategoriesFull().subscribe({
      next: (data) => {
        this.categories = data;
        this.updateFieldOptions('productCategory', data.map(c => ({
          label: c.categoryName,
          value: c.categoryName
        })));
      },
      error: (err) => console.error('Failed to load categories:', err)
    });
 
    // 2. Load all Product Segments / Groups for reference
    this.productService.searchGroups('').subscribe({
      next: (data) => {
        this.allSegments = data || [];
      },
      error: (err) => console.error('Failed to load segments:', err)
    });
 
    // 3. Load Product Types
    this.productService.getProductTypesFull().subscribe({
      next: (data) => {
        this.productTypes = data;
        this.updateFieldOptions('productType', data.map(t => ({
          label: t.typeName,
          value: t.typeName
        })));
      },
      error: (err) => console.error('Failed to load product types:', err)
    });
 
    // 4. Load Sub Systems (SubCategories)
    this.productService.getSubCategoriesFull().subscribe({
      next: (data) => {
        this.subSystems = data;
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
      { label: 'Product', route: '/product' },
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
      name: 'productTarget', label: 'Target', type: 'radio', required: true, options: [
        { label: 'Yes', value: '1' },
        { label: 'No', value: '0' }
      ]
    },
    {
      name: 'productAvailability', label: 'Availability', type: 'radio', required: true, options: [
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' }
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
 
  /* ================= DYNAMIC CASCADING LOGIC ================= */
  onFieldChange(event: { name: string, value: any }): void {
    console.log('AddProduct: onFieldChange', event);
 
    if (event.name === 'productCategory') {
      const selectedCategoryName = event.value;
 
      // Reset Segment & Sub System dropdown options
      this.updateFieldOptions('productSegment', []);
      this.updateFieldOptions('productSubSystem', []);
 
      if (selectedCategoryName) {
        console.log('Filtering segments for category:', selectedCategoryName);
        this.productService.searchGroups(selectedCategoryName).subscribe({
          next: (data) => {
            let filtered = (data && data.length > 0) ? data : this.allSegments.filter(g =>
              g.productCategory?.categoryName?.toLowerCase() === selectedCategoryName.toLowerCase() ||
              g.category?.categoryName?.toLowerCase() === selectedCategoryName.toLowerCase()
            );
 
            // Fallback to all segments if category association is not set
            if (!filtered || filtered.length === 0) {
              filtered = this.allSegments;
            }
 
            this.segments = filtered;
            this.updateFieldOptions('productSegment', this.segments.map(g => ({
              label: g.groupName,
              value: g.groupName
            })));
          },
          error: (err) => {
            console.error('Failed to load segments:', err);
            this.segments = this.allSegments;
            this.updateFieldOptions('productSegment', this.segments.map(g => ({
              label: g.groupName,
              value: g.groupName
            })));
          }
        });
      }
    } else if (event.name === 'productSegment') {
      const selectedSegmentName = event.value;
 
      // Reset Sub System dropdown options
      this.updateFieldOptions('productSubSystem', []);
 
      if (selectedSegmentName) {
        console.log('Fetching sub-systems for segment:', selectedSegmentName);
        this.productService.getSubCategoriesFull(selectedSegmentName).subscribe({
          next: (data) => {
            this.subSystems = data || [];
            this.updateFieldOptions('productSubSystem', this.subSystems.map(s => ({
              label: s.subcategoryName || s.name,
              value: s.subcategoryName || s.name
            })));
          },
          error: (err) => console.error('Failed to load sub-systems for segment:', err)
        });
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
    // Look up IDs from the names selected in the dropdowns
    const selectedGroup = this.segments.find(s => s.groupName === data.productSegment);
    const selectedType = this.productTypes.find(t => t.typeName === data.productType);
    const selectedSubSys = this.subSystems.find(s => s.subcategoryName === data.productSubSystem);
 
    const payload = {
      ...data,
      groupId: selectedGroup ? selectedGroup.groupId : null,
      productTypeId: selectedType ? selectedType.productTypeId : null,
      subCategoryId: selectedSubSys ? selectedSubSys.subCategoryId : null,
     
      productSecondaryName: data.productCode,
      productFeatures: data.productTechnicalSpecifications,
      productScope: data.productScopeOfSupply,
      productStatus: 1,
      productTarget: data.productTarget != null ? Number(data.productTarget) : null,
      productAvailability: data.productAvailability != null ? Number(data.productAvailability) : null
    };
 
    this.productService.createProduct(payload).subscribe({
      next: () => {
        this.toastService.success('Product Created Successfully!');
        this.router.navigate(['/product']);
      },
      error: err => {
        console.error('Create failed', err);
        this.toastService.error('Failed to create product');
      }
    });
  }
 
  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/product']);
  }
}