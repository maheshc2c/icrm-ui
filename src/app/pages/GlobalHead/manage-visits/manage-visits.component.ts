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

@Component({
    selector: 'app-manage-visits',
    standalone: true,
    imports: [CommonModule, DataTable, Header, Sidebar, Pageheader],
    templateUrl: './manage-visits.component.html',
    styleUrl: './manage-visits.component.css'
})
export class ManageVisitsComponent implements OnInit {
    headerTitle = 'Manage Visits';
    headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/globalhead-dashboard' },
        { label: 'Manage Visits' }
    ];

    columns = [
        { header: 'Customer Name', field: 'customerName' },
        { header: 'Purpose', field: 'purposeName' },
        { header: 'Start Date', field: 'startDate' },
        { header: 'End Date', field: 'endDate' }
    ];

    rows: any[] = [];

    searchFields: SearchFieldConfig[] = [
        { key: 'leadId', label: 'Lead ID', placeholder: 'Lead ID', type: 'text' },
        { key: 'customerName', label: 'Customer Name', placeholder: 'Customer Name', type: 'text' },
        { key: 'startDate', label: 'Start Date', placeholder: 'Start Date', type: 'date' },
        { key: 'endDate', label: 'End Date', placeholder: 'End Date', type: 'date' }
    ];

    constructor(
        private globalHeadService: GlobalHeadService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadVisits();
    }

    loadVisits() {
        this.globalHeadService.getAllVisits().subscribe({
            next: (visits: any[]) => {
                this.rows = visits.map(v => ({
                    ...v,
                    startDate: v.startDate ? new Date(v.startDate).toLocaleDateString() : '',
                    endDate: v.endDate ? new Date(v.endDate).toLocaleDateString() : '',
                    statusLabel: v.status === 1 ? 'Active' : 'Inactive'
                }));
            },
            error: (err) => {
                console.error('Failed to load visits:', err);
            }
        });
    }

    onAdd() {
        this.router.navigate(['/globalhead/add-visit']);
    }

    // onEdit(row: any) {
    //     if (row.visitId) {
    //         this.router.navigate(['/globalhead/edit-visit', row.visitId]);
    //     } else {
    //         this.router.navigate(['/globalhead/add-visit']);
    //     }
    // }

    onEdit(row: any) {
    console.log('EDIT CLICKED:', row);

    if (row.visitId) {
        console.log('NAVIGATING TO:', '/globalhead/edit-visit', row.visitId);
        this.router.navigate(['/globalhead/edit-visit', row.visitId]);
    } else {
        console.log('NO ID → redirecting to add');
        this.router.navigate(['/globalhead/add-visit']);
    }
}

// onEdit(row: any) {
//     console.log('ROW:', row);

//     const id = row?.visitId;

//     if (!id) {
//         console.error('visitId missing → cannot navigate');
//         return;
//     }

//     this.router.navigate(['/globalhead/edit-visit', id]);
// }
}
