import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Adminservice } from '../../../service/adminservice';
import { GeneralSettingsResponse } from '../../../models/general-settings.model';

@Component({
    standalone: true,
    selector: 'app-general-settings',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        Header,
        Sidebar,
        Pageheader
    ],
    templateUrl: './general-settings.html',
    styleUrl: './general-settings.css'
})
export class GeneralSettingsComponent implements OnInit {
    headerTitle = 'Settings';
    headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/' },
        { label: 'Settings', route: '/admin/general-settings' }
    ];

    settingsForm!: FormGroup;

    constructor(private fb: FormBuilder, private adminService: Adminservice) {}

    ngOnInit(): void {
        this.initForm();
        this.loadData();
    }

    initForm(): void {
        this.settingsForm = this.fb.group({
            // Dealer PO Settings
            dealerWarranty: [false],
            poDocumentsUpload: [false],
            poUploadCheck: [false],
            maxDiscount: [0],
            maxBalancePaymentDays: [0],
            
            // General Settings
            defaultWarranty: [0],
            defaultBalancePayment: [0],
            defaultAdvance: [0],
            recordsPerPage: [0],
            
            // Margin Settings
            costOfMaintainingWarranty: [0],
            costOfCapital: [0]
        });
    }

    loadData(): void {
        this.adminService.getGeneralSettings().subscribe({
            next: (response: GeneralSettingsResponse) => {
                const sections = response?.data ?? [];
                let values: any = {};

                sections.forEach(section => {
                    section.preferences.forEach(pref => {
                        const value = pref.value === 'true' || pref.value === '1' || pref.value === 'yes';
                        switch (pref.name) {
                            case 'dealerWarranty':
                            case 'enable_warranty':
                                values.dealerWarranty = value;
                                break;
                            case 'poDocumentsUpload':
                            case 'enable_po_upload':
                                values.poDocumentsUpload = value;
                                break;
                            case 'poUploadCheck':
                            case 'enable_po_upload_check':
                                values.poUploadCheck = value;
                                break;
                            case 'maxDiscount':
                            case 'max_discount':
                                values.maxDiscount = Number(pref.value) || 0;
                                break;
                            case 'maxBalancePaymentDays':
                            case 'max_balance_payment_days':
                                values.maxBalancePaymentDays = Number(pref.value) || 0;
                                break;
                            case 'defaultWarranty':
                            case 'default_warranty':
                                values.defaultWarranty = Number(pref.value) || 0;
                                break;
                            case 'defaultBalancePayment':
                            case 'default_balance_payment_days':
                                values.defaultBalancePayment = Number(pref.value) || 0;
                                break;
                            case 'defaultAdvance':
                            case 'default_advance_percentage':
                                values.defaultAdvance = Number(pref.value) || 0;
                                break;
                            case 'recordsPerPage':
                            case 'records_per_page':
                                values.recordsPerPage = Number(pref.value) || 0;
                                break;
                            case 'costOfMaintainingWarranty':
                            case 'cost_of_maintaining_warranty':
                                values.costOfMaintainingWarranty = Number(pref.value) || 0;
                                break;
                            case 'costOfCapital':
                            case 'cost_of_capital':
                                values.costOfCapital = Number(pref.value) || 0;
                                break;
                        }
                    });
                });

                this.settingsForm.patchValue(values);
            },
            error: (error) => {
                console.error('Failed to load general settings:', error);
                // fallback to defaults if needed
            }
        });
    }

    onSave(): void {
        if (!this.settingsForm.valid) {
            return;
        }

        const payload = this.buildSavePayload();

        this.adminService.saveGeneralSettings(payload).subscribe({
            next: (response) => {
                console.log('General settings saved successfully', response);
                this.loadData();
            },
            error: (error) => {
                console.error('Failed to save general settings:', error);
            }
        });
    }

    private buildSavePayload(): any[] {
        const values = this.settingsForm.value;

        return [
            {
                section: 'Dealer PO Settings',
                lable: 'Dealer Warranty',
                value: values.dealerWarranty ? '1' : '0'
            },
            {
                section: 'Dealer PO Settings',
                lable: ' PO Documents Upload',
                value: values.poDocumentsUpload ? '1' : '0'
            },
            {
                section: 'Dealer PO Settings',
                lable: 'PO Upload Check at PO Creation',
                value: values.poUploadCheck ? '1' : '0'
            },
            {
                section: 'Dealer PO Settings',
                lable: 'Max Discount (%)',
                value: values.maxDiscount?.toString() ?? '0'
            },
            {
                section: 'Dealer PO Settings',
                lable: 'Max Balance Payment Days',
                value: values.maxBalancePaymentDays?.toString() ?? '0'
            },
            {
                section: 'General Settings',
                lable: 'Default Warranty (Months)',
                value: values.defaultWarranty?.toString() ?? '0'
            },
            {
                section: 'General Settings',
                lable: 'Default Balance Payment (Days)',
                value: values.defaultBalancePayment?.toString() ?? '0'
            },
            {
                section: 'General Settings',
                lable: 'Default Advance (%)',
                value: values.defaultAdvance?.toString() ?? '0'
            },
            {
                section: 'General Settings',
                lable: 'Records per page',
                value: values.recordsPerPage?.toString() ?? '0'
            },
            {
                section: 'Margin Settings',
                lable: 'Cost of Maintaining Warranty %',
                value: values.costOfMaintainingWarranty?.toString() ?? '0'
            },
            {
                section: 'Margin Settings',
                lable: 'Cost of Capital',
                value: values.costOfCapital?.toString() ?? '0'
            }
        ];
    }

    onCancel(): void {
        console.log('Cancel clicked');
        this.loadData();
    }
}
