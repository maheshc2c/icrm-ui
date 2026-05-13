import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdDashboard } from './sd-dashboard';

describe('SdDashboard', () => {
  let component: SdDashboard;
  let fixture: ComponentFixture<SdDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
