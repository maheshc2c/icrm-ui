import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Customerservice } from '../../../../service/customerservice';

@Component({
  selector: 'app-addcustomer',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader, CommonModule, FormsModule],
  templateUrl: './addcustomer.html',
  styleUrls: ['./addcustomer.css']
})
export class AddcustomerComponent implements OnInit {
  /* ================= HEADER ================= */
  headerTitle: string = 'Add Customer';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= FORM STATE ================= */
  isEditMode: boolean = false;
  customerId: number | null = null;
  model: any = {};

  /* ================= DROPDOWN DATA ================= */
  categoriesData: any[] = [];
  citiesData: any[] = [];
  subCategoriesData: any[] = [];
  filteredSubCategories: any[] = [];

  /* ================= FORM FIELDS ================= */
  customerFields: any[] = [
    {
      name: 'customerName',
      label: 'Customer Name',
      placeholder: 'Enter customer name',
      type: 'text',
      required: true
    },
    {
      name: 'companyName',
      label: 'Company Name',
      placeholder: 'Enter company name',
      type: 'text',
      required: false
    },
    // COMMENTED: Customer Code not yet implemented in backend
    // {
    //   name: 'customerCode',
    //   label: 'Customer Code',
    //   placeholder: 'Enter customer code',
    //   type: 'text',
    //   required: true
    // },
    {
      name: 'category',
      label: 'Category',
      placeholder: 'Select category',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'subCategory',
      label: 'Sub Category',
      placeholder: 'Select sub category',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'email',
      label: 'Email',
      placeholder: 'Enter email',
      type: 'email',
      required: false
    },
    {
      name: 'telephone',
      label: 'Telephone',
      placeholder: 'Enter telephone',
      type: 'text',
      required: false
    },
    {
      name: 'mobile',
      label: 'Mobile',
      placeholder: 'Enter mobile',
      type: 'text',
      required: false
    },
    {
      name: 'fax',
      label: 'Fax',
      placeholder: 'Enter fax',
      type: 'text',
      required: false
    },
    {
      name: 'website',
      label: 'Website',
      placeholder: 'Enter website',
      type: 'text',
      required: false
    },
    {
      name: 'city',
      label: 'City',
      placeholder: 'Select city',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'address1',
      label: 'Address Line 1',
      placeholder: 'Enter address line 1',
      type: 'textarea',
      required: true
    },
    {
      name: 'address2',
      label: 'Address Line 2',
      placeholder: 'Enter address line 2',
      type: 'textarea',
      required: false
    },
    {
      name: 'address3',
      label: 'Address Line 3',
      placeholder: 'Enter address line 3',
      type: 'textarea',
      required: false
    },
    {
      name: 'landmark',
      label: 'Landmark',
      placeholder: 'Enter landmark',
      type: 'text',
      required: false
    },
    {
      name: 'pincode',
      label: 'Pincode',
      placeholder: 'Enter pincode',
      type: 'text',
      required: false
    },
    {
      name: 'pan',
      label: 'PAN',
      placeholder: 'Enter PAN',
      type: 'text',
      required: false
    },
    {
      name: 'tan',
      label: 'TAN',
      placeholder: 'Enter TAN',
      type: 'text',
      required: false
    },
    {
      name: 'tin',
      label: 'TIN',
      placeholder: 'Enter TIN',
      type: 'text',
      required: false
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private customerService: Customerservice
  ) { }

  /* ================= INIT ================= */
  ngOnInit(): void {
    console.log('AddCustomer component initialized');
    
    // Load all dropdown data
    this.loadAllDropdowns();
    
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

  /* ================= LOAD ALL DROPDOWNS ================= */
  private loadAllDropdowns(): void {
    console.log('Loading all dropdown data...');
    
    // Load Categories
    this.customerService.getCategories().subscribe({
      next: (categories: any[]) => {
        console.log('✅ Categories API response:', categories);
        console.log('First category object:', categories[0]);
        this.categoriesData = categories;
        this.updateCategoryOptions();
      },
      error: (err: any) => {
        console.error('❌ Failed to load categories:', err);
        console.error('Error details:', err.message, err.status);
      }
    });

    // Load Cities
    this.customerService.getCities().subscribe({
      next: (cities: any[]) => {
        console.log('✅ Cities API response:', cities);
        console.log('First city object:', cities[0]);
        this.citiesData = cities;
        this.updateCityOptions();
      },
      error: (err: any) => {
        console.error('❌ Failed to load cities:', err);
        console.error('Error details:', err.message, err.status);
      }
    });

    // Load Sub-Categories
    this.customerService.getSubCategories().subscribe({
      next: (subCategories: any[]) => {
        console.log('✅ Sub-categories API response:', subCategories);
        this.subCategoriesData = subCategories;

        // If a category is already selected (edit mode), update cascading subcategory options
        if (this.model && this.model.category != null && this.model.category !== '') {
          this.onCategoryChange(this.model.category, false);
        }
      },
      error: (err: any) => {
        console.error('❌ Failed to load sub-categories:', err);
        console.error('Error details:', err.message, err.status);
      }
    });
  }

  /* ================= UPDATE CATEGORY OPTIONS ================= */
  private updateCategoryOptions(): void {
    console.log('🔄 Updating category options with data:', this.categoriesData);
    const categoryFieldIndex = this.customerFields.findIndex(f => f.name === 'category');
    console.log('Category field index:', categoryFieldIndex);
    
    if (categoryFieldIndex !== -1 && this.categoriesData.length > 0) {
      // Create a new field object to trigger change detection
      const newOptions = this.categoriesData
        .map((cat: any) => ({
          label:
            cat.categoryName ||
            cat.productCategoryName ||
            cat.customerCategoryName ||
            cat.name ||
            cat.category_name ||
            cat.product_category_name ||
            'Unknown Category',
          value:
            cat.categoryId ||
            cat.customerCategoryId ||
            cat.productCategoryId ||
            cat.id ||
            cat.category_id ||
            cat.product_category_id ||
            null
        }))
        .filter(opt => opt.value !== null);
      console.log('📋 New category options:', newOptions);
      
      // Create a new array reference to trigger @Input change detection in Form component
      const updatedFields = [...this.customerFields];
      updatedFields[categoryFieldIndex] = {
        ...updatedFields[categoryFieldIndex],
        options: [{ label: '-- Select --', value: '' }, ...newOptions]
      };
      this.customerFields = updatedFields;
      
      console.log('✅ Category options updated in field:', this.customerFields[categoryFieldIndex].options);
    } else {
      console.warn('⚠️ Cannot update category options - field not found or no data');
    }
  }

  /* ================= UPDATE CITY OPTIONS ================= */
  private updateCityOptions(): void {
    console.log('🔄 Updating city options with data:', this.citiesData);
    const cityFieldIndex = this.customerFields.findIndex(f => f.name === 'city');
    console.log('City field index:', cityFieldIndex);
    
    if (cityFieldIndex !== -1 && this.citiesData.length > 0) {
      // Create a new field object to trigger change detection
      const newOptions = this.citiesData
        .map((city: any) => ({
          label:
            city.cityName ||
            city.locationName ||
            city.name ||
            city.city_name ||
            city.location_name ||
            'Unknown City',
          value:
            city.cityId ||
            city.locationId ||
            city.id ||
            city.city_id ||
            city.location_id ||
            null
        }))
        .filter(opt => opt.value !== null);

      console.log('📋 New city options:', newOptions);
      
      // Create a new array reference to trigger @Input change detection in Form component
      const updatedFields = [...this.customerFields];
      updatedFields[cityFieldIndex] = {
        ...updatedFields[cityFieldIndex],
        options: [{ label: '-- Select --', value: '' }, ...newOptions]
      };
      this.customerFields = updatedFields;
      
      console.log('✅ City options updated in field:', this.customerFields[cityFieldIndex].options);
    } else {
      console.warn('⚠️ Cannot update city options - field not found or no data');
    }
  }

  /* ================= HANDLE FIELD CHANGES (FOR CASCADING) ================= */
  onFieldChange(event: {name: string, value: any}): void {
    console.log('Field changed:', event);
    
    if (event.name === 'category') {
      this.onCategoryChange(event.value);
    }
  }

  /* ================= HANDLE CATEGORY CHANGE (CASCADING) ================= */
  onCategoryChange(selectedCategoryId: any, resetSubCategory: boolean = true): void {
    console.log('Category changed to:', selectedCategoryId);

    const normalizedCategoryId =
      selectedCategoryId === '' || selectedCategoryId === null || selectedCategoryId === undefined
        ? null
        : Number(selectedCategoryId);

    // Filter sub-categories based on selected category
    if (this.subCategoriesData && this.subCategoriesData.length > 0 && normalizedCategoryId !== null) {
      this.filteredSubCategories = this.subCategoriesData.filter((subCat: any) => {
        const subCatCategoryId =
          subCat.categoryId || subCat.category_id ||
          (subCat.category && (subCat.category.categoryId || subCat.category.category_id));

        return subCatCategoryId !== undefined && subCatCategoryId !== null &&
          Number(subCatCategoryId) === normalizedCategoryId;
      });
    } else {
      this.filteredSubCategories = [];
    }

    // Update sub-category field options
    const subCategoryFieldIndex = this.customerFields.findIndex(f => f.name === 'subCategory');
    if (subCategoryFieldIndex !== -1) {
      const newOptions = [{ label: '-- Select --', value: '' }, ...this.filteredSubCategories.map((subCat: any) => ({
        label: subCat.subcategoryName || subCat.name || subCat.sub_category_name || 'Unknown Sub Category',
        value: subCat.subCategoryId || subCat.subcategoryId || subCat.id || subCat.sub_category_id || ''
      }))];

      // Create a new array reference to trigger @Input change detection in Form component
      const updatedFields = [...this.customerFields];
      updatedFields[subCategoryFieldIndex] = {
        ...updatedFields[subCategoryFieldIndex],
        options: newOptions
      };
      this.customerFields = updatedFields;

      console.log('✅ Sub-category options updated:', this.customerFields[subCategoryFieldIndex].options);
    }

    // Clear selected sub-category when category changes (not in edit restore flow)
    if (resetSubCategory) {
      this.model.subCategory = '';
    }
  }

  /* ================= MODE SETUP ================= */
  private setupEditMode(id: number): void {
    this.isEditMode = true;
    this.customerId = id;

    this.headerTitle = 'Edit Customer';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/sales-manager-dashboard' },
      { label: 'Manage Customer', route: '/salesmanager/customer' },
      { label: 'Edit Customer' }
    ];

    this.loadCustomer(id);
  }

  private setupCreateMode(): void {
    this.isEditMode = false;

    this.headerTitle = 'Add Customer';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/sales-manager-dashboard' },
      { label: 'Manage Customer', route: '/salesmanager/customer' },
      { label: 'Add Customer' }
    ];
  }

