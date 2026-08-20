import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { UserTargetService } from '../../../../service/user-target.service';
import { ToastService } from '../../../../service/toast.service';
import { DataTable } from '../../../../shared/data-table/data-table';

@Component({
    standalone: true,
    selector: 'app-upload-target',
    imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader],
    templateUrl: './upload-target.html',
    styleUrls: ['./upload-target.css']
})
export class UploadTargetComponent implements OnInit {

    headerTitle = 'Upload Product Target';
    headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/admindashboard' },
        { label: 'Target Role', route: '/user-target' },
        { label: 'Upload Target' }
    ];

    employeeId: string = '';
    selectedYear: string = '';
    financialYears: string[] = [];
    selectedFile: File | null = null;
    isSubmitting = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userTargetService: UserTargetService,
        private toastService: ToastService
    ) { }

    generateFinancialYears(): string[] {
        const years: string[] = [];
        const startYear = 2017;
        for (let year = startYear; year <= 2040; year++) {
            const nextYearStr = (year + 1).toString().substring(2);
            years.push(`${year}-${nextYearStr}`);
        }
        return years;
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
        const currentFinancialYear = currentMonth < 3 ? currentYear - 1 : currentYear;
        return yearId < currentFinancialYear;
    }

    ngOnInit(): void {
        this.employeeId = this.route.snapshot.paramMap.get('id') ?? '';
        
        this.financialYears = this.generateFinancialYears();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const currentFinancialYear = currentMonth < 3 ? currentYear - 1 : currentYear;
        const defaultYear = `${currentFinancialYear}-${(currentFinancialYear + 1).toString().substring(2)}`;
        
        this.selectedYear = this.financialYears.includes(defaultYear) ? defaultYear : this.financialYears[0];
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        }
    }

    onDownloadEmptyTemplate(): void {
        this.userTargetService.downloadEmptyTargetTemplate().subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Empty_Target_Template.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: err => {
                console.error('Download failed', err);
                this.toastService.error('Download failed. Please try again.');
            }
        });
    }

    onDownloadTemplate(): void {
        // Download the CSV template for user product targets
        this.userTargetService.downloadUserTargetTemplate(this.employeeId, this.selectedYear).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `UserProductTargets_${this.employeeId}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: err => {
                console.error('Download failed', err);
                this.toastService.error('Download failed. Please try again.');
            }
        });
    }

    onSubmit(): void {
        if (this.isPastYear) {
            this.toastService.error('You cannot upload targets for a past financial year. You can only upload for current and future years.');
            return;
        }
        if (!this.selectedFile) {
            this.toastService.error('Please select a CSV file to upload.');
            return;
        }
        const ext = this.selectedFile.name.split('.').pop()?.toLowerCase();
        if (ext !== 'csv') {
            this.toastService.error('Only CSV files are allowed.');
            return;
        }

        this.isSubmitting = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('financialYearName', this.selectedYear);

        this.userTargetService.uploadUserTargetFile(this.employeeId, formData).subscribe({
            next: () => {
                this.toastService.success('File uploaded successfully!');
                this.router.navigate(['/user-target']);
            },
            error: (err: any) => {
                console.error('Upload failed', err);
                const backendMsg = err.error?.message || 'Upload failed. Please check the file format or ensure all products exist.';
                this.toastService.error(backendMsg);
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/user-target']);
    }
}
