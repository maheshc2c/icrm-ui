import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Adminservice } from '../../../service/adminservice';

export interface MarginBand {
    sNo: number;
    level: string;
    variance: string;
    netMargin: string;
}

interface MarginBandConfigResponse {
    status: boolean;
    message: string;
    data: {
        marginBands: Array<{
            sno: number;
            level: string;
            variance: string;
            netMargin: string;
        }>;
        costOfMaintainingWarranty: string | number;
        costOfCapital: string | number;
        dealerWarranty: string | boolean;
    };
    totalElements: number | null;
    totalPages: number | null;
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
    
    costOfMaintainingWarranty = '0';
    costOfCapital = '0';
    dealerWarrantyEnabled = false;

    constructor(
        private readonly router: Router,
        private readonly adminService: Adminservice
    ) {}

    ngOnInit(): void {
        this.loadMarginConfig();
    }

    loadMarginConfig(): void {
        this.adminService.getMarginBandConfig().subscribe({
            next: (response: any) => {
                const config = response?.data ?? {};
                const bands = Array.isArray(config.marginBands) ? config.marginBands : [];

                this.marginBands = bands.map((band: any) => ({
                    sNo: band.sno,
                    level: band.level,
                    variance: band.variance,
                    netMargin: band.netMargin
                }));

                this.costOfMaintainingWarranty = this.normalizeSummaryValue(config.costOfMaintainingWarranty);
                this.costOfCapital = this.normalizeSummaryValue(config.costOfCapital);
                this.dealerWarrantyEnabled = this.isDealerWarrantyEnabled(config.dealerWarranty);
            },
            error: (error) => {
                console.error('Failed to load margin band config:', error);
                this.marginBands = [];
                this.costOfMaintainingWarranty = '0';
                this.costOfCapital = '0';
                this.dealerWarrantyEnabled = false;
            }
        });
    }

    private normalizeSummaryValue(value: string | number | null | undefined): string {
        const normalized = String(value ?? '0');
        return normalized.endsWith('%') ? normalized.slice(0, -1) : normalized;
    }

    private isDealerWarrantyEnabled(value: string | number | boolean | null | undefined): boolean {
        const normalized = String(value ?? '').trim().toLowerCase();

        if (normalized === '1' || normalized === 'enabled' || normalized === 'true' || value === true) {
            return true;
        }

        if (normalized === '2' || normalized === 'disabled' || normalized === 'false' || value === false) {
            return false;
        }

        return false;
    }

    onSearch(): void {
        // Search logic placeholder
    }

    onEdit(): void {
        this.router.navigate(['/admin/margin-bands/edit']);
    }
}
