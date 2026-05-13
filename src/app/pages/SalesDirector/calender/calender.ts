import { Component } from '@angular/core';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calender',
  standalone: true,
  imports: [Sidebar, Pageheader, Header, CommonModule],
  templateUrl: './calender.html',
  styleUrl: './calender.css'
})
export class Calender {

    headerTitle = 'View Calendar';

  headerBreadcrumbs = [
    { label: 'Home', route: '/sddashboard' },
    { label: 'View Calendar', route: '/salesdirector/calender' }
  ];

  currentView: 'month' | 'week' | 'day' = 'month';
  currentDate = new Date();

  days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  setView(view: 'month' | 'week' | 'day') {
    this.currentView = view;
  }

  prev() {
    const d = new Date(this.currentDate);
    if (this.currentView === 'month') d.setMonth(d.getMonth() - 1);
    else if (this.currentView === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    this.currentDate = d;
  }

  next() {
    const d = new Date(this.currentDate);
    if (this.currentView === 'month') d.setMonth(d.getMonth() + 1);
    else if (this.currentView === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    this.currentDate = d;
  }

  goToday() {
    this.currentDate = new Date();
  }

  get weekRange(): string {
    const start = new Date(this.currentDate);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — 
            ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  monthDays = [
    29,30,31,1,2,3,4,
    5,6,7,8,9,10,11,
    12,13,14,15,16,17,18,
    19,20,21,22,23,24,25,
    26,27,28,29,30,1,2
  ];

  timeSlots = [
    '6am','7am','8am','9am','10am','11am',
    '12pm','1pm','2pm','3pm','4pm','5pm'
  ];
}