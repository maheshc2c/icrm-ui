import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addsubsystem } from './addsubsystem';

describe('Addsubsystem', () => {
  let component: Addsubsystem;
  let fixture: ComponentFixture<Addsubsystem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addsubsystem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addsubsystem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
