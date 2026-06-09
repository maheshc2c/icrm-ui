import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addcompaign } from './addcompaign';

describe('Addcompaign', () => {
  let component: Addcompaign;
  let fixture: ComponentFixture<Addcompaign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addcompaign]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addcompaign);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
