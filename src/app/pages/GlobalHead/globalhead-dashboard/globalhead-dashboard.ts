import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';
import { GlobalHeadService } from '../../../service/GlobalHeadService';

@Component({
  selector: 'app-globalhead-dashboard',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader],
  templateUrl: './globalhead-dashboard.html',
  styleUrls: ['./globalhead-dashboard.css'],
})
export class GlobalheadDashboard implements OnInit {

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/globalhead-dashboard' },
    { label: 'Dashboard', route: '/globalhead-dashboard' }
  ];
 
  alertCounts = {
    leadsToday: 0,
    opportunityReview: 0,
    demoFeedback: 0,
    visitFeedback: 2
  };
 
  constructor(private globalHeadService: GlobalHeadService) { }
 
  ngOnInit(): void { }

}
