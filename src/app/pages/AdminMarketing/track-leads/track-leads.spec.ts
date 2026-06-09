import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackLeads } from './track-leads';

describe('TrackLeads', () => {
  let component: TrackLeads;
  let fixture: ComponentFixture<TrackLeads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackLeads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackLeads);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
