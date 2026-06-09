import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../shared/search/search';
import { Customerservice } from '../../../service/customerservice';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule],
  templateUrl: './customer.html',
  styleUrls: ['./customer.css']
})
export class CustomerComponent implements OnInit {
  
  searchFields: SearchFieldConfig[] = [
    { key: 'customerName', label: 'Customer', type: 'text', placeholder: 'Name' },
    { key: 'category', label: 'Category', type: 'select', placeholder: 'Select Category', options: [
      { value: '', label: 'Select Category' },
      { value: 'Category A', label: 'Category A' },
      { value: 'Category B', label: 'Category B' }
    ]},
    { key: 'subCategory', label: 'Sub Category', dependsOn: 'category', type: 'select', placeholder: 'Select Sub Category', options: [
      { value: '', label: 'Select Sub Category' },
      { value: 'Sub A', label: 'Sub A' },
      { value: 'Sub B', label: 'Sub B' }
    ]},
    { key: 'location', label: 'Location', type: 'select', placeholder: 'Select Location', options: [
      { value: '', label: 'Select Location' },
      { value: 'Bangalore', label: 'Bangalore' },
      { value: 'Chennai', label: 'Chennai' }
    ]}
  ];

  columns = [
    { header: 'Customer Name', field: 'customerName' },
    { header: 'Telephone', field: 'telephone' },
    { header: 'Mobile', field: 'mobile' },
    { header: 'Location', field: 'location' }
  ];

  rows: any[] = [];

  constructor(
    private router: Router,
    private customerService: Customerservice
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.rows = [
      {
        customerName: 'C2C Advanced Systems',
        telephone: '',
        mobile: '',
        location: 'Chittoor'
      },
      {
        customerName: 'Lido Mall',
        telephone: '',
        mobile: '',
        location: 'Bangalore'
      },
      {
        customerName: 'BEML',
        telephone: '',
        mobile: '',
        location: 'Bangalore'
      },
      {
        customerName: 'Soul Space Spirit Centro Mall',
        telephone: '',
        mobile: '',
        location: 'Bangalore'
      },
      {
        customerName: 'Vega city mall',
        telephone: '',
        mobile: '',
        location: 'Bangalore'
      },
      {
        customerName: 'Park Square mall',
        telephone: '',
        mobile: '',
        location: 'Bangalore'
      },
      {
        customerName: 'Shantiniketan Nexus mall',
        telephone: '',
        mobile: '',
        location: 'Bangalore'
      },
      {
        customerName: 'INICAI',
        telephone: '91 9449253849',
        mobile: '91 9449253849',
        location: 'Bangalore'
      },
      {
        customerName: 'Indian Naval Academy',
        telephone: '',
        mobile: '',
        location: 'Kannur'
      },
      {
        customerName: 'HAL Engine Division',
        telephone: '',
        mobile: '',
        location: 'Bangalore'
      }
    ];
  }

  onSearch(filters: any): void {
    console.log('Search filters:', filters);
  }

  onAdd(): void {
    this.router.navigate(['/salesmanager/customer/add']);
  }

  onEdit(row: any): void {
    console.log('Edit customer:', row);
    // this.router.navigate(['/salesmanager/customer/edit', row.customerId]);
  }

  onDownload(): void {
    console.log('Download customers as Excel');
    alert('Download functionality will be implemented');
  }
}
