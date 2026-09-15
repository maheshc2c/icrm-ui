import { Component, OnInit } from '@angular/core';
import { DataTable } from '../../../shared/data-table/data-table';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';
import { Router } from '@angular/router';

import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { GlobalHeadService } from '../../../service/GlobalHeadService';
import { ToastService } from '../../../service/toast.service';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';

@Component({
    selector: 'app-manage-visits',
    standalone: true,
    imports: [CommonModule, DataTable, Header, Sidebar, Pageheader],
    templateUrl: './manage-visits.component.html',
    styleUrl: './manage-visits.component.css'
})
export class ManageVisitsComponent implements OnInit {
    private getHomeRoute(): string {
        if (typeof window !== 'undefined' && window.localStorage) {
            const role = localStorage.getItem('role')?.trim();
            if (role) {
                const normalizedRole = role.replace(/[\s_]+/g, '').toUpperCase();
                switch (normalizedRole) {
                    case 'SUPERADMIN':
                        return '/superadmindashboard';
                    case 'ADMIN':
                        return '/admindashboard';
                    case 'ADMINMARKETING':
                        return '/adminmarketingdashboard';
                    case 'SALESDIRECTOR':
                        return '/sddashboard';
                    case 'REGIONALBRANCHHEAD':
                        return '/regional-branch-head-dashboard';
                    case 'REGIONALSALESMANAGER':
                        return '/regional-sales-manager-dashboard';
                    case 'NATIONALSALESMANAGER':
                        return '/national-sales-manager-dashboard';
                    case 'GLOBALHEAD':
                        return '/globalhead-dashboard';
                    case 'COUNTRYHEAD':
                        return '/country-head';
                    case 'CUSTOMERINTERACTIONCENTER':
                        return '/Approve-Leads';
                    case 'OTR':
                        return '/Cnotedownload';
                    case 'SALESENGINEER':
                    case 'SALESMANAGER':
                    default:
                        return '/sales-manager-dashboard';
                }
            }
        }
        return '/sales-manager-dashboard';
    }

    headerTitle = 'Manage Visits';
    headerBreadcrumbs: Breadcrumb[] = [];

    columns = [
        { header: 'Lead ID', field: 'leadId' },
        { header: 'Customer Name', field: 'customerName' },
        { header: 'Purpose', field: 'purpose' },
        { header: 'Start Date', field: 'startDate' },
        { header: 'End Date', field: 'endDate' }
    ];

    rows: any[] = [];
    lastRequestPayload: any = null;

    searchFields: SearchFieldConfig[] = [
        { key: 'leadId', label: 'Lead ID', placeholder: 'Select Lead', type: 'select', options: [] },
        { key: 'customerId', label: 'Customer Name', placeholder: 'Select Customer', type: 'select', options: [] },
        { key: 'purposeId', label: 'Purpose', placeholder: 'Select Purpose', type: 'select', options: [] },
        { key: 'startDate', label: 'Start Date', placeholder: 'Start Date', type: 'date' },
        { key: 'endDate', label: 'End Date', placeholder: 'End Date', type: 'date' }
    ];

    constructor(
        private globalHeadService: GlobalHeadService,
        private router: Router,
        private toastService: ToastService,
        private confirmService: ConfirmDialogService
    ) { }

    ngOnInit(): void {
        this.headerBreadcrumbs = [
            { label: 'Home', route: this.getHomeRoute() },
            { label: 'Manage Visits' }
        ];
        this.loadDropdowns();
        this.onSearchChange({});
    }

    loadDropdowns() {
        this.globalHeadService.getLeadsForDemoVisit().subscribe({
            next: (leads) => {
                const options = leads.map(l => ({ label: l.customerName || 'No Name', value: l.leadId }));
                const field = this.searchFields.find(f => f.key === 'leadId');
                if (field) field.options = options;
            }
        });
        this.globalHeadService.getCustomersForDemoVisit().subscribe({
            next: (customers) => {
                const options = customers.map(c => ({ label: c.customerName, value: c.customerId }));
                const field = this.searchFields.find(f => f.key === 'customerId');
                if (field) field.options = options;
            }
        });
        this.globalHeadService.getPurposesForDemoVisit().subscribe({
            next: (purposes) => {
                const options = purposes.map(p => ({ label: p.purposeName, value: p.purposeId }));
                const field = this.searchFields.find(f => f.key === 'purposeId');
                if (field) field.options = options;
            }
        });
    }

