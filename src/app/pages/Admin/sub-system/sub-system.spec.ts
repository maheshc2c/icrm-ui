import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubSystem } from './sub-system';

describe('SubSystem', () => {
  let component: SubSystem;
  let fixture: ComponentFixture<SubSystem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubSystem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubSystem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
