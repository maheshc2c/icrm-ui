import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import { ToastComponent } from '../../../shared/toast/toast.component';

@Component({
  selector: 'app-adminmarketing-dashboard',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    Header,
    Sidebar,
    Pageheader,
    ToastComponent],
  templateUrl: './adminmarketing-dashboard.html',
  styleUrl: './adminmarketing-dashboard.css',
})
export class AdminmarketingDashboard {
    constructor() {}

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/adminmarketingdashboard' },
    { label: 'Dashboard' }
  ];
 



}