    loadVisits() {
        this.onSearchChange({});
    }

    onSearchChange(filters: any) {
        // When using type: 'date', HTML5 date picker emits 'yyyy-MM-dd'
        // But backend expects 'dd-MM-yyyy' for startDate and endDate.
        let parsedStartDate = filters?.startDate || null;
        let parsedEndDate = filters?.endDate || null;

        if (parsedStartDate && parsedStartDate.includes('-')) {
            const parts = parsedStartDate.split('-');
            if (parts.length === 3 && parts[0].length === 4) { // yyyy-MM-dd
                parsedStartDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // dd-MM-yyyy
            }
        }

        if (parsedEndDate && parsedEndDate.includes('-')) {
            const parts = parsedEndDate.split('-');
            if (parts.length === 3 && parts[0].length === 4) {
                parsedEndDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        const requestPayload = {
            leadId: filters?.leadId || null,
            customerId: filters?.customerId || null,
            purposeId: filters?.purposeId || null,
            startDate: parsedStartDate ? parsedStartDate : null,
            endDate: parsedEndDate ? parsedEndDate : null,
            pagination: {
                pageNumber: 0,
                pageSize: 100, // Load enough rows since we handle pagination client-side or we can hook it up
                sortBy: 'startDate',
                sortOrder: 'DESC'
            }
        };

        this.lastRequestPayload = requestPayload;

        this.globalHeadService.searchPlanDemoVisits(requestPayload).subscribe({
            next: (res: any) => {
                const data = res?.data || [];
                this.rows = data.map((v: any) => ({
                    ...v,
                    statusLabel: v.status === 1 ? 'Active' : 'Inactive'
                }));
            },
            error: (err) => {
                console.error('Failed to load visits:', err);
                this.rows = [];
            }
        });
    }

    onAdd() {
        this.router.navigate(['/plan-visit/add']);
    }

    onEdit(row: any) {
        console.log('EDIT CLICKED:', row);
        if (row.visitId) {
            console.log('NAVIGATING TO:', '/plan-visit/edit', row.visitId);
            this.router.navigate(['/plan-visit/edit', row.visitId]);
        } else {
            console.log('NO ID → redirecting to add');
            this.router.navigate(['/plan-visit/add']);
        }
    }

    onDelete(row: any) {
        const id = row?.visitId;
        if (!id) return;

        const status = Number(row?.status);
        const isActive = status === 1;

        this.confirmService.confirm({
            title: 'Confirm',
            message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this visit?`,
            confirmText: isActive ? 'Deactivate' : 'Activate'
        }).then((confirmed) => {
            if (!confirmed) return;

            this.globalHeadService.toggleVisitStatus(id).subscribe({
                next: () => {
                    row.status = isActive ? 2 : 1;
                    row.statusLabel = isActive ? 'Inactive' : 'Active';
                    this.rows = [...this.rows]; // trigger change detection if needed
                    this.toastService.success(`Visit ${isActive ? 'deactivated' : 'activated'} successfully`);
                },
                error: (err) => {
                    console.error('Failed to toggle visit status:', err);
                    this.toastService.error('Failed to toggle visit status');
                }
            });
        });
    }

    onDownloadExcel() {
        if (!this.lastRequestPayload) {
            this.toastService.error("No search data available to download");
            return;
        }

        this.globalHeadService.downloadDemoVisits(this.lastRequestPayload).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Visits.xlsx';
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: (err) => {
                console.error('Failed to download excel:', err);
                this.toastService.error('Failed to download excel file');
            }
        });
    }
}
