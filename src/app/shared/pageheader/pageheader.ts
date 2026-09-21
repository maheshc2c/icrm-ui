import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Breadcrumb } from '../../models/breadcrumb';

@Component({
  selector: 'app-pageheader',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './pageheader.html',
  styleUrl: './pageheader.css'
})
export class Pageheader implements OnInit, OnChanges {

  @Input() title!: string;
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() homeIcon: string = 'fas fa-home';

  ngOnInit(): void {
    this.normalizeHomeBreadcrumb();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['breadcrumbs']) {
      this.normalizeHomeBreadcrumb();
    }
  }

  private normalizeHomeBreadcrumb(): void {
    if (!this.breadcrumbs || this.breadcrumbs.length === 0) return;

    const first = this.breadcrumbs[0];
    if (first && first.label && first.label.trim().toLowerCase() === 'home') {
      const role = (localStorage.getItem('role') || '').trim();
      const normRole = role.replace(/[\s_]+/g, '').toUpperCase();

      if (normRole === 'COUNTRYHEAD' || (normRole.includes('COUNTRY') && normRole.includes('HEAD'))) {
        if (!first.route || first.route === '/' || first.route === '/dashboard' ||
            first.route === '/sales-manager-dashboard' || first.route === '/sddashboard' ||
            first.route === '/admindashboard' || first.route === '/login') {
          first.route = '/country-head';
        }
      }
    }
  }
}
