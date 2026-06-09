import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDemoComponent } from './plan-demo.component';

describe('PlanDemoComponent', () => {
  let component: PlanDemoComponent;
  let fixture: ComponentFixture<PlanDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
