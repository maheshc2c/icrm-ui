import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpentrackLeads } from './opentrack-leads';

describe('OpentrackLeads', () => {
  let component: OpentrackLeads;
  let fixture: ComponentFixture<OpentrackLeads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpentrackLeads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpentrackLeads);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
