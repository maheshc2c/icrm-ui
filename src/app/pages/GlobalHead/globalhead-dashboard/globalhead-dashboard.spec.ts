import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalheadDashboard } from './globalhead-dashboard';

describe('GlobalheadDashboard', () => {
  let component: GlobalheadDashboard;
  let fixture: ComponentFixture<GlobalheadDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalheadDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalheadDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
