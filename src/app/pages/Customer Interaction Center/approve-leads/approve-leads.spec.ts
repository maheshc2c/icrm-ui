import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveLeads } from './approve-leads';

describe('ApproveLeads', () => {
  let component: ApproveLeads;
  let fixture: ComponentFixture<ApproveLeads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveLeads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveLeads);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
