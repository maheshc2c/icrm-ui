import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from "../../../../shared/form/form";
import { Header } from "../../../../layout/header/header";
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Breadcrumb } from '../../../../models/breadcrumb';
import { adminMarketingservice } from '../../../../service/adminmarketingservice';
import { ToastService } from '../../../../service/toast.service';

@Component({
  selector: 'app-add-document',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './adddocument.html',
  styleUrls: ['./adddocument.css']
})
export class AddDocument implements OnInit {

  constructor(
    private adminMarketingservice: adminMarketingservice,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  headerTitle = 'Add New Document';
  headerBreadcrumbs: Breadcrumb[] = [];

  isEditMode = false;
  documentId!: number;
  formInitialData: any = {};
  availableRoles: any[] = [];

  ngOnInit(): void {
    this.fetchRoles();
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.documentId = +id;
      this.headerTitle = 'Edit Document';
      this.loadDocumentById(this.documentId);
    } else {
      this.isEditMode = false;
      this.formInitialData = {};
      this.headerTitle = 'Add New Document';
    }

    this.headerBreadcrumbs = [
      { label: 'Home', route: '/adminmarketingdashboard' },
      { label: 'Upload Documents', route: '/adminmarketing/managedacument' },
      { label: this.isEditMode ? 'Edit Document' : 'Add Document' }
    ];

    const docPathField = this.documentFields.find(f => f.name === 'campaignDocpath');
    if (docPathField) {
      docPathField.required = !this.isEditMode;
    }
  }

  /* ================= FORM FIELDS ================= */
  documentFields = [
    {
      name: 'roleName',
      label: 'Role',
      type: 'checkbox',
      required: true,
      options: [
        { value: 'ADMINMARKETING', label: 'Admin Marketing' },
        { value: 'SALES_MANAGER', label: 'Sales Manager' },
        { value: 'DISTRIBUTOR', label: 'Distributor' }
      ]
    },
    {
      name: 'campaignDocName',
      label: 'Document Name',
      type: 'text',
      required: true
    },
    {
      name: 'campaignDocdescription',
      label: 'Description',
      type: 'text',
      required: false
    },
    {
      name: 'campaignDocpath',
      label: 'Attachments',
      type: 'file',
      required: true
    }
  ];

  /* ================= SAVE ================= */
  saveDocument(data: any): void {
    const formData = new FormData();
    formData.append('campaignDocName', data.campaignDocName);
    formData.append('campaignDocdescription', data.campaignDocdescription || '');
    formData.append('campaignDocstatus', '1');

    let rolesString = '';
    if (data.roleName && typeof data.roleName === 'object') {
      rolesString = Object.keys(data.roleName)
        .filter(key => data.roleName[key])
        .join(',');
    } else {
      rolesString = data.roleName || '';
    }
    formData.append('roleName', rolesString);

    if (data.campaignDocpath instanceof File) {
      formData.append('file', data.campaignDocpath);
    }

    if (this.isEditMode) {
      formData.append('campaignDocumentId', String(this.documentId));
    }

    console.log('[AddDocument] Final FormData payload');

    const request$ = this.isEditMode
      ? this.adminMarketingservice.updateDocument(this.documentId, formData)
      : this.adminMarketingservice.createDocument(formData);

    request$.subscribe({
      next: () => {
        const message = `Document ${this.isEditMode ? 'updated' : 'created'} successfully`;
        sessionStorage.setItem('toastMessage', message);
        sessionStorage.setItem('toastType', 'success');
        this.router.navigate(['/adminmarketing/managedacument']);
      },
      error: (err: any) => {
        console.error(err);
        const message = 'Failed to save document';
        sessionStorage.setItem('toastMessage', message);
        sessionStorage.setItem('toastType', 'error');
        this.router.navigate(['/adminmarketing/managedacument']);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/adminmarketing/managedacument']);
  }

  private fetchRoles(): void {
    this.adminMarketingservice.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        // Update form fields with dynamic roles
        const roleField = this.documentFields.find(f => f.name === 'roleName');
        if (roleField) {
          roleField.options = roles.map(r => ({
            value: r.roleName,
            label: r.roleName
          }));
        }
      },
      error: () => {
        console.error('Failed to fetch roles');
      }
    });
  }

  /* ================= LOAD ================= */
  private loadDocumentById(id: number): void {
    this.adminMarketingservice.getDocumentById(id).subscribe({
      next: (docs: any[]) => {
        const d = docs.find(x => x.campaignDocumentId === id);
        if (d) {
          const rolesObj: any = {};
          if (Array.isArray(d.role)) {
            d.role.forEach((r: any) => {
              if (r?.roleName) {
                rolesObj[r.roleName] = true;
              }
            });
          }
          this.formInitialData = {
            campaignDocName: d.campaignDocName,
            campaignDocdescription: d.campaignDocdescription,
            campaignDocpath: d.campaignDocpath,
            roleName: rolesObj
          };
        } else {
          this.toastService.error('Document not found');
          this.router.navigate(['/adminmarketing/managedacument']);
        }
      },
      error: () => {
        this.toastService.error('Failed to load document');
        this.router.navigate(['/adminmarketing/managedacument']);
      }
    });
  }
}
