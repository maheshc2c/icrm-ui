import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackQuote } from './track-quote';

describe('TrackQuote', () => {
  let component: TrackQuote;
  let fixture: ComponentFixture<TrackQuote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackQuote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackQuote);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
