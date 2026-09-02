import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { ProductService } from '../../../../service/productservice';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ToastService } from '../../../../service/toast.service';
 
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
  allSegments: any[] = [];
  subSystems: any[] = [];
  productTypes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private toastService: ToastService
  ) { }

  headerTitle = 'Edit Product';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Product', route: '/product' },
    { label: 'Edit' }
  ];

  productFields = [
    { name: 'productCode', label: 'Product Code', type: 'text', required: false, disabled: true },
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

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDropdownData();
    this.loadProduct();
  }


  /* ================= LOAD DROPDOWN DATA ================= */
  private loadDropdownData(): void {
    // 1. Lead categories
    this.productService.getCategoriesFull().subscribe({
      next: (data) => {
        this.categories = data;
        this.updateFieldOptions('productCategory', this.categories.map(c => ({
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
        this.updateFieldOptions('productType', this.productTypes.map(t => ({
          label: t.typeName,
          value: t.typeName
        })));
      },
      error: (err) => console.error('Failed to load product types:', err)
    });
  }

  loadProduct(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (product: any) => {
        if (product) {
          console.log('Loaded Product:', product);

          const hasSecondaryName = !!product.productSecondaryName;

          // Flatten the nested object to match form control names
          this.productData = {
            ...product,
            productCode: product.productSecondaryName || (product.productId ? 'PROD-' + String(product.productId).padStart(4, '0') : ''),
            productName: hasSecondaryName ? (product.productName || '') : (product.productDescription || product.productName || ''),
            productDescription: hasSecondaryName ? (product.productDescription || '') : '',
            productCategory: product.group?.category?.categoryName,
            productSegment: product.group?.groupName,
            productSubSystem: product.subCategory?.subcategoryName,
            productType: product.productType?.typeName,
            productTechnicalSpecifications: product.productFeatures || '',
            productScopeOfSupply: product.productScope || '',
            productTarget: product.productTarget != null ? String(product.productTarget) : null,
            productAvailability: product.productAvailability != null ? String(product.productAvailability) : null
          };

          // Trigger segment loading if category is present
          if (this.productData.productCategory) {
            this.loadSegments(this.productData.productCategory);
          }
          if (this.productData.productSegment) {
            this.loadSubSystems(this.productData.productSegment);
          }
        }
      },
      error: () => this.toastService.error('Failed to load product')
    });
  }

  /* ================= DYNAMIC LOGIC ================= */
  onFieldChange(event: { name: string, value: any }): void {
    console.log('EditProduct: onFieldChange', event);

    if (event.name === 'productCategory') {
      const selectedCategoryName = event.value;
      this.updateFieldOptions('productSegment', []);
      this.updateFieldOptions('productSubSystem', []);
      this.loadSegments(selectedCategoryName);
    } else if (event.name === 'productSegment') {
      const selectedSegmentName = event.value;
      this.updateFieldOptions('productSubSystem', []);
      this.loadSubSystems(selectedSegmentName);
    }
  }

  private loadSegments(categoryName: string): void {
    if (!categoryName) {
      this.updateFieldOptions('productSegment', []);
      return;
    }
    this.productService.searchGroups(categoryName).subscribe({
      next: (data) => {
        let list = (data && data.length > 0) ? data : this.allSegments.filter(g => 
          g.productCategory?.categoryName?.toLowerCase() === categoryName.toLowerCase() ||
          g.category?.categoryName?.toLowerCase() === categoryName.toLowerCase()
        );
        if (!list || list.length === 0) {
          list = this.allSegments;
        }
        this.segments = list;
        this.updateFieldOptions('productSegment', this.segments.map(g => ({
          label: g.groupName,
          value: g.groupName
        })));
      },
      error: (err) => console.error('Failed to load segments:', err)
    });
  }

  private loadSubSystems(segmentName: string): void {
    if (segmentName) {
      this.productService.getSubCategoriesFull(segmentName).subscribe({
        next: (data) => {
          this.subSystems = data || [];
          this.updateFieldOptions('productSubSystem', this.subSystems.map(s => ({
            label: s.subcategoryName || s.name,
            value: s.subcategoryName || s.name
          })));
        },
        error: (err) => console.error('Failed to load sub-systems:', err)
      });
    } else {
      this.updateFieldOptions('productSubSystem', []);
    }
  }
 
  private updateFieldOptions(fieldName: string, options: any[]): void {
    const field = this.productFields.find(f => f.name === fieldName);
    if (field) {
      field.options = options;
      this.productFields = [...this.productFields];
    }
  }
 
  isSubmitting = false;

  private formatErrorMessage(err: any, fallbackMessage: string, productCode?: string): string {
    const rawMessage = typeof err?.error === 'string'
      ? err.error
      : (err?.error?.message || err?.message || '');

    const lower = rawMessage.toLowerCase();
    if (
      lower.includes('product code') ||
      lower.includes('productcode') ||
      lower.includes('already exists') ||
      lower.includes('duplicate') ||
      err?.status === 400 || err?.status === 409
    ) {
      const code = productCode || this.productData?.productCode || '';
      return code
        ? `A product already exists with Product Code "${code}". Please try changing the Product Code and submit again.`
        : 'A product already exists with this Product Code. Please try changing the Product Code and submit again.';
    }
    return rawMessage || fallbackMessage;
  }

  updateProduct(formData: any): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
 
    // Look up IDs from the names selected in the dropdowns
    const selectedGroup = this.segments.find(s => s.groupName === formData.productSegment);
    const selectedType = this.productTypes.find(t => t.typeName === formData.productType);
    const selectedSubSys = this.subSystems.find(s => s.subcategoryName === formData.productSubSystem);

    const payload: any = {
      ...formData,
      productId: this.productId,
      modifiedBy: localStorage.getItem('userId') || '1',
      
      groupId: selectedGroup ? selectedGroup.groupId : null,
      productTypeId: selectedType ? selectedType.productTypeId : null,
      subCategoryId: selectedSubSys ? selectedSubSys.subCategoryId : null,

      productSecondaryName: formData.productCode,
      productFeatures: formData.productTechnicalSpecifications,
      productScope: formData.productScopeOfSupply,
      
      productTarget: formData.productTarget != null ? Number(formData.productTarget) : null,
      productAvailability: formData.productAvailability != null ? Number(formData.productAvailability) : null
    };
 
    console.log('Update Payload:', payload);
 
    this.productService.updateProduct(this.productId, payload).subscribe({
      next: (res) => {
        this.toastService.success('Product updated successfully');
        this.isSubmitting = false;
        this.router.navigate(['/product']);
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.isSubmitting = false;
        const msg = this.formatErrorMessage(err, 'Update failed', formData.productCode);
        this.toastService.error(msg);
      }
    });
  }
 
  cancelEdit(): void {
 
    this.router.navigate(['/product']);
  }
 
}
 
 
