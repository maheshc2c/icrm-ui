import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';

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
        private fb: FormBuilder,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.loadStaticData();
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

    createBandGroup(band: any): FormGroup {
        return this.fb.group({
            sNo: [band.sNo],
            level: [band.level],
            varLowerLimit: [band.varLowerLimit],
            varIncludeLower: [band.varIncludeLower],
            varUpperLimit: [band.varUpperLimit],
            varIncludeUpper: [band.varIncludeUpper],
            netLowerLimit: [band.netLowerLimit],
            netIncludeLower: [band.netIncludeLower],
            netUpperLimit: [band.netUpperLimit],
            netIncludeUpper: [band.netIncludeUpper]
        });
    }

    loadStaticData(): void {
        const staticBands = [
            { sNo: 1, level: 'Auto approval', varLowerLimit: 8, varIncludeLower: false, varUpperLimit: null, varIncludeUpper: false, netLowerLimit: 10, netIncludeLower: false, netUpperLimit: null, netIncludeUpper: false },
            { sNo: 2, level: 'RBH', varLowerLimit: 0, varIncludeLower: true, varUpperLimit: null, varIncludeUpper: false, netLowerLimit: 8, netIncludeLower: true, netUpperLimit: 10, netIncludeUpper: true },
            { sNo: 3, level: 'NSM', varLowerLimit: -15, varIncludeLower: true, varUpperLimit: -5, varIncludeUpper: true, netLowerLimit: 5, netIncludeLower: true, netUpperLimit: 8, netIncludeUpper: true },
            { sNo: 4, level: 'CH', varLowerLimit: null, varIncludeLower: false, varUpperLimit: -15, varIncludeUpper: false, netLowerLimit: null, netIncludeLower: false, netUpperLimit: 5, netIncludeUpper: false }
        ];

        staticBands.forEach(band => {
            this.bandsArray.push(this.createBandGroup(band));
        });

        this.editForm.patchValue({
            costOfMaintainingWarranty: 5,
            costOfCapital: 20,
            dealerWarranty: true
        });
    }

    onSubmit(): void {
        console.log('Submitted values:', this.editForm.value);
        // Navigate back to the view page after submit
        this.router.navigate(['/admin/margin-bands']);
    }

    onCancel(): void {
        this.router.navigate(['/admin/margin-bands']);
    }
}
