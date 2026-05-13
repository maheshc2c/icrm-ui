import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from "../../../shared/form/form";
import { Header } from "../../../layout/header/header";
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { Breadcrumb } from '../../../models/breadcrumb';
import { Companyservice } from '../../../service/companyservice';



@Component({
  selector: 'app-addcompany',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader],
  templateUrl: './addcompany.html',
  styleUrl: './addcompany.css'
})
export class Addcompany implements OnInit {

  constructor(
    private companyService: Companyservice,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /* ================= HEADER ================= */
  headerTitle = 'Add New Company';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= FORM STATE ================= */
  isEditMode = false;
  companyId!: number;
  formInitialData: any = {};

  /* ================= ON INIT ================= */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.setupEditMode(+id);
    } else {
      this.setupCreateMode();
    }
  }

  /* ================= MODE SETUP ================= */
  private setupEditMode(id: number): void {
    this.isEditMode = true;
    this.companyId = id;

    this.headerTitle = 'Edit Company';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/superadmin' },
      { label: 'Company', route: '/superadmin/company' },
      { label: 'Edit Company' }
    ];

    this.loadCompanyById(id);
  }

  private setupCreateMode(): void {
    this.isEditMode = false;

    this.headerTitle = 'Add New Company';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/superadmin' },
      { label: 'Company', route: '/superadmin/company' },
      { label: 'Add Company' }
    ];
  }

  /* ================= FORM FIELDS ================= */
  companyFields = [
  { name: 'companyName', label: 'Company Name', placeholder: 'Company Name', type: 'text', required: true },
  { name: 'panNumber', label: 'PAN Number', placeholder: 'PAN Number', type: 'text', required: true },
  { name: 'tinNumber', label: 'TIN Number', placeholder: 'TIN Number', type: 'text', required: true },
  { name: 'cinNumber', label: 'CIN Number', placeholder: 'CIN Number', type: 'text', required: true },
  { name: 'tanNumber', label: 'TAN Number', placeholder: 'TAN Number', type: 'text', required: true },

  { name: 'serviceTaxNumber', label: 'Service Tax Number 1', placeholder: 'Service Tax Number 1', type: 'text', required: true },
  { name: 'serviceTaxNumber2', label: 'Service Tax Number 2', placeholder: 'Service Tax Number 2', type: 'text', required: true },
  { name: 'salesTaxNumber', label: 'Sales Tax Number', placeholder: 'Sales Tax Number', type: 'text', required: true },

  { name: 'exciseNumber', label: 'Excise Number 1', placeholder: 'Excise Number 1', type: 'text', required: true },
  { name: 'exciseNumber2', label: 'Excise Number 2', placeholder: 'Excise Number 2', type: 'text', required: true },

 
  { name: 'country', label: 'Country', placeholder: 'Country', type: 'text', required: true },
  { name: 'state', label: 'State', placeholder: 'State', type: 'text', required: true },

  { name: 'city', label: 'City', placeholder: 'City', type: 'text', required: true },
  { name: 'address1', label: 'Area', placeholder: 'Area', type: 'text', required: true },
  { name: 'address2', label: 'Address', placeholder: 'Address', type: 'textarea', required: true },

  { name: 'bankName', label: 'Bank', placeholder: 'Bank Name', type: 'text', required: true },
  { name: 'branch', label: 'Bank Branch', placeholder: 'Bank Branch', type: 'text', required: true },
  { name: 'acName', label: 'Account Name', placeholder: 'Account Name', type: 'text', required: true },
  { name: 'acNo', label: 'Account Number', placeholder: 'Account Number', type: 'number', required: true },
  { name: 'ifsc', label: 'IFSC', placeholder: 'IFSC Number', type: 'text', required: true }
];


  /* ================= SAVE ================= */
  saveCompany(data: any): void {
    const payload = { ...data, status: 1 };

    if (this.isEditMode) {
      this.companyService.updateCompany(this.companyId, payload).subscribe({
        next: () => this.router.navigate(['/superadmin/company']),
        error: err => {
          console.error('Update failed', err);
          alert('Failed to update company');
        }
      });
    } else {
      this.companyService.createCompany(payload).subscribe({
        next: () => this.router.navigate(['/superadmin/company']),
        error: err => {
          console.error('Create failed', err);
          alert('Failed to create company');
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/superadmin/company']);
  }

  /* ================= LOAD COMPANY ================= */
  private loadCompanyById(id: number): void {
    this.companyService.getCompanyById(id).subscribe({
      next: (companies: any[]) => {
        const company = companies.find(c => c.companyId === id);

        if (!company) {
          alert('Company not found');
          this.router.navigate(['/superadmin/company']);
          return;
        }

        this.formInitialData = { ...company };
      },
      error: err => {
        console.error(err);
        alert('Failed to load company');
      }
    });
  }
}
