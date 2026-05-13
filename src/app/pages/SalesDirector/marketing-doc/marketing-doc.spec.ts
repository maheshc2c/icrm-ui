import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingDoc } from './marketing-doc';

describe('MarketingDoc', () => {
  let component: MarketingDoc;
  let fixture: ComponentFixture<MarketingDoc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketingDoc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketingDoc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
