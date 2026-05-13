import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  selector: 'app-salesmanager-dashboard',
  imports: [
    CommonModule,
    Header,
    Sidebar,
    Pageheader,
    RouterLink
  ],
  templateUrl: './salesmanager-dashboard.html',
  styleUrl: './salesmanager-dashboard.css'
})
export class SalesManagerDashboard {
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/salesmanager' },
    { label: 'Dashboard' }
  ];
}
