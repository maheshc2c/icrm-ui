import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../models/breadcrumb';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [Header, Sidebar, Pageheader, CommonModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent implements OnInit {
  /* ================= HEADER ================= */
  headerTitle: string = 'View Calendar';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'View Calendar' }
  ];

  /* ================= CALENDAR DATA ================= */
  selectedUser: string = '';
  currentMonth: string = 'January 2026';
  currentYear: number = 2026;
  currentMonthIndex: number = 0;

  users = [
    { value: 'user1', label: 'sam k - D6065 (Super User)' },
    { value: 'user2', label: 'john d - D6066 (Sales Manager)' }
  ];

  calendarDays: any[] = [];

  ngOnInit(): void {
    this.generateCalendar();
  }

  /* ================= GENERATE CALENDAR ================= */
  generateCalendar(): void {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    this.currentMonth = `${months[this.currentMonthIndex]} ${this.currentYear}`;

    // Generate calendar grid (simplified for UI)
    const daysInMonth = new Date(this.currentYear, this.currentMonthIndex + 1, 0).getDate();
    const firstDay = new Date(this.currentYear, this.currentMonthIndex, 1).getDay();

    this.calendarDays = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push({ day: '', events: [] });
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push({
        day: day,
        events: this.getEventsForDay(day)
      });
    }
  }

  /* ================= GET EVENTS FOR DAY ================= */
  getEventsForDay(day: number): any[] {
    // Dummy events for demonstration
    if (day === 5) {
      return [{ type: 'visit', label: 'Visit' }];
    } else if (day === 10) {
      return [{ type: 'demo', label: 'Demo' }];
    }
    return [];
  }

  /* ================= NAVIGATION ================= */
  previousMonth(): void {
    this.currentMonthIndex--;
    if (this.currentMonthIndex < 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonthIndex++;
    if (this.currentMonthIndex > 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonthIndex = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar();
  }
}
