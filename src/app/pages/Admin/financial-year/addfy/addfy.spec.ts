import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addfy } from './addfy';

describe('Addfy', () => {
  let component: Addfy;
  let fixture: ComponentFixture<Addfy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addfy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addfy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
