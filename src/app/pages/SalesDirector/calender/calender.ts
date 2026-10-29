import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Sidebar }
  from '../../../layout/sidebar/sidebar';

import { Pageheader }
  from '../../../shared/pageheader/pageheader';

import { Header }
  from '../../../layout/header/header';

import {
  CalendarDay,
  CalendarEvent,
  CalendarResponse,
  UserDropdown
} from '../../../models/calendar.model';

import { CalendarService }
  from './calendar.service';

@Component({
  selector: 'app-calender',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Header,
    Sidebar,
    Pageheader
  ],
  templateUrl: './calender.html',
  styleUrl: './calender.css'
})
export class Calender implements OnInit {

  headerTitle = 'View Calendar';

  headerBreadcrumbs = [
    {
      label: 'Home',
      route: '/sddashboard'
    },
    {
      label: 'View Calendar',
      route: '/calender'
    }
  ];

  currentView: 'month' | 'week' | 'day' =
    'month';

  currentDate: Date = new Date();

  users: UserDropdown[] = [];

  selectedUserId: number | null = null;

  calendarEvents: CalendarEvent[] = [];

  monthDays: CalendarDay[] = [];

  loading = false;

  days: string[] = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ];

  timeSlots: string[] = [
    '6am',
    '7am',
    '8am',
    '9am',
    '10am',
    '11am',
    '12pm',
    '1pm',
    '2pm',
    '3pm',
    '4pm',
    '5pm',
    '6pm',
    '7pm'
  ];

  constructor(
    private calendarService: CalendarService
  ) {}

  ngOnInit(): void {
    this.generateMonthDays();
    this.loadUsers();
  }

  /**
   * Loads active employees for the dropdown.
   */
  loadUsers(
    name: string = ''
  ): void {

    this.loading = true;

    this.calendarService
      .getReportees(name)
      .subscribe({
        next: (
          response: UserDropdown[]
        ) => {

          console.log(
            'Reportees response:',
            response
          );

          this.users =
            Array.isArray(response)
              ? response
              : [];

          this.loading = false;

          if (this.users.length === 0) {
            this.selectedUserId = null;
            this.calendarEvents = [];
            return;
          }

          /*
           * Select the first employee initially.
           */
          this.selectedUserId =
            this.users[0].userId;

          this.loadCalendar();
        },

        error: error => {
          console.error(
            'Failed to load reportees'
          );

          console.error(
            'Status:',
            error.status
          );

          console.error(
            'Backend response:',
            error.error
          );

          this.users = [];
          this.selectedUserId = null;
          this.calendarEvents = [];
          this.loading = false;
        }
      });
  }

  /**
   * Called whenever another employee
   * is selected from the dropdown.
   */
  onUserChange(): void {

    if (
      this.selectedUserId === null ||
      this.selectedUserId === undefined
    ) {
      this.calendarEvents = [];
      return;
    }

    this.loadCalendar();
  }

  /**
   * Loads visits and demos for the
   * selected employee.
   */
  loadCalendar(): void {

    if (
      this.selectedUserId === null ||
      this.selectedUserId === undefined
    ) {
      this.calendarEvents = [];
      return;
    }

    this.loading = true;

    this.calendarService
      .getCalendar(this.selectedUserId)
      .subscribe({
        next: (
          response: CalendarResponse
        ) => {

          console.log(
            'Calendar response:',
            response
          );

          const visitEvents =
            response?.visitEvents ?? [];

          const demoEvents =
            response?.demoEvents ?? [];

          this.calendarEvents = [
            ...visitEvents,
            ...demoEvents
          ];

          this.loading = false;
        },

        error: error => {
          console.error(
            'Failed to load calendar'
          );

          console.error(
            'Status:',
            error.status
          );

          console.error(
            'Backend response:',
            error.error
          );

          this.calendarEvents = [];
          this.loading = false;
        }
      });
  }

  setView(
    view: 'month' | 'week' | 'day'
  ): void {

    this.currentView = view;
  }

  prev(): void {

    const date =
      new Date(this.currentDate);

    if (this.currentView === 'month') {
      date.setMonth(
        date.getMonth() - 1
      );
    } else if (
      this.currentView === 'week'
    ) {
      date.setDate(
        date.getDate() - 7
      );
    } else {
      date.setDate(
        date.getDate() - 1
      );
    }

    this.currentDate = date;
    this.generateMonthDays();
  }

  next(): void {

    const date =
      new Date(this.currentDate);

    if (this.currentView === 'month') {
      date.setMonth(
        date.getMonth() + 1
      );
    } else if (
      this.currentView === 'week'
    ) {
      date.setDate(
        date.getDate() + 7
      );
    } else {
      date.setDate(
        date.getDate() + 1
      );
    }

    this.currentDate = date;
    this.generateMonthDays();
  }

  goToday(): void {

    this.currentDate = new Date();
    this.generateMonthDays();
  }

  /**
   * Generates 42 cells:
   * 7 columns and 6 rows.
   */
  generateMonthDays(): void {

    const year =
      this.currentDate.getFullYear();

    const month =
      this.currentDate.getMonth();

    const firstDay =
      new Date(year, month, 1);

    const gridStart =
      new Date(year, month, 1);

    gridStart.setDate(
      firstDay.getDate() -
      firstDay.getDay()
    );

    const generatedDays:
      CalendarDay[] = [];

    for (
      let index = 0;
      index < 42;
      index++
    ) {

      const date =
        new Date(gridStart);

      date.setDate(
        gridStart.getDate() + index
      );

      generatedDays.push({
        date,
        dateKey: this.toDateKey(date),
        dayNumber: date.getDate(),
        currentMonth:
          date.getMonth() === month
      });
    }

    this.monthDays = generatedDays;
  }

  /**
   * Returns visits and demos scheduled on the supplied date.
   * Multi-day events are shown on every date from start through end.
   */
  getEventsForDate(
    dateKey: string
  ): CalendarEvent[] {

    return this.calendarEvents.filter(
      event => {

        if (!event.start) {
          return false;
        }

        const startDateKey =
          this.extractDateKey(event.start);

        const endDateKey = event.end
          ? this.extractDateKey(event.end)
          : startDateKey;

        return dateKey >= startDateKey &&
          dateKey <= endDateKey;
      }
    );
  }

  get currentDayEvents():
    CalendarEvent[] {

    const currentDateKey =
      this.toDateKey(
        this.currentDate
      );

    return this.getEventsForDate(
      currentDateKey
    );
  }

  get weekDates(): CalendarDay[] {

    const start =
      new Date(this.currentDate);

    start.setDate(
      start.getDate() -
      start.getDay()
    );

    const dates:
      CalendarDay[] = [];

    for (
      let index = 0;
      index < 7;
      index++
    ) {

      const date =
        new Date(start);

      date.setDate(
        start.getDate() + index
      );

      dates.push({
        date,
        dateKey:
          this.toDateKey(date),
        dayNumber:
          date.getDate(),
        currentMonth:
          date.getMonth() ===
          this.currentDate.getMonth()
      });
    }

    return dates;
  }

  get weekRange(): string {

    const dates =
      this.weekDates;

    const start =
      dates[0].date;

    const end =
      dates[6].date;

    const startText =
      start.toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric'
        }
      );

    const endText =
      end.toLocaleDateString(
        'en-US',
        {
          day: 'numeric',
          year: 'numeric'
        }
      );

    return `${startText} — ${endText}`;
  }

  get calendarTitle(): string {

    if (
      this.currentView === 'month'
    ) {
      return this.currentDate
        .toLocaleDateString(
          'en-US',
          {
            month: 'long',
            year: 'numeric'
          }
        );
    }

    if (
      this.currentView === 'week'
    ) {
      return this.weekRange;
    }

    return this.currentDate
      .toLocaleDateString(
        'en-US',
        {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }
      );
  }

  eventClass(
    event: CalendarEvent
  ): string {

    return event.eventType
      ?.toUpperCase() === 'VISIT'
        ? 'visit-event'
        : 'demo-event';
  }

  isToday(
    date: Date
  ): boolean {

    const today =
      new Date();

    return (
      date.getFullYear() ===
        today.getFullYear() &&
      date.getMonth() ===
        today.getMonth() &&
      date.getDate() ===
        today.getDate()
    );
  }

  private extractDateKey(
    value: string
  ): string {

    /*
     * Supports:
     * 2026-09-11
     * 2026-09-11T10:30:00
     * 2026-09-11 10:30:00
     */
    return String(value).substring(0, 10);
  }

  private toDateKey(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
