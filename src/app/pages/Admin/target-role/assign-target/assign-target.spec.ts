import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTarget } from './assign-target';

describe('AssignTarget', () => {
  let component: AssignTarget;
  let fixture: ComponentFixture<AssignTarget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignTarget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignTarget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
