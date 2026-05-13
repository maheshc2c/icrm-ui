import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addcompany } from './addcompany';

describe('Addcompany', () => {
  let component: Addcompany;
  let fixture: ComponentFixture<Addcompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addcompany]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addcompany);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
