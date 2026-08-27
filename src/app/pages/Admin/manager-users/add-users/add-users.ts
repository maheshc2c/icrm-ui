import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Header } from "../../../../layout/header/header";
import { Sidebar } from "../../../../layout/sidebar/sidebar";
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Breadcrumb } from "../../../../models/breadcrumb";
import { Userservice } from "../../../../service/userservice";
import { ToastService } from "../../../../service/toast.service";
import { Companyservice } from "../../../../service/companyservice";

@Component({
  selector: 'app-add-users',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader],
  providers: [Userservice],
  templateUrl: './add-users.html',
  styleUrl: './add-users.css'
})
export class AddUsersComponent implements OnInit {

  constructor(
    private userService: Userservice,
    private companyService: Companyservice,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /* ================= HEADER ================= */
  headerTitle = 'Add New Users';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Users', route: '/users' },
    { label: 'Add Users' }
  ];

  /* ================= FORM STATE ================= */
  isEditMode = false;
  userId!: number;
  formInitialData: any = {};

  /* ================= MULTI-STEP STATE ================= */
  currentStep: number = 1;
  selectedRole: string = '';
  roles: string[] = [];

  /* ===== DYNAMIC CONFIGURATION ===== */
  locationMode: 'world' | 'geo' | 'cascade' = 'cascade';
  productType: string = '';

  /* ================= CASCADE STATE: LOCATION ================= */
  // World level (for world-level roles)
  worldOptions: string[] = [];
  selWorld = '';

  // Each level stores { locationId, locationName }
  geoOptions: any[] = [];
  countryOptions: any[] = [];
  regionOptions: any[] = [];
  stateOptions: any[] = [];
  districtOptions: any[] = [];
  cityOptions: any[] = [];

  // Single-value selection per level (dropdowns render as single selects)
  selGeo = '';
  selCountry = '';
  selRegion = '';
  // Multi-value selection (checkboxes) for State, District, City
  selStates: string[] = [];
  selDistricts: string[] = [];
  selCities: string[] = [];

  /* ================= CASCADE STATE: PRODUCTS ================= */
  allGroups: any[] = [];
  groupOptions: any[] = [];
  groupedGroups: { category: string; groups: any[] }[] = [];
  productOptions: string[] = [];
  groupedProducts: { group: string; products: string[] }[] = [];

