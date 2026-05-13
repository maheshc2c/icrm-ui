import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackPo } from './track-po';

describe('TrackPo', () => {
  let component: TrackPo;
  let fixture: ComponentFixture<TrackPo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackPo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackPo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
