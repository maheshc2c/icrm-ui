import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Sidebar } from '../../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../../shared/pageheader/pageheader';
import { Header } from "../../../../../layout/header/header";
import { Breadcrumb } from '../../../../../models/breadcrumb';

@Component({
  selector: 'app-financial-year-calender',
  imports: [CommonModule, Sidebar, Pageheader, Header],
  templateUrl: './financial-year-calender.html',
  styleUrl: './financial-year-calender.css',
})
export class FinancialYearCalender {

  headerTitle = 'Manage Financial Year';

   headerBreadcrumbs: Breadcrumb[] = [
          { label: 'Home', route: '/admindashboard' },
          { label: 'FinancialYear', route: '/financial-yr' }
        ];

    financialYearName = '';

  calendarData: any[] = [];

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {

  const state = history.state;

  if (state?.data) {

    this.financialYearName = state.fyName;
    this.financialYearStartDate = state.fyStartDate;
    console.log('FY Start Date:', this.financialYearStartDate);

    const groupedData: any = {};

    state.data.forEach((item: any) => {

      if (!groupedData[item.monthName]) {

        groupedData[item.monthName] = {
          monthName: item.monthName,
          weeks: []
        };
      }

      groupedData[item.monthName].weeks.push({
        weekNo: item.weekNo,
        startDate: item.startDate,
        endDate: item.endDate
      });
    });

    this.calendarData = Object.values(groupedData);
   

    console.log(this.calendarData);

  } else {

    this.router.navigate(
      ['/financial-yr']
    );
  }
}

  goBack(): void {

    this.router.navigate(
      ['/financial-yr']
    );
  }

  financialYearStartDate = '';

 
}
