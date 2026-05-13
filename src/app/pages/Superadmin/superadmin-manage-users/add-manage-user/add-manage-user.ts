import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { ManageUserService } from '../../../../service/manageuserservice';
import { Companyservice } from '../../../../service/companyservice';
import { BranchService } from '../../../../service/branchservice';
import { Breadcrumb } from '../../../../models/breadcrumb';


@Component({
  selector: 'app-add-manage-user',
  imports: [CommonModule, Form, Header, Sidebar, Pageheader],
  templateUrl: './add-manage-user.html',
  styleUrls: ['./add-manage-user.css'],
})
export class AddManageUser implements OnInit {

  constructor(
    private manageUserService: ManageUserService,
    private companyService: Companyservice,
    private branchService: BranchService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /* ================= HEADER ================= */
  headerTitle = 'Add New Manage User';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= FORM STATE ================= */
  isEditMode = false;
  manageUserId!: string;
  formInitialData: any = {};
  companies: any[] = [];
  branches: any[] = [];
  isLoading = false;

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    this.isLoading = true;
    // Check current user profile to verify permissions
    this.manageUserService.getProfile().subscribe({
      next: (profile) => {
        console.log('Current user profile:', profile);
      },
      error: (err) => {
        console.error('Failed to get profile:', err);
      }
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.setupEditMode(id);
    } else {
      this.setupCreateMode();
      this.loadDropdownData();
    }
  }

  /* ================= LOAD DROPDOWN DATA ================= */
  private loadDropdownData(): void {
    this.isLoading = true;
    // Load companies
    this.companyService.getCompanies().subscribe({
      next: (companies: any[]) => {
        this.companies = companies.map(company => ({
          label: company.companyName,
          value: company.companyName
        }));
        this.updateFormFields();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load companies:', err);
        this.isLoading = false;
        if (err.status === 403) {
          alert('You do not have permission to load company data.');
        }
      }
    });

    // Load branches
    this.branchService.getBranches().subscribe({
      next: (branches: any[]) => {
        this.branches = branches.map(branch => ({
          label: branch.branchName,
          value: branch.branchName
        }));
        this.updateFormFields();
      },
      error: (err: any) => {
        console.error('Failed to load branches:', err);
        if (err.status === 403) {
          alert('You do not have permission to load branch data.');
        }
      }
    });
  }

  /* ================= UPDATE FORM FIELDS ================= */
  private updateFormFields(): void {
    const companyField = this.manageUserFields.find(field => field.name === 'company');
    const branchField = this.manageUserFields.find(field => field.name === 'branch');

    if (companyField) {
      companyField.options = this.companies;
    }

    if (branchField) {
      branchField.options = this.branches;
    }
    this.manageUserFields = [...this.manageUserFields];
  }

  /* ================= MODE SETUP ================= */
  private setupEditMode(id: string): void {
    this.isEditMode = true;
    this.manageUserId = id;

    this.headerTitle = 'Edit Manage User';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/superadmindashboard' },
      { label: 'Manage User', route: '/superadmin/manage-users' },
      { label: 'Edit Manage User' }
    ];

    // Load dropdowns and user data in parallel, then set formInitialData
    // This ensures dropdown options are populated BEFORE form data is applied
    forkJoin({
      companies: this.companyService.getCompanies(),
      branches: this.branchService.getBranches(),
      user: this.manageUserService.getUserById(id)
    }).subscribe({
      next: ({ companies, branches, user }) => {
        console.log('Edit Data Loaded:', { companies, branches, user });

        if (!user) {
          alert('User not found');
          this.router.navigate(['/superadmin/manage-users']);
          return;
        }

        // Populate dropdown options first
        this.companies = companies.map((c: any) => ({ label: c.companyName, value: c.companyName }));
        this.branches = branches.map((b: any) => ({ label: b.branchName, value: b.branchName }));

        // Update fields and trigger change detection for fields array
        this.updateFormFields();
        this.manageUserFields = [...this.manageUserFields];

        // Then set form data so Angular can match dropdown values
        this.formInitialData = {
          employeeId: user.username,
          company: (user as any).company?.companyName || (user as any).companyName || '',
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          address1: (user as any).address1 || '',
          address2: (user as any).address2 || '',
          state: (user as any).state || '',
          city: (user as any).city || '',
          branch: (user as any).branch?.branchName || (user as any).branchName || ''
        };
        console.log('formInitialData set to:', this.formInitialData);
      },
      error: (err) => {
        console.error('Failed to load edit data:', err);
        alert('Failed to load user data');
      }
    });
  }

  private setupCreateMode(): void {
    this.isEditMode = false;

    this.headerTitle = 'Add New Manage User';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/superadmindashboard' },
      { label: 'Manage User', route: '/superadmin/manage-users' },
      { label: 'Add Manage User' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  manageUserFields = [
    { name: 'employeeId', label: 'Employee ID', placeholder: 'Employee ID', type: 'text', required: true },
    { name: 'company', label: 'Company', placeholder: 'Company', type: 'select', required: true, options: [] as any[] },
    { name: 'firstName', label: 'First Name', placeholder: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', placeholder: 'Last Name', type: 'text', required: true },
    { name: 'phoneNumber', label: 'Mobile Number', placeholder: 'Mobile Number', type: 'text', required: true },
    { name: 'email', label: 'Email ID', placeholder: 'Email ID', type: 'email', required: true },
    { name: 'address1', label: 'Address', placeholder: 'Address', type: 'textarea', required: false },
    { name: 'address2', label: 'Address 1', placeholder: 'Address 1', type: 'textarea', required: false },
    { name: 'state', label: 'State', placeholder: 'State', type: 'text', required: false },
    { name: 'city', label: 'City', placeholder: 'City', type: 'text', required: false },
    { name: 'branch', label: 'Branch', placeholder: 'Branch', type: 'select', required: true, options: [] as any[] }
  ];

  /* ================= SAVE ================= */
  saveManageUser(data: any): void {
    // Transform payload to match backend DTO
    const payload = {
      ...data,
      username: data.employeeId, // Map employeeId to username
      companyName: data.company,  // Map company (name) to companyName
      branchName: data.branch,    // Map branch (name) to branchName
      status: 1
    };

    // Debug: Log the final payload
    console.log('Final payload being sent:', JSON.stringify(payload, null, 2));

    if (this.isEditMode) {
      this.manageUserService.updateUser(this.manageUserId, payload).subscribe({
        // next: () => this.router.navigate(['/superadmin/manage-users']),
         next: () => {
          this.manageUserService.clearUsersCache();
          this.router.navigate(['/superadmin/manage-users']);
        },
        error: (err: any) => {
          console.error('Update failed', err);
          alert('Failed to update user');
        }
      });
    } else {
      this.manageUserService.createUser(payload).subscribe({
        // next: () => this.router.navigate(['/superadmin/manage-users']),
         next: () => {
          this.manageUserService.clearUsersCache();
          this.router.navigate(['/superadmin/manage-users']);
        },
        error: (err: any) => {
          console.error('Create failed', err);
          alert('Failed to create user');
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/superadmin/manage-users']);
  }
}
