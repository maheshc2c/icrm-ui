import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Adminservice } from '../../../../service/adminservice';
import { ProductService } from '../../../../service/productservice';
import { DemoProductModel } from '../../../../models/demo-product-model';
import { ToastService } from '../../../../service/toast.service';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader, Form],
  templateUrl: './add.html',
  styleUrl: './add.css'
})
export class Add implements OnInit {

  constructor(
    private adminService: Adminservice,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  isEditMode = false;
  formInitialData: any = {};

  headerTitle = 'Add Demo Product';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Demo', route: '/demoproduct' },
    { label: 'Add Demo Product' }
  ];

  categories: any[] = [];
  groups: any[] = [];
  products: any[] = [];
  regions: any[] = [];
  branches: any[] = [];
  cities: any[] = [];

demoFields: any[] = [
  {
    name: 'categoryId',
    label: 'Product Category',
    type: 'select',
    placeholder:'Select Category',
    required: true,
    options: [],
    onChange: (value: number) => this.onCategoryChange(value)
  },
  {
    name: 'groupId',
    label: 'Segment',
    type: 'select',
    required: true,
    placeholder:'Select Segment',
    options: [],
    onChange: (value: number) => this.onGroupChange(value)
  },
  {
    name: 'productId',
    label: 'Product Name',
    placeholder:'Select Product',
    type: 'select',
    required: true,
    options: []
  },
  {
    name: 'regionId',
    label: 'Region',
    type: 'select',
    placeholder:'Select Region',
    required: true,
    options: [],
    onChange: (value: number) => this.onRegionChange(value)
  },
  {
    name: 'branchId',
    label: 'Branch',
    placeholder:'Select Branch',
    type: 'select',
    required: true,
    options: [],
    onChange: (value: number) => this.onBranchChange(value)
  },
  {
    name: 'cityId',
    label: 'City',
    placeholder:'Select City',
    type: 'select',
    required: true,
    options: []
  },
  {
    name: 'demoProductDetailSerialNumber',
    label: 'Serial Number',
    placeholder:'Enter Serial Number',
    type: 'text',
    required: true
  },
  {
    name: 'demoProductDetailLocation',
    label: 'Location',
    placeholder:'Enter Location',
    type: 'text',
    required: true
  }
];


