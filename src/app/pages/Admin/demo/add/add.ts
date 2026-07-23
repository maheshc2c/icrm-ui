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
    options: []
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


//   private loadDemoById(id: number) {

//   this.adminService.getDemo().subscribe({
//     next: (data: any[]) => {

//       const demo = data.find(d => d.demoProductDetailId == id);

//       if (!demo) {
//         alert('Demo product not found');
//         this.router.navigate(['/admin/demo']);
//         return;
//       }

//       this.formInitialData = {
//         categoryId: demo.categoryId,
//         groupId: demo.groupId,
//         productId: demo.productId,
//         regionId: demo.regionId,
//         branchId: demo.branchId,
//         cityId: demo.cityId,
//         demoProductDetailSerialNumber: demo.demoProductDetailSerialNumber,
//         demoProductDetailLocation: demo.demoProductDetailLocation
//       };

//     },
//     error: () => {
//       alert('Failed to load demo');
//       this.router.navigate(['/admin/demo']);
//     }
//   });
// }
private loadDemoById(id: number) {
  this.adminService.getDemo().subscribe({
      next: (data: any[]) => {
        const demo = data.find(d => d.demoId == id);
  
        if (!demo) {
        this.toastService.error('Demo product not found');
        this.router.navigate(['/demoproduct']);
        return;
      }

        // Assign non-dropdown values first
        this.formInitialData = {
          demoProductDetailSerialNumber: demo.serialNumber,
          demoProductDetailLocation: demo.location
        };

      // Load all edit dropdowns and resolve correct IDs by matching names
      this.loadEditDropdowns(demo);
    },
    error: () => {
      this.toastService.error('Failed to load demo');
      this.router.navigate(['/demoproduct']);
    }
  });
}

private loadEditDropdowns(demo: any) {
    // 1. CATEGORY -> GROUP -> PRODUCT (Resolved via ProductService matching product)
    this.productService.getProducts().subscribe({
      next: (products) => {
        const matchedProduct = products.find(p => p.productName === demo.product);

      if (matchedProduct) {
        const categoryId = matchedProduct.group.category.categoryId;
        const groupId = matchedProduct.group.groupId;
        const productId = matchedProduct.productId;

        // Load Categories options
        this.adminService.getProductCategoriesDropdown().subscribe(catRes => {
          this.categories = catRes;
          this.setOptions('categoryId', catRes, 'categoryId', 'categoryName');

          // Load Segments/Groups options
          this.adminService.getSegmentDropdown(categoryId).subscribe(groupRes => {
            this.groups = groupRes;
            this.setOptions('groupId', groupRes, 'id', 'name');

            // Load Products options
            this.adminService.getProductDropdown(groupId).subscribe(prodRes => {
              this.products = prodRes;
              this.setOptions('productId', prodRes, 'id', 'name');

              // Set the resolved IDs into form initial data once all options are loaded
              this.formInitialData = {
                ...this.formInitialData,
                categoryId: categoryId,
                groupId: groupId,
                productId: productId
              };
            });
          });
        });
      } else {
        // Fallback to loading standard first-level Categories if product name match is not found
        this.loadCategories();
      }
    },
    error: () => {
      this.loadCategories();
    }
  });

  // 2. REGION → BRANCH / CITY
  this.adminService.getRegionDropdown().subscribe(regRes => {
    this.regions = regRes;
    this.setOptions('regionId', regRes, 'id', 'name');

    const matchedRegion = regRes.find(r => r.name === demo.region);
    if (matchedRegion) {
      const regionId = matchedRegion.id;
      this.formInitialData = {
        ...this.formInitialData,
        regionId: regionId
      };

      this.adminService.getBranchDropdown(regionId).subscribe(branchRes => {
        this.branches = branchRes;
        this.setOptions('branchId', branchRes, 'id', 'name');
        
        const matchedBranch = branchRes.find(b => b.name === (demo.branchName || demo.branch));
        if (matchedBranch) {
          this.formInitialData = {
            ...this.formInitialData,
            branchId: matchedBranch.id
          };
        }
      });

      this.adminService.getCityDropdown(regionId).subscribe(cityRes => {
        this.cities = cityRes;
        this.setOptions('cityId', cityRes, 'id', 'name');

        const matchedCity = cityRes.find(c => c.name === (demo.cityName || demo.city));
        if (matchedCity) {
          this.formInitialData = {
            ...this.formInitialData,
            cityId: matchedCity.id
          };
        }
      });
    }
  });
}




  /* 🔥 FORM CHANGE HANDLER (CRITICAL FIX) */
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
  }

  /* ================= DROPDOWNS ================= */

  isDropdownReady = false;

  loadCategories() {
  this.adminService.getProductCategoriesDropdown().subscribe(res => {
    this.categories = res;
    this.setOptions('categoryId', res, 'categoryId', 'categoryName');
    this.isDropdownReady = true;
  });
//   if (!this.isDropdownReady) {
//   alert('Please wait for dropdowns to load');
//   return;
// }
}


  // onCategoryChange(categoryId: number): void {
  //   this.formInitialData.groupId = null;
  //   this.formInitialData.productId = null;
  //   this.clearOptions(['groupId', 'productId']);

  //   this.adminService.getSegmentDropdown(categoryId).subscribe(res => {
  //     this.groups = res;
  //     this.setOptions('groupId', res, 'groupId', 'groupName');
  //   });
  // }
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



  // onGroupChange(groupId: number): void {
  //   this.formInitialData.productId = null;
  //   this.clearOptions(['productId']);

  //   this.adminService.getProductDropdown(groupId).subscribe(res => {
  //     this.products = res;
  //     this.setOptions('productId', res, 'productId', 'productName');
  //   });
  // }

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

