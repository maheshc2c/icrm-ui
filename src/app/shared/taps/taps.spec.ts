import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Taps } from './taps';

describe('Taps', () => {
  let component: Taps;
  let fixture: ComponentFixture<Taps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Taps]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Taps);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
