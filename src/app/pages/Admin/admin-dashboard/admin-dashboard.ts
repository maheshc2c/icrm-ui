import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    Header,
    Sidebar,
    Pageheader,
    RouterLink
],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
    headerBreadcrumbs: Breadcrumb[] = [
      { label: 'Home', route: '/superadmin' },
      { label: 'Company', route: '/superadmin/company' },
      { label: 'Add New' }
    ];
}
