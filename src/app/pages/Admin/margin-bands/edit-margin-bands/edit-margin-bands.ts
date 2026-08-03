import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Adminservice } from '../../../../service/adminservice';
import { ToastService } from '../../../../service/toast.service';

@Component({
    standalone: true,
    selector: 'app-edit-margin-bands',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        Header,
        Sidebar,
        Pageheader
    ],
    templateUrl: './edit-margin-bands.html',
    styleUrl: './edit-margin-bands.css'
})
export class EditMarginBandsComponent implements OnInit {
    headerTitle = 'Edit Margin Approval Bands';
    headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/' },
        { label: 'Margin Bands', route: '/admin/margin-bands' },
        { label: 'Edit Margin Bands', route: '/admin/margin-bands/edit' }
    ];

    editForm!: FormGroup;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly adminService: Adminservice,
        private readonly toastService: ToastService
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.loadMarginConfig();
    }

    initForm(): void {
        this.editForm = this.fb.group({
            bands: this.fb.array([]),
            costOfMaintainingWarranty: [0],
            costOfCapital: [0],
            dealerWarranty: [false]
        });
    }

    get bandsArray(): FormArray {
        return this.editForm.get('bands') as FormArray;
    }

    private createBandGroup(band: any): FormGroup {
        return this.fb.group({
            sNo: [band.sNo ?? band.sno ?? 0],
            level: [band.level ?? ''],
            varLowerLimit: [band.varLowerLimit ?? null],
            varIncludeLower: [band.varIncludeLower ?? false],
            varUpperLimit: [band.varUpperLimit ?? null],
            varIncludeUpper: [band.varIncludeUpper ?? false],
            netLowerLimit: [band.netLowerLimit ?? null],
            netIncludeLower: [band.netIncludeLower ?? false],
            netUpperLimit: [band.netUpperLimit ?? null],
            netIncludeUpper: [band.netIncludeUpper ?? false]
        });
    }

    private loadMarginConfig(): void {
        this.adminService.getMarginBandConfig().subscribe({
            next: (response: any) => {
                const config = response?.data ?? {};
                const bands = Array.isArray(config.marginBands) ? config.marginBands : [];

                this.bandsArray.clear();
                bands.forEach((band: any, index: number) => {
                    const parsedBand = this.mapBandFromApi(band, index + 1);
                    this.bandsArray.push(this.createBandGroup(parsedBand));
                });

                this.editForm.patchValue({
                    costOfMaintainingWarranty: this.normalizeNumber(config.costOfMaintainingWarranty),
                    costOfCapital: this.normalizeNumber(config.costOfCapital),
                    dealerWarranty: this.isDealerWarrantyEnabled(config.dealerWarranty)
                });
            },
            error: (error: any) => {
                console.error('Failed to load margin band config:', error);
                this.bandsArray.clear();
                this.editForm.patchValue({
                    costOfMaintainingWarranty: 0,
                    costOfCapital: 0,
                    dealerWarranty: false
                });
            }
        });
    }

    private mapBandFromApi(band: any, fallbackSNo: number): any {
        const varianceRange = this.parseRange(band?.variance);
        const netRange = this.parseRange(band?.netMargin);

        return {
            sNo: band?.sno ?? fallbackSNo,
            level: band?.level ?? '',
            varLowerLimit: varianceRange.lowerLimit,
            varIncludeLower: varianceRange.includeLower,
            varUpperLimit: varianceRange.upperLimit,
            varIncludeUpper: varianceRange.includeUpper,
            netLowerLimit: netRange.lowerLimit,
            netIncludeLower: netRange.includeLower,
            netUpperLimit: netRange.upperLimit,
            netIncludeUpper: netRange.includeUpper
        };
    }

    private parseRange(value: string | number | null | undefined): {
        lowerLimit: number | null;
        includeLower: boolean;
        upperLimit: number | null;
        includeUpper: boolean;
    } {
        const normalized = String(value ?? '').trim().replace(/%/g, '').trim();

        if (!normalized) {
            return {
                lowerLimit: null,
                includeLower: false,
                upperLimit: null,
                includeUpper: false
            };
        }

        const operatorLower = normalized.startsWith('>=') || normalized.startsWith('>');
        const operatorUpper = normalized.startsWith('<=') || normalized.startsWith('<');

        const numbers = normalized.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
        const lowerLimit = numbers[0] ?? null;
        const upperLimit = numbers[1] ?? null;

        if (normalized.includes(' - ')) {
            return {
                lowerLimit: numbers[0] ?? null,
                includeLower: true,
                upperLimit: numbers[1] ?? null,
                includeUpper: true
            };
        }

        if (normalized.startsWith('>=')) {
            return {
                lowerLimit,
                includeLower: true,
                upperLimit: null,
                includeUpper: false
            };
        }

        if (normalized.startsWith('>')) {
            return {
                lowerLimit,
                includeLower: false,
                upperLimit: null,
                includeUpper: false
            };
        }

        if (normalized.startsWith('<=') || normalized.startsWith('<')) {
            return {
                lowerLimit: null,
                includeLower: false,
                upperLimit: lowerLimit,
                includeUpper: operatorUpper || normalized.includes('<=')
            };
        }

        return {
            lowerLimit,
            includeLower: operatorLower,
            upperLimit,
            includeUpper: false
        };
    }

    private normalizeNumber(value: string | number | null | undefined): number {
        const parsed = Number(String(value ?? '0').replace('%', '').trim());
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private isDealerWarrantyEnabled(value: string | boolean | null | undefined): boolean {
        return String(value ?? '').toLowerCase() === 'enabled' || value === true;
    }

    onSubmit(): void {
        const formValue = this.editForm.value;
        const payload = {
            marginBands: this.bandsArray.controls.map((control: any, index: number) => {
                const band = control.value;
                return {
                    quoteApprovalId: band.sNo ?? index + 1,
                    gmLowerLimit: band.varLowerLimit ?? null,
                    gmLowerCheck: band.varIncludeLower ? 1 : 2,
                    gmUpperLimit: band.varUpperLimit ?? null,
                    gmUpperCheck: band.varIncludeUpper ? 1 : 2,
                    nmLowerLimit: band.netLowerLimit ?? null,
                    nmLowerCheck: band.netIncludeLower ? 1 : 2,
                    nmUpperLimit: band.netUpperLimit ?? null,
                    nmUpperCheck: band.netIncludeUpper ? 1 : 2
                };
            }),
            costOfMaintainingWarranty: Number(formValue.costOfMaintainingWarranty ?? 0),
            costOfCapital: Number(formValue.costOfCapital ?? 0),
            dealerWarranty: formValue.dealerWarranty ? 1 : 0
        };

        this.adminService.updateMarginBandConfig(payload).subscribe({
            next: (response: unknown) => {
                console.log('Margin bands updated successfully:', response);
                this.toastService.success('Margin bands updated successfully.');
                this.router.navigate(['/admin/margin-bands']);
            },
            error: (error: unknown) => {
                console.error('Failed to update margin bands:', error);
                this.toastService.error('Failed to update margin bands. Please try again.');
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/admin/margin-bands']);
    }
}
