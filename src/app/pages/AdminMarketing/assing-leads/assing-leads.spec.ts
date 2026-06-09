import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssingLeads } from './assing-leads';

describe('AssingLeads', () => {
  let component: AssingLeads;
  let fixture: ComponentFixture<AssingLeads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssingLeads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssingLeads);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
