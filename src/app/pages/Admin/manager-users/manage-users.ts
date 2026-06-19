import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Breadcrumb } from '../../../models/breadcrumb';
import { UserTargetService } from '../../../service/user-target.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
import { ToastService } from '../../../service/toast.service';

@Component({
    standalone: true,
    selector: 'app-manage-users',
    imports: [
        CommonModule,
        Header,
        Sidebar,
        Pageheader,
        DataTable
    ],
    templateUrl: './manage-users.html',
    styleUrl: './manage-users.css'
})
export class ManageUsersComponent implements OnInit {

    headerTitle = 'Manage Users';

    headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'Manage Users' }
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
    currentSearchValues: any = {};
    rows: any[] = [];

    // Pagination State
    currentPage = 1;
    totalPages = 1;
    totalItems: number | null = null;
    pageSize = 10;

    constructor(
        private userTargetService: UserTargetService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmService: ConfirmDialogService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this.userTargetService.viewUserTarget(this.currentPage - 1, this.pageSize).subscribe({
            next: (response: any) => {
                console.log("Manager Users API Response:", response);

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

                // Sort to show latest user first (descending by ID)
                users.sort((a: any, b: any) => {
                    const idA = a.userId ?? a.id ?? 0;
                    const idB = b.userId ?? b.id ?? 0;
                    return idB - idA;
                });

                this.rows = users.map((c: any, index: number) => ({
                    serialNumber: c.serialNumber ?? (index + 1),
                    userId: c.userId ?? c.id ?? c.serialNumber ?? null,
                    name: c.firstName && c.lastName
                        ? `${c.firstName} ${c.lastName}`
                        : (c.firstName ?? c.username ?? ''),
                    role: c.roleName ?? c.role?.roleName ?? '',
                    employeeId: c.username ?? '',
                    email: c.email ?? '',
                    mobile: c.phoneNumber ?? '',
                    status: c.status
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
        this.loadUsers();
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

    onSearch() {
        this.onSearchFromChild(this.currentSearchValues);
    }

    onSearchFromChild(searchValues: any) {
        console.log("Search values from child:", searchValues);
        this.currentSearchValues = searchValues || {};

        // Extract values from search object
        const role = this.currentSearchValues.role || undefined;
        const name = this.currentSearchValues.name || undefined;
        const email = this.currentSearchValues.email || undefined;
        const phoneNumber = this.currentSearchValues.mobile || undefined;
        const username = this.currentSearchValues.employeeId || undefined;
        const status = this.currentSearchValues.status || undefined;

        // Call the search API with all parameters
        this.userTargetService.searchTarget(username, role, email, phoneNumber, name).subscribe({
            next: (users: any[]) => {
                this.totalItems = null;

                // Sort to show latest user first (descending by ID)
                users.sort((a: any, b: any) => {
                    const idA = a.userId ?? a.id ?? 0;
                    const idB = b.userId ?? b.id ?? 0;
                    return idB - idA;
                });

                this.rows = users.map((c: any, index: number) => ({
                    serialNumber: c.serialNumber ?? (index + 1),
                    userId: c.userId ?? c.id ?? c.serialNumber ?? null,
                    name: c.firstName && c.lastName
                        ? `${c.firstName} ${c.lastName}`
                        : (c.firstName ?? c.username ?? ''),
                    role: c.roleName ?? c.role?.roleName ?? '',
                    employeeId: c.username ?? '',
                    email: c.email ?? '',
                    mobile: c.phoneNumber ?? '',
                    status: c.status
                }));
            },
            error: (err: any) => {
                console.error("Search failed:", err);
                if (err.status === 400 && err.error === 'No matching records found') {
                    this.rows = [];
                }
            }
        });
    }

    onReset(): void {
        this.currentPage = 1;
        this.loadUsers();
    }

    onAdd() {
        console.log("Add new user clicked");
        this.router.navigate(['/admin/add-users']);
    }

    onEdit(row: any) {
        console.log('Edit clicked for user:', row);
        // Navigate to edit user page with user ID
        this.router.navigate(['/admin/edit-user', row.userId]);
    }

    onDelete(row: any) {
        console.log('Toggle status clicked for user:', row);
        if (!row.userId) {
            this.toastService.error("Unable to change status: User ID not found.");
            return;
        }

        const status = Number(row.status);
        const isActive = status === 1;

        this.confirmService.confirm({
            title: 'Confirm',
            message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this user?`,
            confirmText: isActive ? 'Deactivate' : 'Activate'
        }).then((confirmed) => {
            if (!confirmed) return;

            this.userTargetService.toggleUserStatus(row.userId).subscribe({
                next: (response: any) => {
                    row.status = isActive ? 0 : 1;
                    this.rows = [...this.rows];
                    this.toastService.success(`User ${isActive ? 'deactivated' : 'activated'} successfully`);
                },
                error: (err: any) => {
                    console.error('Failed to change user status:', err);
                    this.toastService.error('Failed to change user status. Please try again.');
                }
            });
        });
    }

    onDownload(): void {
        if (!this.rows || this.rows.length === 0) {
            alert('No data available to download');
            return;
        }

        const excelData = this.rows.map((row, index) => ({
            'S.NO': index + 1,
            'Name': row.name,
            'Role': row.role,
            'Employee ID': row.employeeId,
            'Email': row.email,
            'Mobile': row.mobile,
            'Status': row.status
        }));

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
        const workbook: XLSX.WorkBook = {
            Sheets: { 'Users': worksheet },
            SheetNames: ['Users']
        };

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });

        saveAs(data, `users_export_${new Date().getTime()}.xlsx`);
    }

    onView(row: any) {
        console.log('View clicked for user:', row);
        if (!row.userId) {
            alert('Cannot view user: User ID not found.');
            return;
        }
        this.router.navigate(['/admin/view-user', row.userId]);
    }
}
