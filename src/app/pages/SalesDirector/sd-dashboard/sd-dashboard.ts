import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-sd-dashboard',
  imports: [CommonModule,
    Header,
    Sidebar,
    Pageheader,
    RouterLink],
  standalone: true,
  templateUrl: './sd-dashboard.html',
  styleUrl: './sd-dashboard.css',
})
export class SdDashboard {
    headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sddashboard' },
    { label: 'Dashboard' }
      ];

}
