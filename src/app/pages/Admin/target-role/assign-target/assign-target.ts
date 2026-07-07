import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserTargetService } from '../../../../service/user-target.service';
import { ToastService } from '../../../../service/toast.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Header } from '../../../../layout/header/header';

@Component({
  selector: 'app-assign-target',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader, Sidebar, Header],
  templateUrl: './assign-target.html',
  styleUrls: ['./assign-target.css']
})
export class AssignTargetComponent implements OnInit {
    headerTitle = 'Assign Target';
    headerBreadcrumbs = [
        { label: 'Home', link: '/admin' },
        { label: 'Target Role', link: '/admin/user-target' },
        { label: 'Assign Target', active: true }
    ];

    employeeId = '';
    
    financialYears: string[] = [];
    selectedYear = '';
    
    isSubmitting: boolean = false;
    selectAll: boolean = false;
    isLoading = false;

    globalAprSelected = false;
    globalMaySelected = false;
    globalJunSelected = false;
    globalJulSelected = false;
    globalAugSelected = false;
    globalSepSelected = false;
    globalOctSelected = false;
    globalNovSelected = false;
    globalDecSelected = false;
    globalJanSelected = false;
    globalFebSelected = false;
    globalMarSelected = false;

    // This array holds the DTOs from the backend
    targetDTOs: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userTargetService: UserTargetService,
        private toastService: ToastService
    ) { }

    generateFinancialYears(): string[] {
        const years = [];
        const startYear = 2017;
        for (let year = startYear; year <= 2040; year++) {
            const nextYearStr = (year + 1).toString().substring(2);
            years.push(`${year}-${nextYearStr}`);
        }
        return years;
    }

    ngOnInit(): void {
        this.employeeId = this.route.snapshot.paramMap.get('id') ?? '';

        this.financialYears = this.generateFinancialYears();
        
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const currentFinancialYear = currentMonth < 3 ? currentYear - 1 : currentYear;
        const defaultYear = `${currentFinancialYear}-${(currentFinancialYear + 1).toString().substring(2)}`;
        
        this.selectedYear = this.financialYears.includes(defaultYear) ? defaultYear : this.financialYears[0];
        this.onLoadTargets();
    }

    getFinancialYearId(yearString: string): number {
        const yearMatch = yearString ? yearString.match(/^\d{4}/) : null;
        return yearMatch ? parseInt(yearMatch[0], 10) : 0;
    }

    get isPastYear(): boolean {
        if (!this.selectedYear) return false;
        const yearId = this.getFinancialYearId(this.selectedYear);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); // 0-11 (0 = Jan, 3 = Apr)
        // Financial year starts in April. If month is Jan-Mar, the current FY started last year.
        const currentFinancialYear = currentMonth < 3 ? currentYear - 1 : currentYear;
        return yearId < currentFinancialYear;
    }

    onLoadTargets(): void {
        if (!this.employeeId || !this.selectedYear) {
            this.toastService.error('Missing user or financial year.');
            return;
        }

        const yearId = this.getFinancialYearId(this.selectedYear);
        if (yearId === 0) {
            this.toastService.error('Invalid financial year.');
            return;
        }

        this.isLoading = true;
        this.userTargetService.getProductTargetsForUser(Number(this.employeeId), yearId).subscribe({
            next: (data) => {
                this.targetDTOs = data.map(dto => ({
                    ...dto,
                    selected: this.hasAnyTarget(dto)
                }));
                
                // Initialize global month checkboxes based on data
                this.globalAprSelected = this.targetDTOs.some(dto => dto.aprTarget > 0);
                this.globalMaySelected = this.targetDTOs.some(dto => dto.mayTarget > 0);
                this.globalJunSelected = this.targetDTOs.some(dto => dto.junTarget > 0);
                this.globalJulSelected = this.targetDTOs.some(dto => dto.julTarget > 0);
                this.globalAugSelected = this.targetDTOs.some(dto => dto.augTarget > 0);
                this.globalSepSelected = this.targetDTOs.some(dto => dto.sepTarget > 0);
                this.globalOctSelected = this.targetDTOs.some(dto => dto.octTarget > 0);
                this.globalNovSelected = this.targetDTOs.some(dto => dto.novTarget > 0);
                this.globalDecSelected = this.targetDTOs.some(dto => dto.decTarget > 0);
                this.globalJanSelected = this.targetDTOs.some(dto => dto.janTarget > 0);
                this.globalFebSelected = this.targetDTOs.some(dto => dto.febTarget > 0);
                this.globalMarSelected = this.targetDTOs.some(dto => dto.marTarget > 0);

                this.checkIfAllSelected();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load targets', err);
                this.toastService.error('Failed to load targets');
                this.isLoading = false;
            }
        });
    }

    onSaveTargets(): void {
        if (!this.employeeId || !this.selectedYear) {
            this.toastService.error('Missing user or financial year.');
            return;
        }
        
        if (this.targetDTOs.length === 0) {
            this.toastService.error('No targets to save.');
            return;
        }

        const unselectedWithQuantities = this.targetDTOs.find(dto => !dto.selected && this.hasAnyTarget(dto));
        if (unselectedWithQuantities) {
            this.toastService.error('You entered a quantity for an unselected product. Please select it or clear the quantity.');
            return;
        }

        const selectedWithoutQuantities = this.targetDTOs.find(dto => dto.selected && !this.hasAnyTarget(dto));
        if (selectedWithoutQuantities) {
            this.toastService.error('You selected a product but did not assign any quantity to it.');
            return;
        }

        const yearId = this.getFinancialYearId(this.selectedYear);

        this.isSubmitting = true;

        const selectedTargets = this.targetDTOs.filter(dto => dto.selected).map(dto => ({
            ...dto,
            aprTarget: this.globalAprSelected ? dto.aprTarget : 0,
            mayTarget: this.globalMaySelected ? dto.mayTarget : 0,
            junTarget: this.globalJunSelected ? dto.junTarget : 0,
            julTarget: this.globalJulSelected ? dto.julTarget : 0,
            augTarget: this.globalAugSelected ? dto.augTarget : 0,
            sepTarget: this.globalSepSelected ? dto.sepTarget : 0,
            octTarget: this.globalOctSelected ? dto.octTarget : 0,
            novTarget: this.globalNovSelected ? dto.novTarget : 0,
            decTarget: this.globalDecSelected ? dto.decTarget : 0,
            janTarget: this.globalJanSelected ? dto.janTarget : 0,
            febTarget: this.globalFebSelected ? dto.febTarget : 0,
            marTarget: this.globalMarSelected ? dto.marTarget : 0
        }));

        if (selectedTargets.length === 0) {
            this.toastService.warning('Please select at least one product to assign targets.');
            this.isSubmitting = false;
            return;
        }

        this.userTargetService.saveProductTargetsForUser(Number(this.employeeId), yearId, selectedTargets).subscribe({
            next: () => {
                this.toastService.success('Targets saved successfully!'); 
                setTimeout(() => { this.router.navigate(['/admin/user-target']); }, 1500);
            },
            error: (err: any) => {
                console.error('Failed to assign targets', err);
                const errMsg = err.error || 'An unexpected error occurred.';
                this.toastService.error('Failed to assign targets: ' + errMsg);
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void { this.router.navigate(['/admin/user-target']); } 

    onQuantityChange(dto: any): void {
        // Auto-selection removed per user request
    }

    hasAnyTarget(dto: any): boolean {
        return dto.aprTarget > 0 || dto.mayTarget > 0 || dto.junTarget > 0 || dto.julTarget > 0 ||
               dto.augTarget > 0 || dto.sepTarget > 0 || dto.octTarget > 0 || dto.novTarget > 0 ||
               dto.decTarget > 0 || dto.janTarget > 0 || dto.febTarget > 0 || dto.marTarget > 0;
    }

    toggleAll(): void {
        this.targetDTOs.forEach(dto => dto.selected = this.selectAll);
    }

    checkIfAllSelected(): void {
        this.selectAll = this.targetDTOs.length > 0 && this.targetDTOs.every(dto => dto.selected);
    }
}



