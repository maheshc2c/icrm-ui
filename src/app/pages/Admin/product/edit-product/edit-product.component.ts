import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { ProductService } from '../../../../service/productservice';
import { Breadcrumb } from '../../../../models/breadcrumb';
 
@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [Pageheader, Form, CommonModule, Header, Sidebar],
  providers: [ProductService],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css',
})
export class EditProduct implements OnInit {
 
  productId!: number;
  productData!: any;
 
  // Dynamic dropdown options
  categories: any[] = [];
  segments: any[] = [];
  subSystems: any[] = [];
  productTypes: any[] = [];
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) { }
 
  headerTitle = 'Edit Product';
 
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admin' },
    { label: 'Product', route: '/admin/product' },
    { label: 'Edit' }
  ];
 
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
 
  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDropdownData();
    this.loadProduct();
  }
 
 
  /* ================= LOAD DROPDOWN DATA ================= */
  private loadDropdownData(): void {
    // Lead categories (Full object for ID reference)
    this.productService.getCategoriesFull().subscribe({
      next: (data) => {
        this.categories = data;
        this.updateFieldOptions('productCategory', this.categories.map(c => ({
          label: c.categoryName,
          value: c.categoryName // Value is Name as per backend requirement
        })));
      },
      error: (err) => console.error('Failed to load categories:', err)
    });
 
    // Load Product Types
    this.productService.getProductTypesFull().subscribe({
      next: (data) => {
        this.productTypes = data;
        this.updateFieldOptions('productType', this.productTypes.map(t => ({
          label: t.typeName,
          value: t.typeName
        })));
      },
      error: (err) => console.error('Failed to load product types:', err)
    });
 
    // Load Sub Systems (SubCategories)
    this.productService.getSubCategoriesFull().subscribe({
      next: (data) => {
        this.subSystems = data;
        this.updateFieldOptions('productSubSystem', this.subSystems.map(s => ({
          label: s.subcategoryName,
          value: s.subcategoryName
        })));
      },
      error: (err) => console.error('Failed to load sub systems:', err)
    });
  }
 
  loadProduct(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (product: any) => {
        if (product) {
          console.log('Loaded Product:', product);
 
          // Flatten the nested object to match form control names
          this.productData = {
            ...product,
            productCode: product.productCode || '', // Now mapping real productCode
            productCategory: product.group?.category?.categoryName,
            productSegment: product.group?.groupName,
            productSubSystem: product.subCategory?.subcategoryName,
            productType: product.productType?.typeName,
            productTechnicalSpecifications: product.productFeatures || '',
            productScopeOfSupply: product.productScope || ''
          };
 
          // Trigger segment loading if category is present
          if (this.productData.productCategory) {
            this.loadSegments(this.productData.productCategory);
          }
        }
      },
      error: () => alert('Failed to load product')
    });
  }
 
  /* ================= DYNAMIC LOGIC ================= */
  onFieldChange(event: { name: string, value: any }): void {
    console.log('EditProduct: onFieldChange', event);
 
    if (event.name === 'productCategory') {
      const selectedCategoryName = event.value;
      this.loadSegments(selectedCategoryName);
    }
  }
 
  private loadSegments(categoryName: string): void {
    if (categoryName) {
      // Fetch groups (Segments) by NAME using search API
      console.log('Fetching segments for category Name using search:', categoryName);
      this.productService.searchGroups(categoryName).subscribe({
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
 
  private updateFieldOptions(fieldName: string, options: any[]): void {
    const field = this.productFields.find(f => f.name === fieldName);
    if (field) {
      field.options = options;
      this.productFields = [...this.productFields];
    }
  }
 
  updateProduct(formData: any): void {
 
    const payload: any = {
      ...formData,
      productId: this.productId,
      modifiedBy: localStorage.getItem('userId') || '1',
      // Ensure mapping is correct
      groupName: formData.productSegment, // Segment -> Group
      categoryName: formData.productCategory,
      subCategoryName: formData.productSubSystem,
      typeName: formData.productType,
      productFeatures: formData.productTechnicalSpecifications, // Map form fields to backend names
      productScope: formData.productScopeOfSupply,
      // productStatus: 1 // Preserve or update status as needed
    };
 
    console.log('Update Payload:', payload);
 
    this.productService.updateProduct(this.productId, payload).subscribe({
      next: (res) => {
        alert('Product updated successfully');
        this.router.navigate(['/admin/product']);
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Update failed');
      }
    });
  }
 
  cancelEdit(): void {
 
    this.router.navigate(['/admin/product']);
  }
 
}
 
 