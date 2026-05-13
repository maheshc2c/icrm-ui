import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';

@Component({
  selector: 'app-commission',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader],
  templateUrl: './commission.html',
  styleUrl: './commission.css',
})
export class Commission {
  headerTitle = 'Commission Report';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/otr-dashboard' },
    { label: 'Commission' }
  ];

  // Filter fields
  customerName = '';
  productName = '';
  soNumber = '';
  invoiceStatus = '';
  distributorName = '';
  startDate = '';
  endDate = '';
  paymentStatus = 'Due';

  // Selection
  selectAll = false;

  get hasSelectedRows(): boolean {
    return false; // Since data is hardcoded, selection logic can be added as needed
  }

  toggleAll(): void {
    // Toggle logic can be implemented as needed
  }

  searchRecords(): void {
    // Search logic can be implemented as needed
  }

  resetFilters(): void {
    this.customerName = '';
    this.productName = '';
    this.soNumber = '';
    this.invoiceStatus = '';
    this.distributorName = '';
    this.startDate = '';
    this.endDate = '';
    this.paymentStatus = 'Due';
  }

  markAsPaid(): void {
    alert('Records marked as Paid.');
  }
}
