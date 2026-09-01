import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-national-sales-manager-dashboard',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader, RouterLink],
  templateUrl: './national-sales-manager-dashboard.html',
  styleUrl: './national-sales-manager-dashboard.css',
})
export class NationalSalesManagerDashboard implements OnInit {
  headerTitle = 'National Sales Manager Dashboard';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/national-sales-manager-dashboard' },
    { label: 'Dashboard' }
  ];

  constructor() {}

  ngOnInit(): void {}
}
