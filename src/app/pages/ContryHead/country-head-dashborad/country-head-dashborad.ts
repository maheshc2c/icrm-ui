import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { RouterLink } from '@angular/router';
import { Pageheader } from '../../../shared/pageheader/pageheader';

@Component({
  selector: 'app-country-head-dashborad',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, RouterLink, Pageheader],
  templateUrl: './country-head-dashborad.html',
  styleUrl: './country-head-dashborad.css',
})
export class CountryHeadDashborad {

  headerBreadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Country Head', route: '/country-head' }
  ];
  headerTitle = 'Country Head Dashboard';
}


@Component({
  selector: 'app-country-head',
  standalone: true,
  imports: [CommonModule, CountryHeadDashborad],
  template: '<app-country-head-dashborad></app-country-head-dashborad>'
})
export class CountryHead {}
