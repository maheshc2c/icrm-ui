import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlanDemo } from './add-plan-demo';

describe('AddPlanDemo', () => {
  let component: AddPlanDemo;
  let fixture: ComponentFixture<AddPlanDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPlanDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPlanDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
