import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addcontact } from './addcontact';

describe('Addcontact', () => {
  let component: Addcontact;
  let fixture: ComponentFixture<Addcontact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addcontact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addcontact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
