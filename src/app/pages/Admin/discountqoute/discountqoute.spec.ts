import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Discountqoute } from './discountqoute';

describe('Discountqoute', () => {
  let component: Discountqoute;
  let fixture: ComponentFixture<Discountqoute>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Discountqoute]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Discountqoute);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
