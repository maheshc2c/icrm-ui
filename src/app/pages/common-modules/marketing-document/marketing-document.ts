import { Component, OnDestroy, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';

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
  selector: 'app-common-marketing-document',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, Header, Sidebar, Pageheader, DataTable],
  templateUrl: './marketing-document.html',
  styleUrls: ['./marketing-document.css'],
})
export class MarketingDocumentComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  isCountryHead = false;
  isAdminMarketing = false;
  headerTitle = 'Upload Documents';
  headerBreadcrumbs: Breadcrumb[] = [];

  columns = [
    { header: 'Document Name', field: 'name' },
    { header: 'Description', field: 'description' },
    { header: 'Document Access', field: 'access' },
    { header: 'Attachment', field: 'attachment', type: 'icon', icon: 'fas fa-download', title: 'Download Document' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'name', label: 'Name', type: 'text', placeholder: 'Document Name' },
  ];

  allRows: any[] = [];
  rows: DocumentRow[] = [];
  private useMock = false;
  private refreshSub?: Subscription;
  searchFilters: any = {};

  totalElements = 0;
  currentPage = 1;
  pageSize = 10;

  constructor(
    private adminMarketingservice: adminMarketingservice,
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    const currentUrl = this.router.url;
    this.isCountryHead = currentUrl.includes('country-head');

    if (this.isCountryHead) {
      this.headerTitle = 'Marketing Document';
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/country-head' },
        { label: 'Marketing Document', route: '/country-head/marketing-document' },
        { label: 'Marketing Document' }
      ];
    } else {
      this.headerTitle = 'Upload Documents';
      this.headerBreadcrumbs = [
        { label: 'Home', route: '/adminmarketingdashboard' },
        { label: 'Admin Marketing', route: '/adminmarketing/managedacument' },
        { label: 'Upload Documents' }
      ];
    }

    if (isPlatformBrowser(this.platformId)) {
      const userRole = localStorage.getItem('role') || '';
      this.isAdminMarketing = userRole.replace(/[\s_]+/g, '').toUpperCase() === 'ADMINMARKETING';

      const toastMessage = sessionStorage.getItem('toastMessage');
      const toastType = sessionStorage.getItem('toastType') as 'success' | 'error' | 'warning' | 'info';
      if (toastMessage && toastType) {
        this.toastService.show(toastMessage, toastType);
        sessionStorage.removeItem('toastMessage');
        sessionStorage.removeItem('toastType');
      }

      if (this.useMock) {
        this.rows = [
          { id: 1, name: 'Mass Mailing', description: 'Sam K', access: 'ADMIN MARKETING', attachment: 'sample.pdf', locations: 'Anjaw, Lower Dibang Valley' },
          { id: 2, name: 'Offline', description: 'test', access: 'ADMIN MARKETING', attachment: 'sample2.pdf', locations: 'DHARMAVARAM, PARIGI' },
        ];
        return;
      }
      this.loadDocuments();

      this.refreshSub = this.adminMarketingservice['refreshSubject'].subscribe(() => {
        console.log('[MarketingDocumentComponent] refresh event received, reloading documents');
        this.loadDocuments();
      });
    }
  }

  onSearchChange(values: any) {
    this.searchFilters = values || {};
    this.currentPage = 1;
    this.loadDocuments();
  }

  onSearch(keyword: string) {
    this.searchFilters = { name: keyword };
    this.currentPage = 1;
    this.loadDocuments();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadDocuments();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDocuments();
  }

  onReset(): void {
    this.searchFilters = {};
    this.currentPage = 1;
    this.loadDocuments();
  }

  onDownload() {
    console.log('Download clicked');
    if (this.rows.length > 0) {
      this.adminMarketingservice.exportToExcel(this.rows, 'CampaignDocuments');
    } else {
      this.toastService.warning('No data to download');
    }
  }

  onAdd() {
    if (this.isCountryHead) return;
    console.log('Add clicked');
    this.router.navigate(['/adminmarketing/managedacument/add']);
  }

  onEdit(row: DocumentRow) {
    if (this.isCountryHead) return;
    console.log('Info/Edit document:', row);
    this.router.navigate(['/adminmarketing/managedacument/edit', row.id]);
  }

  onDelete(row: any) {
    if (this.isCountryHead) return;
    const id = row.id;
    if (!id && id !== 0) {
      return;
    }
    const status = Number(row.specialityStatus);
    const isActive = status === 1;

    this.confirmService.confirm({
      title: 'Confirm',
      message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this document?`,
      confirmText: isActive ? 'Deactivate' : 'Activate'
    }).then((confirmed) => {
      if (!confirmed) return;

      const apiCall = isActive
        ? this.adminMarketingservice.deactivateCampdoc(id)
        : this.adminMarketingservice.activateCampdoc(id);

      apiCall.subscribe({
        next: () => {
          row.specialityStatus = isActive ? 2 : 1;
          row.statusText = isActive ? 'Inactive' : 'Active';
          this.rows = [...this.rows];
          this.toastService.success(`Document ${isActive ? 'deactivated' : 'activated'} successfully`);
        },
        error: (err) => {
          console.error('Status update failed', err);
          this.toastService.error('Failed to update status');
        }
      });
    });
  }

  private loadDocuments() {
    const userRole = this.isCountryHead ? (localStorage.getItem('role') || null) : null;
    this.adminMarketingservice.searchCampaignDocumentsPaged(
      this.searchFilters.name || null,
      userRole, // roleName
      this.currentPage - 1,
      this.pageSize
    ).subscribe({
      next: (res: any) => {
        const list = res?.content || [];
        this.totalElements = res?.totalElements || 0;
        this.allRows = list;

        this.rows = list.map((d: CampaignDocument) => {
          const status = d.campaignDocstatus !== undefined ? d.campaignDocstatus : 1;
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
            locations: 'N/A',
            specialityStatus: status,
            statusText: status === 1 ? 'Active' : 'Inactive'
          };
        });
      },
      error: (err: any) => {
        console.error('Failed to load documents:', err);
        this.rows = [];
        this.allRows = [];
        this.totalElements = 0;
      }
    });
  }

  onDownloadDocument(row: any): void {
    const fileName = row.attachment;
    if (fileName && fileName.trim().length > 0) {
      this.adminMarketingservice.downloadFile(fileName).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
          a.download = row.name ? `${row.name}${ext}` : fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Failed to download file:', err);
          this.toastService.error('Failed to download file');
        }
      });
    } else {
      this.toastService.error('No document file attached to this record');
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }
}
