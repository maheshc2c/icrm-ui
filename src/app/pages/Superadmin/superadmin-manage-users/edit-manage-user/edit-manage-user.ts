import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';

import { ManageUserService } from '../../../../service/manageuserservice';
import { Companyservice } from '../../../../service/companyservice';
import { BranchService } from '../../../../service/branchservice';
import { Breadcrumb } from '../../../../models/breadcrumb';

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: any[];
}

@Component({
  selector: 'app-edit-manage-user',
  standalone: true,
  imports: [CommonModule, Form, Header, Sidebar, Pageheader],
  templateUrl: './edit-manage-user.html',
  styleUrls: ['./edit-manage-user.css'],
})
export class EditManageUserComponent implements OnInit {

  constructor(
    private manageUserService: ManageUserService,
    private companyService: Companyservice,
    private branchService: BranchService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  headerTitle = 'Edit Manage User';
  headerBreadcrumbs: Breadcrumb[] = [];

  manageUserId!: string;
  formInitialData: any = {};
  companies: any[] = [];
  branches: any[] = [];
  isDataLoaded = false;

  currentUser: any;

  manageUserFields: FormField[] = [
    { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
    { name: 'company', label: 'Company', type: 'select', required: true, options: [] },
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'phoneNumber', label: 'Mobile Number', type: 'text', required: true },
    { name: 'email', label: 'Email ID', type: 'email', required: true },
    { name: 'address1', label: 'Address', type: 'textarea' },
    { name: 'address2', label: 'Address 1', type: 'textarea' },
    { name: 'state', label: 'State', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'branch', label: 'Branch', type: 'select', required: true, options: [] }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      alert('Invalid user');
      this.router.navigate(['/superadmin/manage-users']);
      return;
    }

    this.manageUserId = id;

    this.loadAllData(id);
  }

  loadAllData(id: string) {
    forkJoin({
      companies: this.companyService.getCompanies().pipe(catchError(() => of([]))),
      branches: this.branchService.getBranches().pipe(catchError(() => of([]))),
      user: this.manageUserService.getUserById(id).pipe(
        catchError(err => {
          console.error('USER API ERROR:', err);
          return of(null);
        })
      )
    }).subscribe(({ companies, branches, user }) => {

      console.log('USER RESPONSE:', user);

      if (!user) {
        alert('User not found');
        return;
      }

      this.currentUser = user;

      this.companies = companies.map((c: any) => ({
        label: c.companyName,
        value: c.companyId
      }));

      this.branches = branches.map((b: any) => ({
        label: b.branchName,
        value: b.branchId
      }));

      this.manageUserFields = this.manageUserFields.map(field => {
        if (field.name === 'company') return { ...field, options: this.companies };
        if (field.name === 'branch') return { ...field, options: this.branches };
        return field;
      });

      this.formInitialData = {
        employeeId: user.username,
        company: user.company?.companyId,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        address1: user.address1 || '',
        address2: user.address2 || '',
        state: user.state || '',
        city: user.city || '',
        branch: user.branch?.branchId
      };

      this.isDataLoaded = true;
    });
  }

  saveManageUser(data: any): void {

    const selectedCompany = this.companies.find(c => c.value === data.company);
    const selectedBranch = this.branches.find(b => b.value === data.branch);

    const payload = {
      id: Number(this.manageUserId),
      username: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address1: data.address1,
      address2: data.address2,
      state: data.state,
      city: data.city,
      companyName: selectedCompany?.label,
      branchName: selectedBranch?.label,
      status: 1
    };

    this.manageUserService.updateUser(this.manageUserId, payload).subscribe({
      next: () => {
         this.manageUserService.clearUsersCache();
        alert('User updated successfully');
        this.router.navigate(['/superadmin/manage-users']);
      },
      error: err => {
        console.error('Update failed:', err);
        alert('Update failed');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/superadmin/manage-users']);
  }
}