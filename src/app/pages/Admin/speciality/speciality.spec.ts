import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Speciality } from './speciality';

describe('Speciality', () => {
  let component: Speciality;
  let fixture: ComponentFixture<Speciality>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Speciality]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Speciality);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
