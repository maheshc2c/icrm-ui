import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Shared components
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Header } from '../../../../layout/header/header';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Form } from '../../../../shared/form/form';

// Services
import { VisitService, VisitDto } from '../../../../service/visit-service';
import { Leadservice } from '../../../../service/leadservice';
import { LeadSummary } from '../../../../models/lead-model';

@Component({
  selector: 'app-add-visit',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, Header, Pageheader, Form],
  templateUrl: './add-visit.html'
})
export class AddVisitComponent implements OnInit {
  
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Manage Visit', route: '/salesmanager/visit' },
    { label: 'Plan Visit' }
  ];

  isEditMode = false;
  visitId: number | null = null;
  leads: LeadSummary[] = [];
  
  visitForm: VisitDto = {
    leadId: undefined,
    purposeName: '',
    startDate: '',
    endDate: '',
    status: 1,
    remarks1: ''
  };

  purposes = [
    { label: 'Product Demo', value: 'Product Demo' },
    { label: 'Order Follow Up', value: 'Order Follow Up' },
    { label: 'Negotiation', value: 'Negotiation' },
    { label: 'Service Support', value: 'Service Support' },
    { label: 'Payment Collection', value: 'Payment Collection' }
  ];

  visitFields: any[] = [
    { name: 'leadId', label: 'Lead', type: 'select', options: [], required: true },
    { name: 'purposeName', label: 'Purpose', type: 'select', options: this.purposes, required: true },
    { name: 'startDate', label: 'Start Time', type: 'datetime-local', required: true },
    { name: 'endDate', label: 'End Time', type: 'datetime-local', required: true },
    { name: 'remarks1', label: 'Remark', type: 'textarea' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private visitService: VisitService,
    private leadService: Leadservice
  ) {}

  ngOnInit(): void {
    console.log('AddVisitComponent initialized');
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.visitId = +params['id'];
        console.log('Edit mode for visit:', this.visitId);
      }
    });

    this.loadLeads();
  }

  loadLeads(): void {
    this.leadService.getOpenLeads().subscribe({
      next: (data) => {
        this.leads = data;
        const leadOptions = [
          { label: '-- Select Lead --', value: '' },
          ...data.map(l => ({
            label: `Lead ID: ${l.leadId} - ${l.customerName}`,
            value: l.leadId
          }))
        ];
        
        // Update field options
        const leadField = this.visitFields.find(f => f.name === 'leadId');
        if (leadField) {
          leadField.options = leadOptions;
        }
        // Force refresh field array reference
        this.visitFields = [...this.visitFields];
      },
      error: (err) => console.error('Failed to load leads:', err)
    });
  }

  onSubmit(formData: any): void {
    console.log('Submitting visit data:', formData);
    
    if (!formData.leadId || !formData.purposeName || !formData.startDate || !formData.endDate) {
      alert('Please fill in all mandatory fields.');
      return;
    }

    // Ensure date-time format matches LocalDateTime (ISO with seconds)
    let start = formData.startDate;
    let end = formData.endDate;
    if (start && start.length === 16) start += ':00';
    if (end && end.length === 16) end += ':00';

    const payload: VisitDto = {
      ...this.visitForm,
      leadId: Number(formData.leadId),
      purposeName: formData.purposeName,
      startDate: start,
      endDate: end,
      remarks1: formData.remarks1 || ''
    };

    console.log('Final Payload:', payload);

    if (this.isEditMode && this.visitId) {
      this.visitService.updateVisit(this.visitId, payload).subscribe({
        next: () => {
          alert('Visit updated successfully!');
          this.router.navigate(['/salesmanager/visit']);
        },
        error: (err) => {
          console.error('Update failed:', err);
          alert('Failed to update visit: ' + (err.error?.message || err.message || 'Server error'));
        }
      });
    } else {
      this.visitService.createVisit(payload).subscribe({
        next: () => {
          alert('Visit planned successfully!');
          this.router.navigate(['/salesmanager/visit']);
        },
        error: (err) => {
          console.error('Save failed:', err);
          alert('Failed to save visit: ' + (err.error?.message || err.message || 'Server error'));
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/salesmanager/visit']);
  }
}
