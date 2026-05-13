import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialYear } from './financial-year';

describe('FinancialYear', () => {
  let component: FinancialYear;
  let fixture: ComponentFixture<FinancialYear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialYear]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialYear);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
