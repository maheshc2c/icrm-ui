import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteApproval } from './quote-approval';

describe('QuoteApproval', () => {
  let component: QuoteApproval;
  let fixture: ComponentFixture<QuoteApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