//   onRegionChange(regionId: number): void {
//   this.formInitialData.branchId = null;
//   this.formInitialData.cityId = null;
//   this.clearOptions(['branchId', 'cityId']);

//   this.adminService.getBranchDropdown(regionId).subscribe(res => {
//     this.branches = res;

//     // ✅ FIX IS HERE
//     this.setOptions('branchId', res, 'branchId', 'branchName');
//   });

//   this.adminService.getCityDropdown(regionId).subscribe(res => {
//     this.cities = res;
//     this.setOptions('cityId', res, 'locationId', 'locationName');
//   });
// }
onRegionChange(regionId: number): void {

  if (!this.isEditMode) {
    this.formInitialData.branchId = null;
    this.formInitialData.cityId = null;
  }

  this.adminService.getBranchDropdown(regionId).subscribe(res => {
    this.branches = res;
    this.setOptions('branchId', res, 'id', 'name');
  });

  this.adminService.getCityDropdown(regionId).subscribe(res => {
    this.cities = res;
    this.setOptions('cityId', res, 'id', 'name');
  });
}



  /* ================= HELPERS ================= */

  private setOptions(fieldName: string, data: any[], valueKey: string, labelKey: string): void {
    const field = this.demoFields.find(f => f.name === fieldName);
    if (field) {
      field.options = data.map(d => ({
        value: d[valueKey],
        label: d[labelKey]
      }));
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

//   saveDemo(formData: any): void {

//   const category = this.categories.find(c => c.categoryId == formData.categoryId);
//   const group = this.groups.find(g => g.groupId == formData.groupId);
//   const product = this.products.find(p => p.productId == formData.productId);
//   const region = this.regions.find(r => r.locationId == formData.regionId);
//   const branch = this.branches.find(b => b.branchId == formData.branchId);
//   const city = this.cities.find(c => c.locationId == formData.cityId);

//   if (!category || !group || !product || !region || !branch || !city) {
//     alert('Dropdown data missing. Please select all fields again.');
//     return;
//   }

//   const payload = {
//     categoryName: category.categoryName,
//     groupName: group.groupName,
//     productName: product.productName,
//     regionName: region.locationName,
//     branchName: branch.branchName,
//     cityName: city.locationName,
//     demoProductDetailSerialNumber: formData.demoProductDetailSerialNumber,
//     demoProductDetailLocation: formData.demoProductDetailLocation,
//     demoProductDetailStatus: 1
//   };

//   console.log('FINAL PAYLOAD:', payload);

//   this.adminService.createDemo(payload).subscribe({
//     next: () => this.router.navigate(['/admin/demo']),
//     error: err => {
//       console.error(err);
//       alert(err.error?.message || 'Failed to create demo');
//     }
//   });
// }

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

    // const id = Number(this.router.url.split('/').pop());
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
