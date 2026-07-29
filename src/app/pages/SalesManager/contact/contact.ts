import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Contactservice } from '../../../service/contactservice';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule, Header, Sidebar],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class ContactComponent implements OnInit {
  
  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Manage Contact' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'customer', label: 'Customer', type: 'select', placeholder: 'Select Customer', options: [
      { value: '', label: 'Select Customer' },
      { value: 'Customer A', label: 'Customer A' },
      { value: 'Customer B', label: 'Customer B' }
    ]},
    { key: 'speciality', label: 'Speciality', type: 'select', placeholder: 'Select Speciality', options: [
      { value: '', label: 'Select Speciality' },
      { value: 'Test', label: 'Test' }
    ]},
    { key: 'contact', label: 'Contact', type: 'text', placeholder: 'Name' }
  ];

  columns = [
    { header: 'Name', field: 'name' },
    { header: 'Customer', field: 'customer' },
    { header: 'Speciality', field: 'speciality' },
    { header: 'Email', field: 'email' },
    { header: 'Mobile', field: 'mobile' }
  ];

  rows: any[] = [];

  constructor(
    private router: Router,
    private contactService: Contactservice
  ) { }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.rows = [
      { name: 'Test', customer: '', speciality: 'Test', email: 'abc@gmail.com', mobile: '91-9988997700' },
      { name: 'Finward', customer: '', speciality: 'Test', email: 'mrlemens1809@gmail.com', mobile: '91-9100831007' },
      { name: 'Prashash', customer: '', speciality: 'Test', email: 'test@gmail.com', mobile: '91-9620744022' },
      { name: 'Nagaraj', customer: '', speciality: 'Test', email: 'test@gmail.com', mobile: '91-8100511796' },
      { name: 'Shankar', customer: '', speciality: 'Test', email: 'test@gmail.com', mobile: '91-9590253883' },
      { name: 'shaji', customer: '', speciality: 'Test', email: 'test@gmail.com', mobile: '91-9809608111' },
      { name: 'Ameen LSS', customer: '', speciality: 'Test', email: 'rasdan@2c2as.com', mobile: '91-9535905312' },
      { name: 'sudhina', customer: '', speciality: 'Test', email: 'c2cna@2cls.com', mobile: '91-9876549210' },
      { name: 'sam k', customer: '', speciality: 'Test', email: 'samkumarj673@gmail.com', mobile: '91-6666666666' },
      { name: 'test new k', customer: '', speciality: 'Test', email: 'samkumarj7@gmail.com', mobile: '91-6666666666' },
      { name: 'test k', customer: '', speciality: 'Test', email: 'samkumarj673@gmail.com', mobile: '91-9940079561' },
      { name: 'RAVI', customer: '', speciality: 'Test', email: 'admin@example.com', mobile: '91-1234567790' }
    ];
  }

  onSearch(filters: any): void {
    console.log('Search filters:', filters);
  }

  onAdd(): void {
    this.router.navigate(['/salesmanager/contact/add']);
  }

  onEdit(row: any): void {
    console.log('Edit contact:', row);
    // Navigate to edit page - you'll need to add a unique ID field to your rows
    // For now, using the name as identifier
    this.router.navigate(['/salesmanager/contact/edit', row.name]);
  }

  onDownload(): void {
    console.log('Download contacts as Excel');
    alert('Download functionality will be implemented');
  }
}
