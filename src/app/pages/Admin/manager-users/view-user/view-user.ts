import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Userservice } from '../../../../service/userservice';
import { ToastService } from '../../../../service/toast.service';

@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader],
  providers: [Userservice],
  templateUrl: './view-user.html',
  styleUrl: './view-user.css'
})
export class ViewUserComponent implements OnInit {

  constructor(
    private userService: Userservice,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /* ─── Header ─────────────────────────────────────────── */
  headerTitle = 'View User Profile';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Users', route: '/users' },
    { label: 'View User' }
  ];

  /* ─── State ───────────────────────────────────────────── */
  userId!: number;
  userData: any = null;
  userName = '';
  isUserLoading = true;
  locationMode: 'world' | 'geo' | 'cascade' = 'cascade';
  productType: string = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toastService.error('User ID not provided');
      this.router.navigate(['/users']);
      return;
    }
    this.userId = +id;
    this.loadUser();
  }

  private loadUser(): void {
    this.isUserLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (result: any) => {
        console.log('Fetched user view profile:', result);
        const user = Array.isArray(result) ? result[0] : result;
        this.userData = user;
        
        if (user) {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          this.userName = fullName || user.username || 'User';
          const roleName = user.role?.roleName || user.roleName || '';
          const roleLabel = roleName ? ` (${roleName})` : '';
          
          this.headerBreadcrumbs = [
            { label: 'Home', route: '/admindashboard' },
            { label: 'Manage Users', route: '/users' },
            { label: `View ${this.userName}${roleLabel}` }
          ];

          if (roleName) {
            this.userService.getRoleConfiguration(roleName).subscribe({
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
                this.isUserLoading = false;
              },
              error: (err) => {
                console.error('Failed to fetch role configuration:', err);
                this.isUserLoading = false;
              }
            });
            return;
          }
        }
        this.isUserLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load user profile details:', err);
        this.toastService.error('Could not retrieve user details.');
        this.router.navigate(['/users']);
      }
    });
  }

  get isDistributor(): boolean {
    const roleName = this.userData?.role?.roleName || this.userData?.roleName || '';
    return roleName.toUpperCase() === 'DISTRIBUTOR';
  }

  get isStockist(): boolean {
    const roleName = this.userData?.role?.roleName || this.userData?.roleName || '';
    return roleName.toUpperCase() === 'STOCKIST';
  }

  /* ─── Assigned Location & Product Getters ─────────────── */
  get assignedGeos(): string[] {
    if (this.locationMode === 'world' || (this.userData?.worldNames && this.userData.worldNames.length > 0)) {
      return ['All GEOS'];
    }
    return this.userData?.geoNames || [];
  }

  get assignedCountries(): string[] {
    return this.userData?.countryNames || [];
  }

  get assignedRegions(): string[] {
    return this.userData?.regionNames || [];
  }

  get assignedStates(): string[] {
    return this.userData?.stateNames || [];
  }

  get assignedDistricts(): string[] {
    return this.userData?.districtNames || [];
  }

  get assignedCities(): string[] {
    return this.userData?.cityNames || [];
  }

  get assignedCategories(): string[] {
    if (this.productType === 'ALL_PRODUCTS') {
      return ['All Categories'];
    }
    return this.userData?.categoryNames || [];
  }

  get assignedGroups(): string[] {
    if (this.productType === 'ALL_PRODUCTS') {
      return ['All Groups'];
    }
    return this.userData?.groupNames || [];
  }

  get assignedProducts(): string[] {
    if (this.productType === 'ALL_PRODUCTS') {
      return ['All Products Assigned'];
    }
    if (this.productType === 'NO_PRODUCTS') {
      return ['No Products Assigned'];
    }
    return this.userData?.productNames || [];
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
