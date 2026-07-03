import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteTracking } from './quote-tracking';

describe('QuoteTracking', () => {
  let component: QuoteTracking;
  let fixture: ComponentFixture<QuoteTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteTracking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteTracking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