  /* ================= LOAD CUSTOMER FOR EDIT ================= */
  loadCustomer(id: number): void {
    console.log('Loading customer for edit, ID:', id);
    
    this.customerService.searchCustomers({}).subscribe({
      next: (customers: any[]) => {
        const customer = customers.find(c => c.customerId === id);
        if (customer) {
          this.model = {
            customerName: customer.customerName,
            companyName: customer.companyName,
            category: customer.categoryId,
            subCategory: customer.subcategoryId,
            email: customer.email,
            telephone: customer.telephone,
            mobile: customer.mobile,
            fax: customer.fax,
            website: customer.website,
            city: customer.cityId,
            address1: customer.customerAddress1,
            address2: customer.customerAddress2,
            address3: customer.customerAddress3,
            landmark: customer.customerLandmark,
            pincode: customer.customerPincode,
            pan: customer.customerPan,
            tan: customer.customerTan,
            tin: customer.customerTin
          };
          console.log('Customer loaded:', this.model);
          
          // Trigger cascading for sub-categories
          if (customer.categoryId) {
            this.onCategoryChange(customer.categoryId, false);
            this.model.subCategory = customer.subcategoryId;
          }
        } else {
          alert('Customer not found');
          this.router.navigate(['/salesmanager/customer']);
        }
      },
      error: (err: any) => {
        console.error('Failed to load customer:', err);
        alert('Failed to load customer');
      }
    });
  }

