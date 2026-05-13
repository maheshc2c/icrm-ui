import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Header } from "../../../layout/header/header";
import { Sidebar } from "../../../layout/sidebar/sidebar";
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { Form } from "../../../shared/form/form";

import { Breadcrumb } from '../../../models/breadcrumb';
import { Company } from '../../../models/company';
import { Companyservice } from './../../../service/companyservice';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-company',
  standalone: true,
  imports: [Pageheader, Form, CommonModule, Header, Sidebar],
  templateUrl: './edit-company.html',
  styleUrl: './edit-company.css',
})
export class EditCompany implements OnInit {

  companyId!: number;
  companyData!: Company;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: Companyservice
  ) {}

  headerTitle = 'Edit Company';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/superadmin' },
    { label: 'Company', route: '/superadmin/company' },
    { label: 'Edit' }
  ];

  companyFields = [
    { name: 'companyName', label: 'Company Name', type: 'text', required: true },
    { name: 'panNumber', label: 'PAN Number', type: 'text', required: true },
    { name: 'tinNumber', label: 'TIN Number', type: 'text', required: true },
    { name: 'cinNumber', label: 'CIN Number', type: 'text', required: true },
    { name: 'tanNumber', label: 'TAN Number', type: 'text', required: true },

    { name: 'serviceTaxNumber', label: 'Service Tax Number 1', type: 'text', required: true },
    { name: 'serviceTaxNumber2', label: 'Service Tax Number 2', type: 'text', required: true },
    { name: 'salesTaxNumber', label: 'Sales Tax Number', type: 'text', required: true },

    { name: 'exciseNumber', label: 'Excise Number 1', type: 'text', required: true },
    { name: 'exciseNumber2', label: 'Excise Number 2', type: 'text', required: true },

    {
      name: 'country',
      label: 'Country',
      type: 'select',
      required: true,
      options: [
        { label: 'India', value: 'India' },
        { label: 'USA', value: 'USA' }
      ]
    },
    {
      name: 'state',
      label: 'State',
      type: 'select-dynamic',
      required: true,
      dependsOn: 'country',
      optionsMap: {
        India: [
          { label: 'Tamil Nadu', value: 'Tamil Nadu' },
          { label: 'Kerala', value: 'Kerala' }
        ],
        USA: [
          { label: 'California', value: 'California' },
          { label: 'Texas', value: 'Texas' }
        ]
      }
    },

    { name: 'city', label: 'City', type: 'text', required: true },
    { name: 'address1', label: 'Address Line 1', type: 'textarea', required: true },
    { name: 'address2', label: 'Address Line 2', type: 'textarea', required: false },

    { name: 'bankName', label: 'Bank', type: 'text', required: true },
    { name: 'branch', label: 'Bank Branch', type: 'text', required: true },
    { name: 'acName', label: 'Account Name', type: 'text', required: true },
    { name: 'acNo', label: 'Account Number', type: 'number', required: true },
    { name: 'ifsc', label: 'IFSC', type: 'text', required: true }
  ];

  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCompany();
  }

  loadCompany(): void {
    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        const found = companies.find(c => c.companyId === this.companyId);
        if (found) {
          this.companyData = found;
        }
      },
      error: () => alert('Failed to load company')
    });
  }

 updateCompany(formData: Company): void {

  const payload: Company = {
    ...formData,
    companyId: this.companyId,                 // ⭐ REQUIRED
    modifiedBy: localStorage.getItem('userId') || '1'
  };

  console.log('Update Payload:', payload);

  this.companyService.updateCompany(this.companyId, payload).subscribe({
    next: (res) => {
      alert('Company updated successfully');
      this.router.navigate(['/superadmin/company']);
    },
    error: (err) => {
      console.error('Update failed:', err);
      alert('Update failed');
    }
  });
}

cancelEdit(): void {
  
  this.router.navigate(['/superadmin/company']);
}

}
