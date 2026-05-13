import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';

@Component({
  selector: 'app-otr-dashboard',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader],
  templateUrl: './otr-dashboard.html',
  styleUrl: './otr-dashboard.css',
})
export class OtrDashboard {
  headerTitle = 'OTR Dashboard';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/otr-dashboard' }
  ];
}
