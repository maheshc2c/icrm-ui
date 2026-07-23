import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { GlobalHeadService } from '../../../../service/GlobalHeadService';
import { ToastService } from '../../../../service/toast.service';


@Component({
    selector: 'app-add-visit',
    standalone: true,
    imports: [CommonModule, FormsModule, Form, Header, Sidebar, Pageheader],
    templateUrl: './add-visit.component.html',
    styleUrl: './add-visit.component.css'
})
export class AddVisitComponent implements OnInit {
    headerTitle = 'Add New Visit';
    headerBreadcrumbs: Breadcrumb[] = [];
    isEditMode = false;
    visitId!: number;
    formInitialData: any = {};

    fields: any[] = [
        { name: 'leadId', label: 'Lead', type: 'select', options: [] as any[], required: true },
        { name: 'purposeId', label: 'Purpose', type: 'select', options: [] as any[], required: true },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'End Date', type: 'date', required: true },
        { name: 'remarks1', label: 'Remarks 1', type: 'textarea' },
        { name: 'remarks2', label: 'Remarks 2', type: 'textarea' },
        { name: 'remarks3', label: 'Remarks 3', type: 'textarea' }
    ];

    constructor(
        private globalHeadService: GlobalHeadService,
        private router: Router,
        private route: ActivatedRoute,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.visitId = +id;
            this.headerTitle = 'Edit Visit';
        }

        this.headerBreadcrumbs = [
            { label: 'Home', route: '/globalhead-dashboard' },
            { label: 'Plan Visits', route: '/plan-visits' },
            { label: this.isEditMode ? 'Edit Visit' : 'Add Visit' }
        ];

        this.loadDropdowns();
        if (this.isEditMode) {
            this.loadVisitData();
        }
    }

    loadVisitData() {
        this.globalHeadService.getVisitById(this.visitId).subscribe({
            next: (response: any) => {
                const visit = response.data ? response.data : response;
                this.formInitialData = visit;
            },
            error: (err) => console.error('Failed to load visit data', err)
        });
    }

    loadDropdowns() {
        // Check authentication token
        const token = this.globalHeadService['auth']?.getToken();
        console.log('Current auth token:', token ? 'Token exists' : 'No token found');
        
        // Debug: Extract and log user ID from token
        if (token) {
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                console.log('Decoded token payload:', tokenPayload);
                console.log('User ID from token:', tokenPayload.userId);
                console.log('User role from token:', tokenPayload.role);
            } catch (e) {
                console.error('Failed to decode token:', e);
            }
        }
        
        // Dynamic: Only proceed if we have authentication
        if (!token) {
            console.error('No authentication token found. Please login first.');
            this.toastService.error('Please login to access this form.');
            this.router.navigate(['/login']);
            return;
        }

        console.log('Loading dynamic data from APIs...');
        
        // Load Leads dynamically
        this.globalHeadService.getLeadsForDemoVisit().subscribe({
            next: (leads: any[]) => {
                console.log('Leads data received:', leads);
                console.log('Leads array length:', leads?.length);
                
                // Debug: Check if user has any leads at all
                if (leads && leads.length === 0) {
                    console.warn('User has no leads assigned. This might be expected for Global Head role.');
                    
                    // Add a message option to indicate no leads available
                    const leadField = this.fields.find(f => f.name === 'leadId');
                    if (leadField) {
                        leadField.options = [
                            { value: '', label: 'No leads available for your account' }
                        ];
                        this.fields = [...this.fields];
                    }
                    return;
                }
                
                const leadField = this.fields.find(f => f.name === 'leadId');
                if (leadField) {
                    leadField.options = leads.map(l => ({
                        value: l.leadId,
                        label: l.customerName || `Lead-${l.leadId}`
                    }));
                    console.log('Lead dropdown populated with', leadField.options.length, 'options');
                    
                    // Force change detection
                    this.fields = [...this.fields];
                }
            },
            error: (err) => {
                console.error('Failed to load leads:', err);
                
                if (err.status === 401) {
                    this.toastService.error('Session expired. Please login again.');
                    this.router.navigate(['/login']);
                    return;
                }
                
                this.toastService.error('Failed to load leads. Please try again later.');
            }
        });

        // Load Purposes dynamically
        this.globalHeadService.getPurposesForDemoVisit().subscribe({
            next: (purposes: any[]) => {
                console.log('Purposes data received:', purposes);
                
                const purposeField = this.fields.find(f => f.name === 'purposeId');
                if (purposeField) {
                    if (purposes && purposes.length > 0) {
                        purposeField.options = purposes.map(p => ({ 
                            value: p.purposeId, 
                            label: p.purposeName 
                        }));
                        console.log('Purpose dropdown populated with', purposeField.options.length, 'options');
                    } else {
                        console.warn('No purposes available from API');
                        purposeField.options = [];
                    }
                    
                    // Force change detection
                    this.fields = [...this.fields];
                }
            },
            error: (err) => {
                console.error('Failed to load purposes:', err);
                
                if (err.status === 401) {
                    this.toastService.error('Session expired. Please login again.');
                    this.router.navigate(['/login']);
                    return;
                }
                
                this.toastService.error('Failed to load visit purposes. Please try again later.');
            }
        });
    }

    onModelChange(event: { name: string, value: any }) {
        // No longer needed after removing customer dropdown
    }

    onSubmit(data: any) {
        // Create payload matching backend expectations
        const payload: any = {
            leadId: data.leadId,
            purposeId: data.purposeId,
            startDate: data.startDate ? new Date(data.startDate).toISOString() : '',
            endDate: data.endDate ? new Date(data.endDate).toISOString() : '',
            status: 1, // Hardcoded status as requested
            remarks1: data.remarks1 || '',
            remarks2: data.remarks2 || '',
            remarks3: data.remarks3 || '',
            createdTime: new Date().toISOString() // Set current time
        };

        console.log('Submitting payload:', payload);

        if (this.isEditMode) {
            this.globalHeadService.updateVisit(this.visitId, payload).subscribe({
                next: (response) => {
                    console.log('Visit updated successfully:', response);
                    this.toastService.success('Visit updated successfully');
                    this.router.navigate(['/plan-visits']);
                },
                error: (err) => {
                    console.error('Failed to update visit:', err);
                    this.toastService.error('Failed to update visit: ' + (err.error?.message || err.message));
                }
            });
        } else {
            this.globalHeadService.createVisit(payload).subscribe({
                next: (response) => {
                    console.log('Visit created successfully:', response);
                    this.toastService.success('Visit created successfully');
                    this.router.navigate(['/plan-visits']);
                },
                error: (err) => {
                    console.error('Failed to create visit:', err);
                    this.toastService.error('Failed to create visit: ' + (err.error?.message || err.message));
                }
            });
        }
    }

    // Helper method to get purpose name by ID from dropdown options
    private getPurposeNameById(purposeId: number): string {
        const purposeField = this.fields.find(f => f.name === 'purposeId');
        if (purposeField && purposeField.options) {
            const purpose = purposeField.options.find((opt: any) => opt.value === purposeId);
            return purpose ? purpose.label : 'Cold Call'; // Default fallback
        }
        return 'Cold Call'; // Default fallback
    }

    onCancel() {
        this.router.navigate(['/plan-visits']);
    }
}
