import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';
import { adminMarketingservice } from '../../../service/adminmarketingservice';
import { CampaignDocument } from '../../../models/campaign-document.model';
import { ToastService } from '../../../service/toast.service';

interface DocumentRow {
  id: number;
  name: string;
  description: string;
  access: string;
  attachment: string;
  locations: string;
  specialityStatus?: number;
  statusText?: string;
}

@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './managedacument.html',
  styleUrls: ['./managedacument.css'],
})
export class UploadDocument {
  constructor(
    private adminMarketingservice: adminMarketingservice,
    private router: Router,
    private toastService: ToastService
  ) {}
  headerTitle = 'Upload Documents';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/adminmarketingdashboard' },
    { label: 'Admin Marketing', route: '/adminmarketing/managedacument' },
    { label: 'Upload Documents' }
  ];

  columns = [
    { header: 'Document Name', field: 'name' },
    { header: 'Description', field: 'description' },
    { header: 'Document Access', field: 'access' },
    { header: 'Attachment', field: 'attachment' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'name', label: 'Name', type: 'text', placeholder: 'Document Name' },
  ];

  allRows: DocumentRow[] = [];
  rows: DocumentRow[] = [];
  private useMock = false;
  private refreshSub?: Subscription;
  searchValues: any = {};  // Store search values

  // Store search values when changed
  onSearchChange(values: any) {
    this.searchValues = values || {};
    console.log('Search values stored:', this.searchValues);
  }

  // Search - Only triggered on Search button click
  onSearch() {
    console.log('Search button clicked, values:', this.searchValues);
    const searchTerm = this.searchValues?.name?.toLowerCase() || '';
    if (!searchTerm) {
      this.rows = [...this.allRows];
    } else {
      this.rows = this.allRows.filter(row => 
        row.name.toLowerCase().includes(searchTerm) ||
        row.description.toLowerCase().includes(searchTerm)
      );
    }
  }

  onDownload() {
    console.log('Download clicked');
    if (this.rows.length > 0) {
      this.adminMarketingservice.exportToExcel(this.rows, 'CampaignDocuments');
    } else {
      this.toastService.warning('No data to download');
    }
  }

  onImport() { console.log('Import clicked'); }
  onAdd() { 
    console.log('Add clicked');
    this.router.navigate(['/adminmarketing/managedacument/add']);
  }
  onEdit(row: DocumentRow) { 
    console.log('Info/Edit document:', row);
    this.router.navigate(['/adminmarketing/managedacument/edit', row.id]);
  }
  onDelete(row: DocumentRow) { 
    console.log('Delete document:', row);
    if (confirm(`Are you sure you want to delete ${row.name}?`)) {
      // Implement delete logic here if needed
    }
  }

  onStatusToggle(row: any) {
    const id = row.id;
    const currentStatus = Number(row.specialityStatus);

    if (!id && id !== 0) {
      this.toastService.error('Cannot toggle status: ID is missing.');
      return;
    }

    if (currentStatus === 1) {
      this.adminMarketingservice.deactivateCampdoc(id).subscribe({
        next: () => {
          this.toastService.success('Document deactivated successfully');
          this.loadDocuments();
        },
        error: (err) => {
          console.error('Deactivate failed', err);
          this.toastService.error('Failed to deactivate document.');
        }
      });
    } else {
      this.adminMarketingservice.activateCampdoc(id).subscribe({
        next: () => {
          this.toastService.success('Document activated successfully');
          this.loadDocuments();
        },
        error: (err) => {
          console.error('Activate failed', err);
          this.toastService.error('Failed to activate document.');
        }
      });
    }
  }

  ngOnInit(): void {
    // Check for toast message from previous page
    const toastMessage = sessionStorage.getItem('toastMessage');
    const toastType = sessionStorage.getItem('toastType') as 'success' | 'error' | 'warning' | 'info';
    if (toastMessage && toastType) {
      this.toastService.show(toastMessage, toastType);
      sessionStorage.removeItem('toastMessage');
      sessionStorage.removeItem('toastType');
    }

    if (this.useMock) {
      this.rows = [
        { id: 1, name: 'Mass Mailing', description: 'Sam K', access: 'ADMINMARKETING', attachment: 'sample.pdf', locations: 'Anjaw, Lower Dibang Valley' },
        { id: 2, name: 'Offline', description: 'test', access: 'ADMINMARKETING', attachment: 'sample2.pdf', locations: 'DHARMAVARAM, PARIGI' },
      ];
      return;
    }
    this.loadDocuments();

    // subscribe to refresh events from adminMarketingservice (fires after create/update)
    this.refreshSub = this.adminMarketingservice['refreshSubject'].subscribe(() => {
      console.log('[UploadDocument] refresh event received, reloading documents');
      this.loadDocuments();
    });
  }

  private loadDocuments() {
    this.adminMarketingservice.getCampaignDocuments().subscribe({
      next: (list: CampaignDocument[]) => {
        console.log('[UploadDocument] API documents received:', list.length);

        // Map data from the provided JSON structure
        this.allRows = (list || []).map((d: CampaignDocument) => {
          const status = d.campaignDocstatus !== undefined ? d.campaignDocstatus : 1;
          
          // Safer mapping for Document Access (Roles) - Sorted alphabetically for consistency
          const roles = Array.isArray(d.role) 
            ? d.role
                .map(r => r?.roleName || '')
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b))
                .join(', ') 
            : '';
            
          return {
            id: d.campaignDocumentId,
            name: d.campaignDocName,
            description: d.campaignDocdescription,
            access: roles,
            attachment: d.campaignDocpath,
            locations: 'N/A', // Locations not present in the provided JSON structure
            specialityStatus: status,
            statusText: status === 1 ? 'Active' : 'Inactive'
          };
        });
        
        // Re-apply search if search values exist, otherwise show all
        if (this.searchValues?.name) {
          this.onSearch();
        } else {
          this.rows = [...this.allRows];
        }

        console.log('[UploadDocument] Final mapped rows:', this.rows);
      },
      error: (err: any) => {
        console.error('Failed to load documents:', err);
        this.allRows = [];
        this.rows = [];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }
}
