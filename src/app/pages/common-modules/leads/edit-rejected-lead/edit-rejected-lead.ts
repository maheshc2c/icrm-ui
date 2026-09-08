import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Leadservice } from '../../../../service/leadservice';
import { ToastService } from '../../../../service/toast.service';
import { Breadcrumb } from '../../../../models/breadcrumb';

@Component({
  selector: 'app-edit-rejected-lead',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader],
  templateUrl: './edit-rejected-lead.html',
  styleUrls: ['./edit-rejected-lead.css']
})
export class EditRejectedLeadComponent implements OnInit {
  leadId: number = 0;
  loading: boolean = true;

  customerName: string = '';
  contactPersonName: string = '';
  
  isd1: string = '91';
  telephone: string = '';
  
  isd2: string = '91';
  mobileNo: string = '';
  
  email: string = '';

  breadcrumbs: Breadcrumb[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadService: Leadservice,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.leadId = +idParam;
      this.breadcrumbs = [
        { label: 'Home', route: '/closed-leads' },
        { label: 'Edit Rejected Lead', route: '/closed-leads' },
        { label: 'Lead ID - ' + this.leadId }
      ];
      this.loadLeadDetails();
    }
  }

  loadLeadDetails(): void {
    this.loading = true;
    this.leadService.getLeadById(this.leadId).subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.customerName = data.customerName || 'N/A';
        this.contactPersonName = data.contactName || data.contactPerson || 'N/A';
        
        const rawPhone = data.telephone || '';
        if (rawPhone.includes('-')) {
          const parts = rawPhone.split('-');
          this.isd1 = parts[0] || '91';
          this.telephone = parts[1] || '';
        } else {
          this.telephone = rawPhone;
        }

        const rawMobile = data.mobileNo || data.mobile || '';
        if (rawMobile.includes('-')) {
          const parts = rawMobile.split('-');
          this.isd2 = parts[0] || '91';
          this.mobileNo = parts[1] || '';
        } else {
          this.mobileNo = rawMobile;
        }

        this.email = data.email || '';
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load lead details:', err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.mobileNo || !this.mobileNo.trim()) {
      this.toastService.error('Mobile Number is required');
      return;
    }
    if (!this.email || !this.email.trim()) {
      this.toastService.error('Email is required');
      return;
    }

    const payload = {
      telephone: (this.isd1 ? (this.isd1 + '-') : '') + (this.telephone ? this.telephone.trim() : ''),
      mobileNo: (this.isd2 ? (this.isd2 + '-') : '') + this.mobileNo.trim(),
      email: this.email.trim()
    };

    this.leadService.updateLead(this.leadId, payload).subscribe({
      next: () => {
        this.toastService.success(`Success! Lead : ${this.leadId} Customer contact details has been updated successfully and lead has been sent for approval!`);
        this.router.navigate(['/openleads']);
      },
      error: (err: any) => {
        console.error('Update failed:', err);
        this.toastService.error('Failed to update rejected lead');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/closed-leads']);
  }
}
