import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionalSalesManagerDashboard } from './regional-sales-manager-dashboard';

describe('RegionalSalesManagerDashboard', () => {
  let component: RegionalSalesManagerDashboard;
  let fixture: ComponentFixture<RegionalSalesManagerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegionalSalesManagerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegionalSalesManagerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
