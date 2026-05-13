import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';

@Component({
  selector: 'app-regional-branch-head',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader],
  templateUrl: './regional-branch-head.html',
  styleUrl: './regional-branch-head.css',
})
export class RegionalBranchHead implements OnInit {
  headerTitle = 'Regional Branch Head Dashboard';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/regional-branch-head' },
    { label: 'Dashboard' }
  ];

  constructor() {}

  ngOnInit(): void {}
}
