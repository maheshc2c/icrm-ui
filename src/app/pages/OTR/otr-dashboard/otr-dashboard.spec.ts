import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtrDashboard } from './otr-dashboard';

describe('OtrDashboard', () => {
  let component: OtrDashboard;
  let fixture: ComponentFixture<OtrDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtrDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtrDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
