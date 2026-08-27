import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';

@Component({
  selector: 'app-regional-sales-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Sidebar, Pageheader],
  templateUrl: './regional-sales-manager-dashboard.html',
  styleUrl: './regional-sales-manager-dashboard.css',
})
export class RegionalSalesManagerDashboard implements OnInit {
  headerTitle = 'Regional Sales Manager Dashboard';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/regional-sales-manager-dashboard' },
    { label: 'Dashboard' }
  ];

  constructor() {}

  ngOnInit(): void {}
}
