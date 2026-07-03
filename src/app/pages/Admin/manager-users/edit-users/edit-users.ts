import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { ToastService } from '../../../../service/toast.service';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Userservice } from '../../../../service/userservice';
import { UserTargetService } from '../../../../service/user-target.service';

/** Which card panel is currently open */
type ActivePanel = 'userDetails' | 'changeRole' | 'locations' | 'products' | null;

@Component({
  selector: 'app-edit-users',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader],
  providers: [Userservice],
  templateUrl: './edit-users.html',
  styleUrl: './edit-users.css'
})
export class EditUsersComponent implements OnInit {

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

  get isDistributor(): boolean {
    return this.userData?.roleName?.toLowerCase() === 'distributor';
  }

  get isStockist(): boolean {
    return this.userData?.roleName?.toLowerCase() === 'stockist';
  }

  constructor(
    private userService: Userservice,
    private userTargetService: UserTargetService,
    private router: Router,
    private route: ActivatedRoute,
      private toastService: ToastService
  ) { }

  /* ─── Header ─────────────────────────────────────────── */
  headerTitle = 'Edit User';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Users', route: '/users' },
    { label: 'Edit User' }
  ];

  /* ─── State ───────────────────────────────────────────── */
  userId!: number;
  userData: any = {};
  userDetailsSubmitted = false;
  productsSubmitted = false;
  userName = '';           // displayed in breadcrumb / header
  isLoading = false;
  isUserLoading = true;
  isSubmitting = false;
  activePanel: ActivePanel = null;

  /* ─── Dropdown options ────────────────────────────────── */
  roles: string[] = [];
  branches: string[] = [];
  categories: string[] = [];
  allGroups: any[] = [];
  worldOptions: string[] = [];

  /* ─── Location cascade ───────────────────────────────── */
  geoOptions: any[] = [];
  countryOptions: any[] = [];
  regionOptions: any[] = [];
  stateOptions: any[] = [];
  districtOptions: any[] = [];
  cityOptions: any[] = [];

  selGeo = '';
  selCountry = '';
  selRegion = '';
  selStates: string[] = [];
  selDistricts: string[] = [];
  selCities: string[] = [];
  selWorld = '';

  /* ─── Product cascade ────────────────────────────────── */
  groupOptions: any[] = [];
  productOptions: string[] = [];
  selCategories: string[] = [];
  selGroups: string[] = [];
  selProducts: string[] = [];

  /* ================= DYNAMIC CONFIGURATION ================= */
  locationMode: 'world' | 'geo' | 'cascade' = 'cascade';
  productType: string = '';

  /* ══════════════════════════════════════════════════════
     LIFECYCLE
  ══════════════════════════════════════════════════════ */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toastService.error('User ID not provided');
      this.router.navigate(['/users']);
      return;
    }
    this.userId = +id;
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading = false;
    this.isUserLoading = true;

    forkJoin({
      roles: this.userService.getRoles(),
      branches: this.userService.getBranches(),
      categories: this.userService.getCategories(),
      worlds: this.userService.getWorlds(),
      allGroups: this.userService.getAllGroups(),
      geos: this.userService.getLocationsByLevel(2)
    }).subscribe({
      next: ({ roles, branches, categories, worlds, allGroups, geos }) => {
        this.roles = roles.filter((r: string) => r.toLowerCase().replace(/\s+/g, '') !== 'superadmin');
        this.branches = branches;
        this.categories = categories;
        this.worldOptions = worlds;
        
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
        
        this.geoOptions = geos;
        this.loadUser();
      },
      error: (err) => {
        console.error('Failed to load dropdown options', err);
        this.loadUser(); // still try to load user even if dropdowns fail
      }
    });
  }

  private loadUser(): void {
    this.isUserLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (result: any) => {
        // Backend may return an array or a single object
        const user = Array.isArray(result)
          ? (result.find((u: any) => u.userId === this.userId) ?? result[0])
          : result;

        if (!user) {
          this.toastService.error('User not found');
          this.router.navigate(['/users']);
          return;
        }

        this.userData = { 
          ...user,
          roleName: user.role?.roleName || user.roleName,
          branchName: user.branch?.branchName || user.branchName,
          companyName: user.company?.companyName || user.companyName
        };
        this.userName = user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : (user.firstName ?? user.username ?? '');

        this.updateBreadcrumbs();

        if (this.userData.roleName) {
          this.userService.getRoleConfiguration(this.userData.roleName).subscribe({
            next: (config) => {
              const locType = config?.locationType?.toUpperCase() || '';
              if (locType === 'ALL_GEOS' || locType === 'WORLD') {
                this.locationMode = 'world';
              } else if (locType === 'SELECT_GEO' || locType === 'GEO') {
                this.locationMode = 'geo';
              } else {
                this.locationMode = 'cascade';
              }
              this.productType = config?.productType || '';
              
              this.prepopulateSelections();
              this.isUserLoading = false;
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Failed to load role config', err);
              this.locationMode = 'cascade';
              this.prepopulateSelections();
              this.isUserLoading = false;
              this.isLoading = false;
            }
          });
        } else {
          this.prepopulateSelections();
          this.isUserLoading = false;
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error('Failed to load user', err);
        this.toastService.error('Failed to load user data. Please try again.');
        this.isUserLoading = false;
        this.isLoading = false;
      }
    });
  }

  private prepopulateSelections(): void {
    // 1. Locations
    const mode = this.locationMode;
    if (mode === 'world') {
      this.selWorld = this.userData.worldNames?.[0] || '';
    } else if (mode === 'geo') {
      this.selGeo = this.userData.geoNames?.[0] || '';
    } else {
      // cascade
      this.selGeo = this.userData.geoNames?.[0] || '';
      if (this.selGeo) {
        const geoObj = this.geoOptions.find(g => g.locationName === this.selGeo);
        if (geoObj) {
          this.userService.getLocationsByLevel(3, geoObj.locationId).subscribe((countries: any[]) => {
            this.countryOptions = countries;
            this.selCountry = this.userData.countryNames?.[0] || '';
            if (this.selCountry) {
              const countryObj = this.countryOptions.find(c => c.locationName === this.selCountry);
              if (countryObj) {
                this.userService.getLocationsByLevel(4, countryObj.locationId).subscribe((regions: any[]) => {
                  this.regionOptions = regions;
                  this.selRegion = this.userData.regionNames?.[0] || '';
                  if (this.selRegion) {
                    const regionObj = this.regionOptions.find(r => r.locationName === this.selRegion);
                    if (regionObj) {
                      this.userService.getLocationsByLevel(5, regionObj.locationId).subscribe((states: any[]) => {
                        this.stateOptions = states;
                        this.selStates = this.userData.stateNames || [];
                        const stateObjs = this.stateOptions.filter(s => this.selStates.includes(s.locationName));
                        if (stateObjs.length) {
                          forkJoin(stateObjs.map(s => this.userService.getLocationsByLevel(6, s.locationId)))
                            .subscribe(results => {
                              this.districtOptions = results.flat();
                              this.selDistricts = this.userData.districtNames || [];
                              const distObjs = this.districtOptions.filter(d => this.selDistricts.includes(d.locationName));
                              if (distObjs.length) {
                                forkJoin(distObjs.map(d => this.userService.getLocationsByLevel(7, d.locationId)))
                                  .subscribe(cityResults => {
                                    this.cityOptions = cityResults.flat();
                                    this.selCities = this.userData.cityNames || [];
                                  });
                              }
                            });
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        }
      }
    }

    // 2. Products
    this.selCategories = this.userData.categoryNames || [];
    if (this.selCategories.length && this.allGroups.length) {
      this.groupOptions = this.allGroups.filter(g =>
        this.selCategories.includes(g.category?.categoryName)
      );
      this.selGroups = this.userData.groupNames || [];
      const selectedGroupObjs = this.groupOptions.filter(g => this.selGroups.includes(g.groupName));
      if (selectedGroupObjs.length) {
        forkJoin(selectedGroupObjs.map(g => this.userService.getProductsByGroupId(g.groupId)))
          .subscribe(results => {
            this.productOptions = Array.from(new Set(results.flat()));
            this.selProducts = this.userData.productNames || [];
          });
      }
    }
  }

  /* ══════════════════════════════════════════════════════
     CARD TOGGLE
  ══════════════════════════════════════════════════════ */
  openPanel(panel: ActivePanel): void {
    this.activePanel = this.activePanel === panel ? null : panel;
    this.updateBreadcrumbs();
  }

  closePanel(): void {
    this.activePanel = null;
    this.updateBreadcrumbs();
  }

  updateBreadcrumbs(): void {
    const role = this.userData?.roleName ? ` (${this.userData.roleName})` : '';
    const baseLabel = this.userName ? `Edit ${this.userName}${role}` : 'Edit User';
    
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/admindashboard' },
      { label: 'Manage Users', route: '/users' },
      { label: baseLabel }
    ];

    if (this.activePanel) {
      let panelLabel = '';
      switch (this.activePanel) {
        case 'userDetails':
          panelLabel = 'edit user';
          break;
        case 'changeRole':
          panelLabel = 'change role';
          break;
        case 'locations':
          panelLabel = 'edit locations';
          break;
        case 'products':
          panelLabel = 'edit products';
          break;
      }
      this.headerBreadcrumbs.push({ label: panelLabel });
    }
  }

  /* ══════════════════════════════════════════════════════
     USER DETAILS SAVE
  ══════════════════════════════════════════════════════ */
  scrollToError(): void {
    const firstError = document.querySelector('.is-invalid') as HTMLElement;
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }

  getCleanPayload(): any {
    return {
      ...this.userData,
      roleName: this.userData.role?.roleName || this.userData.roleName,
      branchName: this.userData.branch?.branchName || this.userData.branchName,
      companyName: this.userData.company?.companyName || this.userData.companyName,
      branch: undefined, // remove nested objects to avoid mapping errors on backend
      role: undefined,
      company: undefined,
      locationInfo: undefined,
      LocationInfo: undefined,
      createdTime: undefined,
      modifiedTime: undefined
    };
  }

  saveUserDetails(): void {
    this.userDetailsSubmitted = true;
    if (
      !this.userData.firstName || 
      !this.userData.email || 
      !this.userData.username ||
      !this.userData.phoneNumber ||
      !this.userData.branchName ||
      !this.userData.city ||
      (this.isDistributor && !this.userData.distributorName) ||
      (this.isStockist && !this.userData.stockistName)
    ) {
      this.toastService.error('Please fill in all required fields.');
      setTimeout(() => {
        const firstError = document.querySelector('.text-danger');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const input = firstError.parentElement?.querySelector('input, select, textarea') as HTMLElement;
          if (input) {
            input.focus();
          }
        }
      }, 0);
      return;
    }
    this.isSubmitting = true;

    this.userService.updateUser(this.userId, this.getCleanPayload()).subscribe({
      next: () => {
        this.toastService.success('User details updated successfully!');
        this.isSubmitting = false;
        this.closePanel();
      },
      error: (err: any) => {
        console.error('Error updating user details:', err);
        this.toastService.error('Failed to update user details. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     CHANGE ROLE SAVE
  ══════════════════════════════════════════════════════ */
  saveRole(): void {
    if (!this.userData.roleName) {
      this.toastService.error('Please select a role.');
      return;
    }
    this.isSubmitting = true;

    this.userService.updateUser(this.userId, this.getCleanPayload()).subscribe({
      next: () => {
        this.toastService.success('Role updated successfully!');
        
        // Fetch new role configuration and update locationMode/productType
        this.userService.getRoleConfiguration(this.userData.roleName).subscribe({
          next: (config) => {
            const locType = config?.locationType?.toUpperCase() || '';
            if (locType === 'ALL_GEOS' || locType === 'WORLD') {
              this.locationMode = 'world';
            } else if (locType === 'SELECT_GEO' || locType === 'GEO') {
              this.locationMode = 'geo';
            } else {
              this.locationMode = 'cascade';
            }
            this.productType = config?.productType || '';
            
            this.prepopulateSelections();
            this.isSubmitting = false;
            this.closePanel();
          },
          error: (err) => {
            console.error('Error fetching role config after update', err);
            this.locationMode = 'cascade';
            this.isSubmitting = false;
            this.closePanel();
          }
        });
      },
      error: (err: any) => {
        console.error('Error updating role:', err);
        this.toastService.error('Failed to update role. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     LOCATIONS SAVE
  ══════════════════════════════════════════════════════ */
  saveLocations(): void {
    this.isSubmitting = true;

    this.userData.worldNames = this.locationMode === 'world' && this.selWorld ? [this.selWorld] : [];
    this.userData.geoNames = this.selGeo ? [this.selGeo] : [];
    this.userData.countryNames = this.locationMode === 'cascade' && this.selCountry ? [this.selCountry] : [];
    this.userData.regionNames = this.locationMode === 'cascade' && this.selRegion ? [this.selRegion] : [];
    this.userData.stateNames = this.locationMode === 'cascade' ? this.selStates : [];
    this.userData.districtNames = this.locationMode === 'cascade' ? this.selDistricts : [];
    this.userData.cityNames = this.locationMode === 'cascade' ? this.selCities : [];

    this.userService.updateUser(this.userId, this.getCleanPayload()).subscribe({
      next: () => {
        this.toastService.success('Location details updated successfully!');
        this.isSubmitting = false;
        this.closePanel();
      },
      error: (err: any) => {
        console.error('Error updating locations:', err);
        this.toastService.error('Failed to update location details. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     PRODUCTS SAVE
  ══════════════════════════════════════════════════════ */
  saveProducts(): void {
    this.productsSubmitted = true;
    if (this.categories.length > 0 && this.selCategories.length === 0) {
      this.toastService.error('Please select at least one Category.');
      setTimeout(() => this.scrollToError(), 0);
      return;
    }
    if (this.groupOptions.length > 0 && this.selGroups.length === 0) {
      this.toastService.error('Please select at least one Group.');
      setTimeout(() => this.scrollToError(), 0);
      return;
    }
    if (this.productOptions.length > 0 && this.selProducts.length === 0) {
      this.toastService.error('Please select at least one Product.');
      setTimeout(() => this.scrollToError(), 0);
      return;
    }
    this.isSubmitting = true;

    this.userData.categoryNames = this.selCategories;
    this.userData.groupNames = this.selGroups;
    this.userData.productNames = this.selProducts;

    this.userService.updateUser(this.userId, this.getCleanPayload()).subscribe({
      next: () => {
        this.toastService.success('Product details updated successfully!');
        this.isSubmitting = false;
        this.closePanel();
      },
      error: (err: any) => {
        console.error('Error updating products:', err);
        this.toastService.error('Failed to update product details. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     LOCATION CASCADE HANDLERS
  ══════════════════════════════════════════════════════ */
  onWorldChange(val: string): void { this.selWorld = val; }

  onGeoChange(val: string): void {
    this.selGeo = val;
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
    this.selStates = checked
      ? [...this.selStates, name]
      : this.selStates.filter(s => s !== name);
    this.districtOptions = []; this.selDistricts = [];
    this.cityOptions = []; this.selCities = [];

    const selectedObjs = this.stateOptions.filter(s => this.selStates.includes(s.locationName));
    if (selectedObjs.length) {
      forkJoin(selectedObjs.map(s => this.userService.getLocationsByLevel(6, s.locationId)))
        .subscribe(results => this.districtOptions = results.flat());
    }
  }

  onDistrictCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selDistricts = checked
      ? [...this.selDistricts, name]
      : this.selDistricts.filter(d => d !== name);
    this.cityOptions = []; this.selCities = [];

    const selectedObjs = this.districtOptions.filter(d => this.selDistricts.includes(d.locationName));
    if (selectedObjs.length) {
      forkJoin(selectedObjs.map(d => this.userService.getLocationsByLevel(7, d.locationId)))
        .subscribe((results: any[][]) => this.cityOptions = results.flat());
    }
  }

  onCityCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selCities = checked
      ? [...this.selCities, name]
      : this.selCities.filter(c => c !== name);
  }

  /* ══════════════════════════════════════════════════════
     PRODUCT CASCADE HANDLERS
  ══════════════════════════════════════════════════════ */
  onCategoryCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selCategories = checked
      ? [...this.selCategories, name]
      : this.selCategories.filter(c => c !== name);
    this.groupOptions = []; this.selGroups = [];
    this.productOptions = []; this.selProducts = [];

    if (this.selCategories.length) {
      this.groupOptions = this.allGroups.filter(g =>
        this.selCategories.includes(g.category?.categoryName)
      );
    }
  }

  onGroupCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selGroups = checked
      ? [...this.selGroups, name]
      : this.selGroups.filter(g => g !== name);
    this.productOptions = []; this.selProducts = [];

    const selectedObjs = this.groupOptions.filter(g => this.selGroups.includes(g.groupName));
    if (selectedObjs.length) {
      forkJoin(selectedObjs.map(g => this.userService.getProductsByGroupId(g.groupId)))
        .subscribe((results: any[][]) => {
          this.productOptions = Array.from(new Set(results.flat()));
        });
    }
  }

  onProductCheck(event: Event, name: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selProducts = checked
      ? [...this.selProducts, name]
      : this.selProducts.filter(p => p !== name);
  }

  /* ══════════════════════════════════════════════════════
     NAVIGATION
  ══════════════════════════════════════════════════════ */
  goBack(): void {
    this.router.navigate(['/users']);
  }
}
