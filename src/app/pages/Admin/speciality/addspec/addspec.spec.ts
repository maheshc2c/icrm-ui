import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addspec } from './addspec';

describe('Addspec', () => {
  let component: Addspec;
  let fixture: ComponentFixture<Addspec>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addspec]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addspec);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