  ngOnInit(): void {
    this.loadCategories();
    this.loadRegions();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.headerTitle = 'Edit Demo Product';
      this.loadDemoById(Number(idParam));
    }
  }

  private loadDemoById(id: number) {
    this.adminService.getDemoById(id).subscribe({
      next: (demo: any) => {
        if (!demo) {
          this.toastService.error('Demo product not found');
          this.router.navigate(['/demoproduct']);
          return;
        }

        const segmentId = demo.segmentId || demo.groupId;

        this.formInitialData = {
          categoryId: demo.categoryId,
          groupId: segmentId,
          productId: demo.productId,
          regionId: demo.regionId,
          branchId: demo.branchId,
          cityId: demo.cityId,
          demoProductDetailSerialNumber: demo.serialNumber || demo.demoProductDetailSerialNumber,
          demoProductDetailLocation: demo.location || demo.demoProductDetailLocation
        };

        // 1. Load Categories & Segments
        if (demo.categoryId) {
          this.adminService.getProductCategoriesDropdown().subscribe(catRes => {
            this.categories = catRes;
            this.setOptions('categoryId', catRes, 'categoryId', 'categoryName');
          });

          this.adminService.getSegmentDropdown(demo.categoryId).subscribe(groupRes => {
            this.groups = groupRes;
            this.setOptions('groupId', groupRes, 'id', 'name');
          });
        }

        // 2. Load Products
        if (segmentId) {
          this.adminService.getProductDropdown(segmentId).subscribe(prodRes => {
            this.products = prodRes;
            this.setOptions('productId', prodRes, 'id', 'name');
          });
        }

        // 3. Load Regions & Branches
        if (demo.regionId) {
          this.adminService.getRegionDropdown().subscribe(regRes => {
            this.regions = regRes;
            this.setOptions('regionId', regRes, 'id', 'name');
          });

          this.adminService.getBranchDropdown(demo.regionId).subscribe(branchRes => {
            this.branches = branchRes;
            this.setOptions('branchId', branchRes, 'id', 'name');
          });
        }

        // 4. Load Cities
        if (demo.branchId) {
          this.adminService.getCityDropdown(demo.branchId).subscribe(cityRes => {
            this.cities = cityRes;
            this.setOptions('cityId', cityRes, 'id', 'name');
          });
        }
      },
      error: () => {
        this.toastService.error('Failed to load demo');
        this.router.navigate(['/demoproduct']);
      }
    });
  }

  /* 🔥 FORM CHANGE HANDLER */
  onFormValueChange(data: any): void {
    this.formInitialData = { ...data };

    if (data.categoryId) {
      this.onCategoryChange(data.categoryId);
    }

    if (data.groupId) {
      this.onGroupChange(data.groupId);
    }

    if (data.regionId) {
      this.onRegionChange(data.regionId);
    }

    if (data.branchId) {
      this.onBranchChange(data.branchId);
    }
  }

  /* ================= DROPDOWNS ================= */

  isDropdownReady = false;

  loadCategories() {
    this.adminService.getProductCategoriesDropdown().subscribe(res => {
      this.categories = res;
      this.setOptions('categoryId', res, 'categoryId', 'categoryName');
      this.isDropdownReady = true;
    });
  }

  onCategoryChange(categoryId: number): void {
    if (!this.isEditMode) {
      this.formInitialData.groupId = null;
      this.formInitialData.productId = null;
    }

    this.adminService.getSegmentDropdown(categoryId).subscribe(res => {
      this.groups = res;
      this.setOptions('groupId', res, 'id', 'name');
    });
  }

  onGroupChange(groupId: number): void {
    if (!this.isEditMode) {
      this.formInitialData.productId = null;
    }

    this.adminService.getProductDropdown(groupId).subscribe(res => {
      this.products = res;
      this.setOptions('productId', res, 'id', 'name');
    });
  }

  loadRegions(): void {
    this.adminService.getRegionDropdown().subscribe(res => {
      this.regions = res;
      this.setOptions('regionId', res, 'id', 'name');
    });
  }

  onRegionChange(regionId: number): void {
    if (!this.isEditMode) {
      this.formInitialData.branchId = null;
      this.formInitialData.cityId = null;
    }

    this.adminService.getBranchDropdown(regionId).subscribe(res => {
      this.branches = res;
      this.setOptions('branchId', res, 'id', 'name');
    });
  }

  onBranchChange(branchId: number): void {
    if (!this.isEditMode) {
      this.formInitialData.cityId = null;
    }

    this.adminService.getCityDropdown(branchId).subscribe(res => {
      this.cities = res;
      this.setOptions('cityId', res, 'id', 'name');
    });
  }

  /* ================= HELPERS ================= */

  private setOptions(fieldName: string, data: any[], valueKey: string, labelKey: string): void {
    const field = this.demoFields.find(f => f.name === fieldName);
    if (field) {
      field.options = (data || []).map(d => ({
        value: d[valueKey],
        label: d[labelKey]
      }));
      this.demoFields = [...this.demoFields];
      this.formInitialData = { ...this.formInitialData };
    }
  }

  private clearOptions(fields: string[]): void {
    fields.forEach(name => {
      const field = this.demoFields.find(f => f.name === name);
      if (field) {
        field.options = [];
      }
    });
  }

  /* ================= SAVE ================= */

  saveDemo(formData: any): void {
    const category = this.categories.find(c => c.categoryId == formData.categoryId);
    const group = this.groups.find(g => g.id == formData.groupId);
    const product = this.products.find(p => p.id == formData.productId);
    const region = this.regions.find(r => r.id == formData.regionId);
    const branch = this.branches.find(b => b.id == formData.branchId);
    const city = this.cities.find(c => c.id == formData.cityId);

    if (!category || !group || !product || !region || !branch || !city) {
      this.toastService.error('Dropdown data missing');
      return;
    }

    const payload = {
      categoryId: category.categoryId,
      segmentId: group.id,
      productId: product.id,
      regionId: region.id,
      branchId: branch.id,
      cityId: city.id,
      serialNumber: formData.demoProductDetailSerialNumber,
      location: formData.demoProductDetailLocation,
      status: 1
    };

    if (this.isEditMode) {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      this.adminService.updateDemo(id, payload).subscribe({
        next: () => {
          this.toastService.success('Demo updated successfully');
          this.router.navigate(['/demoproduct']);
        },
        error: (err: any) => this.toastService.error(err.error?.message || 'Failed to update demo')
      });
    } else {
      this.adminService.createDemo(payload).subscribe({
        next: () => {
          this.toastService.success('Demo created successfully');
          this.router.navigate(['/demoproduct']);
        },
        error: (err: any) => this.toastService.error(err.error?.message || 'Failed to create demo')
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/demoproduct']);
  }
}
