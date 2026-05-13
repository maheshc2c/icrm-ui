import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanVisit } from './plan-visit';

describe('PlanVisit', () => {
  let component: PlanVisit;
  let fixture: ComponentFixture<PlanVisit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanVisit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanVisit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
