import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalSalesManagerDashboard } from './national-sales-manager-dashboard';

describe('NationalSalesManagerDashboard', () => {
  let component: NationalSalesManagerDashboard;
  let fixture: ComponentFixture<NationalSalesManagerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalSalesManagerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalSalesManagerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
