import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { ModalComponent } from '../../../../shared/modal/modal';
import { CustomerInteractionCenterService } from '../../../../service/customer-interaction-center.service';
import { ToastService } from '../../../../service/toast.service';
import { ConfirmDialogService } from '../../../../service/confirm-dialog.service';

@Component({
  selector: 'app-edit-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader, ModalComponent],
  templateUrl: './edit-leads.html',
  styleUrl: './edit-leads.css'
})
export class EditLeads implements OnInit {
  leadId!: number;
  lead: any = {
    leadVisitRequirement: 0,
    leadResourceRequirement: 0,
    leadPurchasePotential: 0,
    leadCmdLine1: '',
    leadCmdLine2: '',
    siteReadinessName: '',
    distributorId: ''
  };
  distributors: any[] = [];
  siteReadinessOptions: any[] = [];
  
  // Modal states
  showCustomerDetailsModal = false;
  showInstallationBaseModal = false;
  
  // Customer & Installation base data
  customerDetails: any = null;
  installationBaseList: any[] = [];

  headerTitle = 'Edit User Products';
  headerBreadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Approve Leads', route: '/Approve-Leads' },
    { label: 'Edit User Products', route: '' }
  ];

  errors: any = {};
  touched: any = {};
  fieldIdMap: any = {
    'relationshipName': 'edit-leads-relationship',
    'leadPurchasePotential': 'edit-leads-purchase-potential',
    'siteReadinessName': 'edit-leads-site-readiness',
    'resourceRequiredDetails': 'edit-leads-resource-details',
    'distributorId': 'edit-leads-distributor'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cicService: CustomerInteractionCenterService,
    private toastService: ToastService,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.leadId = +idParam;
        this.loadDropdownsAndLead();
      }
    });
  }

  loadDropdownsAndLead(): void {
    // Load all dropdowns first, then fetch lead details to map them correctly
    this.cicService.getDistributors().subscribe({
      next: (dists) => {
        this.distributors = dists || [];
        this.cicService.getSiteReadiness().subscribe({
          next: (sites) => {
            this.siteReadinessOptions = sites || [];
            this.loadLeadDetails();
          },
          error: (err) => {
            console.error('Error fetching site readiness:', err);
            this.loadLeadDetails();
          }
        });
      },
      error: (err) => {
        console.error('Error fetching distributors:', err);
        this.loadLeadDetails();
      }
    });
  }

  loadLeadDetails(): void {
    this.cicService.getLeadById(this.leadId).subscribe({
      next: (res) => {
        this.lead = res;
        
        // Ensure values are numbers/strings - only set defaults if not present
        if (this.lead.leadVisitRequirement === undefined || this.lead.leadVisitRequirement === null) {
          this.lead.leadVisitRequirement = 0;
        }
        if (this.lead.leadResourceRequirement === undefined || this.lead.leadResourceRequirement === null) {
          this.lead.leadResourceRequirement = 0;
        }
        if (this.lead.relationshipName === undefined || this.lead.relationshipName === null) {
          this.lead.relationshipName = '';
        }
        if (this.lead.siteReadinessName === undefined || this.lead.siteReadinessName === null) {
          this.lead.siteReadinessName = '';
        }

        // Map distributor ID only if we have a matching distributor name
        const matchedDist = this.distributors.find(d => d.distributorName === this.lead.distributorName);
        if (matchedDist) {
          this.lead.distributorId = matchedDist.userId;
        } else {
          // Don't auto-select first distributor - leave empty for validation!
          if (this.lead.distributorId === undefined || this.lead.distributorId === null) {
            this.lead.distributorId = '';
          }
        }
        
        // Fetch customer details & installation base details
        if (this.lead.customerId) {
          this.loadCustomerAndInstalledBase(this.lead.customerId);
        }
      },
      error: (err) => {
        console.error('Error fetching lead details:', err);
        this.toastService.error('Failed to load lead details');
      }
    });
  }

  loadCustomerAndInstalledBase(customerId: number): void {
    this.cicService.getInstalledBase(customerId).subscribe({
      next: (res) => {
        this.customerDetails = res.customer;
        if (this.customerDetails) {
          if (this.customerDetails.locations && this.customerDetails.locations.length > 0) {
            this.customerDetails.cityName = this.customerDetails.locations
              .map((l: any) => l.locationName)
              .filter(Boolean)
              .join(', ');
          } else {
            this.customerDetails.cityName = '';
          }
        }
        this.installationBaseList = res.customerInstallers || [];
      },
      error: (err) => {
        console.error('Error fetching installation base:', err);
      }
    });
  }

  openCustomerModal(): void {
    this.showCustomerDetailsModal = true;
  }

  closeCustomerModal(): void {
    this.showCustomerDetailsModal = false;
  }

  openInstallationModal(): void {
    this.showInstallationBaseModal = true;
  }

  closeInstallationModal(): void {
    this.showInstallationBaseModal = false;
  }

  validateForm(): { valid: boolean; firstInvalidField: string | null } {
    this.errors = {};
    let firstInvalidField: string | null = null;
    const fieldOrder = ['relationshipName', 'leadPurchasePotential', 'siteReadinessName', 'resourceRequiredDetails', 'distributorId'];

    // 1. Rapport with Customer
    if (!this.lead.relationshipName) {
      this.errors['relationshipName'] = 'Rapport with Customer is required';
      if (!firstInvalidField) firstInvalidField = 'relationshipName';
    }

    // 2. Purchase Potential
    if (this.lead.leadPurchasePotential !== null && this.lead.leadPurchasePotential !== undefined && this.lead.leadPurchasePotential !== '') {
      const val = Number(this.lead.leadPurchasePotential);
      if (isNaN(val) || val < 0) {
        this.errors['leadPurchasePotential'] = 'Purchase Potential must be a positive number';
        if (!firstInvalidField) firstInvalidField = 'leadPurchasePotential';
      }
    }

    // 3. Site Readiness
    if (!this.lead.siteReadinessName) {
      this.errors['siteReadinessName'] = 'Site Readiness status is required';
      if (!firstInvalidField) firstInvalidField = 'siteReadinessName';
    }

    // 4. Resource Required Information
    if (this.lead.leadResourceRequirement === 1 && (!this.lead.resourceRequiredDetails || !this.lead.resourceRequiredDetails.trim())) {
      this.errors['resourceRequiredDetails'] = 'Resource Required Information is required';
      if (!firstInvalidField) firstInvalidField = 'resourceRequiredDetails';
    }

    // 5. Distributor
    if (!this.lead.distributorId) {
      this.errors['distributorId'] = 'Distributor is required';
      if (!firstInvalidField) firstInvalidField = 'distributorId';
    }

    return { valid: Object.keys(this.errors).length === 0, firstInvalidField };
  }

  clearError(field: string): void {
    this.touched[field] = true;
    // Re-validate the field on change
    let hasError = false;
    let errorMessage = '';

    switch(field) {
      case 'relationshipName':
        if (!this.lead.relationshipName) {
          hasError = true;
          errorMessage = 'Rapport with Customer is required';
        }
        break;
      case 'leadPurchasePotential':
        if (this.lead.leadPurchasePotential !== null && this.lead.leadPurchasePotential !== undefined && this.lead.leadPurchasePotential !== '') {
          const val = Number(this.lead.leadPurchasePotential);
          if (isNaN(val) || val < 0) {
            hasError = true;
            errorMessage = 'Purchase Potential must be a positive number';
          }
        }
        break;
      case 'siteReadinessName':
        if (!this.lead.siteReadinessName) {
          hasError = true;
          errorMessage = 'Site Readiness status is required';
        }
        break;
      case 'resourceRequiredDetails':
        if (this.lead.leadResourceRequirement === 1 && (!this.lead.resourceRequiredDetails || !this.lead.resourceRequiredDetails.trim())) {
          hasError = true;
          errorMessage = 'Resource Required Information is required';
        }
        break;
      case 'distributorId':
        if (!this.lead.distributorId) {
          hasError = true;
          errorMessage = 'Distributor is required';
        }
        break;
    }

    if (hasError) {
      this.errors[field] = errorMessage;
    } else {
      delete this.errors[field];
    }
  }

  handleApprove(): void {
    this.saveLead(() => {
      this.cicService.approveLead(this.leadId).subscribe({
        next: () => {
          this.toastService.success(`Lead #${this.leadId} approved successfully`);
          this.router.navigate(['/Approve-Leads']);
        },
        error: (err) => {
          console.error('Error approving lead:', err);
          this.toastService.error('Failed to approve lead');
        }
      });
    });
  }

  handleReject(): void {
    this.confirmService.confirm({
      title: 'Confirm',
      message: 'Are you sure you want to Reject?',
      confirmText: 'Reject'
    }).then((confirmed) => {
      if (confirmed) {
        this.saveLead(() => {
          this.cicService.rejectLead(this.leadId).subscribe({
            next: () => {
              this.toastService.success(`Lead #${this.leadId} rejected successfully`);
              this.router.navigate(['/Approve-Leads']);
            },
            error: (err) => {
              console.error('Error rejecting lead:', err);
              this.toastService.error('Failed to reject lead');
            }
          });
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/Approve-Leads']);
  }

  saveLead(callback?: () => void): void {
    const { valid, firstInvalidField } = this.validateForm();
    if (!valid) {
      // Mark all error fields as touched
      Object.keys(this.errors).forEach(field => {
        this.touched[field] = true;
      });

      // Focus first invalid field
      if (firstInvalidField && this.fieldIdMap[firstInvalidField]) {
        setTimeout(() => {
          const element = document.getElementById(this.fieldIdMap[firstInvalidField]);
          if (element) {
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
              element.focus();
            } else if (element.tagName === 'DIV') {
              const firstInput = element.querySelector('input') as HTMLElement;
              if (firstInput) {
                firstInput.focus();
              }
            }
          }
        }, 0);
      }

      return;
    }

    const dto = {
      leadId: this.leadId,
      customerName: this.lead.customerName,
      contactFirstName: this.lead.contactFirstName,
      createdBy: this.lead.username || 'System',
      leadSource: this.lead.sourceName,
      leadStatus: this.lead.leadStatus,
      purchasePotential: this.lead.leadPurchasePotential || 0,
      relationship: this.lead.relationshipName,
      siteReadiness: this.lead.siteReadinessName,
      visitRequirement: this.lead.leadVisitRequirement,
      resourceRequirement: this.lead.leadResourceRequirement,
      distributorId: +this.lead.distributorId,
      commandLine1: this.lead.leadCmdLine1 || '',
      commandLine2: this.lead.leadCmdLine2 || ''
    };

    this.cicService.editLead(dto).subscribe({
      next: () => {
        if (callback) {
          callback();
        } else {
          this.toastService.success('Lead details saved successfully');
        }
      },
      error: (err) => {
        console.error('Error updating lead:', err);
        this.toastService.error('Failed to save lead updates');
      }
    });
  }

  formatCustomerValue(val: any): string {
    if (val === null || val === undefined || val === 0 || val === '0' || val === 'null' || val === 'NULL') {
      return '';
    }
    return String(val).trim();
  }
}
