import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Territory } from './territory';

describe('Territory', () => {
  let component: Territory;
  let fixture: ComponentFixture<Territory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Territory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Territory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
