import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Breadcrumb } from '../../../models/breadcrumb';
import { UserTargetService } from '../../../service/user-target.service';
import { ToastService } from '../../../service/toast.service';

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
    currentSearchValues: any = null;

    // Pagination State
    currentPage = 1;
    totalPages = 1;
    totalItems: number | null = null;
    pageSize = 10;

    constructor(
        private userTargetService: UserTargetService,
        private router: Router,
        private route: ActivatedRoute,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this.userTargetService.viewUserTarget(this.currentPage - 1, this.pageSize).subscribe({
            next: (response: any) => {
                console.log("API Response:", response);

                let users: any[] = [];
                if (response && response.content) {
                    users = response.content;
                    this.totalPages = response.totalPages || 1;
                    this.totalItems = response.totalElements || 0;
                } else if (Array.isArray(response)) {
                    users = response;
                    this.totalPages = 1;
                    this.totalItems = null;
                }

                // Sort descending by userId so latest is first
                users.sort((a: any, b: any) => {
                    const idA = a.userId ?? a.id ?? a.serialNumber ?? 0;
                    const idB = b.userId ?? b.id ?? b.serialNumber ?? 0;
                    return idB - idA;
                });

                this.rows = users.map((c: any, index: number) => ({
                    serialNumber: c.serialNumber ?? ((this.currentPage - 1) * this.pageSize + index + 1),
                    userId: c.userId ?? c.id ?? c.serialNumber ?? null,
                    name: c.name || (c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : (c.firstName ?? c.username ?? '')),
                    role: c.role || c.roleName || c.role?.roleName || '',
                    employeeId: c.employeeId || c.username || '',
                    email: c.email || '',
                    mobile: c.mobile || c.phoneNumber || ''
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

    onPageChange(pageIndex: number) {
        this.currentPage = pageIndex;
        if (this.currentSearchValues && Object.keys(this.currentSearchValues).length > 0) {
            this.executeSearch(this.currentSearchValues);
        } else {
            this.loadUsers();
        }
    }

    onPageSizeChange(size: number) {
        this.pageSize = size;
        this.currentPage = 1;
        if (this.currentSearchValues && Object.keys(this.currentSearchValues).length > 0) {
            this.executeSearch(this.currentSearchValues);
        } else {
            this.loadUsers();
        }
    }

    onSearch(searchTerm?: string) {
        console.log("Search target for:", searchTerm);
        if (this.currentSearchValues && Object.keys(this.currentSearchValues).length > 0) {
            this.currentPage = 1;
            this.executeSearch(this.currentSearchValues);
        } else if (searchTerm) {
            this.currentPage = 1;
            this.userTargetService.searchTarget(undefined, undefined, undefined, undefined, searchTerm, this.currentPage - 1, this.pageSize).subscribe({
                next: (response: any) => {
                    let users: any[] = [];
                    if (response && response.content) {
                        users = response.content;
                        this.totalPages = response.totalPages || 1;
                        this.totalItems = response.totalElements || 0;
                    } else if (Array.isArray(response)) {
                        users = response;
                        this.totalPages = 1;
                        this.totalItems = null;
                    }

                    // Sort descending by userId so latest is first
                    users.sort((a: any, b: any) => {
                        const idA = a.userId ?? a.id ?? a.serialNumber ?? 0;
                        const idB = b.userId ?? b.id ?? b.serialNumber ?? 0;
                        return idB - idA;
                    });
                    this.rows = users.map((c: any, index: number) => ({
                        serialNumber: c.serialNumber ?? ((this.currentPage - 1) * this.pageSize + index + 1),
                        userId: c.userId ?? c.id ?? c.serialNumber ?? null,
                        name: c.name || (c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : (c.firstName ?? c.username ?? '')),
                        role: c.role || c.roleName || c.role?.roleName || '',
                        employeeId: c.employeeId || c.username || '',
                        email: c.email || '',
                        mobile: c.mobile || c.phoneNumber || ''
                    }));
                },
                error: (err: any) => {
                    console.error("Search failed:", err);
                    if (err.status === 400 && err.error === 'No matching records found') {
                        this.rows = [];
                        this.totalItems = 0;
                        this.totalPages = 1;
                    } else {
                        this.toastService.error('Search failed');
                    }
                }
            });
        } else {
            this.currentPage = 1;
            this.loadUsers();
        }
    }

    onSearchFromChild(searchValues: any) {
        console.log("Search values from child:", searchValues);
        this.currentSearchValues = searchValues;
        this.currentPage = 1;
        
        this.executeSearch(searchValues);
    }

    executeSearch(searchValues: any) {
        // Extract values from search object
        const role = searchValues.role || undefined;
        const name = searchValues.name || undefined;
        const email = searchValues.email || undefined;
        const phoneNumber = searchValues.mobile || undefined;
        const username = searchValues.employeeId || undefined;
        
        // Call the search API with all parameters
        this.userTargetService.searchTarget(username, role, email, phoneNumber, name, this.currentPage - 1, this.pageSize).subscribe({
            next: (response: any) => {
                let users: any[] = [];
                if (response && response.content) {
                    users = response.content;
                    this.totalPages = response.totalPages || 1;
                    this.totalItems = response.totalElements || 0;
                } else if (Array.isArray(response)) {
                    users = response;
                    this.totalPages = 1;
                    this.totalItems = null;
                }

                // Sort descending by userId so latest is first
                users.sort((a: any, b: any) => {
                    const idA = a.userId ?? a.id ?? a.serialNumber ?? 0;
                    const idB = b.userId ?? b.id ?? b.serialNumber ?? 0;
                    return idB - idA;
                });
                this.rows = users.map((c: any, index: number) => ({
                    serialNumber: c.serialNumber ?? ((this.currentPage - 1) * this.pageSize + index + 1),
                    userId: c.userId ?? c.id ?? c.serialNumber ?? null,
                    name: c.name || (c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : (c.firstName ?? c.username ?? '')),
                    role: c.role || c.roleName || c.role?.roleName || '',
                    employeeId: c.employeeId || c.username || '',
                    email: c.email || '',
                    mobile: c.mobile || c.phoneNumber || ''
                }));
            },
            error: (err: any) => {
                console.error("Search failed:", err);
                if (err.status === 400 && err.error === 'No matching records found') {
                    this.rows = [];
                    this.totalItems = 0;
                    this.totalPages = 1;
                } else {
                    this.toastService.error('Search failed');
                }
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

    onRefresh() {
        this.currentSearchValues = null;
        this.loadUsers();
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
