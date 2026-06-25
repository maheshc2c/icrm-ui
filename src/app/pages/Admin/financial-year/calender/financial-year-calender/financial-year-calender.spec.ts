import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialYearCalender } from './financial-year-calender';

describe('FinancialYearCalender', () => {
  let component: FinancialYearCalender;
  let fixture: ComponentFixture<FinancialYearCalender>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialYearCalender]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialYearCalender);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
