import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Header } from "../../../../layout/header/header";
import { Sidebar } from "../../../../layout/sidebar/sidebar";
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Breadcrumb } from "../../../../models/breadcrumb";
import { UserTargetService } from "../../../../service/user-target.service";

// Indian financial year months in order
const FY_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

@Component({
    standalone: true,
    selector: 'app-assign-target',
    imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader],
    templateUrl: './assign-target.html',
    styleUrls: ['./assign-target.css']
})
export class AssignTargetComponent implements OnInit {

    headerTitle = 'Assign Product Target';
    headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'Target Role', route: '/admin/user-target' },
        { label: 'Assign Target' }
    ];

    employeeId: string = '';
    selectedYear: string = '';
    financialYears: string[] = [];
    months = FY_MONTHS;
    products: any[] = [];

    // Matrix for dynamic values from backend (number)
    targetMatrix: { [productId: number]: { [month: string]: number } } = {};

    // Matrix for quantity inputs (string)
    quantityMatrix: { [productId: number]: { [month: string]: string } } = {};

    // Matrix for real-time validation error/warning messages
    validationErrors: { [productId: number]: { [month: string]: string } } = {};

    // Matrix for month column header checkboxes (boolean)
    headerCheckboxMatrix: { [month: string]: boolean } = {};

    // Matrix for product row checkboxes (boolean)
    rowCheckboxMatrix: { [productId: number]: boolean } = {};

    isSubmitting = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userTargetService: UserTargetService
    ) { }

    ngOnInit(): void {
        this.employeeId = this.route.snapshot.paramMap.get('id') ?? '';

        forkJoin({
            years: this.userTargetService.getFinancialYears(),
            products: this.userTargetService.getProducts(),
            assignedProductNames: this.userTargetService.getUserProducts(Number(this.employeeId))
        }).subscribe({
            next: ({ years, products, assignedProductNames }) => {
                this.financialYears = years;
                this.selectedYear = years[0] ?? '';

                const productsList = Array.isArray(products) ? products : ((products as any)?.content || []);
                // Dynamically filter products to only include products assigned to this user
                this.products = productsList.filter((p: any) => assignedProductNames.includes(p.productName));

                // Initialize header matrices
                this.months.forEach(m => {
                    this.headerCheckboxMatrix[m] = false;
                });

                // Initialize matrices
                this.products.forEach(p => {
                    this.rowCheckboxMatrix[p.productId] = false;
                    this.targetMatrix[p.productId] = {};
                    this.quantityMatrix[p.productId] = {};
                    this.validationErrors[p.productId] = {};
                    this.months.forEach(m => {
                        this.targetMatrix[p.productId][m] = 0;
                        this.quantityMatrix[p.productId][m] = '';
                        this.validationErrors[p.productId][m] = '';
                    });
                });
            },
            error: err => console.error('Failed to load data', err)
        });
    }

    onHeaderCheckboxChange(month: string): void {
        const isChecked = this.headerCheckboxMatrix[month];
        if (!isChecked) {
            this.products.forEach(product => {
                const dynamicQty = this.targetMatrix[product.productId]?.[month];
                if (dynamicQty === 0) {
                    this.quantityMatrix[product.productId][month] = '';
                    if (this.validationErrors[product.productId]) {
                        this.validationErrors[product.productId][month] = '';
                    }
                }
            });
        }
    }

    onRowCheckboxChange(productId: number): void {
        const isChecked = this.rowCheckboxMatrix[productId];
        if (!isChecked) {
            this.months.forEach(month => {
                const dynamicQty = this.targetMatrix[productId]?.[month];
                if (dynamicQty === 0) {
                    this.quantityMatrix[productId][month] = '';
                    if (this.validationErrors[productId]) {
                        this.validationErrors[productId][month] = '';
                    }
                }
            });
        }
    }

    validateQuantity(productId: number, month: string, event: any): void {
        const inputVal = event.target.value;
        if (/[^\d]/.test(inputVal)) {
            // Restrict input by keeping only numeric digits
            const cleanedVal = inputVal.replace(/[^\d]/g, '');
            this.quantityMatrix[productId][month] = cleanedVal;
            event.target.value = cleanedVal;
            
            if (!this.validationErrors[productId]) {
                this.validationErrors[productId] = {};
            }
            this.validationErrors[productId][month] = 'Only numbers are allowed!';
        } else {
            if (this.validationErrors[productId]) {
                this.validationErrors[productId][month] = '';
            }
        }
    }

    onSubmit(): void {
        if (!this.employeeId || !this.selectedYear) {
            alert('Missing user or financial year.');
            return;
        }

        // Validate non-empty quantities first
        let hasErrors = false;
        this.products.forEach(product => {
            this.months.forEach(month => {
                const dynamicQty = this.targetMatrix[product.productId]?.[month];
                if (dynamicQty === 0) {
                    const rawVal = this.quantityMatrix[product.productId]?.[month];
                    if (rawVal && rawVal !== '') {
                        const inputQty = parseInt(rawVal, 10);
                        if (isNaN(inputQty) || inputQty <= 0) {
                            if (!this.validationErrors[product.productId]) {
                                this.validationErrors[product.productId] = {};
                            }
                            this.validationErrors[product.productId][month] = 'Please enter a valid quantity!';
                            hasErrors = true;
                        }
                    }
                }
            });
        });

        if (hasErrors) {
            alert('Please fix validation errors before submitting.');
            return;
        }

        const payloads: any[] = [];
        const MONTH_MAP: { [key: string]: string } = {
            'Apr': 'April',
            'May': 'May',
            'Jun': 'June',
            'Jul': 'July',
            'Aug': 'August',
            'Sep': 'September',
            'Oct': 'October',
            'Nov': 'November',
            'Dec': 'December',
            'Jan': 'January',
            'Feb': 'February',
            'Mar': 'March'
        };

        const yearMatch = this.selectedYear ? this.selectedYear.match(/^\d{4}/) : null;
        const yearVal = yearMatch ? parseInt(yearMatch[0], 10) : (this.selectedYear ? parseInt(this.selectedYear, 10) : 0);

        this.products.forEach(product => {
            this.months.forEach(month => {
                const dynamicQty = this.targetMatrix[product.productId]?.[month];

                let qty = 0;
                if (dynamicQty > 0) {
                    qty = dynamicQty;
                } else {
                    const rawVal = this.quantityMatrix[product.productId]?.[month];
                    if (rawVal && rawVal !== '') {
                        const inputQty = parseInt(rawVal, 10);
                        qty = isNaN(inputQty) ? 0 : inputQty;
                    }
                }

                if (qty > 0) {
                    payloads.push({
                        productName: product.productName,
                        quantity: qty,
                        status: 1,
                        monthName: MONTH_MAP[month] || month,
                        yearId: yearVal
                    });
                }
            });
        });

        if (payloads.length === 0) {
            alert('Please enter at least one target quantity.');
            return;
        }

        this.isSubmitting = true;
        // Send each target as a separate POST (one per product+month combination)
        const requests = payloads.map(p =>
            this.userTargetService.createUserProductTarget(Number(this.employeeId), p)
        );

        forkJoin(requests).subscribe({
            next: () => {
                alert('Targets assigned successfully!');
                this.router.navigate(['/admin/user-target']);
            },
            error: (err: any) => {
                console.error('Failed to assign targets', err);
                const errMsg = err.error || 'An unexpected error occurred.';
                alert('Failed to assign targets: ' + errMsg);
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/admin/user-target']);
    }
}
