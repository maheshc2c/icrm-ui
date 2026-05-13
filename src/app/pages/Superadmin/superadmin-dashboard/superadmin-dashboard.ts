import { Component } from '@angular/core';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';
import { Breadcrumb } from '../../../models/breadcrumb';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-superadmin-dashboard',
  imports: [Pageheader,Sidebar,Header, RouterLink],
  templateUrl: './superadmin-dashboard.html',
  styleUrl: './superadmin-dashboard.css'
})
export class SuperadminDashboard {

      headerBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', route: '/superadmin' },
        { label: 'Company', route: '/superadmin/company' },
        { label: 'Add New' }
      ];

}
