import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityFunnelHistoryStatus } from './opportunity-funnel-history-status';

describe('OpportunityFunnelHistoryStatus', () => {
  let component: OpportunityFunnelHistoryStatus;
  let fixture: ComponentFixture<OpportunityFunnelHistoryStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityFunnelHistoryStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpportunityFunnelHistoryStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
