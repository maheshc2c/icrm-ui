import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Header } from "../../../../layout/header/header";
import { Sidebar } from "../../../../layout/sidebar/sidebar";
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Breadcrumb } from "../../../../models/breadcrumb";
import { Userservice } from "../../../../service/userservice";

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
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /* ================= HEADER ================= */
  headerTitle = 'Add New Users';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Users', route: '/admin/manage-users' },
    { label: 'Add Users' }
  ];

  /* ================= FORM STATE ================= */
  isEditMode = false;
  userId!: number;
  formInitialData: any = {};

  /* ================= MULTI-STEP STATE ================= */
  currentStep: number = 1;
  selectedRole: string = '';
  roles: string[] = ['USER', 'ADMIN', 'HELPER', 'POLICE'];

  /* ===== ROLE-BASED LOCATION RULES (matched to backend createUser logic) ===== */
  private readonly WORLD_LEVEL_ROLES = [
    'adminmarketing', 'globalhead', 'stockist',
    'customerinteractioncenter'
  ];
  private readonly GEO_LEVEL_ROLES = ['salesdirector'];

  /** 'world' | 'geo' | 'cascade' */
  get locationMode(): 'world' | 'geo' | 'cascade' {
    const r = this.selectedRole.toLowerCase().replace(/\s+/g, '');
    if (this.WORLD_LEVEL_ROLES.includes(r)) return 'world';
    if (this.GEO_LEVEL_ROLES.includes(r)) return 'geo';
    return 'cascade';
  }

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
  productOptions: string[] = [];

  selCategories: string[] = [];
  selGroups: string[] = [];
  selProducts: string[] = [];
  categories: string[] = [];

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
      roles: this.userService.getRoles(),
      branches: this.userService.getBranches(),
      categories: this.userService.getCategories(),
      worlds: this.userService.getWorlds(),
      allGroups: this.userService.getAllGroups()
    }).subscribe({
      next: ({ roles, branches, categories, worlds, allGroups }) => {
        this.roles = roles;
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

        // Load top-level geos (levelId=2) on startup
        this.userService.getLocationsByLevel(2).subscribe({
          next: (locs: any[]) => this.geoOptions = locs,
          error: (err: any) => console.error('Failed to load geos', err)
        });
      },
      error: (err) => console.error('Failed to load dropdown options', err)
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
      { label: 'Manage Users', route: '/admin/manage-users' },
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

  /* ================= SAVE & NAVIGATION ================= */

  handleStepSubmit(data: any): void {
    // Merge data from current step
    this.formInitialData = { ...this.formInitialData, ...data };

    // Validation for Product Details (Step 4)
    if (this.currentStep === 4) {
      if (this.selCategories.length > 0) {
        if (this.selGroups.length === 0) {
          alert('Please select at least one Product Group for the chosen Categories.');
          return;
        }
        if (this.selProducts.length === 0) {
          alert('Please select at least one Product for the chosen Groups.');
          return;
        }
      }
    }

    const maxStep = this.isDistributor ? 5 : 4;

    if (this.currentStep < maxStep) {
      this.currentStep++;
    } else {
      // Final submission
      this.saveUser(this.formInitialData);
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
    const payload = { ...data, status: 1 };

    if (this.isEditMode) {
      this.userService.updateUser(this.userId, payload).subscribe({
        next: () => this.router.navigate(['/admin/manage-users']),
        error: (err: any) => {
          console.error('Update failed', err);
          const msg = err.error || 'Failed to update Users';
          alert(msg);
        }
      });
    } else {
      this.userService.createUserAdmin(payload).subscribe({
        next: () => this.router.navigate(['/admin/manage-users']),
        error: (err: any) => {
          console.error('Create failed', err);
          const msg = err.error?.message || err.error || 'Failed to create user. Please check your input and try again.';
          alert(msg);
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/admin/manage-users']);
  }

  /* ================= STEP NAVIGATION ================= */
  onNextStep(): void {
    if (!this.selectedRole) {
      alert('Please select a role');
      return;
    }

    // Pre-populate the role in form data
    this.formInitialData = { ...this.formInitialData, roleName: this.selectedRole };
    this.currentStep = 2;
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

    if (val) {
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

    if (val) {
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
    // Reset downstream
    this.districtOptions = []; this.selDistricts = [];
    this.cityOptions = []; this.selCities = [];

    // Load districts for ALL checked states
    const selectedStateObjs = this.stateOptions.filter(s => this.selStates.includes(s.locationName));
    if (selectedStateObjs.length) {
      forkJoin(selectedStateObjs.map(s => this.userService.getLocationsByLevel(6, s.locationId)))
        .subscribe(results => this.districtOptions = results.flat());
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
    // Reset cities
    this.cityOptions = []; this.selCities = [];

    // Load cities for ALL checked districts
    const selectedDistrictObjs = this.districtOptions.filter(d => this.selDistricts.includes(d.locationName));
    if (selectedDistrictObjs.length) {
      forkJoin(selectedDistrictObjs.map(d => this.userService.getLocationsByLevel(7, d.locationId)))
        .subscribe((results: any[][]) => this.cityOptions = results.flat());
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
    
    this.groupOptions = []; this.selGroups = []; this.formInitialData.groupNames = [];
    this.productOptions = []; this.selProducts = []; this.formInitialData.productNames = [];

    if (this.selCategories.length) {
      this.groupOptions = this.allGroups.filter(g =>
        this.selCategories.includes(g.category?.categoryName)
      );
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

    this.productOptions = []; this.selProducts = []; this.formInitialData.productNames = [];

    const selectedGroupObjs = this.groupOptions.filter(g => this.selGroups.includes(g.groupName));
    if (selectedGroupObjs.length) {
      forkJoin(selectedGroupObjs.map(g => this.userService.getProductsByGroupId(g.groupId)))
        .subscribe((results: any[][]) => {
          this.productOptions = Array.from(new Set(results.flat()));
        });
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