  selCategories: string[] = [];
  selGroups: string[] = [];
  selProducts: string[] = [];
  categories: string[] = [];
  step4Submitted: boolean = false;

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.setupEditMode(+id);
    } else {
      this.setupCreateMode();
    }

    this.loadDropdownOptions();
  }

  /* ================= LOAD DROPDOWN OPTIONS ================= */
  private loadDropdownOptions(): void {
    forkJoin({
      roles: this.userService.getRoles().pipe(catchError(() => of([]))),
      branches: this.userService.getBranches().pipe(catchError(() => of([]))),
      categories: this.userService.getCategories().pipe(catchError(() => of([]))),
      worlds: this.userService.getWorlds().pipe(catchError(() => of([]))),
      allGroups: this.userService.getAllGroups().pipe(catchError(() => of([]))),
      companies: this.userService.getCompanies().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ roles, branches, categories, worlds, allGroups, companies }) => {
        this.roles = (roles || []).filter((r: any) => typeof r === 'string' && r.toLowerCase().replace(/\s+/g, '') !== 'superadmin');
        this.categories = categories;
        
        let groupsArray: any[] = [];
        if (Array.isArray(allGroups)) {
          groupsArray = allGroups;
        } else if (allGroups && Array.isArray((allGroups as any).content)) {
          groupsArray = (allGroups as any).content;
        } else if (allGroups && Array.isArray((allGroups as any).data)) {
          groupsArray = (allGroups as any).data;
        } else if (allGroups && typeof allGroups === 'object') {
          const values = Object.values(allGroups);
          const foundArray = values.find(val => Array.isArray(val));
          if (foundArray) {
            groupsArray = foundArray as any[];
          }
        }
        this.allGroups = groupsArray;
        
        this.worldOptions = worlds;

        // Inject branches into branchName select field
        const branchField = this.userDetailsFields.find(f => f.name === 'branchName') as any;
        if (branchField) branchField.options = branches;

        // Inject companies into companyName select field
        const companyField = this.userDetailsFields.find(f => f.name === 'companyName') as any;
        if (companyField) {
          companyField.options = Array.isArray(companies) ? companies : [];
        }

        // Load top-level geos (levelId=2) on startup
        this.userService.getLocationsByLevel(2).subscribe({
          next: (locs: any[]) => this.geoOptions = locs,
          error: (err: any) => console.error('Failed to load geos', err)
        });
      },
      error: (err) => {
        console.error('Failed to load dropdown options', err);
      }
    });
  }

  /* ================= MODE SETUP ================= */
  private setupEditMode(id: number): void {
    this.isEditMode = true;
    this.userId = id;
    this.currentStep = 2; // Skip role selection in edit mode

    this.headerTitle = 'Edit Users';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Users', route: '/users' },
      { label: 'Edit Users' }
    ];
  }

  private setupCreateMode(): void {
    this.isEditMode = false;
  }

  /* ================= FORM FIELDS ================= */

  // Step 2: User Details
  userDetailsFields = [
    { name: 'firstName', label: 'First Name', placeholder: 'First name', type: 'text', required: true, options: [] },
    { name: 'lastName', label: 'Last Name', placeholder: 'Last name', type: 'text', required: false, options: [] },
    { name: 'username', label: 'Employee ID', placeholder: 'Employee ID', type: 'text', required: true, options: [] },
    { name: 'email', label: 'E-Mail', placeholder: 'User E-Mail', type: 'email', required: true, options: [] },
    { name: 'phoneNumber', label: 'Mobile', placeholder: 'Mobile Number', type: 'phone', required: true, options: [] },
    { name: 'alternateNumber', label: 'Alternate Number', placeholder: 'Mobile Number', type: 'phone', required: false, options: [] },
    { name: 'branchName', label: 'Branch', placeholder: 'Select Branch', type: 'select', required: true, options: [] },
    { name: 'companyName', label: 'Company', placeholder: 'Select Company', type: 'select', required: true, options: [] },
    { name: 'address1', label: 'Address Line1', placeholder: '', type: 'textarea', required: false, options: [] },
    { name: 'address2', label: 'Address Line2', placeholder: '', type: 'textarea', required: false, options: [] },
    { name: 'city', label: 'City', placeholder: 'City', type: 'text', required: true, options: [] }
  ];

  // Step 5: Distributor Details (only shown when role = Distributor)
  distributorDetailsFields = [
    { name: 'distributorName', label: 'Distributor Name', placeholder: 'Distributor Name', type: 'text', required: true },
    { name: 'panNumber', label: 'PAN Number', placeholder: 'PAN Number', type: 'text', required: false },
    { name: 'tinNumber', label: 'TIN Number', placeholder: 'TIN Number', type: 'text', required: false },
    { name: 'tanNumber', label: 'TAN Number', placeholder: 'TAN Number', type: 'text', required: false },
    { name: 'serviceTaxNumber', label: 'Service Tax Number', placeholder: 'Service Tax Number', type: 'text', required: false },
    { name: 'salesTaxNumber', label: 'Sales Tax Number', placeholder: 'Sales Tax Number', type: 'text', required: false },
    { name: 'exciseNumber', label: 'Excise Number', placeholder: 'Excise Number', type: 'text', required: false },
    { name: 'bankName', label: 'Bank Name', placeholder: 'Bank Name', type: 'text', required: false },
    { name: 'branch', label: 'Bank Branch', placeholder: 'Bank Branch', type: 'text', required: false },
    { name: 'accountHolderName', label: 'Account Holder Name', placeholder: 'Account Holder Name', type: 'text', required: false },
    { name: 'accountNumber', label: 'Account Number', placeholder: 'Account Number', type: 'text', required: false },
    { name: 'ifscCode', label: 'IFSC Code', placeholder: 'IFSC Code', type: 'text', required: false }
  ];

  get isDistributor(): boolean {
    return this.selectedRole?.toLowerCase() === 'distributor';
  }

  stockistDetailsFields = [
    { name: 'stockistName', label: 'Stockist Name', placeholder: 'Stockist Name', type: 'text', required: true },
    { name: 'panNumber', label: 'PAN Number', placeholder: 'PAN Number', type: 'text', required: false },
    { name: 'tinNumber', label: 'TIN Number', placeholder: 'TIN Number', type: 'text', required: false },
    { name: 'tanNumber', label: 'TAN Number', placeholder: 'TAN Number', type: 'text', required: false },
    { name: 'serviceTaxNumber', label: 'Service Tax Number', placeholder: 'Service Tax Number', type: 'text', required: false },
    { name: 'salesTaxNumber', label: 'Sales Tax Number', placeholder: 'Sales Tax Number', type: 'text', required: false },
    { name: 'exciseNumber', label: 'Excise Number', placeholder: 'Excise Number', type: 'text', required: false },
    { name: 'bankName', label: 'Bank', placeholder: 'Bank Name', type: 'text', required: false },
    { name: 'branch', label: 'Bank Branch', placeholder: 'Bank Branch', type: 'text', required: false },
    { name: 'accountHolderName', label: 'Account Name', placeholder: 'Account Name', type: 'text', required: false },
    { name: 'accountNumber', label: 'Bank Account Number', placeholder: 'Account Number', type: 'text', required: false },
    { name: 'ifscCode', label: 'IFSC', placeholder: 'IFSC', type: 'text', required: false }
  ];

  get isStockist(): boolean {
    return this.selectedRole?.toLowerCase() === 'stockist';
  }

  get currentRoleName(): string {
    return (this.selectedRole || this.formInitialData?.roleName || '').trim();
  }

  get isRegionLevelOnlyRole(): boolean {
    const r = this.currentRoleName.toLowerCase();
    return r.includes('rbh') || r.includes('regional branch head') ||
           r.includes('rsm') || r.includes('regional sales manager') ||
           r.includes('otr');
  }

  get isCountryLevelOnlyRole(): boolean {
    const r = this.currentRoleName.toLowerCase();
    return r.includes('nsm') || r.includes('national sales manager') ||
           r.includes('country head') || r === 'ch';
  }

  /* ================= SAVE & NAVIGATION ================= */

  handleFormError(form?: any): void {
    if (form && form.form) {
      form.form.markAllAsTouched();
    }
    setTimeout(() => {
      const firstError = document.querySelector('.is-invalid') as HTMLElement;
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
    }, 0);
  }

  onFormSubmit(data: any): void {
    if (data) {
      this.formInitialData = { ...this.formInitialData, ...data };
    }
    // Final submission from any step where Submit is clicked
    this.saveUser(this.formInitialData);
  }

  goToNextStep(data?: any): void {
    if (data) {
      this.formInitialData = { ...this.formInitialData, ...data };
    }
    const maxStep = 4;
    if (this.currentStep < maxStep) {
      this.currentStep++;
    }
  }

  handleStepSubmit(data?: any): void {
    const maxStep = 4;
    if (this.currentStep < maxStep) {
      this.goToNextStep(data);
    } else {
      this.onFormSubmit(data);
    }
  }

  handleStepCancel(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.onCancel();
    }
  }

  saveUser(data: any): void {
    const payload = {
      roleName: data.roleName || this.selectedRole,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      phoneNumber: data.phoneNumber,
      alternateNumber: data.alternateNumber,
      branchName: data.branchName,
      companyName: data.companyName,
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      status: 1,
      // Distributor fields (will be undefined if not entered, which is fine)
      distributorName: data.distributorName,
      panNumber: data.panNumber,
      tinNumber: data.tinNumber,
      tanNumber: data.tanNumber,
      serviceTaxNumber: data.serviceTaxNumber,
      salesTaxNumber: data.salesTaxNumber,
      exciseNumber: data.exciseNumber,
      bankName: data.bankName,
      branch: data.branch,
      accountHolderName: data.accountHolderName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      
      // Location Details
      worldNames: this.locationMode === 'world' && this.selWorld ? [this.selWorld] : [],
      geoNames: this.selGeo ? [this.selGeo] : [],
      countryNames: this.locationMode === 'cascade' && this.selCountry ? [this.selCountry] : [],
      regionNames: (this.locationMode === 'cascade' && !this.isCountryLevelOnlyRole && this.selRegion) ? [this.selRegion] : [],
      stateNames: (this.locationMode === 'cascade' && !this.isCountryLevelOnlyRole && !this.isRegionLevelOnlyRole) ? this.selStates : [],
      districtNames: (this.locationMode === 'cascade' && !this.isCountryLevelOnlyRole && !this.isRegionLevelOnlyRole) ? this.selDistricts : [],
      cityNames: (this.locationMode === 'cascade' && !this.isCountryLevelOnlyRole && !this.isRegionLevelOnlyRole) ? this.selCities : [],

      // Product Details
      categoryNames: this.selCategories,
      groupNames: this.selGroups,
      productNames: this.selProducts
    };

    if (this.isEditMode) {
      this.userService.updateUser(this.userId, payload).subscribe({
        next: () => {
          this.toastService.success('User updated successfully');
          this.router.navigate(['/users']);
        },
        error: (err: any) => {
          console.error('Update failed', err);
          const msg = err.error?.message || err.error || 'Failed to update Users';
          this.toastService.error(msg);
        }
      });
    } else {
      this.userService.createUserAdmin(payload).subscribe({
        next: () => {
          this.toastService.success('User created successfully');
          this.router.navigate(['/users']);
        },
        error: (err: any) => {
          console.error('Create failed', err);
          this.toastService.error('Failed to create user. Please check your input and try again.');
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/users']);
  }

  /* ================= STEP NAVIGATION ================= */
  onNextStep(): void {
    if (!this.selectedRole) {
      this.toastService.warning('Please select a role');
      return;
    }

    this.userService.getRoleConfiguration(this.selectedRole).subscribe({
      next: (config) => {
        const locType = config?.locationType?.toUpperCase() || '';
        
        if (locType === 'ALL_GEOS') {
          this.locationMode = 'world';
        } else if (locType === 'SELECT_GEO') {
          this.locationMode = 'geo';
        } else {
          this.locationMode = 'cascade';
        }

        this.productType = config?.productType || '';

        // Pre-populate the role in form data
        this.formInitialData = { ...this.formInitialData, roleName: this.selectedRole };
        this.currentStep = 2;
      },
      error: (err) => {
        console.error('Failed to fetch role configuration', err);
        this.toastService.error('Failed to fetch role configuration');
        // Fallback to cascade if error
        this.locationMode = 'cascade';
        this.formInitialData = { ...this.formInitialData, roleName: this.selectedRole };
        this.currentStep = 2;
      }
    });
  }

  onBackToRoleSelection(): void {
    this.currentStep = 1;
  }

  /* ================= CASCADE: LOCATION ================= */
  onWorldChange(val: string): void {
    this.selWorld = val;
    this.formInitialData.worldNames = val ? [val] : [];
  }

  /* ================= CASCADE: LOCATION ================= */
  onGeoChange(val: string): void {
    this.selGeo = val;
    this.formInitialData.geoNames = val ? [val] : [];
    this.countryOptions = []; this.selCountry = '';
    this.regionOptions = []; this.selRegion = '';
    this.stateOptions = []; this.selStates = [];
    this.districtOptions = []; this.selDistricts = [];
    this.cityOptions = []; this.selCities = [];

    if (val) {
      const geo = this.geoOptions.find(g => g.locationName === val);
      if (geo) {
        this.userService.getLocationsByLevel(3, geo.locationId).subscribe(
          (locs: any[]) => this.countryOptions = locs
        );
      }
    }
  }

  onCountryChange(val: string): void {
    this.selCountry = val;
    this.formInitialData.countryNames = val ? [val] : [];
    this.regionOptions = []; this.selRegion = '';
    this.stateOptions = []; this.selStates = [];
    this.districtOptions = []; this.selDistricts = [];
    this.cityOptions = []; this.selCities = [];

    if (val && !this.isCountryLevelOnlyRole) {
      const country = this.countryOptions.find(c => c.locationName === val);
      if (country) {
        this.userService.getLocationsByLevel(4, country.locationId).subscribe(
          (locs: any[]) => this.regionOptions = locs
        );
      }
    }
  }

  onRegionChange(val: string): void {
    this.selRegion = val;
    this.formInitialData.regionNames = val ? [val] : [];
    this.stateOptions = []; this.selStates = [];
    this.districtOptions = []; this.selDistricts = [];
    this.cityOptions = []; this.selCities = [];

    if (val && !this.isRegionLevelOnlyRole && !this.isCountryLevelOnlyRole) {
      const region = this.regionOptions.find(r => r.locationName === val);
      if (region) {
        this.userService.getLocationsByLevel(5, region.locationId).subscribe(
          (locs: any[]) => this.stateOptions = locs
        );
      }
    }
  }

  onStateCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selStates = [...this.selStates, name];
    } else {
      this.selStates = this.selStates.filter(s => s !== name);
    }
    this.formInitialData.stateNames = this.selStates;

    const selectedStateObjs = this.stateOptions.filter(s => this.selStates.includes(s.locationName));
    if (selectedStateObjs.length) {
      forkJoin(selectedStateObjs.map(s => this.userService.getLocationsByLevel(6, s.locationId)))
        .subscribe(results => {
          const newDistricts = results.flat();
          this.districtOptions = newDistricts;
          const validDistrictNames = new Set(newDistricts.map(d => d.locationName));
          this.selDistricts = this.selDistricts.filter(d => validDistrictNames.has(d));
          this.formInitialData.districtNames = this.selDistricts;

          const selectedDistrictObjs = this.districtOptions.filter(d => this.selDistricts.includes(d.locationName));
          if (selectedDistrictObjs.length) {
            forkJoin(selectedDistrictObjs.map(d => this.userService.getLocationsByLevel(7, d.locationId)))
              .subscribe((cityResults: any[][]) => {
                const newCities = cityResults.flat();
                this.cityOptions = newCities;
                const validCityNames = new Set(newCities.map(c => c.locationName));
                this.selCities = this.selCities.filter(c => validCityNames.has(c));
                this.formInitialData.cityNames = this.selCities;
              });
          } else {
            this.cityOptions = [];
            this.selCities = [];
            this.formInitialData.cityNames = [];
          }
        });
    } else {
      this.districtOptions = [];
      this.selDistricts = [];
      this.formInitialData.districtNames = [];
      this.cityOptions = [];
      this.selCities = [];
      this.formInitialData.cityNames = [];
    }
  }

  onDistrictCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selDistricts = [...this.selDistricts, name];
    } else {
      this.selDistricts = this.selDistricts.filter(d => d !== name);
    }
    this.formInitialData.districtNames = this.selDistricts;

    const selectedDistrictObjs = this.districtOptions.filter(d => this.selDistricts.includes(d.locationName));
    if (selectedDistrictObjs.length) {
      forkJoin(selectedDistrictObjs.map(d => this.userService.getLocationsByLevel(7, d.locationId)))
        .subscribe((results: any[][]) => {
          const newCities = results.flat();
          this.cityOptions = newCities;
          const validCityNames = new Set(newCities.map(c => c.locationName));
          this.selCities = this.selCities.filter(c => validCityNames.has(c));
          this.formInitialData.cityNames = this.selCities;
        });
    } else {
      this.cityOptions = [];
      this.selCities = [];
      this.formInitialData.cityNames = [];
    }
  }

  onCityCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selCities = [...this.selCities, name];
    } else {
      this.selCities = this.selCities.filter(c => c !== name);
    }
    this.formInitialData.cityNames = this.selCities;
  }

  /* ================= CASCADE: PRODUCTS ================= */
  onCategoryCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selCategories = [...this.selCategories, name];
    } else {
      this.selCategories = this.selCategories.filter(c => c !== name);
    }
    this.formInitialData.categoryNames = this.selCategories;

    if (this.selCategories.length) {
      this.groupOptions = this.allGroups.filter(g =>
        this.selCategories.includes(g.category?.categoryName)
      );
      const validGroupNames = new Set(this.groupOptions.map(g => g.groupName));
      this.selGroups = this.selGroups.filter(g => validGroupNames.has(g));
      this.formInitialData.groupNames = this.selGroups;

      this.groupedGroups = [];
      this.selCategories.forEach(cat => {
        const catGroups = this.groupOptions.filter(g => g.category?.categoryName === cat);
        if (catGroups.length > 0) {
          this.groupedGroups.push({ category: cat, groups: catGroups });
        }
      });

      const selectedGroupObjs = this.groupOptions.filter(g => this.selGroups.includes(g.groupName));
      if (selectedGroupObjs.length) {
        forkJoin(selectedGroupObjs.map(g => this.userService.getProductsByGroupId(g.groupId)))
          .subscribe((results: any[][]) => {
            const newProducts = Array.from(new Set(results.flat()));
            this.productOptions = newProducts;
            const validProductNames = new Set(newProducts);
            this.selProducts = this.selProducts.filter(p => validProductNames.has(p));
            this.formInitialData.productNames = this.selProducts;
          });
      } else {
        this.productOptions = [];
        this.selProducts = [];
        this.formInitialData.productNames = [];
      }
    } else {
      this.groupOptions = [];
      this.selGroups = [];
      this.formInitialData.groupNames = [];
      this.groupedGroups = [];
      this.productOptions = [];
      this.selProducts = [];
      this.formInitialData.productNames = [];
    }
  }

  onGroupCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selGroups = [...this.selGroups, name];
    } else {
      this.selGroups = this.selGroups.filter(g => g !== name);
    }
    this.formInitialData.groupNames = this.selGroups;

    const selectedGroupObjs = this.groupOptions.filter(g => this.selGroups.includes(g.groupName));
    if (selectedGroupObjs.length) {
      forkJoin(selectedGroupObjs.map(g => this.userService.getProductsByGroupId(g.groupId)))
        .subscribe((results: any[][]) => {
          const newProducts = Array.from(new Set(results.flat()));
          this.productOptions = newProducts;
          const validProductNames = new Set(newProducts);
          this.selProducts = this.selProducts.filter(p => validProductNames.has(p));
          this.formInitialData.productNames = this.selProducts;

          this.groupedProducts = selectedGroupObjs.map((g, index) => {
            return {
              group: g.groupName,
              products: results[index]
            };
          }).filter(g => g.products && g.products.length > 0);
        });
    } else {
      this.productOptions = [];
      this.selProducts = [];
      this.formInitialData.productNames = [];
      this.groupedProducts = [];
    }
  }

  onProductCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selProducts = [...this.selProducts, name];
    } else {
      this.selProducts = this.selProducts.filter(p => p !== name);
    }
    this.formInitialData.productNames = this.selProducts;
  }
}
