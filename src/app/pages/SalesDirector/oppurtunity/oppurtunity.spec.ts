import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Oppurtunity } from './oppurtunity';

describe('Oppurtunity', () => {
  let component: Oppurtunity;
  let fixture: ComponentFixture<Oppurtunity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Oppurtunity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Oppurtunity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
