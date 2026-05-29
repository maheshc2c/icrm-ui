import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { UserTargetService } from '../../../../service/user-target.service';

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
        { label: 'Target Role', route: '/admin/user-target' },
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
        private userTargetService: UserTargetService
    ) { }

    ngOnInit(): void {
        this.employeeId = this.route.snapshot.paramMap.get('id') ?? '';
        this.userTargetService.getFinancialYears().subscribe({
            next: (years) => {
                this.financialYears = years;
                this.selectedYear = years[0] ?? '2025 - 2026';
            },
            error: err => console.error('Failed to load years', err)
        });
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        }
    }

    onDownloadTemplate(): void {
        // Download the XLS template for user product targets
        this.userTargetService.downloadUserTargetTemplate(this.employeeId).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `UserProductTargets_${this.employeeId}.xlsx`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: err => {
                console.error('Download failed', err);
                alert('Download failed. Please try again.');
            }
        });
    }

    onSubmit(): void {
        if (!this.selectedFile) {
            alert('Please select a CSV file to upload.');
            return;
        }
        const ext = this.selectedFile.name.split('.').pop()?.toLowerCase();
        if (ext !== 'csv') {
            alert('Only CSV files are allowed.');
            return;
        }

        this.isSubmitting = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.userTargetService.uploadUserTargetFile(this.employeeId, formData).subscribe({
            next: () => {
                alert('File uploaded successfully!');
                this.router.navigate(['/admin/user-target']);
            },
            error: (err: any) => {
                console.error('Upload failed', err);
                alert('Upload failed. Please check the file format.');
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/admin/user-target']);
    }
}
