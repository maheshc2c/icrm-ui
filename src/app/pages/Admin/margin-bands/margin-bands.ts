import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';

export interface MarginBand {
    sNo: number;
    level: string;
    variance: string;
    netMargin: string;
}

@Component({
    standalone: true,
    selector: 'app-margin-bands',
    imports: [
        CommonModule,
        RouterModule,
        Header,
        Sidebar,
        Pageheader
    ],
    templateUrl: './margin-bands.html',
    styleUrl: './margin-bands.css'
})
export class MarginBandsComponent implements OnInit {
    headerTitle = 'Margin Approval Bands';
    headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/' },
        { label: 'Margin Bands', route: '/admin/margin-bands' }
    ];

    marginBands: MarginBand[] = [];
    columns = [
        { field: 'level', header: 'LEVEL' },
        { field: 'variance', header: 'VARIANCE %' },
        { field: 'netMargin', header: 'NET MARGIN %' }
    ];
    searchFields: SearchFieldConfig[] = [
        { key: 'level', label: 'Level', type: 'text', placeholder: 'Level' }
    ];
    
    // Bottom summary static values
    costOfMaintainingWarranty = 5;
    costOfCapital = 20;
    dealerWarrantyEnabled = true;

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.loadStaticData();
    }

    loadStaticData(): void {
        this.marginBands = [
            { sNo: 1, level: 'Auto approval', variance: '> 8', netMargin: '> 10' },
            { sNo: 2, level: 'RBH', variance: '>= 0', netMargin: '8 - 10' },
            { sNo: 3, level: 'NSM', variance: '-15 - -5', netMargin: '5 - 8' },
            { sNo: 4, level: 'CH', variance: '< -15', netMargin: '< 5' }
        ];
    }

    onSearch(): void {
        // Search logic placeholder
    }

    onEdit(): void {
        this.router.navigate(['/admin/margin-bands/edit']);
    }
}
