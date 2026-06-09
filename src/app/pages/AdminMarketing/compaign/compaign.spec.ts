import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Compaign } from './compaign';

describe('Compaign', () => {
  let component: Compaign;
  let fixture: ComponentFixture<Compaign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Compaign]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Compaign);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
