import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityLostReport } from './opportunity-lost-report';

describe('OpportunityLostReport', () => {
  let component: OpportunityLostReport;
  let fixture: ComponentFixture<OpportunityLostReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityLostReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpportunityLostReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