  /* ================= SAVE CUSTOMER ================= */
  saveCustomer(data: any): void {
    console.log('========== SAVING CUSTOMER ==========');
    console.log('Form data received:', data);
    console.log('Is Edit Mode:', this.isEditMode);

    if (!data.customerName) {
      alert('Please fill in Customer Name');
      return;
    }

    // ✅ Transform form data to API payload
    const payload = {
      customerName: data.customerName,
      companyName: data.companyName,
      customerCategoryName: data.category,
      subcategoryName: data.subCategory,
      cityName: data.city ? [data.city] : [],
      customerEmail: data.email,
      customerTelephone: data.telephone,
      customerMobile: data.mobile,
      customerFax: data.fax,
      customerWebsite: data.website,
      customerAddress1: data.address1,
      customerAddress2: data.address2,
      customerAddress3: data.address3,
      customerLandmark: data.landmark,
      customerPincode: data.pincode,
      customerPan: data.pan,
      customerTan: data.tan,
      customerTin: data.tin,
      customerStatus: 1
    };

    console.log('📦 Payload to send:', payload);

    if (this.isEditMode && this.customerId) {
      // Update existing customer
      this.customerService.updateCustomer(this.customerId, payload).subscribe({
        next: (response: any) => {
          console.log('Customer updated:', response);
          alert('Customer updated successfully!');
          this.router.navigate(['/salesmanager/customer']);
        },
        error: (err: any) => {
          console.error('Update failed:', err);
          alert('Failed to update customer. Please check console details.');
        }
      });
    } else {
      // Create new customer
      this.customerService.createCustomer(payload).subscribe({
        next: (response: any) => {
          console.log('Customer created:', response);
          alert('Customer created successfully!');
          this.router.navigate(['/salesmanager/customer']);
        },
        error: (err: any) => {
          console.error('Create failed:', err);
          alert('Failed to create customer. Please check console for details.');
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/salesmanager/customer']);
  }
}
