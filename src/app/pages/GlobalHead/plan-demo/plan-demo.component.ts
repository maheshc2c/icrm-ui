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
    selector: 'app-plan-demo',
    standalone: true,
    imports: [CommonModule, DataTable, Header, Sidebar, Pageheader],
    templateUrl: './plan-demo.component.html',
    styleUrl: './plan-demo.component.scss'
})
export class PlanDemoComponent implements OnInit {
    headerTitle = 'Manage Demo';
    headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/globalhead-dashboard' },
        { label: 'Manage Demo' }
    ];

    columns = [
        { header: 'Customer Name', field: 'customerName' },
        { header: 'Opportunity', field: 'opportunity' },
        { header: 'Demo Machine', field: 'demoMachine' },
        { header: 'Start Date', field: 'startDate' },
        { header: 'End Date', field: 'endDate' }
    ];

    rows: any[] = [];

    searchFields: SearchFieldConfig[] = [
        { key: 'opportunityId', label: 'Opportunity ID', placeholder: 'Opportunity ID', type: 'text' },
        { key: 'customerName', label: 'Select Customer', placeholder: 'Select Customer', type: 'text' },
        { key: 'startTime', label: 'Start Time', placeholder: 'Start Time', type: 'date' },
        { key: 'endTime', label: 'End Time', placeholder: 'End Time', type: 'date' }
    ];

    constructor(
        private globalHeadService: GlobalHeadService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadDemos();
    }

    loadDemos() {
        // TODO: Implement service call to load demos
        // this.globalHeadService.getAllDemos().subscribe({
        //     next: (demos: any[]) => {
        //         this.rows = demos.map(d => ({
        //             ...d,
        //             startDate: d.startDate ? new Date(d.startDate).toLocaleDateString() : '',
        //             endDate: d.endDate ? new Date(d.endDate).toLocaleDateString() : ''
        //         }));
        //     },
        //     error: (err) => {
        //         console.error('Failed to load demos:', err);
        //     }
        // });
    }

    onAdd() {
        // TODO: Navigate to add demo page
        // this.router.navigate(['/globalhead/add-demo']);
    }

    onEdit(row: any) {
        console.log('Edit clicked for:', row);
        // TODO: Navigate to edit demo page
        // if (row.demoId) {
        //     this.router.navigate(['/globalhead/edit-demo', row.demoId]);
        // } else {
        //     this.router.navigate(['/globalhead/add-demo']);
        // }
    }
}
