import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Breadcrumb } from '../../../models/breadcrumb';
import { UserTargetService } from '../../../service/user-target.service';

@Component({
    standalone: true,
    selector: 'app-target-role',
    imports: [
        CommonModule,
        Header,
        Sidebar,
        Pageheader,
        DataTable
    ],
    templateUrl: './target-role.html',
    styleUrl: './target-role.css'
})
export class TargetRoleComponent implements OnInit {

    headerTitle = 'Target Role';

    headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'Target Role' }
    ];

    columns = [
        { header: 'Name', field: 'name' },
        { header: 'Role', field: 'role' },
        { header: 'Employee ID', field: 'employeeId' },
        { header: 'Email', field: 'email' },
        { header: 'Mobile', field: 'mobile' }
    ];

    searchFields: any[] = [
        { key: 'role', label: 'Role', type: 'select' as const, placeholder: 'Select Role', options: [] },
        { key: 'name', label: 'Name', type: 'text' as const, placeholder: 'Enter Name' },
        { key: 'employeeId', label: 'Employee ID', type: 'text' as const, placeholder: 'Enter EMP ID' },
        { key: 'email', label: 'Email', type: 'email' as const, placeholder: 'Enter Email' },
        { key: 'mobile', label: 'Mobile', type: 'text' as const, placeholder: 'Enter Mobile' }
    ];

    availableRoles: any[] = [];

    rows: any[] = [];

    constructor(
        private userTargetService: UserTargetService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.loadUsers();
        this.loadRoles();
    }

    loadUsers() {
        this.userTargetService.viewUserTarget().subscribe({
            next: (users: any[]) => {
                console.log("API Response:", users);

                this.rows = users.map((c: any, index: number) => ({
                    serialNumber: c.serialNumber ?? (index + 1),
                    userId: c.userId ?? c.id ?? c.serialNumber ?? null,  // Use real database user ID if available
                    name: c.firstName && c.lastName
                        ? `${c.firstName} ${c.lastName}`
                        : (c.firstName ?? c.username ?? ''),
                    role: c.roleName ?? '',
                    employeeId: c.username ?? '',
                    email: c.email ?? '',
                    mobile: c.phoneNumber ?? ''
                }));
                
                // Load roles after users are loaded
                this.loadRoles();
            },
            error: (err: any) => {
                console.error("Failed to load users list:", err);
                if (err.status === 401) {
                    alert("Session expired, please login again.");
                    this.router.navigate(['/login']);
                }
            }
        });
    }

    onSearch(searchTerm?: string) {
        console.log("Search target for:", searchTerm);
        this.userTargetService.searchTarget(searchTerm, undefined, undefined, undefined, searchTerm).subscribe({
            next: (users: any[]) => {
                this.rows = users.map((c: any, index: number) => ({
                    serialNumber: c.serialNumber ?? (index + 1),
                    userId: c.userId ?? c.id ?? c.serialNumber ?? null,
                    name: c.firstName && c.lastName
                        ? `${c.firstName} ${c.lastName}`
                        : (c.firstName ?? c.username ?? ''),
                    role: c.roleName ?? '',
                    employeeId: c.username ?? '',
                    email: c.email ?? '',
                    mobile: c.phoneNumber ?? ''
                }));
            },
            error: (err: any) => {
                console.error("Search failed:", err);
            }
        });
    }

    onSearchFromChild(searchValues: any) {
        console.log("Search values from child:", searchValues);
        
        // Extract values from search object
        const role = searchValues.role || undefined;
        const name = searchValues.name || undefined;
        const email = searchValues.email || undefined;
        const phoneNumber = searchValues.mobile || undefined;
        const username = searchValues.employeeId || undefined;
        
        // Call the search API with all parameters
        this.userTargetService.searchTarget(username, role, email, phoneNumber, name).subscribe({
            next: (users: any[]) => {
                this.rows = users.map((c: any, index: number) => ({
                    serialNumber: c.serialNumber ?? (index + 1),
                    userId: c.userId ?? c.id ?? c.serialNumber ?? null,
                    name: c.firstName && c.lastName
                        ? `${c.firstName} ${c.lastName}`
                        : (c.firstName ?? c.username ?? ''),
                    role: c.roleName ?? '',
                    employeeId: c.username ?? '',
                    email: c.email ?? '',
                    mobile: c.phoneNumber ?? ''
                }));
            },
            error: (err: any) => {
                console.error("Search failed:", err);
            }
        });
    }

    loadRoles() {
        // Extract unique roles from the current users data
        const uniqueRoles = [...new Set(this.rows.map(user => user.role).filter(role => role))];
        this.availableRoles = uniqueRoles.map(role => ({
            value: role,
            label: role
        }));
        
        // Update search fields with the fetched roles
        this.updateSearchFieldsWithRoles();
    }

    updateSearchFieldsWithRoles() {
        const roleFieldIndex = this.searchFields.findIndex(field => field.key === 'role');
        if (roleFieldIndex !== -1) {
            this.searchFields[roleFieldIndex] = {
                ...this.searchFields[roleFieldIndex],
                options: this.availableRoles
            };
        }
    }

    onAdd() {
        this.router.navigate(['/admin/addusers']);
    }

    onAssign(row: any) {
        console.log('Assign clicked for user:', row);
        // Use userId (serialNumber from UserViewDto) as the numeric user ID
        this.router.navigate(['/admin/assign-target', row.userId]);
    }

    onUpload(row: any) {
        console.log('Upload clicked for user:', row);
        // Use userId (serialNumber from UserViewDto) as the numeric user ID
        this.router.navigate(['/admin/upload-target', row.userId]);
    }
}
