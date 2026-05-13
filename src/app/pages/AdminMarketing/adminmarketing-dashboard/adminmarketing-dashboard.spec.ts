import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminmarketingDashboard } from './adminmarketing-dashboard';

describe('AdminmarketingDashboard', () => {
  let component: AdminmarketingDashboard;
  let fixture: ComponentFixture<AdminmarketingDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminmarketingDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminmarketingDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
